<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AiGenerationJobResource;
use App\Jobs\GenerateStoryJob;
use App\Models\AiGenerationJob;
use App\Models\Experience;
use Illuminate\Http\Request;

class AiGenerationController extends Controller
{
    public function generate(Request $request, Experience $experience)
    {
        // Reuses the "update" policy rule: only the owning partner or an
        // admin may request generation for an experience.
        if (! $request->user()->can('update', $experience)) {
            abort(403, 'You are not authorized to generate a story for this experience.');
        }

        $job = AiGenerationJob::create([
            'experience_id' => $experience->id,
            'requested_by' => $request->user()->id,
            'status' => AiGenerationJob::STATUS_QUEUED,
            'job_type' => 'story_text',
        ]);

        GenerateStoryJob::dispatch($job);

        return response()->json([
            'job_id' => $job->id,
            'status' => $job->status,
        ], 202);
    }

    public function show(Request $request, AiGenerationJob $aiJob)
    {
        $user = $request->user();

        if (! $user->isAdmin() && $aiJob->requested_by !== $user->id) {
            abort(403, 'You are not authorized to view this job.');
        }

        return new AiGenerationJobResource($aiJob);
    }
}
