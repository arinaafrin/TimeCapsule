<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Journey;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class JourneyFactory extends Factory
{
    protected $model = Journey::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'city_id' => City::factory(),
            'created_by' => User::factory()->partner(),
            'status' => Journey::STATUS_DRAFT,
        ];
    }
}
