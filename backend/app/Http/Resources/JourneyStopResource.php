<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JourneyStopResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sequence_order' => $this->sequence_order,
            'stop_latitude' => $this->stop_latitude !== null ? (float) $this->stop_latitude : null,
            'stop_longitude' => $this->stop_longitude !== null ? (float) $this->stop_longitude : null,
            'experience' => new ExperienceResource($this->whenLoaded('experience')),
        ];
    }
}
