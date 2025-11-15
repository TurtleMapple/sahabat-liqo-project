<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ClearDatabase extends Command
{
    protected $signature = 'db:clear';
    protected $description = 'Clear all data from database tables';

    public function handle()
    {
        if (!$this->confirm('This will delete ALL data from your database. Are you sure?')) {
            return;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        $tables = [
            'attendances',
            'meetings', 
            'announcements',
            'mentee_group_histories',
            'group_mentor_histories',
            'mentees',
            'groups',
            'profiles',
            'login_attempts',
            'users',
            'personal_access_tokens'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
                $this->info("Cleared: {$table}");
            }
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        $this->info('Database cleared successfully!');
    }
}
