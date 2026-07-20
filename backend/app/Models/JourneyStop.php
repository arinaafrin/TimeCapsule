<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JourneyStop extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'journey_id',
        'experience_id',
        'sequence_order',
        'stop_latitude',
        'stop_longitude',
    ];

    protected function casts(): array
    {
        return [
            'sequence_order' => 'integer',
            'stop_latitude' => 'decimal:7',
            'stop_longitude' => 'decimal:7',
        ];
    }

    public function journey(): BelongsTo
    {
        return $this->belongsTo(Journey::class);
    }

    public function experience(): BelongsTo
    {
        return $this->belongsTo(Experience::class);
    }
}
