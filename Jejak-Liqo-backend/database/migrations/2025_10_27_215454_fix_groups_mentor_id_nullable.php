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
        Schema::table('groups', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['mentor_id']);
            
            // Make mentor_id nullable and add new constraint
            $table->foreignId('mentor_id')->nullable()->change();
            $table->foreign('mentor_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->dropForeign(['mentor_id']);
            $table->foreignId('mentor_id')->nullable(false)->change();
            $table->foreign('mentor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};