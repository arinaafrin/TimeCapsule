<?php

namespace App\Providers;

use App\Services\AI\Contracts\ImageGeneratorInterface;
use App\Services\AI\Contracts\StoryGeneratorInterface;
use App\Services\AI\ImageGenerationService;
use App\Services\AI\StoryGenerationService;
use Illuminate\Support\ServiceProvider;

class AiServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Only the "anthropic" story provider is implemented today; the
        // config switch exists so a second adapter can be added later
        // without touching call sites (GenerateStoryJob only depends on
        // the interface).
        $this->app->bind(StoryGeneratorInterface::class, function () {
            return match (config('services.ai_story.provider', 'anthropic')) {
                default => new StoryGenerationService(),
            };
        });

        // Same pattern for image generation — only "stability" is
        // implemented; GenerateMediaJob only depends on the interface.
        $this->app->bind(ImageGeneratorInterface::class, function () {
            return match (config('services.ai_image.provider', 'stability')) {
                default => new ImageGenerationService(),
            };
        });
    }

    public function boot(): void
    {
        //
    }
}
