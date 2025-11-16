<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('meetings', function (Blueprint $table) {
            // Rename photo to photos and change to JSON type
            $table->json('photos')->nullable()->after('notes');
        });
        
        // Copy data from photo to photos if exists
        DB::statement("UPDATE meetings SET photos = JSON_ARRAY(photo) WHERE photo IS NOT NULL");
        
        Schema::table('meetings', function (Blueprint $table) {
            // Drop old photo column
            $table->dropColumn('photo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meetings', function (Blueprint $table) {
            // Add back photo column
            $table->string('photo')->nullable()->after('notes');
        });
        
        // Copy first photo from photos array back to photo
        DB::statement("UPDATE meetings SET photo = JSON_UNQUOTE(JSON_EXTRACT(photos, '$[0]')) WHERE photos IS NOT NULL");
        
        Schema::table('meetings', function (Blueprint $table) {
            // Drop photos column
            $table->dropColumn('photos');
        });
    }
};