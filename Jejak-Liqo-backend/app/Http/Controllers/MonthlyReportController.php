<?php

namespace App\Http\Controllers;

use App\Http\Requests\MonthlyReportRequest;
use App\Models\Group;
use App\Models\Meeting;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\MonthlyReportExport;

class MonthlyReportController extends Controller
{
    public function getReport(Request $request)
    {
        $fromMonth = $request->from_month;
        $fromYear = $request->from_year;
        $toMonth = $request->to_month;
        $toYear = $request->to_year;
        $groupType = $request->group_type; // 'all', 'ikhwan', 'akhwat', 'custom'
        $selectedGroups = $request->selected_groups ?? [];

        // Create date range
        $startDate = Carbon::create($fromYear, $fromMonth, 1)->startOfMonth();
        $endDate = Carbon::create($toYear, $toMonth, 1)->endOfMonth();

        // Get groups based on selection type
        $query = Group::with([
            'mentor.profile',
            'mentees' => function($q) {
                $q->where('status', 'Aktif');
            },
            'meetings' => function($q) use ($startDate, $endDate) {
                $q->whereBetween('meeting_date', [$startDate, $endDate])
                  ->with(['attendances.mentee']);
            }
        ]);

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
        } elseif ($groupType === 'custom' && !empty($selectedGroups)) {
            $query->whereIn('id', $selectedGroups);
        }

        $groups = $query->get();

        // Structure the data for frontend
        $reportData = $groups->map(function($group) {
            // Determine group type based on mentees' gender
            $groupType = $this->determineGroupType($group->mentees);

            $meetingsData = $group->meetings->map(function($meeting) {
                return [
                    'id' => $meeting->id,
                    'meeting_date' => $meeting->meeting_date,
                    'place' => $meeting->place,
                    'topic' => $meeting->topic,
                    'notes' => $meeting->notes,
                    'meeting_type' => $meeting->meeting_type,
                    'attendances' => $meeting->attendances->map(function($attendance) {
                        return [
                            'mentee_id' => $attendance->mentee_id,
                            'mentee_name' => $attendance->mentee->full_name,
                            'activity_class' => $attendance->mentee->activity_class,
                            'status' => $attendance->status,
                            'notes' => $attendance->notes,
                        ];
                    })
                ];
            });

            return [
                'group_id' => $group->id,
                'group_name' => $group->group_name,
                'group_type' => $groupType,
                'mentor_name' => $group->mentor->profile->full_name ?? 'Unknown',
                'mentees' => $group->mentees->map(function($mentee) {
                    return [
                        'id' => $mentee->id,
                        'full_name' => $mentee->full_name,
                        'activity_class' => $mentee->activity_class,
                        'gender' => $mentee->gender,
                    ];
                }),
                'meetings' => $meetingsData,
            ];
        });

        // Calculate summary statistics
        $totalMeetings = $groups->sum(function($group) {
            return $group->meetings->count();
        });
        
        $totalMentees = $groups->sum(function($group) {
            return $group->mentees->count();
        });
        
        $totalAttendances = $groups->sum(function($group) {
            return $group->meetings->sum(function($meeting) {
                return $meeting->attendances->where('status', 'Hadir')->count();
            });
        });
        
        $totalPossibleAttendances = $groups->sum(function($group) {
            return $group->meetings->sum(function($meeting) {
                return $meeting->attendances->count();
            });
        });
        
        $attendanceRate = $totalPossibleAttendances > 0 
            ? round(($totalAttendances / $totalPossibleAttendances) * 100, 1) 
            : 0;

