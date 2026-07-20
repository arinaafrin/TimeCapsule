<?php

use App\Models\PartnerOrganization;
use App\Models\User;

test('a guest cannot create a partner organization', function () {
    $response = $this->postJson('/api/v1/partner-organizations', ['name' => 'Rogue Museum']);

    $response->assertUnauthorized();
});

test('a visitor cannot create a partner organization', function () {
    $visitor = User::factory()->create(['role' => 'visitor']);

    $response = $this->actingAs($visitor)->postJson('/api/v1/partner-organizations', [
        'name' => 'Visitor Museum',
    ]);

    $response->assertForbidden();
});

test('a partner can create a partner organization which starts unverified', function () {
    $partner = User::factory()->create(['role' => 'partner']);

    $response = $this->actingAs($partner)->postJson('/api/v1/partner-organizations', [
        'name' => 'Louvre Digital Team',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.name', 'Louvre Digital Team')
        ->assertJsonPath('data.verified', false)
        ->assertJsonPath('data.contact_user_id', $partner->id);

    $this->assertDatabaseHas('partner_organizations', [
        'name' => 'Louvre Digital Team',
        'contact_user_id' => $partner->id,
        'verified' => false,
    ]);
});

test('creating a partner organization requires a name', function () {
    $partner = User::factory()->create(['role' => 'partner']);

    $response = $this->actingAs($partner)->postJson('/api/v1/partner-organizations', []);

    $response->assertUnprocessable()->assertJsonValidationErrors('name');
});

test('a partner only sees their own organizations, not other partners', function () {
    $partnerA = User::factory()->create(['role' => 'partner']);
    $partnerB = User::factory()->create(['role' => 'partner']);

    PartnerOrganization::factory()->create(['contact_user_id' => $partnerA->id]);
    PartnerOrganization::factory()->create(['contact_user_id' => $partnerB->id]);

    $response = $this->actingAs($partnerA)->getJson('/api/v1/partner-organizations');

    $response->assertOk()->assertJsonCount(1, 'data');
});

test('an admin sees all partner organizations', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    PartnerOrganization::factory()->count(3)->create();

    $response = $this->actingAs($admin)->getJson('/api/v1/partner-organizations');

    $response->assertOk()->assertJsonCount(3, 'data');
});

test('a partner cannot verify their own organization', function () {
    $partner = User::factory()->create(['role' => 'partner']);
    $organization = PartnerOrganization::factory()->create(['contact_user_id' => $partner->id]);

    $response = $this->actingAs($partner)->postJson("/api/v1/partner-organizations/{$organization->id}/verify");

    $response->assertForbidden();
    expect($organization->fresh()->verified)->toBeFalse();
});

test('an admin can verify a partner organization', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $organization = PartnerOrganization::factory()->create(['verified' => false]);

    $response = $this->actingAs($admin)->postJson("/api/v1/partner-organizations/{$organization->id}/verify");

    $response->assertOk()->assertJsonPath('data.verified', true);
    expect($organization->fresh()->verified)->toBeTrue();
});

test('a partner cannot view another partners organization', function () {
    $partnerA = User::factory()->create(['role' => 'partner']);
    $partnerB = User::factory()->create(['role' => 'partner']);
    $organization = PartnerOrganization::factory()->create(['contact_user_id' => $partnerB->id]);

    $response = $this->actingAs($partnerA)->getJson("/api/v1/partner-organizations/{$organization->id}");

    $response->assertForbidden();
});
