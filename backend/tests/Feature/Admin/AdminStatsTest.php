<?php

use App\Models\AiGenerationJob;
use App\Models\Experience;
use App\Models\ModerationLog;
use App\Models\PartnerOrganization;
use App\Models\User;

test('a guest cannot view admin stats', function () {
    $response = $this->getJson('/api/v1/admin/stats');

    $response->assertUnauthorized();
});

test('a partner cannot view admin stats', function () {
    $partner = User::factory()->create(['role' => 'partner']);

    $response = $this->actingAs($partner)->getJson('/api/v1/admin/stats');

    $response->assertForbidden();
});

test('an admin can view aggregate platform stats', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    User::factory()->count(2)->create(['role' => 'visitor']);
    Experience::factory()->count(3)->approved()->create();
    Experience::factory()->draft()->create();
    PartnerOrganization::factory()->create(['verified' => true]);
    PartnerOrganization::factory()->create(['verified' => false]);

    $response = $this->actingAs($admin)->getJson('/api/v1/admin/stats');

    $response
        ->assertOk()
        ->assertJsonPath('data.experiences.total', 4)
        ->assertJsonPath('data.experiences.by_status.approved', 3)
        ->assertJsonPath('data.experiences.by_status.draft', 1)
        ->assertJsonPath('data.partner_organizations.total', 2)
        ->assertJsonPath('data.partner_organizations.verified', 1)
        ->assertJsonStructure([
            'data' => [
                'users' => ['total', 'by_role'],
                'cities' => ['total'],
                'experiences' => ['total', 'by_status'],
                'journeys' => ['total', 'by_status'],
                'ai_generation_jobs' => ['total', 'by_status', 'recent_failures'],
                'favorites' => ['total'],
                'partner_organizations' => ['total', 'verified', 'pending'],
                'recent_moderation_activity',
            ],
        ]);
});

test('recent job failures are included with their error message', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $experience = Experience::factory()->create();
    AiGenerationJob::factory()->create([
        'experience_id' => $experience->id,
        'status' => AiGenerationJob::STATUS_FAILED,
        'error_message' => 'AI provider timed out',
        'completed_at' => now(),
    ]);

    $response = $this->actingAs($admin)->getJson('/api/v1/admin/stats');

    $response->assertOk()->assertJsonPath('data.ai_generation_jobs.recent_failures.0.error_message', 'AI provider timed out');
});

test('recent moderation activity reflects the latest approve/reject actions', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $experience = Experience::factory()->approved()->create();
    ModerationLog::factory()->create([
        'experience_id' => $experience->id,
        'reviewer_id' => $admin->id,
        'action' => ModerationLog::ACTION_APPROVED,
        'notes' => 'Looks accurate.',
    ]);

    $response = $this->actingAs($admin)->getJson('/api/v1/admin/stats');

    $response->assertOk()->assertJsonPath('data.recent_moderation_activity.0.action', 'approved');
});
