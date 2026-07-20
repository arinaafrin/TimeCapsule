<?php

use App\Models\Experience;
use App\Models\Favorite;
use App\Models\User;

test('a guest cannot list favorites', function () {
    $response = $this->getJson('/api/v1/me/favorites');

    $response->assertUnauthorized();
});

test('an authenticated user can favorite an experience', function () {
    $visitor = User::factory()->create();
    $experience = Experience::factory()->approved()->create();

    $response = $this->actingAs($visitor)->postJson("/api/v1/experiences/{$experience->id}/favorite");

    $response->assertCreated()->assertJsonPath('data.experience_id', $experience->id);
    $this->assertDatabaseHas('favorites', [
        'user_id' => $visitor->id,
        'experience_id' => $experience->id,
    ]);
});

test('favoriting the same experience twice does not create a duplicate row', function () {
    $visitor = User::factory()->create();
    $experience = Experience::factory()->approved()->create();

    $this->actingAs($visitor)->postJson("/api/v1/experiences/{$experience->id}/favorite")->assertCreated();
    $this->actingAs($visitor)->postJson("/api/v1/experiences/{$experience->id}/favorite")->assertCreated();

    $this->assertDatabaseCount('favorites', 1);
});

test('a user can list their own favorited experiences', function () {
    $visitor = User::factory()->create();
    $favorited = Experience::factory()->approved()->create();
    Experience::factory()->approved()->create(); // not favorited

    Favorite::factory()->create([
        'user_id' => $visitor->id,
        'experience_id' => $favorited->id,
    ]);

    $response = $this->actingAs($visitor)->getJson('/api/v1/me/favorites');

    $response->assertOk()->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $favorited->id);
});

test('a user can remove a favorite', function () {
    $visitor = User::factory()->create();
    $experience = Experience::factory()->approved()->create();
    Favorite::factory()->create([
        'user_id' => $visitor->id,
        'experience_id' => $experience->id,
    ]);

    $response = $this->actingAs($visitor)->deleteJson("/api/v1/experiences/{$experience->id}/favorite");

    $response->assertNoContent();
    $this->assertDatabaseCount('favorites', 0);
});

test('a user only ever sees their own favorites, not another users', function () {
    $visitorA = User::factory()->create();
    $visitorB = User::factory()->create();
    $experience = Experience::factory()->approved()->create();

    Favorite::factory()->create(['user_id' => $visitorA->id, 'experience_id' => $experience->id]);

    $response = $this->actingAs($visitorB)->getJson('/api/v1/me/favorites');

    $response->assertOk()->assertJsonCount(0, 'data');
});
