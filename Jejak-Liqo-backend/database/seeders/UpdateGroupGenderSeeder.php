<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Group;
use App\Models\User;

class UpdateGroupGenderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groups = Group::with('mentor.profile')->get();
        
        foreach ($groups as $group) {
            if ($group->mentor && $group->mentor->profile) {
                $mentorGender = $group->mentor->profile->gender;
                $group->update(['gender' => $mentorGender]);
                $this->command->info("Updated group {$group->group_name} with gender: {$mentorGender}");
            }
        }
        
        $this->command->info('Group gender update completed!');
    }
}