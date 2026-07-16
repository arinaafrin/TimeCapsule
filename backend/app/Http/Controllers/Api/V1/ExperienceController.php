<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExperienceRequest;
use App\Http\Requests\UpdateExperienceRequest;
use App\Http\Resources\ExperienceResource;
use App\Models\Experience;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    public function index(Request $request)
    {
        $query = Experience::query()->with('city');

        $user = $request->user();

        if ($user && $user->isAdmin()) {
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
        $experience = Experience::create([
            ...$request->validated(),
            'status' => Experience::STATUS_DRAFT,
            'created_by' => $request->user()->id,
        ]);

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
