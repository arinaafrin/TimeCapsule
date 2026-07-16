<?php

namespace App\Services\AI\Contracts;

use App\Models\Experience;

interface ImageGeneratorInterface
{
    /**
     * Generate a 360-degree panorama image for the given experience.
     *
     * @return array{binary: string, content_type: string}
     */
    public function generatePanorama(Experience $experience): array;
}
