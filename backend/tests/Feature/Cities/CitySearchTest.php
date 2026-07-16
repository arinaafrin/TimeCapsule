<?php

use App\Models\City;

test('cities can be listed', function () {
    City::factory()->count(3)->create();

    $response = $this->getJson('/api/v1/cities');

    $response->assertOk()->assertJsonCount(3, 'data');
});

test('cities can be searched by name', function () {
    City::factory()->create(['name' => 'Paris']);
    City::factory()->create(['name' => 'Tokyo']);

    $response = $this->getJson('/api/v1/cities?search=Par');

    $response
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Paris');
});

test('a single city can be fetched by id', function () {
    $city = City::factory()->create();

    $response = $this->getJson("/api/v1/cities/{$city->id}");

    $response->assertOk()->assertJsonPath('data.id', $city->id);
});

test('fetching a non-existent city returns 404', function () {
    $response = $this->getJson('/api/v1/cities/'.\Illuminate\Support\Str::uuid());

    $response->assertNotFound();
});
