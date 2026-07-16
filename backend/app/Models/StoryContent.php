<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoryContent extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'experience_id',
        'narrative_script',
        'description',
        'audio_narration_url',
        'ai_model_used',
        'generation_prompt_hash',
        'estimated_duration_seconds',
    ];

    protected function casts(): array
    {
        return [
            'estimated_duration_seconds' => 'integer',
        ];
    }

    public function experience(): BelongsTo
    {
        return $this->belongsTo(Experience::class);
    }
}
