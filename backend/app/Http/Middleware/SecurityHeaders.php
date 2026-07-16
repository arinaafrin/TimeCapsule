<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * This is an API-only backend (the React SPA is a separate origin), so
     * the CSP here governs API responses themselves — error pages, any
     * server-rendered content, and defense-in-depth in case a browser ever
     * navigates directly to an endpoint. It intentionally has no
     * 'unsafe-inline'/'unsafe-eval' and no wildcard sources.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('Content-Security-Policy', implode('; ', [
            "default-src 'none'",
            "frame-ancestors 'none'",
            "base-uri 'none'",
        ]));
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

        return $response;
    }
}
