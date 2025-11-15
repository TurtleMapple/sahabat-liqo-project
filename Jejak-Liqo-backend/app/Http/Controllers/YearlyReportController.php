<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Meeting;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class YearlyReportController extends Controller
{
    public function getYearlyReport(Request $request)
    {
        // Validation
        $request->validate([
            'year' => 'required|integer|min:2020|max:2030',
            'group_type' => 'required|in:all,ikhwan,akhwat'
        ]);
        
        $year = $request->year;
        $groupType = $request->group_type;
        
        // Get groups with mentor and mentees data
        $query = Group::with([
            'mentor.profile',
            'mentees' => function($q) {
                $q->where('status', 'Aktif');
            }
        ])->whereNull('deleted_at');
        
        // Apply group filtering based on type
        if ($groupType === 'ikhwan') {
            $query->whereHas('mentees', function($q) {
                $q->where(function($subQ) {
                    $subQ->where('gender', 'Laki-laki')
                         ->orWhere('gender', 'Ikhwan')
                         ->orWhere('gender', 'L')
                         ->orWhere('gender', 'Male');
                });
            });
        } elseif ($groupType === 'akhwat') {
            $query->whereHas('mentees', function($q) {
                $q->where(function($subQ) {
                    $subQ->where('gender', 'Perempuan')
                         ->orWhere('gender', 'Akhwat')
                         ->orWhere('gender', 'P')
                         ->orWhere('gender', 'Female');
                });
            });
        }
        
        $groups = $query->orderBy('group_name')->get();
        
        // Get all meetings for the year in one query
        $groupIds = $groups->pluck('id')->toArray();
        $meetings = Meeting::whereIn('group_id', $groupIds)
            ->whereYear('meeting_date', $year)
            ->selectRaw('group_id, MONTH(meeting_date) as month, COUNT(*) as meeting_count')
            ->groupBy('group_id', 'month')
            ->get()
            ->groupBy('group_id');
        
        // Process data for yearly report format
        $reportData = [];
        $no = 1;
        
        foreach ($groups as $group) {
            // Initialize monthly data with zeros
            $monthlyData = array_fill(1, 12, 0);
            
            // Fill actual meeting counts
            if (isset($meetings[$group->id])) {
                foreach ($meetings[$group->id] as $meetingData) {
                    $monthlyData[$meetingData->month] = $meetingData->meeting_count;
                }
            }
            
            $reportData[] = [
                'no' => $no++,
                'mentor_name' => $group->mentor->profile->full_name ?? 'Unknown',
                'group_name' => $group->group_name,
                'monthly_meetings' => $monthlyData
            ];
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Yearly report data fetched successfully',
            'data' => $reportData,
            'year' => $year,
            'group_type' => $groupType,
            'total_groups' => count($reportData)
        ]);
    }
    
    public function prepareYearlyExportData(Request $request)
    {
        // Validation
        $request->validate([
            'year' => 'required|integer|min:2020|max:2030',
            'group_type' => 'required|in:all,ikhwan,akhwat'
        ]);
        
        $year = $request->year;
        $groupType = $request->group_type;
        
        // Get the report data
        $reportResponse = $this->getYearlyReport($request);
        $reportData = $reportResponse->getData(true);
        
        if ($reportData['status'] !== 'success') {
            throw new \Exception('Failed to get yearly report data');
        }
        
        // Prepare data for export
        $exportData = [
            'year' => $year,
            'group_type' => $groupType,
            'group_type_text' => match($groupType) {
                'ikhwan' => 'Kelompok Ikhwan',
                'akhwat' => 'Kelompok Akhwat',
                default => 'Semua Kelompok'
            },
            'total_groups' => $reportData['total_groups'],
            'report_data' => $reportData['data'],
            'months' => ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        ];
        
        // Generate filename
        $groupTypeText = match($groupType) {
            'ikhwan' => 'ikhwan',
            'akhwat' => 'akhwat',
            default => 'semua_kelompok'
        };
        
        $exportData['filename'] = "laporan_tahunan_{$year}_{$groupTypeText}";
        
        return $exportData;
    }
    
    private function generateYearlyPDFHTML($data)
    {
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Laporan Tahunan Pertemuan Liqo</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { font-size: 18px; margin: 0; }
                .header p { font-size: 12px; margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; font-size: 9px; }
                th, td { border: 1px solid #333; padding: 4px; text-align: center; vertical-align: middle; }
                .header-cell { font-weight: bold; background-color: #f5f5f5; }
                .text-left { text-align: left; }
                .year-header { font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>LAPORAN TAHUNAN PERTEMUAN LIQO</h1>
                <p>Tahun: ' . $data['year'] . '</p>
                <p>Kategori: ' . $data['group_type_text'] . '</p>
                <p>Total Kelompok: ' . $data['total_groups'] . '</p>
            </div>
            
            <table>
                <!-- Header Row 1 -->
                <tr>
                    <th rowspan="2" class="header-cell">No</th>
                    <th rowspan="2" class="header-cell">KPAA (Pementor)</th>
                    <th rowspan="2" class="header-cell">Kelompok</th>
                    <th colspan="12" class="header-cell year-header">' . $data['year'] . '</th>
                </tr>
                <!-- Header Row 2 -->
                <tr>';
        
        foreach ($data['months'] as $month) {
            $html .= '<th class="header-cell">' . $month . '</th>';
        }
        
        $html .= '</tr>';
        
        // Data rows
        foreach ($data['report_data'] as $row) {
            $html .= '<tr>';
            $html .= '<td>' . $row['no'] . '</td>';
            $html .= '<td class="text-left">' . htmlspecialchars($row['mentor_name']) . '</td>';
            $html .= '<td class="text-left">' . htmlspecialchars($row['group_name']) . '</td>';
            
            for ($month = 1; $month <= 12; $month++) {
                $html .= '<td>' . $row['monthly_meetings'][$month] . '</td>';
            }
            
            $html .= '</tr>';
        }
        
        $html .= '</table></body></html>';
        
        return $html;
    }
    
    public function exportYearlyPDF(Request $request)
    {
        try {
            $data = $this->prepareYearlyExportData($request);
            $html = $this->generateYearlyPDFHTML($data);
            
            $pdf = Pdf::loadHTML($html);
            $pdf->setPaper('A4', 'landscape');
            
            return $pdf->download($data['filename'] . '.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate yearly PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function exportYearlyExcel(Request $request)
    {
        try {
            $data = $this->prepareYearlyExportData($request);
            $filename = $data['filename'] . '.xls';
            
            return response()->streamDownload(function() use ($data) {
                echo $this->generateYearlyExcelHTML($data);
            }, $filename, [
                'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate yearly Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    private function generateYearlyExcelHTML($data)
    {
        $html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
        $html .= '<style>';
        $html .= 'table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }';
        $html .= 'th, td { border: 1px solid #000; padding: 8px; text-align: center; vertical-align: middle; }';
        $html .= '.header-cell { font-weight: bold; background-color: #f0f0f0; }';
        $html .= '.text-left { text-align: left; }';
        $html .= '</style></head><body>';
        
        // Header
        $html .= '<h2 style="text-align: center;">LAPORAN TAHUNAN PERTEMUAN LIQO</h2>';
        $html .= '<p style="text-align: center;">Tahun: ' . $data['year'] . '</p>';
        $html .= '<p style="text-align: center;">Kategori: ' . $data['group_type_text'] . '</p>';
        $html .= '<p style="text-align: center;">Total Kelompok: ' . $data['total_groups'] . '</p><br>';
        
        $html .= '<table>';
        
        // Header Row 1
        $html .= '<tr>';
        $html .= '<th rowspan="2" class="header-cell">No</th>';
        $html .= '<th rowspan="2" class="header-cell">KPAA (Pementor)</th>';
        $html .= '<th rowspan="2" class="header-cell">Kelompok</th>';
        $html .= '<th colspan="12" class="header-cell">' . $data['year'] . '</th>';
        $html .= '</tr>';
        
        // Header Row 2
        $html .= '<tr>';
        foreach ($data['months'] as $month) {
            $html .= '<th class="header-cell">' . htmlspecialchars($month) . '</th>';
        }
        $html .= '</tr>';
        
        // Data rows
        foreach ($data['report_data'] as $row) {
            $html .= '<tr>';
            $html .= '<td>' . $row['no'] . '</td>';
            $html .= '<td class="text-left">' . htmlspecialchars($row['mentor_name']) . '</td>';
            $html .= '<td class="text-left">' . htmlspecialchars($row['group_name']) . '</td>';
            
            for ($month = 1; $month <= 12; $month++) {
                $html .= '<td>' . $row['monthly_meetings'][$month] . '</td>';
            }
            
            $html .= '</tr>';
        }
        
        $html .= '</table></body></html>';
        return $html;
    }
    
    public function testYearlyData(Request $request)
    {
        try {
            // Test with sample data
            $request->merge([
                'year' => 2024,
                'group_type' => 'all'
            ]);
            
            return $this->getYearlyReport($request);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch yearly data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function testYearlyPDF(Request $request)
    {
        try {
            // Test with sample data - no auth required
            $request->merge([
                'year' => $request->get('year', 2024),
                'group_type' => $request->get('group_type', 'all')
            ]);
            
            // Create sample data for testing
            $sampleData = [
                'year' => $request->get('year', 2024),
                'group_type' => $request->get('group_type', 'all'),
                'group_type_text' => match($request->get('group_type', 'all')) {
                    'ikhwan' => 'Kelompok Ikhwan',
                    'akhwat' => 'Kelompok Akhwat',
                    default => 'Semua Kelompok'
                },
                'total_groups' => 2,
                'report_data' => [
                    [
                        'no' => 1,
                        'mentor_name' => 'Ahmad Test',
                        'group_name' => 'Kelompok Test A',
                        'monthly_meetings' => [1 => 3, 2 => 2, 3 => 4, 4 => 3, 5 => 2, 6 => 3, 7 => 4, 8 => 3, 9 => 2, 10 => 4, 11 => 3, 12 => 2]
                    ],
                    [
                        'no' => 2,
                        'mentor_name' => 'Siti Test',
                        'group_name' => 'Kelompok Test B',
                        'monthly_meetings' => [1 => 2, 2 => 3, 3 => 3, 4 => 2, 5 => 4, 6 => 2, 7 => 3, 8 => 4, 9 => 3, 10 => 2, 11 => 3, 12 => 4]
                    ]
                ],
                'months' => ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                'filename' => 'test_laporan_tahunan_' . $request->get('year', 2024)
            ];
            
            $html = $this->generateYearlyPDFHTML($sampleData);
            
            $pdf = Pdf::loadHTML($html);
            $pdf->setPaper('A4', 'landscape');
            
            return $pdf->download($sampleData['filename'] . '.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate test yearly PDF',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}