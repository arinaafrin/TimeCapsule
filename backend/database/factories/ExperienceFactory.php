<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Experience;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExperienceFactory extends Factory
{
    protected $model = Experience::class;

    public function definition(): array
    {
        return [
            'city_id' => City::factory(),
            'year' => fake()->numberBetween(-500, 2024),
            'era_label' => fake()->words(2, true),
            'status' => Experience::STATUS_DRAFT,
            'created_by' => null,
            'approved_by' => null,
            'google_maps_link' => null,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => Experience::STATUS_DRAFT]);
    }

    public function pendingReview(): static
    {
        return $this->state(fn () => ['status' => Experience::STATUS_PENDING_REVIEW]);
    }

    public function approved(): static
    {
        return $this->state(fn () => ['status' => Experience::STATUS_APPROVED]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => ['status' => Experience::STATUS_REJECTED]);
    }
}
