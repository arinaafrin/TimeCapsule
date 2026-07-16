<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_generation_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('experience_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('requested_by')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('queued'); // queued, processing, completed, failed
            $table->string('job_type')->default('story_text'); // story_text, image, full_bundle
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['experience_id', 'status']);
        });

        Schema::create('story_contents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('experience_id')->constrained()->cascadeOnDelete()->unique();
            $table->longText('narrative_script');
            $table->text('description');
            $table->string('audio_narration_url')->nullable();
            $table->string('ai_model_used')->nullable();
            $table->string('generation_prompt_hash')->nullable();
            $table->unsignedInteger('estimated_duration_seconds')->default(300);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('story_contents');
        Schema::dropIfExists('ai_generation_jobs');
    }
};
