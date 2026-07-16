<?php

use App\Http\Controllers\Api\V1\AiGenerationController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CityController;
use App\Http\Controllers\Api\V1\ExperienceController;
use App\Http\Controllers\Api\V1\GoogleAuthController;
use App\Http\Controllers\Api\V1\MediaController;
use App\Http\Controllers\Api\V1\ModerationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — v1
|--------------------------------------------------------------------------
|
| Favorites routes are added in a later milestone (see docs/PROJECT_SPEC.md).
|
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

        // Moderation — admin-only, enforced inside ModerationController.
        Route::get('/moderation/queue', [ModerationController::class, 'queue']);
        Route::post('/moderation/{experience}/approve', [ModerationController::class, 'approve']);
        Route::post('/moderation/{experience}/reject', [ModerationController::class, 'reject']);
        Route::post('/moderation/{experience}/comment', [ModerationController::class, 'comment']);
        Route::get('/moderation/{experience}/logs', [ModerationController::class, 'logs']);
    });
});
