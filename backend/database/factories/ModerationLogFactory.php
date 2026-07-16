<?php

namespace Database\Factories;

use App\Models\Experience;
use App\Models\ModerationLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ModerationLogFactory extends Factory
{
    protected $model = ModerationLog::class;

    public function definition(): array
    {
        return [
            'experience_id' => Experience::factory(),
            'reviewer_id' => User::factory(['role' => 'admin']),
            'action' => ModerationLog::ACTION_COMMENT,
            'notes' => fake()->sentence(),
        ];
    }
}
