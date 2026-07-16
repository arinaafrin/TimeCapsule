<?php

namespace App\Services\AI\Contracts;

use App\Models\Experience;

interface StoryGeneratorInterface
{
    /**
     * Generate a ~5 minute narrated story for the given experience.
     *
     * @return array{narrative_script: string, description: string, model: string}
     */
    public function generate(Experience $experience): array;
}
