<?php

namespace App\Policies;

use App\Models\Journey;
use App\Models\User;

class JourneyPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Journey $journey): bool
    {
        if ($journey->status === Journey::STATUS_PUBLISHED) {
            return true;
        }

        return $user && ($user->isAdmin() || $journey->created_by === $user->id);
    }

    public function create(User $user): bool
    {
        return $user->isPartner() || $user->isAdmin();
    }

    public function update(User $user, Journey $journey): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isPartner() && $journey->created_by === $user->id;
    }
}
