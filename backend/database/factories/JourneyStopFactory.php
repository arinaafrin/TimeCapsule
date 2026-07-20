<?php

namespace Database\Factories;

use App\Models\Experience;
use App\Models\Journey;
use App\Models\JourneyStop;
use Illuminate\Database\Eloquent\Factories\Factory;

class JourneyStopFactory extends Factory
{
    protected $model = JourneyStop::class;

    public function definition(): array
    {
        return [
            'journey_id' => Journey::factory(),
            'experience_id' => Experience::factory(),
            'sequence_order' => 0,
            'stop_latitude' => null,
            'stop_longitude' => null,
        ];
    }
}
