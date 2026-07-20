<?php

namespace Database\Factories;

use App\Models\PartnerOrganization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PartnerOrganizationFactory extends Factory
{
    protected $model = PartnerOrganization::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company().' Museum',
            'contact_user_id' => User::factory()->partner(),
            'verified' => false,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn () => ['verified' => true]);
    }
}
