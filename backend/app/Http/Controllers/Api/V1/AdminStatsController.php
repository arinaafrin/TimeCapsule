<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AiGenerationJob;
use App\Models\City;
use App\Models\Experience;
use App\Models\Favorite;
use App\Models\Journey;
use App\Models\ModerationLog;
use App\Models\PartnerOrganization;
use App\Models\User;

class AdminStatsController extends Controller
{
    /**
     * Platform-wide counts + recent activity, for the admin dashboard.
     * Route is gated by `role:admin` middleware, so no in-controller check needed.
     */
    public function index()
    {
        return response()->json([
            'data' => [
                'users' => [
                    'total' => User::count(),
                    'by_role' => [
                        'visitor' => User::where('role', User::ROLE_VISITOR)->count(),
                        'partner' => User::where('role', User::ROLE_PARTNER)->count(),
                        'admin' => User::where('role', User::ROLE_ADMIN)->count(),
                    ],
                ],
                'cities' => [
                    'total' => City::count(),
                ],
                'experiences' => [
                    'total' => Experience::count(),
                    'by_status' => [
                        'draft' => Experience::where('status', Experience::STATUS_DRAFT)->count(),
                        'pending_review' => Experience::where('status', Experience::STATUS_PENDING_REVIEW)->count(),
                        'approved' => Experience::where('status', Experience::STATUS_APPROVED)->count(),
                        'rejected' => Experience::where('status', Experience::STATUS_REJECTED)->count(),
                        'archived' => Experience::where('status', Experience::STATUS_ARCHIVED)->count(),
                    ],
                ],
                'journeys' => [
                    'total' => Journey::count(),
                    'by_status' => [
                        'draft' => Journey::where('status', Journey::STATUS_DRAFT)->count(),
                        'pending_review' => Journey::where('status', Journey::STATUS_PENDING_REVIEW)->count(),
                        'published' => Journey::where('status', Journey::STATUS_PUBLISHED)->count(),
                    ],
                ],
                'ai_generation_jobs' => [
                    'total' => AiGenerationJob::count(),
                    'by_status' => [
                        'queued' => AiGenerationJob::where('status', AiGenerationJob::STATUS_QUEUED)->count(),
                        'processing' => AiGenerationJob::where('status', AiGenerationJob::STATUS_PROCESSING)->count(),
                        'completed' => AiGenerationJob::where('status', AiGenerationJob::STATUS_COMPLETED)->count(),
                        'failed' => AiGenerationJob::where('status', AiGenerationJob::STATUS_FAILED)->count(),
                    ],
                    'recent_failures' => AiGenerationJob::where('status', AiGenerationJob::STATUS_FAILED)
                        ->with('experience.city')
                        ->latest('completed_at')
                        ->limit(5)
                        ->get()
                        ->map(fn (AiGenerationJob $job) => [
                            'id' => $job->id,
                            'job_type' => $job->job_type,
                            'error_message' => $job->error_message,
                            'experience_id' => $job->experience_id,
                            'city' => $job->experience?->city?->name,
                            'failed_at' => $job->completed_at?->toIso8601String(),
                        ]),
                ],
                'favorites' => [
                    'total' => Favorite::count(),
                ],
                'partner_organizations' => [
                    'total' => PartnerOrganization::count(),
                    'verified' => PartnerOrganization::where('verified', true)->count(),
                    'pending' => PartnerOrganization::where('verified', false)->count(),
                ],
                'recent_moderation_activity' => ModerationLog::with(['experience.city', 'reviewer'])
                    ->latest('created_at')
                    ->limit(10)
                    ->get()
                    ->map(fn (ModerationLog $log) => [
                        'id' => $log->id,
                        'action' => $log->action,
                        'notes' => $log->notes,
                        'reviewer_name' => $log->reviewer?->name,
                        'experience_id' => $log->experience_id,
                        'era_label' => $log->experience?->era_label,
                        'city' => $log->experience?->city?->name,
                        'created_at' => $log->created_at?->toIso8601String(),
                    ]),
            ],
        ]);
    }
}
