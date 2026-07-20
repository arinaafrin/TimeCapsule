<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('experiences', function (Blueprint $table) {
            // Populated server-side by resolving `google_maps_link` (see
            // GoogleMapsService::resolveLink()). Nullable because the link
            // itself is optional and resolution can fail (dead link,
            // unsupported URL format, API quota, etc.) without blocking
            // experience creation.
            $table->decimal('pin_latitude', 10, 7)->nullable()->after('google_maps_link');
            $table->decimal('pin_longitude', 10, 7)->nullable()->after('pin_latitude');
            $table->string('pin_place_name')->nullable()->after('pin_longitude');
        });
    }

    public function down(): void
    {
        Schema::table('experiences', function (Blueprint $table) {
            $table->dropColumn(['pin_latitude', 'pin_longitude', 'pin_place_name']);
        });
    }
};