        // Format period
        $periodText = $startDate->format('F Y');
        if (!$startDate->isSameMonth($endDate)) {
            $periodText = $startDate->format('F Y') . ' - ' . $endDate->format('F Y');
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Monthly report data fetched successfully',
            'data' => $reportData,
            'summary' => [
                'period' => $periodText,
                'total_groups' => $groups->count(),
                'total_meetings' => $totalMeetings,
                'total_mentees' => $totalMentees,
                'attendance_rate' => $attendanceRate,
                'group_type' => $groupType
            ]
        ]);
    }

    public function getGroupsForSelection(Request $request)
    {
        $search = $request->search;
        $genderFilter = $request->gender_filter; // 'all', 'ikhwan', 'akhwat'
        $mentorFilter = $request->mentor_filter;

        $query = Group::with(['mentor.profile', 'mentees'])
            ->select('id', 'group_name', 'mentor_id')
            ->whereNull('deleted_at');

        // Search by group name or mentor name
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('group_name', 'like', "%{$search}%")
                  ->orWhereHas('mentor.profile', function($subQ) use ($search) {
                      $subQ->where('full_name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by gender
        if ($genderFilter && $genderFilter !== 'all') {
            if ($genderFilter === 'ikhwan') {
                $query->whereHas('mentees', function($q) {
                    $q->where(function($subQ) {
                        $subQ->where('gender', 'Laki-laki')
                             ->orWhere('gender', 'Ikhwan')
                             ->orWhere('gender', 'L')
                             ->orWhere('gender', 'Male');
                    });
                });
            } else {
                $query->whereHas('mentees', function($q) {
                    $q->where(function($subQ) {
                        $subQ->where('gender', 'Perempuan')
                             ->orWhere('gender', 'Akhwat')
                             ->orWhere('gender', 'P')
                             ->orWhere('gender', 'Female');
                    });
                });
            }
        }

        // Filter by mentor
        if ($mentorFilter) {
            $query->where('mentor_id', $mentorFilter);
        }

        $groups = $query->get()->map(function($group) {
            $menteeCount = $group->mentees->count();
            $groupGender = $this->determineGroupGender($group->mentees);
            
            return [
                'id' => $group->id,
                'group_name' => $group->group_name,
                'mentor_name' => $group->mentor->profile->full_name ?? 'Unknown',
                'mentee_count' => $menteeCount,
                'group_gender' => $groupGender
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $groups
        ]);
    }

    private function determineGroupType($mentees)
    {
        $genders = $mentees->pluck('gender')->unique()->filter();

        if ($genders->contains('Ikhwan') && !$genders->contains('Akhwat')) {
            return 'Laporan Kelompok Ikhwan';
        } elseif ($genders->contains('Akhwat') && !$genders->contains('Ikhwan')) {
            return 'Laporan Kelompok Akhwat';
        } else {
            return 'Laporan Kelompok Campuran';
        }
    }

    public function debugGenders()
    {
        $genders = \App\Models\Mentee::select('gender')
            ->distinct()
            ->whereNotNull('gender')
            ->pluck('gender')
            ->toArray();
            
        return response()->json([
            'status' => 'success',
            'message' => 'Gender values in database',
            'data' => $genders
        ]);
    }

    public function prepareExportData(Request $request)
    {
        // Validation
        $request->validate([
            'from_month' => 'required|integer|min:1|max:12',
            'from_year' => 'required|integer|min:2020|max:2030',
            'to_month' => 'required|integer|min:1|max:12',
            'to_year' => 'required|integer|min:2020|max:2030',
            'group_type' => 'required|in:all,ikhwan,akhwat,custom',
            'selected_groups' => 'array',
            'selected_groups.*' => 'integer|exists:groups,id'
        ]);
        
        $fromMonth = $request->from_month;
        $fromYear = $request->from_year;
        $toMonth = $request->to_month;
        $toYear = $request->to_year;
        $groupType = $request->group_type;
        $selectedGroups = $request->selected_groups ?? [];
        
        // Validate date range
        $startDate = Carbon::create($fromYear, $fromMonth, 1);
        $endDate = Carbon::create($toYear, $toMonth, 1);
        
        if ($startDate->gt($endDate)) {
            throw new \Exception('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
        }
        
        // Validate custom group selection
        if ($groupType === 'custom' && empty($selectedGroups)) {
            throw new \Exception('Silakan pilih minimal 1 kelompok untuk tipe custom');
        }

        // Get the same data as getReport but structure it for export
        $startDate = $startDate->startOfMonth();
        $endDate = $endDate->endOfMonth();

        $query = Group::with([
            'mentor.profile',
            'mentees' => function($q) {
                $q->where('status', 'Aktif')->orderBy('full_name');
            },
            'meetings' => function($q) use ($startDate, $endDate) {
                $q->whereBetween('meeting_date', [$startDate, $endDate])
                  ->orderBy('meeting_date', 'asc')
                  ->with(['attendances']);
            }
        ]);

        // Apply filtering
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
        } elseif ($groupType === 'custom' && !empty($selectedGroups)) {
            $query->whereIn('id', $selectedGroups);
        }

        $groups = $query->get();

        // Structure data for export
        $exportData = [];
        
        foreach ($groups as $group) {
            $mentorName = $group->mentor->profile->full_name ?? 'Unknown';
            $meetings = $group->meetings->sortBy('meeting_date');
            
            // Prepare meetings header data
            $meetingsHeader = [];
            foreach ($meetings as $meeting) {
                $meetingsHeader[] = [
                    'date' => Carbon::parse($meeting->meeting_date)->format('d/m/Y'),
                    'type' => $meeting->meeting_type,
                    'topic' => $meeting->topic
                ];
            }
            
            // Prepare mentees data with attendance
            $menteesData = [];
            foreach ($group->mentees as $mentee) {
                $attendanceData = [];
                
                foreach ($meetings as $meeting) {
                    $attendance = $meeting->attendances->where('mentee_id', $mentee->id)->first();
                    $attendanceData[] = $attendance ? $attendance->status : '-';
                }
                
                $menteesData[] = [
                    'full_name' => $mentee->full_name,
                    'activity_class' => $mentee->activity_class,
                    'attendance' => $attendanceData
                ];
            }
            
            $exportData[] = [
                'group_id' => $group->id,
                'group_name' => $group->group_name,
                'mentor_name' => $mentorName,
                'meetings_header' => $meetingsHeader,
                'mentees_data' => $menteesData
            ];
        }

        // Generate filename
        $periodText = $startDate->format('F_Y');
        if (!$startDate->isSameMonth($endDate)) {
            $periodText = $startDate->format('F_Y') . '_' . $endDate->format('F_Y');
        }
        
        $groupTypeText = match($groupType) {
            'ikhwan' => 'ikhwan',
            'akhwat' => 'akhwat', 
            'custom' => 'custom',
            default => 'semua_kelompok'
        };
        
        $filename = "laporan_{$periodText}_{$groupTypeText}";

        return [
            'export_data' => $exportData,
            'filename' => $filename,
            'period' => $startDate->format('F Y') . ($startDate->isSameMonth($endDate) ? '' : ' - ' . $endDate->format('F Y')),
            'total_groups' => count($exportData)
        ];
    }

    public function testExportData(Request $request)
    {
        try {
            $data = $this->prepareExportData($request);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Export data structure prepared successfully',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to prepare export data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function exportPDF(Request $request)
    {
        try {
            // Validate user is authenticated
            if (!$request->user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $data = $this->prepareExportData($request);
            
            $html = $this->generatePDFHTML($data);
            
            $pdf = Pdf::loadHTML($html);
            $pdf->setPaper('A4', 'landscape');
            
            return $pdf->download($data['filename'] . '.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function generatePDFHTML($data)
    {
        // Calculate summary statistics
        $totalMeetings = 0;
        $totalMentees = 0;
        $totalAttendances = 0;
        $totalPossibleAttendances = 0;
        
        foreach ($data['export_data'] as $group) {
            $totalMeetings += count($group['meetings_header']);
            $totalMentees += count($group['mentees_data']);
            
            foreach ($group['mentees_data'] as $mentee) {
                foreach ($mentee['attendance'] as $attendance) {
                    if ($attendance !== '-') {
                        $totalPossibleAttendances++;
                        if ($attendance === 'Hadir') {
                            $totalAttendances++;
                        }
                    }
                }
            }
        }
        
        $attendanceRate = $totalPossibleAttendances > 0 ? round(($totalAttendances / $totalPossibleAttendances) * 100, 1) : 0;
        
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Laporan Pertemuan Liqo</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { font-size: 18px; margin: 0; }
                .header p { font-size: 12px; margin: 5px 0; }
                .summary { margin-bottom: 30px; }
                .summary table { width: 100%; border-collapse: collapse; }
                .summary td { padding: 8px; border: 1px solid #333; font-size: 11px; }
                .summary .label { font-weight: bold; background-color: #f5f5f5; width: 30%; }
                .group-table { margin-bottom: 15px; page-break-inside: avoid; }
                .group-title { font-size: 14px; font-weight: bold; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; font-size: 9px; }
                th, td { border: 1px solid #333; padding: 4px; text-align: center; vertical-align: middle; }
                .mentor-cell { writing-mode: vertical-rl; text-orientation: mixed; }
                .header-cell { font-weight: bold; background-color: #f5f5f5; }
                .text-left { text-align: left; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>LAPORAN PERTEMUAN LIQO</h1>
                <p>Periode: ' . $data['period'] . '</p>
            </div>
            
            <div class="summary">
                <h3>RINGKASAN LAPORAN</h3>
                <table>
                    <tr>
                        <td class="label">Total Kelompok</td>
                        <td>' . $data['total_groups'] . ' kelompok</td>
                    </tr>
                    <tr>
                        <td class="label">Total Pertemuan</td>
                        <td>' . $totalMeetings . ' pertemuan</td>
                    </tr>
                    <tr>
                        <td class="label">Total Mentee</td>
                        <td>' . $totalMentees . ' mentee</td>
                    </tr>
                    <tr>
                        <td class="label">Tingkat Kehadiran</td>
                        <td>' . $attendanceRate . '%</td>
                    </tr>
                </table>
            </div>';

        foreach ($data['export_data'] as $groupData) {
            $html .= '<div class="group-table">';
            $html .= '<div class="group-title">KELOMPOK: ' . strtoupper($groupData['group_name']) . '</div>';
            $html .= '<table>';
            
            // Header rows
            $meetingsCount = count($groupData['meetings_header']);
            $menteesCount = count($groupData['mentees_data']);
            
            // Row 1: Dates
            $html .= '<tr>';
            $html .= '<th rowspan="3" class="header-cell mentor-cell">Pementor</th>';
            $html .= '<th rowspan="3" class="header-cell">Nama Lengkap</th>';
            $html .= '<th rowspan="3" class="header-cell">Kelas</th>';
            foreach ($groupData['meetings_header'] as $meeting) {
                $html .= '<th class="header-cell">' . $meeting['date'] . '</th>';
            }
            $html .= '</tr>';
            
            // Row 2: Meeting Types
            $html .= '<tr>';
            foreach ($groupData['meetings_header'] as $meeting) {
                $html .= '<th class="header-cell">' . $meeting['type'] . '</th>';
            }
            $html .= '</tr>';
            
            // Row 3: Topics
            $html .= '<tr>';
            foreach ($groupData['meetings_header'] as $meeting) {
                $html .= '<th class="header-cell">' . $meeting['topic'] . '</th>';
            }
            $html .= '</tr>';
            
            // Data rows
            foreach ($groupData['mentees_data'] as $index => $mentee) {
                $html .= '<tr>';
                
                // Mentor name (merged for all mentees)
                if ($index === 0) {
                    $html .= '<td rowspan="' . $menteesCount . '" class="mentor-cell">' . $groupData['mentor_name'] . '</td>';
                }
                
                // Mentee data
                $html .= '<td class="text-left">' . $mentee['full_name'] . '</td>';
                $html .= '<td>' . $mentee['activity_class'] . '</td>';
                
                // Attendance data
                foreach ($mentee['attendance'] as $attendance) {
                    $html .= '<td>' . $attendance . '</td>';
                }
                
                $html .= '</tr>';
            }
            
            $html .= '</table></div>';
        }
        
        $html .= '</body></html>';
        
        return $html;
    }

    public function testPDF()
    {
        try {
            // Sample data for testing
            $sampleData = [
                'export_data' => [
                    [
                        'group_id' => 1,
                        'group_name' => 'Kelompok Test',
                        'mentor_name' => 'Ahmad Test',
                        'meetings_header' => [
                            [
                                'date' => '05/01/2024',
                                'type' => 'Online',
                                'topic' => 'Akhlak'
                            ],
                            [
                                'date' => '12/01/2024',
                                'type' => 'Offline', 
                                'topic' => 'Tauhid'
                            ]
                        ],
                        'mentees_data' => [
                            [
                                'full_name' => 'Ali Test',
                                'activity_class' => '7A',
                                'attendance' => ['Hadir', 'Sakit']
                            ],
                            [
                                'full_name' => 'Umar Test',
                                'activity_class' => '7B', 
                                'attendance' => ['Hadir', '-']
                            ]
                        ]
                    ]
                ],
                'filename' => 'test_laporan',
                'period' => 'January 2024',
                'total_groups' => 1
            ];
            
            $html = $this->generatePDFHTML($sampleData);
            
            $pdf = Pdf::loadHTML($html);
            $pdf->setPaper('A4', 'landscape');
            
            return $pdf->download('test_laporan.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate test PDF',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function exportExcel(Request $request)
    {
        try {
            // Validate user is authenticated
            if (!$request->user()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $data = $this->prepareExportData($request);
            $filename = $data['filename'] . '.xls';
            
            return response()->streamDownload(function() use ($data) {
                echo $this->generateExcelHTML($data);
            }, $filename, [
                'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function testExcel()
    {
        try {
            // Sample data for testing
            $sampleData = [
                'export_data' => [
                    [
                        'group_id' => 1,
                        'group_name' => 'Kelompok Test',
                        'mentor_name' => 'Ahmad Test',
                        'meetings_header' => [
                            [
                                'date' => '05/01/2024',
                                'type' => 'Online',
                                'topic' => 'Akhlak'
                            ],
                            [
                                'date' => '12/01/2024',
                                'type' => 'Offline', 
                                'topic' => 'Tauhid'
                            ]
                        ],
                        'mentees_data' => [
                            [
                                'full_name' => 'Ali Test',
                                'activity_class' => '7A',
                                'attendance' => ['Hadir', 'Sakit']
                            ],
                            [
                                'full_name' => 'Umar Test',
                                'activity_class' => '7B', 
                                'attendance' => ['Hadir', '-']
                            ]
                        ]
                    ]
                ],
                'filename' => 'test_laporan',
                'period' => 'January 2024',
                'total_groups' => 1
            ];
            
            $export = new MonthlyReportExport($sampleData);
            $csvData = $export->getData();
            
            return response()->streamDownload(function() use ($sampleData) {
                echo $this->generateExcelHTML($sampleData);
            }, 'test_laporan.xls', [
                'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate test Excel',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    private function generateExcelHTML($data)
    {
        // Calculate summary statistics
        $totalMeetings = 0;
        $totalMentees = 0;
        $totalAttendances = 0;
        $totalPossibleAttendances = 0;
        
        foreach ($data['export_data'] as $group) {
            $totalMeetings += count($group['meetings_header']);
            $totalMentees += count($group['mentees_data']);
            
            foreach ($group['mentees_data'] as $mentee) {
                foreach ($mentee['attendance'] as $attendance) {
                    if ($attendance !== '-') {
                        $totalPossibleAttendances++;
                        if ($attendance === 'Hadir') {
                            $totalAttendances++;
                        }
                    }
                }
            }
        }
        
        $attendanceRate = $totalPossibleAttendances > 0 ? round(($totalAttendances / $totalPossibleAttendances) * 100, 1) : 0;
        
        $html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
        $html .= '<style>';
        $html .= 'table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }';
        $html .= 'th, td { border: 1px solid #000; padding: 8px; text-align: center; vertical-align: middle; }';
        $html .= '.header-cell { font-weight: bold; background-color: #f0f0f0; }';
        $html .= '.mentor-cell { writing-mode: vertical-rl; text-orientation: mixed; }';
        $html .= '.text-left { text-align: left; }';
        $html .= '.group-title { font-weight: bold; font-size: 14px; margin: 20px 0 10px 0; }';
        $html .= '.summary-table { margin: 20px 0; }';
        $html .= '.summary-label { font-weight: bold; background-color: #f0f0f0; width: 30%; }';
        $html .= '</style></head><body>';
        
        // Header
        $html .= '<h2 style="text-align: center;">LAPORAN PERTEMUAN LIQO</h2>';
        $html .= '<p style="text-align: center;">Periode: ' . $data['period'] . '</p><br>';
        
        // Summary
        $html .= '<h3>RINGKASAN LAPORAN</h3>';
        $html .= '<table class="summary-table">';
        $html .= '<tr><td class="summary-label">Total Kelompok</td><td>' . $data['total_groups'] . ' kelompok</td></tr>';
        $html .= '<tr><td class="summary-label">Total Pertemuan</td><td>' . $totalMeetings . ' pertemuan</td></tr>';
        $html .= '<tr><td class="summary-label">Total Mentee</td><td>' . $totalMentees . ' mentee</td></tr>';
        $html .= '<tr><td class="summary-label">Tingkat Kehadiran</td><td>' . $attendanceRate . '%</td></tr>';
        $html .= '</table><br><br>';
        
        foreach ($data['export_data'] as $groupData) {
            $html .= '<div class="group-title">KELOMPOK: ' . strtoupper($groupData['group_name']) . '</div>';
            $html .= '<table>';
            
            $meetingsCount = count($groupData['meetings_header']);
            $menteesCount = count($groupData['mentees_data']);
            
            // Header Row 1: Dates
            $html .= '<tr>';
            $html .= '<th rowspan="3" class="header-cell mentor-cell">Pementor</th>';
            $html .= '<th rowspan="3" class="header-cell">Nama Lengkap</th>';
            $html .= '<th rowspan="3" class="header-cell">Kelas</th>';
            
            if (empty($groupData['meetings_header'])) {
                $html .= '<th class="header-cell">Tidak Ada Pertemuan</th>';
            } else {
                foreach ($groupData['meetings_header'] as $meeting) {
                    $html .= '<th class="header-cell">' . htmlspecialchars($meeting['date']) . '</th>';
                }
            }
            $html .= '</tr>';
            
            // Header Row 2: Meeting Types
            $html .= '<tr>';
            if (empty($groupData['meetings_header'])) {
                $html .= '<th class="header-cell"></th>';
            } else {
                foreach ($groupData['meetings_header'] as $meeting) {
                    $html .= '<th class="header-cell">' . htmlspecialchars($meeting['type']) . '</th>';
                }
            }
            $html .= '</tr>';
            
            // Header Row 3: Topics
            $html .= '<tr>';
            if (empty($groupData['meetings_header'])) {
                $html .= '<th class="header-cell"></th>';
            } else {
                foreach ($groupData['meetings_header'] as $meeting) {
                    $html .= '<th class="header-cell">' . htmlspecialchars($meeting['topic']) . '</th>';
                }
            }
            $html .= '</tr>';
            
            // Data rows
            foreach ($groupData['mentees_data'] as $index => $mentee) {
                $html .= '<tr>';
                
                // Mentor name (merged for all mentees)
                if ($index === 0) {
                    $html .= '<td rowspan="' . $menteesCount . '" class="mentor-cell">' . htmlspecialchars($groupData['mentor_name']) . '</td>';
                }
                
                // Mentee data
                $html .= '<td class="text-left">' . htmlspecialchars($mentee['full_name']) . '</td>';
                $html .= '<td>' . htmlspecialchars($mentee['activity_class']) . '</td>';
                
                // Attendance data
                if (empty($mentee['attendance'])) {
                    $html .= '<td>-</td>';
                } else {
                    foreach ($mentee['attendance'] as $attendance) {
                        $html .= '<td>' . htmlspecialchars($attendance) . '</td>';
                    }
                }
                
                $html .= '</tr>';
            }
            
            $html .= '</table><br><br>';
        }
        
        $html .= '</body></html>';
        return $html;
    }

    public function debugExcelData()
    {
        try {
            $sampleData = [
                'export_data' => [
                    [
                        'group_id' => 1,
                        'group_name' => 'Kelompok Test',
                        'mentor_name' => 'Ahmad Test',
                        'meetings_header' => [
                            [
                                'date' => '05/01/2024',
                                'type' => 'Online',
                                'topic' => 'Akhlak'
                            ]
                        ],
                        'mentees_data' => [
                            [
                                'full_name' => 'Ali Test',
                                'activity_class' => '7A',
                                'attendance' => ['Hadir']
                            ]
                        ]
                    ]
                ],
                'filename' => 'test_laporan',
                'period' => 'January 2024',
                'total_groups' => 1
            ];
            
            return response()->json([
                'status' => 'success',
                'data' => $sampleData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    private function determineGroupGender($mentees)
    {
        $genders = $mentees->pluck('gender')->unique()->filter();
        
        $ikhwanGenders = ['Laki-laki', 'Ikhwan', 'L', 'Male'];
        $akhwatGenders = ['Perempuan', 'Akhwat', 'P', 'Female'];
        
        $hasIkhwan = $genders->intersect($ikhwanGenders)->isNotEmpty();
        $hasAkhwat = $genders->intersect($akhwatGenders)->isNotEmpty();
        
        if ($hasIkhwan && !$hasAkhwat) {
            return 'Ikhwan';
        } elseif ($hasAkhwat && !$hasIkhwan) {
            return 'Akhwat';
        } else {
            return 'Campuran';
        }
    }
}
