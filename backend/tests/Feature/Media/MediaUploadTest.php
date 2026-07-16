<?php

use App\Jobs\GenerateMediaJob;
use App\Models\Experience;
use App\Models\MediaAsset;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('s3');
});

test('a partner can manually upload media for their own experience', function () {
    $partner = User::factory()->create(['role' => 'partner']);
    $experience = Experience::factory()->draft()->create(['created_by' => $partner->id]);

    $file = UploadedFile::fake()->image('panorama.jpg', 4000, 2000);

    $response = $this->actingAs($partner)->postJson("/api/v1/experiences/{$experience->id}/media", [
        'type' => 'panorama_360',
        'source_type' => 'partner_upload',
        'file' => $file,
    ]);

    $response->assertCreated()->assertJsonPath('data.type', 'panorama_360');

    expect(MediaAsset::where('experience_id', $experience->id)->exists())->toBeTrue();
    Storage::disk('s3')->assertExists(MediaAsset::first()->storage_path);
});

test('a visitor cannot upload media', function () {
    $visitor = User::factory()->create(['role' => 'visitor']);
    $experience = Experience::factory()->draft()->create();

    $file = UploadedFile::fake()->image('panorama.jpg');

    $response = $this->actingAs($visitor)->postJson("/api/v1/experiences/{$experience->id}/media", [
        'type' => 'panorama_360',
        'source_type' => 'partner_upload',
        'file' => $file,
    ]);

    $response->assertForbidden();
});

test('a partner cannot upload media to someone elses experience', function () {
    $owner = User::factory()->create(['role' => 'partner']);
    $otherPartner = User::factory()->create(['role' => 'partner']);
    $experience = Experience::factory()->draft()->create(['created_by' => $owner->id]);

    $file = UploadedFile::fake()->image('panorama.jpg');

    $response = $this->actingAs($otherPartner)->postJson("/api/v1/experiences/{$experience->id}/media", [
        'type' => 'panorama_360',
        'source_type' => 'partner_upload',
        'file' => $file,
    ]);

    $response->assertForbidden();
});

test('media upload validates file type and required fields', function () {
    $partner = User::factory()->create(['role' => 'partner']);
    $experience = Experience::factory()->draft()->create(['created_by' => $partner->id]);

    $response = $this->actingAs($partner)->postJson("/api/v1/experiences/{$experience->id}/media", [
        'type' => 'not_a_real_type',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors(['type', 'file']);
});

test('media assets can be listed for an experience', function () {
    $experience = Experience::factory()->approved()->create();
    MediaAsset::factory()->count(2)->create(['experience_id' => $experience->id]);

    $response = $this->getJson("/api/v1/experiences/{$experience->id}/media");

    $response->assertOk()->assertJsonCount(2, 'data');
});

test('a partner can trigger AI image generation for their experience', function () {
    Queue::fake();

    $partner = User::factory()->create(['role' => 'partner']);
    $experience = Experience::factory()->draft()->create(['created_by' => $partner->id]);

    $response = $this->actingAs($partner)->postJson("/api/v1/experiences/{$experience->id}/generate-media");

    $response->assertAccepted()->assertJsonStructure(['job_id', 'status']);

    Queue::assertPushed(GenerateMediaJob::class);
});

test('media asset urls returned are signed and expiring', function () {
    $experience = Experience::factory()->approved()->create();
    MediaAsset::factory()->create(['experience_id' => $experience->id, 'storage_path' => 'media/test.jpg']);

    $response = $this->getJson("/api/v1/experiences/{$experience->id}/media");

    $response->assertOk();
    $url = $response->json('data.0.url');
    expect($url)->toContain('media/test.jpg');
});
