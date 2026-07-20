<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_organizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->foreignUuid('contact_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('verified')->default(false);
            $table->timestamps();

            $table->index('verified');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_organizations');
    }
};
