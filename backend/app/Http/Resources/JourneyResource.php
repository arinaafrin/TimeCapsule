<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JourneyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'city' => new CityResource($this->whenLoaded('city')),
            'city_id' => $this->city_id,
            'status' => $this->status,
            'created_by' => $this->created_by,
            'stops' => JourneyStopResource::collection($this->whenLoaded('stops')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
