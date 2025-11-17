<?php

namespace App\Imports;

use App\Models\Mentee;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class MenteeImport implements ToCollection, WithHeadingRow
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

        // Process in chunks untuk memory management
        $rows->chunk(100)->each(function ($chunk) {
            foreach ($chunk as $index => $row) {
                try {
                    // Skip empty rows
                    if (empty($row['nama_lengkap']) && empty($row['gender']) && empty($row['nomor_telepon'])) {
                        continue;
                    }

                    // Validasi field wajib
                    if (empty($row['nama_lengkap']) || empty($row['gender']) || empty($row['nomor_telepon'])) {
                        $this->failures[] = [
                            'row' => $index + 2,
                            'errors' => ['Nama lengkap, gender, dan nomor telepon wajib diisi']
                        ];
                        continue;
                    }

                    // Sanitize input data
                    $cleanData = [
                        'full_name' => strip_tags(trim($row['nama_lengkap'])),
                        'gender' => in_array($row['gender'], ['Ikhwan', 'Akhwat']) ? $row['gender'] : null,
                        'nickname' => !empty($row['nama_panggilan']) ? strip_tags(trim($row['nama_panggilan'])) : null,
                        'birth_date' => !empty($row['tanggal_lahir']) ? date('Y-m-d', strtotime($row['tanggal_lahir'])) : null,
                        'phone_number' => preg_replace('/[^0-9+]/', '', (string)$row['nomor_telepon']),
                        'address' => !empty($row['alamat']) ? strip_tags(trim($row['alamat'])) : null,
                        'status' => 'Aktif'
                    ];

                    // Additional validation after sanitization
                    if (empty($cleanData['gender'])) {
                        $this->failures[] = [
                            'row' => $index + 2,
                            'errors' => ['Gender harus Ikhwan atau Akhwat']
                        ];
                        continue;
                    }

                    if (strlen($cleanData['phone_number']) < 10) {
                        $this->failures[] = [
                            'row' => $index + 2,
                            'errors' => ['Nomor telepon tidak valid']
                        ];
                        continue;
                    }

                    // Create mentee
                    Mentee::create($cleanData);
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