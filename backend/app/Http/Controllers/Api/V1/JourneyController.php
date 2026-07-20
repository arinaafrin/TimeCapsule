<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJourneyRequest;
use App\Http\Resources\JourneyResource;
use App\Jobs\GenerateStoryJob;
use App\Models\AiGenerationJob;
use App\Models\Experience;
use App\Models\Journey;
use App\Models\JourneyStop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JourneyController extends Controller
{
    public function index(Request $request)
    {
        $journeys = Journey::query()
            ->where('status', Journey::STATUS_PUBLISHED)
            ->with('city')
            ->orderByDesc('created_at')
            ->paginate(20);

        return JourneyResource::collection($journeys);
    }

    public function show(Request $request, Journey $journey)
    {
        $this->authorize('view', $journey);

        $journey->load(['city', 'stops.experience.city', 'stops.experience.storyContent']);

        return new JourneyResource($journey);
    }

    public function store(StoreJourneyRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();

        $journey = DB::transaction(function () use ($data, $user) {
            $journey = Journey::create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'city_id' => $data['city_id'],
                'created_by' => $user->id,
                'status' => Journey::STATUS_DRAFT,
            ]);

            foreach ($data['stops'] as $index => $stopData) {
                // Each Stop reuses the exact same Experience model and
                // generation pipeline as a standalone TimeCapsule — a
                // Journey is just N Experiences linked together in order,
                // not a separate content system.
                $experience = Experience::create([
                    'city_id' => $data['city_id'],
                    'year' => $stopData['year'],
                    'era_label' => $stopData['era_label'] ?? null,
                    'status' => Experience::STATUS_DRAFT,
                    'created_by' => $user->id,
                ]);

                JourneyStop::create([
                    'journey_id' => $journey->id,
                    'experience_id' => $experience->id,
                    'sequence_order' => $index,
                    'stop_latitude' => $stopData['stop_latitude'] ?? null,
                    'stop_longitude' => $stopData['stop_longitude'] ?? null,
                ]);

                // Auto-dispatch generation for every stop immediately, so
                // the partner doesn't have to make N follow-up requests —
                // this is the actual reuse of the existing generation
                // pipeline the architecture doc calls for.
                $job = AiGenerationJob::create([
                    'experience_id' => $experience->id,
                    'requested_by' => $user->id,
                    'status' => AiGenerationJob::STATUS_QUEUED,
                    'job_type' => 'story_text',
                ]);

                GenerateStoryJob::dispatch($job);
            }

            return $journey;
        });

        $journey->load(['city', 'stops.experience']);

        return (new JourneyResource($journey))
            ->response()
            ->setStatusCode(201);
    }
}
