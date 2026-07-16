<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_assets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('experience_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // panorama_360, still_image, thumbnail, 3d_model
            $table->string('storage_path');
            $table->unsignedInteger('signed_url_expiry_seconds')->default(900);
            $table->string('source_type'); // ai_generated, archival, partner_upload
            $table->string('attribution_text')->nullable();
            $table->timestamps();

            $table->index(['experience_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_assets');
    }
};
