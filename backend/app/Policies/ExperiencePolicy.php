<?php

namespace App\Policies;

use App\Models\Experience;
use App\Models\User;

class ExperiencePolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Experience $experience): bool
    {
        if ($experience->isApproved()) {
            return true;
        }

        return $user && ($user->isAdmin() || $experience->created_by === $user->id);
    }

    public function create(User $user): bool
    {
        return $user->isPartner() || $user->isAdmin();
    }

    public function update(User $user, Experience $experience): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isPartner() && $experience->created_by === $user->id;
    }

    public function delete(User $user, Experience $experience): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isPartner() && $experience->created_by === $user->id;
    }
}
