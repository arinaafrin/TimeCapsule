<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExperienceRequest;
use App\Http\Requests\UpdateExperienceRequest;
use App\Http\Resources\ExperienceResource;
use App\Models\Experience;
use App\Services\Maps\GoogleMapsService;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    public function __construct(protected GoogleMapsService $mapsService)
    {
    }

    public function index(Request $request)
    {
        $query = Experience::query()->with('city');

        $user = $request->user();

        if ($request->boolean('mine')) {
            // "My Experiences" — owner sees every one of their own, regardless
            // of status (draft/pending/approved/rejected), unlike the default
            // visibility rules below.
            if (! $user) {
                abort(403, 'You must be logged in to view your own experiences.');
            }
            $query->where('created_by', $user->id);
        } elseif ($user && $user->isAdmin()) {
            // Admins may optionally filter by any status; default to all.
            if ($status = $request->query('status')) {
                $query->where('status', $status);
            }
        } elseif ($user) {
            // Authenticated non-admins see approved experiences plus their own.
            $query->where(function ($q) use ($user) {
                $q->where('status', Experience::STATUS_APPROVED)
                    ->orWhere('created_by', $user->id);
            });
        } else {
            // Guests only ever see approved experiences.
            $query->where('status', Experience::STATUS_APPROVED);
        }

        if ($cityId = $request->query('city_id')) {
            $query->where('city_id', $cityId);
        }

        if ($year = $request->query('year')) {
            $query->where('year', $year);
        }

        // Full-text-style search across city name and era/theme label, per the
        // "Browse by city, era, theme" Search & Discovery requirement (Milestone 9).
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('era_label', 'ilike', "%{$search}%")
                    ->orWhereHas('city', function ($cityQuery) use ($search) {
                        $cityQuery->where('name', 'ilike', "%{$search}%");
                    });
            });
        }

        $experiences = $query->orderByDesc('created_at')->paginate(20);

        return ExperienceResource::collection($experiences);
    }

    public function show(Request $request, Experience $experience)
    {
        $this->authorize('view', $experience);

        return new ExperienceResource($experience->load('city', 'storyContent'));
    }

    public function store(StoreExperienceRequest $request)
    {
        $data = [
            ...$request->validated(),
            'status' => Experience::STATUS_DRAFT,
            'created_by' => $request->user()->id,
        ];

        // Resolve the partner-supplied Google Maps link (if any) into real
        // coordinates + a place name, so story/image generation can be
        // grounded in the specific pinned location rather than just the
        // city name. Resolution failures (dead link, unsupported format,
        // API quota) never block experience creation — the pin fields
        // simply stay null and generation falls back to the city name.
        if (! empty($data['google_maps_link'])) {
            $resolved = $this->mapsService->resolveLink($data['google_maps_link']);

            if ($resolved !== null) {
                $data['pin_latitude'] = $resolved['latitude'];
                $data['pin_longitude'] = $resolved['longitude'];
                $data['pin_place_name'] = $resolved['place_name'];
            }
        }

        $experience = Experience::create($data);

        return (new ExperienceResource($experience->load('city')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateExperienceRequest $request, Experience $experience)
    {
        $experience->update($request->validated());

        return new ExperienceResource($experience->fresh('city'));
    }

    public function destroy(Request $request, Experience $experience)
    {
        $this->authorize('delete', $experience);

        $experience->delete();

        return response()->noContent();
    }
}
