<?php

namespace Database\Factories;

use App\Models\AiGenerationJob;
use App\Models\Experience;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AiGenerationJobFactory extends Factory
{
    protected $model = AiGenerationJob::class;

    public function definition(): array
    {
        return [
            'experience_id' => Experience::factory(),
            'requested_by' => User::factory(),
            'status' => AiGenerationJob::STATUS_QUEUED,
            'job_type' => 'story_text',
            'error_message' => null,
            'started_at' => null,
            'completed_at' => null,
        ];
    }
}
