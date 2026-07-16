<?php

use App\Models\User;

test('a visitor can register with name email and password', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('user.email', 'ada@example.com')
        ->assertJsonPath('user.role', 'visitor')
        ->assertJsonStructure(['user' => ['id', 'name', 'email', 'role'], 'token']);

    $this->assertDatabaseHas('users', [
        'email' => 'ada@example.com',
        'role' => 'visitor',
    ]);
});

test('registration fails with a duplicate email', function () {
    User::factory()->create(['email' => 'ada@example.com']);

    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('email');
});

test('registration fails when passwords do not match', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password456',
    ]);

    $response->assertUnprocessable()->assertJsonValidationErrors('password');
});
