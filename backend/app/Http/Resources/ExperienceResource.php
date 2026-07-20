<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExperienceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'city' => new CityResource($this->whenLoaded('city')),
            'city_id' => $this->city_id,
            'year' => $this->year,
            'era_label' => $this->era_label,
            'status' => $this->status,
            'created_by' => $this->created_by,
            'approved_by' => $this->approved_by,
            'google_maps_link' => $this->google_maps_link,
            'pin_latitude' => $this->pin_latitude !== null ? (float) $this->pin_latitude : null,
            'pin_longitude' => $this->pin_longitude !== null ? (float) $this->pin_longitude : null,
            'pin_place_name' => $this->pin_place_name,
            'story_content' => new StoryContentResource($this->whenLoaded('storyContent')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
