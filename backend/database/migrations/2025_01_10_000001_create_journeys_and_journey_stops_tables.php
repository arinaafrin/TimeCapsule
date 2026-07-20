<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journeys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignUuid('city_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('draft'); // draft, pending_review, published
            $table->timestamps();
        });

        Schema::create('journey_stops', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('journey_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('experience_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('sequence_order')->default(0);
            // Nullable: a stop may reuse the journey's overall city location,
            // or pin its own distinct coordinate along a walking route.
            $table->decimal('stop_latitude', 10, 7)->nullable();
            $table->decimal('stop_longitude', 10, 7)->nullable();
            $table->timestamps();

            $table->unique(['journey_id', 'sequence_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journey_stops');
        Schema::dropIfExists('journeys');
    }
};
