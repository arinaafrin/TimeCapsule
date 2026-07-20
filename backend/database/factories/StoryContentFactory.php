<?php

namespace Database\Factories;

use App\Models\Experience;
use App\Models\StoryContent;
use Illuminate\Database\Eloquent\Factories\Factory;

class StoryContentFactory extends Factory
{
    protected $model = StoryContent::class;

    public function definition(): array
    {
        return [
            'experience_id' => Experience::factory(),
            'narrative_script' => fake()->paragraphs(4, true),
            'description' => fake()->sentence(12),
            'audio_narration_url' => null,
            'ai_model_used' => 'claude-sonnet-5',
            'generation_prompt_hash' => fake()->sha256(),
            'estimated_duration_seconds' => 300,
        ];
    }
}
