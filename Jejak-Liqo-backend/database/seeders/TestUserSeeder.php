<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    public function run()
    {
        // Create test mentor
        $mentor = User::create([
            'email' => 'mentor@test.com',
            'password' => Hash::make('password'),
            'role' => 'mentor',
        ]);

        Profile::create([
            'user_id' => $mentor->id,
            'full_name' => 'Ahmad Mentor Test',
            'gender' => 'Ikhwan',
            'nickname' => 'Ahmad',
            'phone_number' => '081234567890',
            'status' => 'Aktif',
        ]);

        // Create test admin
        $admin = User::create([
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        Profile::create([
            'user_id' => $admin->id,
            'full_name' => 'Admin Test',
            'gender' => 'Ikhwan',
            'nickname' => 'Admin',
            'phone_number' => '081234567891',
            'status' => 'Aktif',
        ]);

        echo "Test users created successfully!\n";
        echo "Mentor: mentor@test.com / password\n";
        echo "Admin: admin@test.com / password\n";
    }
}