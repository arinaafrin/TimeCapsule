<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoryContentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'narrative_script' => $this->narrative_script,
            'description' => $this->description,
            'audio_narration_url' => $this->audio_narration_url,
            'ai_model_used' => $this->ai_model_used,
            'estimated_duration_seconds' => $this->estimated_duration_seconds,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
