<?php

namespace App\Exports;

use App\Models\Meeting;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MeetingsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $year;

    public function __construct($year)
    {
        $this->year = $year;
    }

    public function collection()
    {
        return Meeting::with(['group', 'mentor.profile'])
                     ->whereYear('meeting_date', $this->year)
                     ->orderBy('meeting_date', 'desc')
                     ->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'Tanggal',
            'Kelompok',
            'Mentor',
            'Topik',
            'Tempat',
            'Tipe Pertemuan',
            'Catatan'
        ];
    }

    public function map($meeting): array
    {
        static $no = 1;
        
        return [
            $no++,
            $meeting->meeting_date,
            $meeting->group->name ?? '-',
            $meeting->mentor->profile->full_name ?? '-',
            $meeting->topic,
            $meeting->place,
            $meeting->meeting_type,
            $meeting->notes ?? '-'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}