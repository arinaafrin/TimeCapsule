<?php

use App\Models\City;
use App\Models\Experience;
use App\Models\User;

test('anyone can list approved experiences', function () {
    $city = City::factory()->create();
    Experience::factory()->count(2)->approved()->for($city)->create();
    Experience::factory()->draft()->for($city)->create();

    $response = $this->getJson('/api/v1/experiences');

    $response->assertOk()->assertJsonCount(2, 'data');
});

test('experiences can be filtered by city and year', function () {
    $paris = City::factory()->create(['name' => 'Paris']);
    $tokyo = City::factory()->create(['name' => 'Tokyo']);
    Experience::factory()->approved()->for($paris)->create(['year' => 1889]);
    Experience::factory()->approved()->for($tokyo)->create(['year' => 1600]);

    $response = $this->getJson("/api/v1/experiences?city_id={$paris->id}&year=1889");

    $response->assertOk()->assertJsonCount(1, 'data');
});

test('a guest cannot create an experience', function () {
    $city = City::factory()->create();

    $response = $this->postJson('/api/v1/experiences', [
        'city_id' => $city->id,
        'year' => 1889,
        'era_label' => 'Belle Époque',
    ]);

    $response->assertUnauthorized();
});

test('a visitor cannot create an experience', function () {
    $visitor = User::factory()->create(['role' => 'visitor']);
    $city = City::factory()->create();

    $response = $this->actingAs($visitor)->postJson('/api/v1/experiences', [
        'city_id' => $city->id,
        'year' => 1889,
        'era_label' => 'Belle Époque',
    ]);

    $response->assertForbidden();
});

test('a partner can create an experience which starts as draft', function () {
    $partner = User::factory()->create(['role' => 'partner']);
    $city = City::factory()->create();

    $response = $this->actingAs($partner)->postJson('/api/v1/experiences', [
        'city_id' => $city->id,
        'year' => 1889,
        'era_label' => 'Belle Époque',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.status', 'draft')
        ->assertJsonPath('data.era_label', 'Belle Époque');

    expect(Experience::where('era_label', 'Belle Époque')->exists())->toBeTrue();
});

test('an admin can update any experience', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $experience = Experience::factory()->draft()->create();

    $response = $this->actingAs($admin)->patchJson("/api/v1/experiences/{$experience->id}", [
        'era_label' => 'Updated Era',
    ]);

    $response->assertOk()->assertJsonPath('data.era_label', 'Updated Era');
});

test('a partner cannot update another partners experience', function () {
    $owner = User::factory()->create(['role' => 'partner']);
    $otherPartner = User::factory()->create(['role' => 'partner']);
    $experience = Experience::factory()->draft()->create(['created_by' => $owner->id]);

    $response = $this->actingAs($otherPartner)->patchJson("/api/v1/experiences/{$experience->id}", [
        'era_label' => 'Hijacked',
    ]);

    $response->assertForbidden();
});

test('an admin can delete an experience', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $experience = Experience::factory()->draft()->create();

    $response = $this->actingAs($admin)->deleteJson("/api/v1/experiences/{$experience->id}");

    $response->assertNoContent();
    expect(Experience::find($experience->id))->toBeNull();
});

test('creating an experience with a google maps link resolves and persists the pinned location', function () {
    $partner = User::factory()->create(['role' => 'partner']);
    $city = City::factory()->create();

    // 1. Force the config keys to have a value during test execution
    config([
        'services.google_maps.server_api_key' => 'test_key',
        'services.google.maps_api_key' => 'test_key',
    ]);

    $mock = new \GuzzleHttp\Handler\MockHandler([
        new \GuzzleHttp\Psr7\Response(200, [], json_encode([
            'results' => [['formatted_address' => 'Piazza del Colosseo, 1, 00184 Roma RM, Italy']],
        ])),
    ]);
    $client = new \GuzzleHttp\Client(['handler' => \GuzzleHttp\HandlerStack::create($mock)]);
    
    // Pass the test key into the constructor if your GoogleMapsService accepts it as a 2nd argument:
    // new \App\Services\Maps\GoogleMapsService($client, 'test_key')
    // Otherwise, the config() set above will handle it!
    $this->app->instance(
        \App\Services\Maps\GoogleMapsService::class,
        new \App\Services\Maps\GoogleMapsService($client)
    );

    $response = $this->actingAs($partner)->postJson('/api/v1/experiences', [
        'city_id' => $city->id,
        'year' => 1889,
        'era_label' => 'Belle Époque',
        'google_maps_link' => 'https://www.google.com/maps/@41.8902142,12.4900422,17z',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.pin_place_name', 'Piazza del Colosseo, 1, 00184 Roma RM, Italy');

    expect((float) $response->json('data.pin_latitude'))->toEqualWithDelta(41.8902142, 0.0001);
    expect((float) $response->json('data.pin_longitude'))->toEqualWithDelta(12.4900422, 0.0001);
});

test('an unresolvable google maps link does not block experience creation', function () {
    $partner = User::factory()->create(['role' => 'partner']);
    $city = City::factory()->create();

    $mock = new \GuzzleHttp\Handler\MockHandler([
        new \GuzzleHttp\Psr7\Response(200, []),
    ]);
    $client = new \GuzzleHttp\Client(['handler' => \GuzzleHttp\HandlerStack::create($mock)]);
    $this->app->instance(
        \App\Services\Maps\GoogleMapsService::class,
        new \App\Services\Maps\GoogleMapsService($client)
    );

    $response = $this->actingAs($partner)->postJson('/api/v1/experiences', [
        'city_id' => $city->id,
        'year' => 1889,
        'google_maps_link' => 'https://maps.app.goo.gl/deadLinkExample',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.pin_place_name', null);
});
