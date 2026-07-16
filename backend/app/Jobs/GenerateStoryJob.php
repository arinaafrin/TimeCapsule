<?php

namespace App\Jobs;

use App\Models\AiGenerationJob;
use App\Models\Experience;
use App\Models\StoryContent;
use App\Services\AI\Contracts\StoryGeneratorInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateStoryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 180;

    // Named $aiGenerationJob (not $job) because InteractsWithQueue already
    // declares a $job property internally (the underlying queue job
    // wrapper) — reusing that name causes a fatal property collision.
    public function __construct(public AiGenerationJob $aiGenerationJob) {}

    public function handle(StoryGeneratorInterface $generator): void
    {
        $this->aiGenerationJob->update([
            'status' => AiGenerationJob::STATUS_PROCESSING,
            'started_at' => now(),
        ]);

        try {
            $experience = $this->aiGenerationJob->experience;

            $result = $generator->generate($experience);

            StoryContent::updateOrCreate(
                ['experience_id' => $experience->id],
                [
                    'narrative_script' => $result['narrative_script'],
                    'description' => $result['description'],
                    'ai_model_used' => $result['model'],
                    'estimated_duration_seconds' => 300,
                ]
            );

            $this->aiGenerationJob->update([
                'status' => AiGenerationJob::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);

            $experience->update(['status' => Experience::STATUS_PENDING_REVIEW]);
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
