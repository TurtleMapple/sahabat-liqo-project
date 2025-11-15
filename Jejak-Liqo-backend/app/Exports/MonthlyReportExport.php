<?php

namespace App\Exports;

class MonthlyReportExport
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function getData()
    {
        $rows = [];
        
        // Header
        $rows[] = ['LAPORAN PERTEMUAN LIQO'];
        $rows[] = ['Periode: ' . $this->data['period']];
        $rows[] = ['Total Kelompok: ' . $this->data['total_groups']];
        $rows[] = []; // Empty row
        
        // Handle empty data
        if (empty($this->data['export_data'])) {
            $rows[] = ['Tidak ada data untuk periode yang dipilih'];
            return $rows;
        }

        foreach ($this->data['export_data'] as $groupIndex => $group) {
            // Group title
            $rows[] = ['KELOMPOK: ' . strtoupper($group['group_name'])];
            
            // Table headers
            $headerRow1 = ['Pementor', 'Nama Lengkap', 'Kelas'];
            $headerRow2 = ['', '', ''];
            $headerRow3 = ['', '', ''];
            
            // Handle groups with no meetings
            if (empty($group['meetings_header'])) {
                $headerRow1[] = 'Tidak Ada Pertemuan';
                $headerRow2[] = '';
                $headerRow3[] = '';
            } else {
                foreach ($group['meetings_header'] as $meeting) {
                    $headerRow1[] = $meeting['date'];
                    $headerRow2[] = $meeting['type'];
                    $headerRow3[] = $meeting['topic'];
                }
            }
            
            $rows[] = $headerRow1;
            $rows[] = $headerRow2;
            $rows[] = $headerRow3;
            
            // Data rows
            foreach ($group['mentees_data'] as $menteeIndex => $mentee) {
                $dataRow = [];
                
                // Mentor name (only for first mentee)
                if ($menteeIndex === 0) {
                    $dataRow[] = $group['mentor_name'];
                } else {
                    $dataRow[] = '';
                }
                
                $dataRow[] = $mentee['full_name'];
                $dataRow[] = $mentee['activity_class'];
                
                // Attendance data
                if (empty($mentee['attendance'])) {
                    $dataRow[] = '-'; // If no meetings at all
                } else {
                    foreach ($mentee['attendance'] as $attendance) {
                        $dataRow[] = $attendance;
                    }
                }
                
                $rows[] = $dataRow;
            }
            
            // Add spacing between groups (1 empty row)
            if ($groupIndex < count($this->data['export_data']) - 1) {
                $rows[] = [];
            }
        }
        
        return $rows;
    }
}