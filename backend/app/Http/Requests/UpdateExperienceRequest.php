<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExperienceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('experience')) ?? false;
    }

    public function rules(): array
    {
        return [
            'city_id' => ['sometimes', 'uuid', 'exists:cities,id'],
            'year' => ['sometimes', 'integer', 'min:-3000', 'max:2100'],
            'era_label' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'in:draft,pending_review,approved,rejected,archived'],
            'google_maps_link' => ['sometimes', 'nullable', 'url'],
        ];
    }
}
