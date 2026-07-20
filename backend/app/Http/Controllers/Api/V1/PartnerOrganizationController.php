<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartnerOrganizationRequest;
use App\Http\Resources\PartnerOrganizationResource;
use App\Models\PartnerOrganization;
use Illuminate\Http\Request;

class PartnerOrganizationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = PartnerOrganization::query();

        if (! $user->isAdmin()) {
            $query->where('contact_user_id', $user->id);
        }

        $organizations = $query->orderByDesc('created_at')->paginate(20);

        return PartnerOrganizationResource::collection($organizations);
    }

    public function show(Request $request, PartnerOrganization $partnerOrganization)
    {
        $this->ensureCanView($request, $partnerOrganization);

        return new PartnerOrganizationResource($partnerOrganization);
    }

    public function store(StorePartnerOrganizationRequest $request)
    {
        $organization = PartnerOrganization::create([
            ...$request->validated(),
            'contact_user_id' => $request->user()->id,
            'verified' => false,
        ]);

        return (new PartnerOrganizationResource($organization))
            ->response()
            ->setStatusCode(201);
    }

    public function verify(Request $request, PartnerOrganization $partnerOrganization)
    {
        $this->ensureIsAdmin($request);

        $partnerOrganization->update(['verified' => true]);

        return new PartnerOrganizationResource($partnerOrganization->fresh());
    }

    protected function ensureCanView(Request $request, PartnerOrganization $organization): void
    {
        $user = $request->user();

        if (! $user->isAdmin() && $organization->contact_user_id !== $user->id) {
            abort(403, 'You do not have permission to view this organization.');
        }
    }

    protected function ensureIsAdmin(Request $request): void
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'Only admins may verify partner organizations.');
        }
    }
}
