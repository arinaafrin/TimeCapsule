<?php

namespace Database\Factories;

use App\Models\Experience;
use App\Models\MediaAsset;
use Illuminate\Database\Eloquent\Factories\Factory;

class MediaAssetFactory extends Factory
{
    protected $model = MediaAsset::class;

    public function definition(): array
    {
        return [
            'experience_id' => Experience::factory(),
            'type' => MediaAsset::TYPE_PANORAMA_360,
            'storage_path' => 'media/'.fake()->uuid().'.jpg',
            'signed_url_expiry_seconds' => 900,
            'source_type' => MediaAsset::SOURCE_AI_GENERATED,
            'attribution_text' => null,
        ];
    }
}
