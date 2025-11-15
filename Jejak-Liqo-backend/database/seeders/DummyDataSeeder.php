<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use App\Models\Group;
use App\Models\Mentee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin
        $superAdmin = User::create([
            'role' => 'super_admin',
            'email' => 'superadmin@example.com',
            'password' => Hash::make('password'),
        ]);

        Profile::create([
            'user_id' => $superAdmin->id,
            'full_name' => 'Super Admin',
            'nickname' => 'Super',
            'gender' => 'Ikhwan',
            'phone_number' => '081234567890',
            'address' => 'Jakarta',
        ]);

        // 2. Admin
        $admin = User::create([
            'role' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        Profile::create([
            'user_id' => $admin->id,
            'full_name' => 'Admin User',
            'nickname' => 'Admin',
            'gender' => 'Akhwat',
            'phone_number' => '081234567891',
            'address' => 'Bandung',
        ]);

        // 3. Mentors (4 Akhwat, 2 Ikhwan)
        $mentorData = [
            ['name' => 'Siti Aminah', 'gender' => 'Akhwat', 'email' => 'siti@example.com'],
            ['name' => 'Fatimah Zahra', 'gender' => 'Akhwat', 'email' => 'fatimah@example.com'],
            ['name' => 'Khadijah Binti', 'gender' => 'Akhwat', 'email' => 'khadijah@example.com'],
            ['name' => 'Aisyah Rahman', 'gender' => 'Akhwat', 'email' => 'aisyah@example.com'],
            ['name' => 'Ahmad Fauzi', 'gender' => 'Ikhwan', 'email' => 'ahmad@example.com'],
            ['name' => 'Muhammad Rizki', 'gender' => 'Ikhwan', 'email' => 'rizki@example.com'],
        ];

        $mentors = [];
        foreach ($mentorData as $index => $data) {
            $mentor = User::create([
                'role' => 'mentor',
                'email' => $data['email'],
                'password' => Hash::make('password'),
            ]);

            Profile::create([
                'user_id' => $mentor->id,
                'full_name' => $data['name'],
                'nickname' => explode(' ', $data['name'])[0],
                'gender' => $data['gender'],
                'phone_number' => '08123456789' . ($index + 2),
                'address' => 'Kota ' . ($index + 1),
            ]);

            $mentors[] = $mentor;
        }

        // 4. Groups (sesuai gender mentor)
        foreach ($mentors as $index => $mentor) {
            Group::create([
                'group_name' => 'Kelompok ' . ($index + 1),
                'description' => 'Kelompok bimbingan ' . $mentor->profile->gender,
                'mentor_id' => $mentor->id,
            ]);
        }

        // 5. Mentees (12 Ikhwan, 8 Akhwat)
        $menteeData = [
            // 12 Ikhwan
            ['name' => 'Abdullah Ahmad', 'gender' => 'Ikhwan'],
            ['name' => 'Ibrahim Yusuf', 'gender' => 'Ikhwan'],
            ['name' => 'Umar Faruq', 'gender' => 'Ikhwan'],
            ['name' => 'Ali Hassan', 'gender' => 'Ikhwan'],
            ['name' => 'Hamza Malik', 'gender' => 'Ikhwan'],
            ['name' => 'Zaid Nasser', 'gender' => 'Ikhwan'],
            ['name' => 'Khalid Omar', 'gender' => 'Ikhwan'],
            ['name' => 'Bilal Amin', 'gender' => 'Ikhwan'],
            ['name' => 'Salman Reza', 'gender' => 'Ikhwan'],
            ['name' => 'Hasan Ridwan', 'gender' => 'Ikhwan'],
            ['name' => 'Husain Akbar', 'gender' => 'Ikhwan'],
            ['name' => 'Ismail Hakim', 'gender' => 'Ikhwan'],
            // 8 Akhwat
            ['name' => 'Maryam Sari', 'gender' => 'Akhwat'],
            ['name' => 'Zainab Putri', 'gender' => 'Akhwat'],
            ['name' => 'Ruqayyah Dewi', 'gender' => 'Akhwat'],
            ['name' => 'Ummu Salamah', 'gender' => 'Akhwat'],
            ['name' => 'Hafshah Indira', 'gender' => 'Akhwat'],
            ['name' => 'Safiyyah Nur', 'gender' => 'Akhwat'],
            ['name' => 'Juwayriyah Sinta', 'gender' => 'Akhwat'],
            ['name' => 'Maymunah Fitri', 'gender' => 'Akhwat'],
        ];

        $groups = Group::all();
        $ikhwanGroups = $groups->filter(fn($g) => $g->mentor->profile->gender === 'Ikhwan');
        $akhwatGroups = $groups->filter(fn($g) => $g->mentor->profile->gender === 'Akhwat');

        foreach ($menteeData as $index => $data) {
            // Assign ke group sesuai gender
            if ($data['gender'] === 'Ikhwan') {
                $group = $ikhwanGroups->random();
            } else {
                $group = $akhwatGroups->random();
            }

            Mentee::create([
                'full_name' => $data['name'],
                'nickname' => explode(' ', $data['name'])[0],
                'gender' => $data['gender'],
                'phone_number' => '08567890123' . $index,
                'address' => 'Alamat ' . $data['name'],
                'status' => 'Aktif',
                'group_id' => $group->id,
            ]);
        }
    }
}