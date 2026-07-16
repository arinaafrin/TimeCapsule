<?php

namespace App\Jobs;

use App\Models\AiGenerationJob;
use App\Models\MediaAsset;
use App\Services\AI\Contracts\ImageGeneratorInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GenerateMediaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 180;

    // Named $aiGenerationJob (not $job) — InteractsWithQueue already
    // declares a $job property internally, so reusing that name causes a
    // fatal property collision (see GenerateStoryJob for the same fix).
    public function __construct(public AiGenerationJob $aiGenerationJob) {}

    public function handle(ImageGeneratorInterface $generator): void
    {
        $this->aiGenerationJob->update([
            'status' => AiGenerationJob::STATUS_PROCESSING,
            'started_at' => now(),
        ]);

        try {
            $experience = $this->aiGenerationJob->experience;

            $result = $generator->generatePanorama($experience);

            $extension = str_contains($result['content_type'], 'png') ? 'png' : 'jpg';
            $path = "media/experiences/{$experience->id}/".Str::uuid().".{$extension}";

            Storage::disk(config('filesystems.default'))->put($path, $result['binary']);

            MediaAsset::create([
                'experience_id' => $experience->id,
                'type' => MediaAsset::TYPE_PANORAMA_360,
                'storage_path' => $path,
                'signed_url_expiry_seconds' => config('media.signed_url_ttl_seconds'),
                'source_type' => MediaAsset::SOURCE_AI_GENERATED,
            ]);

            $this->aiGenerationJob->update([
                'status' => AiGenerationJob::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);
        } catch (\Throwable $e) {
            $this->aiGenerationJob->update([
                'status' => AiGenerationJob::STATUS_FAILED,
                'error_message' => $e->getMessage(),
                'completed_at' => now(),
            ]);

            throw $e;
        }
    }
}
