<?php

namespace App\Imports;

use App\Models\Group;
use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class GroupImport implements ToCollection, WithHeadingRow
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

        // Check for duplicate group names in file
        $groupNamesInFile = $rows->pluck('nama_kelompok')->filter()->toArray();
        $groupNameCounts = array_count_values($groupNamesInFile);
        $duplicateGroupNames = array_keys(array_filter($groupNameCounts, function($count) {
            return $count > 1;
        }));
        
        // Check existing group names in database
        $existingGroupNames = Group::whereIn('group_name', $groupNamesInFile)->pluck('group_name')->toArray();
        
        if (!empty($duplicateGroupNames)) {
            $this->errors[] = 'Nama kelompok duplikat dalam file: ' . implode(', ', $duplicateGroupNames);
        }
        
        if (!empty($existingGroupNames)) {
            $this->errors[] = 'Nama kelompok sudah ada: ' . implode(', ', $existingGroupNames);
        }
        
        if (!empty($this->errors)) {
            return;
        }

        // Process in chunks untuk memory management
        $rows->chunk(100)->each(function ($chunk) {
            foreach ($chunk as $index => $row) {
                try {
                    // Skip empty rows
                    if (empty($row['nama_kelompok']) && empty($row['email_mentor'])) {
                        continue;
                    }

                    // Validate required fields
                    if (empty($row['nama_kelompok'])) {
                        $this->failures[] = [
                            'row' => $index + 2,
                            'errors' => ['Nama kelompok wajib diisi']
                        ];
                        continue;
                    }

                    // Sanitize input data
                    $cleanData = [
                        'group_name' => strip_tags(trim($row['nama_kelompok'])),
                        'description' => !empty($row['deskripsi']) ? strip_tags(trim($row['deskripsi'])) : null,
                        'email_mentor' => !empty($row['email_mentor']) ? filter_var($row['email_mentor'], FILTER_SANITIZE_EMAIL) : null
                    ];

                    $mentorId = null;
                    
                    // Validate mentor email if provided
                    if (!empty($cleanData['email_mentor'])) {
                        if (!filter_var($cleanData['email_mentor'], FILTER_VALIDATE_EMAIL)) {
                            $this->failures[] = [
                                'row' => $index + 2,
                                'errors' => ['Format email mentor tidak valid']
                            ];
                            continue;
                        }

                        $mentor = User::where('email', $cleanData['email_mentor'])
                                      ->where('role', 'mentor')
                                      ->first();
                        
                        if (!$mentor) {
                            $this->failures[] = [
                                'row' => $index + 2,
                                'errors' => ['Email mentor tidak ditemukan atau bukan mentor']
                            ];
                            continue;
                        }
                        
                        $mentorId = $mentor->id;
                    }

                    // Additional validation
                    if (strlen($cleanData['group_name']) < 3) {
                        $this->failures[] = [
                            'row' => $index + 2,
                            'errors' => ['Nama kelompok minimal 3 karakter']
                        ];
                        continue;
                    }

                    // Create group
                    Group::create([
                        'group_name' => $cleanData['group_name'],
                        'description' => $cleanData['description'],
                        'mentor_id' => $mentorId
                    ]);

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