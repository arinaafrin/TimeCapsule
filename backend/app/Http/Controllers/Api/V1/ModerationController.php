<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExperienceResource;
use App\Http\Resources\ModerationLogResource;
use App\Models\Experience;
use App\Models\ModerationLog;
use Illuminate\Http\Request;

class ModerationController extends Controller
{
    public function queue(Request $request)
    {
        $this->ensureIsAdmin($request);

        $experiences = Experience::query()
            ->where('status', Experience::STATUS_PENDING_REVIEW)
            ->with('city')
            ->orderBy('created_at')
            ->paginate(20);

        return ExperienceResource::collection($experiences);
    }

    public function approve(Request $request, Experience $experience)
    {
        $this->ensureIsAdmin($request);

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $experience->update([
            'status' => Experience::STATUS_APPROVED,
            'approved_by' => $request->user()->id,
        ]);

        $this->logAction($experience, $request->user()->id, ModerationLog::ACTION_APPROVED, $validated['notes'] ?? null);

        return new ExperienceResource($experience->fresh('city'));
    }

    public function reject(Request $request, Experience $experience)
    {
        $this->ensureIsAdmin($request);

        $validated = $request->validate([
            'notes' => ['required', 'string', 'max:2000'],
        ]);

        $experience->update([
            'status' => Experience::STATUS_REJECTED,
        ]);

        $this->logAction($experience, $request->user()->id, ModerationLog::ACTION_REJECTED, $validated['notes']);

        return new ExperienceResource($experience->fresh('city'));
    }

    public function comment(Request $request, Experience $experience)
    {
        $this->ensureIsAdmin($request);

        $validated = $request->validate([
            'notes' => ['required', 'string', 'max:2000'],
        ]);

        $log = $this->logAction($experience, $request->user()->id, ModerationLog::ACTION_COMMENT, $validated['notes']);

        return (new ModerationLogResource($log))->response()->setStatusCode(201);
    }

    public function logs(Request $request, Experience $experience)
    {
        $this->ensureIsAdmin($request);

        return ModerationLogResource::collection($experience->moderationLogs);
    }

    protected function ensureIsAdmin(Request $request): void
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            abort(403, 'Only admins may perform moderation actions.');
        }
    }

    protected function logAction(Experience $experience, string $reviewerId, string $action, ?string $notes): ModerationLog
    {
        return ModerationLog::create([
            'experience_id' => $experience->id,
            'reviewer_id' => $reviewerId,
            'action' => $action,
            'notes' => $notes,
        ]);
    }
}
