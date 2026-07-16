<?php

use App\Models\Experience;
use App\Models\ModerationLog;
use App\Models\User;

test('an admin can view the moderation queue of pending-review experiences', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Experience::factory()->count(2)->pendingReview()->create();
    Experience::factory()->draft()->create();
    Experience::factory()->approved()->create();

    $response = $this->actingAs($admin)->getJson('/api/v1/moderation/queue');

    $response->assertOk()->assertJsonCount(2, 'data');
});

test('a partner cannot view the moderation queue', function () {
    $partner = User::factory()->create(['role' => 'partner']);

    $response = $this->actingAs($partner)->getJson('/api/v1/moderation/queue');

    $response->assertForbidden();
});

test('a guest cannot view the moderation queue', function () {
    $response = $this->getJson('/api/v1/moderation/queue');

    $response->assertUnauthorized();
});

test('an admin can approve a pending-review experience', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $experience = Experience::factory()->pendingReview()->create();

    $response = $this->actingAs($admin)->postJson("/api/v1/moderation/{$experience->id}/approve", [
        'notes' => 'Looks historically accurate.',
    ]);

    $response->assertOk()->assertJsonPath('data.status', 'approved');

    $experience->refresh();
    expect($experience->status)->toBe('approved');
    expect($experience->approved_by)->toBe($admin->id);

    expect(ModerationLog::where('experience_id', $experience->id)
        ->where('action', 'approved')
        ->where('reviewer_id', $admin->id)
        ->exists())->toBeTrue();
});

test('an admin can reject a pending-review experience with notes', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $experience = Experience::factory()->pendingReview()->create();

    $response = $this->actingAs($admin)->postJson("/api/v1/moderation/{$experience->id}/reject", [
        'notes' => 'Historical inaccuracies in the second paragraph.',
    ]);

    $response->assertOk()->assertJsonPath('data.status', 'rejected');

    expect(ModerationLog::where('experience_id', $experience->id)
        ->where('action', 'rejected')
        ->where('notes', 'Historical inaccuracies in the second paragraph.')
        ->exists())->toBeTrue();
});

test('rejecting an experience requires notes explaining why', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $experience = Experience::factory()->pendingReview()->create();

    $response = $this->actingAs($admin)->postJson("/api/v1/moderation/{$experience->id}/reject", []);

    $response->assertUnprocessable()->assertJsonValidationErrors(['notes']);
});

test('a partner cannot approve their own experience', function () {
    $partner = User::factory()->create(['role' => 'partner']);
    $experience = Experience::factory()->pendingReview()->create(['created_by' => $partner->id]);

    $response = $this->actingAs($partner)->postJson("/api/v1/moderation/{$experience->id}/approve");

    $response->assertForbidden();
});

test('an admin can add a comment without approving or rejecting', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $experience = Experience::factory()->pendingReview()->create();

    $response = $this->actingAs($admin)->postJson("/api/v1/moderation/{$experience->id}/comment", [
        'notes' => 'Can you double check the date of the fire?',
    ]);

    $response->assertCreated();

    $experience->refresh();
    expect($experience->status)->toBe('pending_review');

    expect(ModerationLog::where('experience_id', $experience->id)
        ->where('action', 'comment')
        ->exists())->toBeTrue();
});

test('moderation logs are listed in an experiences moderation history', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $experience = Experience::factory()->pendingReview()->create();

    $this->actingAs($admin)->postJson("/api/v1/moderation/{$experience->id}/comment", [
        'notes' => 'First pass looks good.',
    ]);
    $this->actingAs($admin)->postJson("/api/v1/moderation/{$experience->id}/approve", [
        'notes' => 'Approved after review.',
    ]);

    $response = $this->actingAs($admin)->getJson("/api/v1/moderation/{$experience->id}/logs");

    $response->assertOk()->assertJsonCount(2, 'data');
});
