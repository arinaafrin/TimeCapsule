<?php

namespace App\Providers;

use App\Models\Experience;
use App\Policies\ExperiencePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Model => Policy map.
     *
     * MediaAssetPolicy is registered here once MediaAsset lands in Milestone 6.
     */
    protected array $policies = [
        Experience::class => ExperiencePolicy::class,
    ];

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }
}
