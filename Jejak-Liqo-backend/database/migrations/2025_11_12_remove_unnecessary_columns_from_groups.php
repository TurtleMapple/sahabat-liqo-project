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
            $table->dropColumn([
                'max_capacity',
                'status',
                'start_date',
                'end_date',
                'category',
                'meeting_schedule',
                'location',
                'objectives'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->integer('max_capacity')->default(10)->after('description');
            $table->enum('status', ['active', 'inactive', 'completed'])->default('active')->after('max_capacity');
            $table->date('start_date')->nullable()->after('status');
            $table->date('end_date')->nullable()->after('start_date');
            $table->enum('category', ['regular', 'intensive', 'special'])->default('regular')->after('end_date');
            $table->string('meeting_schedule')->nullable()->after('category');
            $table->string('location')->nullable()->after('meeting_schedule');
            $table->json('objectives')->nullable()->after('location');
        });
    }
};