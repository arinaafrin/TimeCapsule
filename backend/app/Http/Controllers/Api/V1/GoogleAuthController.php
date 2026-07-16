<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;

class GoogleAuthController extends Controller
{
    public function redirect(): mixed
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback(): JsonResponse|RedirectResponse
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if (! $user) {
            $user = User::create([
                'name' => $googleUser->getName() ?: $googleUser->getNickname() ?: 'TimeCapsule Explorer',
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => Str::random(32),
                'role' => User::ROLE_VISITOR,
                'email_verified_at' => now(),
            ]);
        } elseif (! $user->google_id) {
            $user->update(['google_id' => $googleUser->getId()]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        // Hand the token back to the SPA via a redirect fragment rather than a
        // JSON body, since this endpoint is reached via full-page browser
        // redirect, not an XHR/fetch call.
        return Redirect::away(
            rtrim(config('app.frontend_url'), '/').'/auth/callback#token='.$token
        );
    }
}
