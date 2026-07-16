<?php

return [

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'google_maps' => [
        'server_api_key' => env('GOOGLE_MAPS_SERVER_API_KEY'),
    ],

    'ai_story' => [
        'provider' => env('AI_STORY_PROVIDER', 'anthropic'),
        'anthropic_api_key' => env('ANTHROPIC_API_KEY'),
    ],

    'ai_image' => [
        'provider' => env('AI_IMAGE_PROVIDER', 'stability'),
        'api_key' => env('AI_IMAGE_API_KEY'),
    ],

];
