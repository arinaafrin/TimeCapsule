<?php

use App\Jobs\GenerateStoryJob;
use App\Models\AiGenerationJob;
use App\Models\Experience;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

test('a partner can trigger story generation for their own experience', function () {
    Queue::fake();

    $partner = User::factory()->create(['role' => 'partner']);
    $experience = Experience::factory()->draft()->create(['created_by' => $partner->id]);

    $response = $this->actingAs($partner)->postJson("/api/v1/experiences/{$experience->id}/generate");

    $response->assertAccepted()->assertJsonStructure(['job_id', 'status']);

    expect(AiGenerationJob::where('experience_id', $experience->id)->exists())->toBeTrue();

    Queue::assertPushed(GenerateStoryJob::class);
});

test('a visitor cannot trigger story generation', function () {
    $visitor = User::factory()->create(['role' => 'visitor']);
    $experience = Experience::factory()->draft()->create();

    $response = $this->actingAs($visitor)->postJson("/api/v1/experiences/{$experience->id}/generate");

    $response->assertForbidden();
});

test('a partner cannot trigger generation for someone elses experience', function () {
    $owner = User::factory()->create(['role' => 'partner']);
    $otherPartner = User::factory()->create(['role' => 'partner']);
    $experience = Experience::factory()->draft()->create(['created_by' => $owner->id]);

    $response = $this->actingAs($otherPartner)->postJson("/api/v1/experiences/{$experience->id}/generate");

    $response->assertForbidden();
});

test('job status can be polled by job id', function () {
    $partner = User::factory()->create(['role' => 'partner']);
    $experience = Experience::factory()->draft()->create(['created_by' => $partner->id]);
    $job = AiGenerationJob::factory()->create([
        'experience_id' => $experience->id,
        'requested_by' => $partner->id,
        'status' => 'processing',
    ]);

    $response = $this->actingAs($partner)->getJson("/api/v1/ai-jobs/{$job->id}");

    $response->assertOk()->assertJsonPath('data.status', 'processing');
});

test('generation is rate limited per user', function () {
    Queue::fake();

    $partner = User::factory()->create(['role' => 'partner']);
    $experience = Experience::factory()->draft()->create(['created_by' => $partner->id]);

    config(['ai.generation_rate_limit_per_hour' => 1]);

    $this->actingAs($partner)->postJson("/api/v1/experiences/{$experience->id}/generate")
        ->assertAccepted();

    $second = Experience::factory()->draft()->create(['created_by' => $partner->id]);

    $this->actingAs($partner)->postJson("/api/v1/experiences/{$second->id}/generate")
        ->assertStatus(429);
});
