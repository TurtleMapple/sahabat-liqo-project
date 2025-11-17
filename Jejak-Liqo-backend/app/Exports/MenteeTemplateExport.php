<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;

class MenteeTemplateExport implements FromArray
{
    public function array(): array
    {
        return [
            ['nama_lengkap', 'jenis_kelamin', 'nama_panggilan', 'nomor_telepon', 'kelas_aktivitas'],
            ['Ahmad Fauzi', 'Ikhwan', 'Ahmad', '081234567890', 'Kelas A'],
            ['Siti Aisyah', 'Akhwat', 'Aisyah', '081987654321', 'Kelas B']
        ];
    }
}