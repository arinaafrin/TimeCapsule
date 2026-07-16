<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExperienceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\Experience::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'city_id' => ['required', 'uuid', 'exists:cities,id'],
            'year' => ['required', 'integer', 'min:-3000', 'max:2100'],
            'era_label' => ['nullable', 'string', 'max:255'],
            'google_maps_link' => ['nullable', 'url'],
        ];
    }
}
