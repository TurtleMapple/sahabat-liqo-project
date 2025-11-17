<?php

namespace App\Http\Controllers;

use App\Imports\MenteeImport;
use App\Imports\MentorImport;
use App\Imports\GroupImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;

class ImportController extends Controller
{
    public function importMentees(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:xlsx,xls,csv',
                'max:5120', // 5MB max
                function ($attribute, $value, $fail) {
                    if ($value->getSize() < 100) {
                        $fail('File terlalu kecil atau kosong.');
                    }
                }
            ]
        ]);

        try {
            // Log import activity
            \Log::info('Import mentee started', [
                'user_id' => auth()->id(),
                'filename' => $request->file('file')->getClientOriginalName(),
                'filesize' => $request->file('file')->getSize()
            ]);

            $import = new MenteeImport;
            Excel::import($import, $request->file('file'));

            $failures = $import->failures();
            $errors = $import->errors();
            $successCount = $import->getSuccessCount();

            // Log completion
            \Log::info('Import mentee completed', [
                'user_id' => auth()->id(),
                'success_count' => $successCount,
                'failure_count' => count($failures)
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Data mentee berhasil diimport',
                'failures_count' => count($failures),
                'errors_count' => count($errors),
                'failures' => $failures,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            // Log error untuk debugging
            \Log::error('Import mentee error', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'file' => $request->file('file')->getClientOriginalName()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat memproses file. Silakan periksa format dan coba lagi.'
            ], 500);
        }
    }

    public function downloadMenteeTemplate()
    {
        try {
            $export = new class implements FromArray, WithColumnWidths, WithStyles {
                public function array(): array
                {
                    return [
                        ['No', 'Nama Lengkap', 'Gender', 'Nama Panggilan', 'Tanggal Lahir', 'Nomor Telepon', 'Alamat'],
                        [1, 'Ahmad Fauzi', 'Ikhwan', 'Ahmad', '2000-01-15', '081234567890', 'Jakarta'],
                        [2, 'Siti Aisyah', 'Akhwat', 'Aisyah', '2001-03-20', '081987654321', 'Bandung']
                    ];
                }
                
                public function columnWidths(): array
                {
                    return [
                        'A' => 5, 'B' => 25, 'C' => 12, 'D' => 18, 'E' => 15, 'F' => 18, 'G' => 25
                    ];
                }
                
                public function styles(Worksheet $sheet)
                {
                    $sheet->setShowGridlines(true);
                    
                    $sheet->getStyle('A1:H50')->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => '9CA3AF']
                            ]
                        ]
                    ]);
                    
                    $sheet->getStyle('A1:G1')->applyFromArray([
                        'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                        'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '059669']],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '000000']]]
                    ]);
                    
                    $sheet->getStyle('A1:G22')->applyFromArray([
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER]
                    ]);
                    
                    $sheet->getStyle('A:A')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle('C:C')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle('E:E')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle('F:F')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    
                    $validation = $sheet->getCell('C2')->getDataValidation();
                    $validation->setType(DataValidation::TYPE_LIST);
                    $validation->setErrorStyle(DataValidation::STYLE_INFORMATION);
                    $validation->setAllowBlank(false);
                    $validation->setShowInputMessage(true);
                    $validation->setShowErrorMessage(true);
                    $validation->setShowDropDown(true);
                    $validation->setErrorTitle('Input Error');
                    $validation->setError('Pilih Ikhwan atau Akhwat');
                    $validation->setPromptTitle('Gender');
                    $validation->setPrompt('Pilih gender: Ikhwan atau Akhwat');
                    $validation->setFormula1('"Ikhwan,Akhwat"');
                    
                    for ($row = 2; $row <= 50; $row++) {
                        $sheet->getCell('C' . $row)->setDataValidation(clone $validation);
                    }
                    
                    return $sheet;
                }
            };
            
            return Excel::download($export, 'template_mentee.xlsx');
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal generate template: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function importMentors(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:xlsx,xls,csv',
                'max:5120', // 5MB max
                function ($attribute, $value, $fail) {
                    if ($value->getSize() < 100) {
                        $fail('File terlalu kecil atau kosong.');
                    }
                }
            ]
        ]);

        try {
            // Log import activity
            \Log::info('Import mentor started', [
                'user_id' => auth()->id(),
                'filename' => $request->file('file')->getClientOriginalName(),
                'filesize' => $request->file('file')->getSize()
            ]);

            $import = new MentorImport;
            Excel::import($import, $request->file('file'));

            $failures = $import->failures();
            $errors = $import->errors();
            $successCount = $import->getSuccessCount();

            if (!empty($errors)) {
                return response()->json([
                    'status' => 'error',
                    'message' => implode('. ', $errors)
                ], 400);
            }

            // Log completion
            \Log::info('Import mentor completed', [
                'user_id' => auth()->id(),
                'success_count' => $successCount,
                'failure_count' => count($failures)
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Data mentor berhasil diimport',
                'failures_count' => count($failures),
                'failures' => $failures
            ]);

        } catch (\Exception $e) {
            // Log error untuk debugging
            \Log::error('Import mentor error', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'file' => $request->file('file')->getClientOriginalName()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat memproses file. Silakan periksa format dan coba lagi.'
            ], 500);
        }
    }
    
    public function downloadMentorTemplate()
    {
        try {
            $export = new class implements FromArray, WithColumnWidths, WithStyles {
                public function array(): array
                {
                    return [
                        ['No', 'Nama Lengkap', 'Email', 'Gender', 'Nama Panggilan', 'Tanggal Lahir', 'Nomor Telepon', 'Pekerjaan', 'Alamat'],
                        [1, 'Ahmad Mentor', 'ahmad.mentor@email.com', 'Ikhwan', 'Ahmad', '1990-01-15', '081234567890', 'Software Engineer', 'Jakarta'],
                        [2, 'Siti Mentor', 'siti.mentor@email.com', 'Akhwat', 'Siti', '1992-03-20', '081987654321', 'Teacher', 'Bandung']
                    ];
                }
                
                public function columnWidths(): array
                {
                    return [
                        'A' => 5, 'B' => 25, 'C' => 30, 'D' => 12, 'E' => 18, 'F' => 15, 'G' => 18, 'H' => 20, 'I' => 25
                    ];
                }
                
                public function styles(Worksheet $sheet)
                {
                    $sheet->setShowGridlines(true);
                    
                    $sheet->getStyle('A1:J50')->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => '9CA3AF']
                            ]
                        ]
                    ]);
                    
                    $sheet->getStyle('A1:I1')->applyFromArray([
                        'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                        'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '3B82F6']],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '000000']]]
                    ]);
                    
                    $sheet->getStyle('A1:I22')->applyFromArray([
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER]
                    ]);
                    
                    $sheet->getStyle('A:A')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle('D:D')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle('F:F')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle('G:G')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    
                    $validation = $sheet->getCell('D2')->getDataValidation();
                    $validation->setType(DataValidation::TYPE_LIST);
                    $validation->setErrorStyle(DataValidation::STYLE_INFORMATION);
                    $validation->setAllowBlank(true);
                    $validation->setShowInputMessage(true);
                    $validation->setShowErrorMessage(true);
                    $validation->setShowDropDown(true);
                    $validation->setErrorTitle('Input Error');
                    $validation->setError('Pilih Ikhwan atau Akhwat');
                    $validation->setPromptTitle('Gender');
                    $validation->setPrompt('Pilih gender: Ikhwan atau Akhwat');
                    $validation->setFormula1('"Ikhwan,Akhwat"');
                    
                    for ($row = 2; $row <= 50; $row++) {
                        $sheet->getCell('D' . $row)->setDataValidation(clone $validation);
                    }
                    
                    return $sheet;
                }
            };
            
            return Excel::download($export, 'template_mentor.xlsx');
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal generate template: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function importGroups(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:xlsx,xls,csv',
                'max:5120', // 5MB max
                function ($attribute, $value, $fail) {
                    if ($value->getSize() < 100) {
                        $fail('File terlalu kecil atau kosong.');
                    }
                }
            ]
        ]);

        try {
            // Log import activity
            \Log::info('Import group started', [
                'user_id' => auth()->id(),
                'filename' => $request->file('file')->getClientOriginalName(),
                'filesize' => $request->file('file')->getSize()
            ]);

            $import = new GroupImport;
            Excel::import($import, $request->file('file'));

            $failures = $import->failures();
            $errors = $import->errors();
            $successCount = $import->getSuccessCount();

            if (!empty($errors)) {
                return response()->json([
                    'status' => 'error',
                    'message' => implode('. ', $errors)
                ], 400);
            }

            // Log completion
            \Log::info('Import group completed', [
                'user_id' => auth()->id(),
                'success_count' => $successCount,
                'failure_count' => count($failures)
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Data kelompok berhasil diimport',
                'failures_count' => count($failures),
                'failures' => $failures
            ]);

        } catch (\Exception $e) {
            // Log error untuk debugging
            \Log::error('Import group error', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'file' => $request->file('file')->getClientOriginalName()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat memproses file. Silakan periksa format dan coba lagi.'
            ], 500);
        }
    }
    
    public function downloadGroupTemplate()
    {
        try {
            $export = new class implements FromArray, WithColumnWidths, WithStyles {
                public function array(): array
                {
                    return [
                        ['No', 'Nama Kelompok', 'Deskripsi', 'Email Mentor'],
                        [1, 'Kelompok Tahfidz A', 'Kelompok tahfidz untuk pemula', 'mentor1@email.com'],
                        [2, 'Kelompok Fiqh B', 'Kelompok kajian fiqh lanjutan', 'mentor2@email.com']
                    ];
                }
                
                public function columnWidths(): array
                {
                    return [
                        'A' => 5, 'B' => 30, 'C' => 40, 'D' => 30
                    ];
                }
                
                public function styles(Worksheet $sheet)
                {
                    $sheet->setShowGridlines(true);
                    
                    $sheet->getStyle('A1:E50')->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['rgb' => '9CA3AF']
                            ]
                        ]
                    ]);
                    
                    $sheet->getStyle('A1:D1')->applyFromArray([
                        'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                        'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '7C3AED']],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '000000']]]
                    ]);
                    
                    $sheet->getStyle('A1:D22')->applyFromArray([
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER]
                    ]);
                    
                    $sheet->getStyle('A:A')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    
                    return $sheet;
                }
            };
            
            return Excel::download($export, 'template_kelompok.xlsx');
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal generate template: ' . $e->getMessage()
            ], 500);
        }
    }
}