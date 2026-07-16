<?php

test('the api health-check endpoint responds ok', function () {
    $response = $this->getJson('/api/v1/ping');

    $response
        ->assertOk()
        ->assertJson([
            'service' => 'timecapsule-api',
            'status' => 'ok',
        ]);
});
