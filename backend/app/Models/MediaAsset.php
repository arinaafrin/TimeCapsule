<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaAsset extends Model
{
    use HasFactory, HasUuids;

    public const TYPE_PANORAMA_360 = 'panorama_360';

    public const TYPE_STILL_IMAGE = 'still_image';

    public const TYPE_THUMBNAIL = 'thumbnail';

    public const TYPE_3D_MODEL = '3d_model';

    public const SOURCE_AI_GENERATED = 'ai_generated';

    public const SOURCE_ARCHIVAL = 'archival';

    public const SOURCE_PARTNER_UPLOAD = 'partner_upload';

    protected $fillable = [
        'experience_id',
        'type',
        'storage_path',
        'signed_url_expiry_seconds',
        'source_type',
        'attribution_text',
    ];

    protected function casts(): array
    {
        return [
            'signed_url_expiry_seconds' => 'integer',
        ];
    }

    public function experience(): BelongsTo
    {
        return $this->belongsTo(Experience::class);
    }
}
