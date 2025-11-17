<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class MentorImport implements ToCollection, WithHeadingRow
{
    protected $failures = [];
    protected $errors = [];
    protected $successCount = 0;

    public function collection(Collection $rows)
    {
        // Limit maksimal 500 rows per import
        if ($rows->count() > 500) {
            $this->errors[] = 'Maksimal 500 baris per import. File Anda memiliki ' . $rows->count() . ' baris.';
            return;
        }

        // Check for duplicate emails in file
        $emailsInFile = $rows->pluck('email')->filter()->toArray();
        $emailCounts = array_count_values($emailsInFile);
        $duplicateEmails = array_keys(array_filter($emailCounts, function($count) {
            return $count > 1;
        }));
        
        // Check existing emails in database
        $existingEmails = User::whereIn('email', $emailsInFile)->pluck('email')->toArray();
        
        if (!empty($duplicateEmails)) {
            $this->errors[] = 'Email duplikat dalam file: ' . implode(', ', $duplicateEmails);
        }
        
        if (!empty($existingEmails)) {
            $this->errors[] = 'Email sudah terdaftar: ' . implode(', ', $existingEmails);
        }
        
        if (!empty($this->errors)) {
            return;
        }

        // Process in chunks untuk memory management
        $rows->chunk(100)->each(function ($chunk) {
            foreach ($chunk as $index => $row) {
                try {
                    // Skip empty rows
                    if (empty($row['nama_lengkap']) && empty($row['email']) && empty($row['nomor_telepon'])) {
                        continue;
                    }

                    // Validate required fields
                    if (empty($row['nama_lengkap']) || empty($row['email']) || empty($row['nomor_telepon'])) {
                        $this->failures[] = [
                            'row' => $index + 2,
                            'errors' => ['Nama lengkap, email, dan nomor telepon wajib diisi']
                        ];
                        continue;
                    }

                    // Sanitize and validate email
                    $cleanEmail = filter_var($row['email'], FILTER_SANITIZE_EMAIL);
                    if (!filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
                        $this->failures[] = [
                            'row' => $index + 2,
                            'errors' => ['Format email tidak valid']
                        ];
                        continue;
                    }

                    // Sanitize input data
                    $cleanData = [
                        'full_name' => strip_tags(trim($row['nama_lengkap'])),
                        'email' => $cleanEmail,
                        'nickname' => !empty($row['nama_panggilan']) ? strip_tags(trim($row['nama_panggilan'])) : null,
                        'gender' => !empty($row['gender']) && in_array($row['gender'], ['Ikhwan', 'Akhwat']) ? $row['gender'] : null,
                        'birth_date' => !empty($row['tanggal_lahir']) ? date('Y-m-d', strtotime($row['tanggal_lahir'])) : null,
                        'phone_number' => preg_replace('/[^0-9+]/', '', (string)$row['nomor_telepon']),
                        'job' => !empty($row['pekerjaan']) ? strip_tags(trim($row['pekerjaan'])) : null,
                        'address' => !empty($row['alamat']) ? strip_tags(trim($row['alamat'])) : null
                    ];

                    // Additional validation
                    if (strlen($cleanData['phone_number']) < 10) {
                        $this->failures[] = [
                            'row' => $index + 2,
                            'errors' => ['Nomor telepon tidak valid']
                        ];
                        continue;
                    }

                    DB::transaction(function () use ($cleanData) {
                        // Create user with mentor role
                        $user = User::create([
                            'email' => $cleanData['email'],
                            'password' => Hash::make('Mentor2025'),
                            'role' => 'mentor'
                        ]);

                        // Create profile
                        Profile::create([
                            'user_id' => $user->id,
                            'full_name' => $cleanData['full_name'],
                            'nickname' => $cleanData['nickname'],
                            'gender' => $cleanData['gender'],
                            'birth_date' => $cleanData['birth_date'],
                            'phone_number' => $cleanData['phone_number'],
                            'job' => $cleanData['job'],
                            'address' => $cleanData['address'],
                            'status' => 'Aktif'
                        ]);
                    }, 3); // Retry 3 times on deadlock

                    $this->successCount++;

                } catch (\Exception $e) {
                    $this->failures[] = [
                        'row' => $index + 2,
                        'errors' => ['Terjadi kesalahan pada baris ini']
                    ];
                }
            }
            
            // Clear memory setiap chunk
            if (memory_get_usage() > 50 * 1024 * 1024) { // 50MB
                gc_collect_cycles();
            }
        });
    }

    public function failures()
    {
        return $this->failures;
    }

    public function errors()
    {
        return $this->errors;
    }

    public function getSuccessCount()
    {
        return $this->successCount;
    }
}