<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Model => Policy map.
     *
     * MediaAssetPolicy is registered here once MediaAsset lands in Milestone 6.
     */
    protected array $policies = [
        \App\Models\Experience::class => \App\Policies\ExperiencePolicy::class,
    ];

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        foreach ($this->policies as $model => $policy) {
            \Illuminate\Support\Facades\Gate::policy($model, $policy);
        }
    }
}
