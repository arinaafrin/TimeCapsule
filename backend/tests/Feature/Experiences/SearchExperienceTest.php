<?php

use App\Models\City;
use App\Models\Experience;

test('experiences can be searched by era/theme label', function () {
    $city = City::factory()->create();
    Experience::factory()->approved()->for($city)->create(['era_label' => 'Belle Époque']);
    Experience::factory()->approved()->for($city)->create(['era_label' => 'Jazz Age']);

    $response = $this->getJson('/api/v1/experiences?search=Belle');

    $response->assertOk()->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.era_label', 'Belle Époque');
});

test('experiences can be searched by city name', function () {
    $paris = City::factory()->create(['name' => 'Paris']);
    $tokyo = City::factory()->create(['name' => 'Tokyo']);
    Experience::factory()->approved()->for($paris)->create();
    Experience::factory()->approved()->for($tokyo)->create();

    $response = $this->getJson('/api/v1/experiences?search=par');

    $response->assertOk()->assertJsonCount(1, 'data');
});

test('search is case-insensitive and returns nothing for an unmatched term', function () {
    $city = City::factory()->create(['name' => 'Rome']);
    Experience::factory()->approved()->for($city)->create(['era_label' => 'Fall of the Republic']);

    $matching = $this->getJson('/api/v1/experiences?search=REPUBLIC');
    $matching->assertOk()->assertJsonCount(1, 'data');

    $notMatching = $this->getJson('/api/v1/experiences?search=nonexistentterm');
    $notMatching->assertOk()->assertJsonCount(0, 'data');
});
