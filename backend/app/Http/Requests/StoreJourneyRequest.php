<?php

namespace App\Http\Requests;

use App\Models\Journey;
use Illuminate\Foundation\Http\FormRequest;

class StoreJourneyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Journey::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'city_id' => ['required', 'uuid', 'exists:cities,id'],

            // A Journey needs at least two Stops — a single stop is just a
            // regular Experience and doesn't need this feature at all.
            'stops' => ['required', 'array', 'min:2'],
            'stops.*.year' => ['required', 'integer', 'min:-3000', 'max:2100'],
            'stops.*.era_label' => ['nullable', 'string', 'max:255'],
            'stops.*.stop_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'stops.*.stop_longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }
}
