<?php

return [
    'story_provider' => env('AI_STORY_PROVIDER', 'anthropic'),
    'image_provider' => env('AI_IMAGE_PROVIDER', 'stability'),
    'generation_rate_limit_per_hour' => env('AI_GENERATION_RATE_LIMIT_PER_HOUR', 10),
];
