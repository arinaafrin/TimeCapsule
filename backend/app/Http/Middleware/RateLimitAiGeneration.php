<?php

namespace App\Http\Middleware;

use App\Models\AiGenerationJob;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RateLimitAiGeneration
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $limit = (int) config('ai.generation_rate_limit_per_hour', 10);

        $recentCount = AiGenerationJob::where('requested_by', $user->id)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($recentCount >= $limit) {
            return response()->json([
                'message' => 'AI generation rate limit exceeded. Please try again later.',
            ], 429);
        }

        return $next($request);
    }
}
