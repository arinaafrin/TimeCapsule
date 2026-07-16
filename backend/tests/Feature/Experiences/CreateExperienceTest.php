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
