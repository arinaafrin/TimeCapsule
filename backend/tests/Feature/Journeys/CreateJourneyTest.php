<?php

use App\Jobs\GenerateStoryJob;
use App\Models\AiGenerationJob;
use App\Models\City;
use App\Models\Experience;
use App\Models\Journey;
use App\Models\JourneyStop;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

test('a partner can create a journey with multiple linked stops in one request', function () {
    Queue::fake();

    $partner = User::factory()->create(['role' => 'partner']);
    $city = City::factory()->create(['name' => 'Paris']);

    $response = $this->actingAs($partner)->postJson('/api/v1/journeys', [
        'title' => 'Origins of Paris',
        'description' => 'A walk through the ages.',
        'city_id' => $city->id,
        'stops' => [
            ['year' => 1889, 'era_label' => "World's Fair"],
            ['year' => 2026, 'era_label' => 'Present day'],
            ['year' => 2076, 'era_label' => 'Imagined future'],
        ],
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.title', 'Origins of Paris')
        ->assertJsonCount(3, 'data.stops');

    $journey = Journey::where('title', 'Origins of Paris')->firstOrFail();
    expect($journey->stops)->toHaveCount(3);
    expect(Experience::where('city_id', $city->id)->count())->toBe(3);

    // Stop ordering is preserved.
    expect($journey->stops->pluck('sequence_order')->all())->toBe([0, 1, 2]);

    // Each stop's underlying experience is grounded at the journey's city.
    $journey->stops->each(function (JourneyStop $stop) use ($city) {
        expect($stop->experience->city_id)->toBe($city->id);
    });
});

test('creating a journey auto-dispatches story generation for every stop', function () {
    Queue::fake();

    $partner = User::factory()->create(['role' => 'partner']);
    $city = City::factory()->create();

    $this->actingAs($partner)->postJson('/api/v1/journeys', [
        'title' => 'Test Journey',
        'city_id' => $city->id,
        'stops' => [
            ['year' => 1900],
            ['year' => 2026],
        ],
    ])->assertCreated();

    expect(AiGenerationJob::count())->toBe(2);
    Queue::assertPushed(GenerateStoryJob::class, 2);
});

test('a visitor cannot create a journey', function () {
    $visitor = User::factory()->create(['role' => 'visitor']);
    $city = City::factory()->create();

    $response = $this->actingAs($visitor)->postJson('/api/v1/journeys', [
        'title' => 'Nope',
        'city_id' => $city->id,
        'stops' => [['year' => 2000]],
    ]);

    $response->assertForbidden();
});

test('a journey requires at least two stops', function () {
    $partner = User::factory()->create(['role' => 'partner']);
    $city = City::factory()->create();

    $response = $this->actingAs($partner)->postJson('/api/v1/journeys', [
        'title' => 'Too Short',
        'city_id' => $city->id,
        'stops' => [['year' => 2000]],
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors(['stops']);
});

test('a journey with per-stop coordinates stores them on each stop', function () {
    Queue::fake();

    $partner = User::factory()->create(['role' => 'partner']);
    $city = City::factory()->create();

    $response = $this->actingAs($partner)->postJson('/api/v1/journeys', [
        'title' => 'Route Walk',
        'city_id' => $city->id,
        'stops' => [
            ['year' => 1800, 'stop_latitude' => 48.8566, 'stop_longitude' => 2.3522],
            ['year' => 1900, 'stop_latitude' => 48.8600, 'stop_longitude' => 2.3500],
        ],
    ]);

    $response->assertCreated();

    $journey = Journey::where('title', 'Route Walk')->firstOrFail();
    expect((float) $journey->stops[0]->stop_latitude)->toBe(48.8566);
    expect((float) $journey->stops[1]->stop_latitude)->toBe(48.86);
});

test('anyone can view a published journey with its stops and experiences loaded', function () {
    $city = City::factory()->create();
    $journey = Journey::factory()->create(['city_id' => $city->id, 'status' => Journey::STATUS_PUBLISHED]);
    $experience = Experience::factory()->approved()->create(['city_id' => $city->id]);
    JourneyStop::factory()->create(['journey_id' => $journey->id, 'experience_id' => $experience->id, 'sequence_order' => 0]);

    $response = $this->getJson("/api/v1/journeys/{$journey->id}");

    $response
        ->assertOk()
        ->assertJsonCount(1, 'data.stops')
        ->assertJsonPath('data.stops.0.experience.id', $experience->id);
});

test('a guest cannot create a journey', function () {
    $city = City::factory()->create();

    $response = $this->postJson('/api/v1/journeys', [
        'title' => 'Nope',
        'city_id' => $city->id,
        'stops' => [['year' => 2000], ['year' => 2020]],
    ]);

    $response->assertUnauthorized();
});
