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
        Schema::table('mentees', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['group_id']);
            
            // Make group_id nullable and add new constraint
            $table->foreignId('group_id')->nullable()->change();
            $table->foreign('group_id')->references('id')->on('groups')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mentees', function (Blueprint $table) {
            $table->dropForeign(['group_id']);
            $table->foreignId('group_id')->nullable(false)->change();
            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
        });
    }
};