<?php

namespace App\Http\Resources;

use App\Services\Media\SignedUrlService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaAssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'experience_id' => $this->experience_id,
            'type' => $this->type,
            'source_type' => $this->source_type,
            'attribution_text' => $this->attribution_text,
            'url' => app(SignedUrlService::class)->urlFor($this->resource),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
