<?php

use App\Http\Controllers\Api\V1\AiGenerationController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CityController;
use App\Http\Controllers\Api\V1\ExperienceController;
use App\Http\Controllers\Api\V1\FavoriteController;
use App\Http\Controllers\Api\V1\GoogleAuthController;
use App\Http\Controllers\Api\V1\JourneyController;
use App\Http\Controllers\Api\V1\MediaController;
use App\Http\Controllers\Api\V1\ModerationController;
use App\Http\Controllers\Api\V1\PartnerOrganizationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    Route::get('/ping', function () {
        return response()->json([
            'service' => 'timecapsule-api',
            'status' => 'ok',
        ]);
    });

    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

        Route::get('/google/redirect', [GoogleAuthController::class, 'redirect']);
        Route::get('/google/callback', [GoogleAuthController::class, 'callback']);
    });

    // Cities — public read access, indexed for the Explorer map/search UI.
    Route::get('/cities', [CityController::class, 'index']);
    Route::get('/cities/{id}', [CityController::class, 'show']);

    // Experiences — index/show are publicly reachable (guarded internally by
    // status + policy checks); mutating routes require auth.
    Route::get('/experiences', [ExperienceController::class, 'index']);
    Route::get('/experiences/{experience}', [ExperienceController::class, 'show']);

    // Media — listing is public (assets only exist on viewable experiences);
    // uploading/generating requires auth + ownership.
    Route::get('/experiences/{experience}/media', [MediaController::class, 'index']);

    // Journeys — a themed, ordered collection of Stops (each Stop reuses the
    // existing Experience model + generation pipeline unchanged). Index/show
    // are public (guarded internally by JourneyPolicy + published status);
    // creating one requires partner/admin and auto-dispatches generation for
    // every stop in a single request.
    Route::get('/journeys', [JourneyController::class, 'index']);
    Route::get('/journeys/{journey}', [JourneyController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);

        Route::post('/experiences', [ExperienceController::class, 'store']);
        Route::patch('/experiences/{experience}', [ExperienceController::class, 'update']);
        Route::delete('/experiences/{experience}', [ExperienceController::class, 'destroy']);

        Route::post('/experiences/{experience}/generate', [AiGenerationController::class, 'generate'])
            ->middleware('ai.rate_limit');
        Route::get('/ai-jobs/{aiJob}', [AiGenerationController::class, 'show']);

        Route::post('/experiences/{experience}/media', [MediaController::class, 'store']);
        Route::post('/experiences/{experience}/generate-media', [MediaController::class, 'generate'])
            ->middleware('ai.rate_limit');

        Route::post('/journeys', [JourneyController::class, 'store']);

        // Moderation — admin-only, enforced inside ModerationController.
        Route::get('/moderation/queue', [ModerationController::class, 'queue']);
        Route::post('/moderation/{experience}/approve', [ModerationController::class, 'approve']);
        Route::post('/moderation/{experience}/reject', [ModerationController::class, 'reject']);
        Route::post('/moderation/{experience}/comment', [ModerationController::class, 'comment']);
        Route::get('/moderation/{experience}/logs', [ModerationController::class, 'logs']);

        // Favorites — Milestone 9.
        Route::get('/me/favorites', [FavoriteController::class, 'index']);
        Route::post('/experiences/{experience}/favorite', [FavoriteController::class, 'store']);
        Route::delete('/experiences/{experience}/favorite', [FavoriteController::class, 'destroy']);

        // Partner Organizations & Institution Dashboard — Milestone 10.
        Route::get('/partner-organizations', [PartnerOrganizationController::class, 'index']);
        Route::get('/partner-organizations/{partnerOrganization}', [PartnerOrganizationController::class, 'show']);
        Route::post('/partner-organizations', [PartnerOrganizationController::class, 'store'])
            ->middleware('role:partner,admin');
        Route::post('/partner-organizations/{partnerOrganization}/verify', [PartnerOrganizationController::class, 'verify'])
            ->middleware('role:admin');
    });
});
