<?php

use App\Models\User;

test('a registered user can log in with correct credentials', function () {
    $user = User::factory()->create([
        'email' => 'ada@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'ada@example.com',
        'password' => 'password123',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonStructure(['user' => ['id', 'name', 'email', 'role'], 'token']);
});

test('login fails with incorrect credentials', function () {
    User::factory()->create([
        'email' => 'ada@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'ada@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertUnauthorized();
});

test('an authenticated user can log out and their token is revoked', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/auth/logout');

    $response->assertOk();
    $this->assertDatabaseCount('personal_access_tokens', 0);
});

test('an unauthenticated request to a protected route is rejected', function () {
    $response = $this->getJson('/api/v1/me');

    $response->assertUnauthorized();
});

test('an authenticated user can fetch their own profile via me endpoint', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/me');

    $response->assertOk()->assertJsonPath('id', $user->id);
});
