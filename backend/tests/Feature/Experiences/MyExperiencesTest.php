<?php

use App\Models\Experience;
use App\Models\User;

test('a guest cannot request their own experiences', function () {
    $response = $this->getJson('/api/v1/experiences?mine=1');

    $response->assertForbidden();
});

test('a partner sees all of their own experiences regardless of status', function () {
    $partner = User::factory()->create(['role' => 'partner']);
    Experience::factory()->draft()->create(['created_by' => $partner->id]);
    Experience::factory()->pendingReview()->create(['created_by' => $partner->id]);
    Experience::factory()->approved()->create(['created_by' => $partner->id]);
    Experience::factory()->approved()->create(); // someone else's

    $response = $this->actingAs($partner)->getJson('/api/v1/experiences?mine=1');

    $response->assertOk()->assertJsonCount(3, 'data');
});

test('mine=1 never leaks another users draft experiences', function () {
    $partnerA = User::factory()->create(['role' => 'partner']);
    $partnerB = User::factory()->create(['role' => 'partner']);
    Experience::factory()->draft()->create(['created_by' => $partnerB->id]);

    $response = $this->actingAs($partnerA)->getJson('/api/v1/experiences?mine=1');

    $response->assertOk()->assertJsonCount(0, 'data');
});
