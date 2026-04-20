<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Absensi</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #fff;
            line-height: 1.6;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #1f2937;
            padding-bottom: 20px;
        }

        .header h1 {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }

        .header p {
            font-size: 12px;
            color: #666;
        }

        .employee-info {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
        }

        .info-row {
            display: table-row;
        }

        .info-label {
            display: table-cell;
            font-weight: bold;
            width: 20%;
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
        }

        .info-value {
            display: table-cell;
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
        }

        .period {
            text-align: center;
            font-size: 14px;
            margin-bottom: 20px;
            color: #666;
        }

        .statistics {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            border-collapse: collapse;
        }

        .stat-row {
            display: table-row;
        }

        .stat-cell {
            display: table-cell;
            padding: 10px;
            border: 1px solid #d1d5db;
            text-align: center;
            width: 16.66%;
        }

        .stat-label {
            font-size: 11px;
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
        }

        .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-top: 5px;
        }

        .records-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 2px solid #1f2937;
            padding-bottom: 10px;
        }

        .records-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 12px;
        }

        .records-table thead {
            background-color: #1f2937;
            color: white;
        }

        .records-table th {
            padding: 10px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #d1d5db;
        }

        .records-table td {
            padding: 8px;
            border: 1px solid #d1d5db;
        }

        .records-table tbody tr:nth-child(even) {
            background-color: #f9fafb;
        }

        .status {
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 3px;
            text-align: center;
        }

        .status-present {
            background-color: #dcfce7;
            color: #166534;
        }

        .status-absent {
            background-color: #fee2e2;
            color: #991b1b;
        }

        .status-late {
            background-color: #fef3c7;
            color: #b45309;
        }

        .status-leave {
            background-color: #dbeafe;
            color: #1e40af;
        }

        .status-sick {
            background-color: #f3e8ff;
            color: #6b21a8;
        }

        .status-half-day {
            background-color: #fed7aa;
            color: #d97706;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #d1d5db;
            text-align: center;
            font-size: 10px;
            color: #999;
        }

        .no-data {
            text-align: center;
            padding: 20px;
            color: #999;
            font-style: italic;
        }

        page-break {
            display: block;
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>LAPORAN ABSENSI</h1>
            <p>Attendance Report</p>
        </div>

        <!-- Employee Information -->
        <div class="employee-info">
            <div class="info-row">
                <div class="info-label">Nama Karyawan</div>
                <div class="info-value">{{ $employee->full_name ?? 'N/A' }}</div>
                <div class="info-label" style="width: 15%;">NIP</div>
                <div class="info-value">{{ $employee->employee_code ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Departemen</div>
                <div class="info-value">{{ optional($employee->department)->dept_name ?? 'N/A' }}</div>
                <div class="info-label" style="width: 15%;">Jabatan</div>
                <div class="info-value">{{ optional($employee->position)->position_name ?? 'N/A' }}</div>
            </div>
        </div>

        <!-- Period -->
        <div class="period">
            <strong>Periode: {{ $period['start_date'] }} s/d {{ $period['end_date'] }}</strong>
        </div>

        <!-- Statistics -->
        @if ($statistics && count($statistics) > 0)
            <div class="statistics">
                <div class="stat-row">
                    <div class="stat-cell">
                        <div class="stat-label">Hadir</div>
                        <div class="stat-value">{{ $statistics['present'] ?? 0 }}</div>
                    </div>
                    <div class="stat-cell">
                        <div class="stat-label">Terlambat</div>
                        <div class="stat-value">{{ $statistics['late'] ?? 0 }}</div>
                    </div>
                    <div class="stat-cell">
                        <div class="stat-label">Tidak Hadir</div>
                        <div class="stat-value">{{ $statistics['absent'] ?? 0 }}</div>
                    </div>
                    <div class="stat-cell">
                        <div class="stat-label">Cuti</div>
                        <div class="stat-value">{{ $statistics['leave'] ?? 0 }}</div>
                    </div>
                    <div class="stat-cell">
                        <div class="stat-label">Sakit</div>
                        <div class="stat-value">{{ $statistics['sick'] ?? 0 }}</div>
                    </div>
                    <div class="stat-cell">
                        <div class="stat-label">Setengah Hari</div>
                        <div class="stat-value">{{ $statistics['half_day'] ?? 0 }}</div>
                    </div>
                </div>
                <div class="stat-row">
                    <div class="stat-cell">
                        <div class="stat-label">Total Jam Kerja</div>
                        <div class="stat-value">{{ $statistics['total_hours'] ?? 0 }}</div>
                    </div>
                    <div class="stat-cell">
                        <div class="stat-label">Jam Teratur</div>
                        <div class="stat-value">{{ $statistics['regular_hours'] ?? 0 }}</div>
                    </div>
                    <div class="stat-cell">
                        <div class="stat-label">Jam Lembur</div>
                        <div class="stat-value">{{ $statistics['overtime_hours'] ?? 0 }}</div>
                    </div>
                    <div class="stat-cell">
                        <div class="stat-label">Total Terlambat</div>
                        <div class="stat-value">{{ $statistics['total_late_minutes'] ?? 0 }}m</div>
                    </div>
                    <div class="stat-cell">
                        <div class="stat-label">Total Pulang Awal</div>
                        <div class="stat-value">{{ $statistics['total_early_minutes'] ?? 0 }}m</div>
                    </div>
                    <div class="stat-cell">
                        <div class="stat-label">Persentase Kehadiran</div>
                        <div class="stat-value">{{ $statistics['attendance_rate'] ?? 0 }}%</div>
                    </div>
                </div>
            </div>
        @endif

        <!-- Records Table -->
        <div class="records-title">Detail Absensi</div>

        @if ($records && count($records) > 0)
            <table class="records-table">
                <thead>
                    <tr>
                        <th style="width: 12%;">Tanggal</th>
                        <th style="width: 10%;">Hari</th>
                        <th style="width: 12%;">Status</th>
                        <th style="width: 10%;">Jam Masuk</th>
                        <th style="width: 10%;">Jam Pulang</th>
                        <th style="width: 8%;">Total Jam</th>
                        <th style="width: 8%;">Jam Kerja</th>
                        <th style="width: 8%;">Jam Lembur</th>
                        <th style="width: 8%;">Terlambat</th>
                        <th style="width: 8%;">Lokasi</th>
                    </tr>
                </thead>
                <tbody>
                    @if(count($records) > 0)
                        @foreach ($records as $record)
                            <tr>
                                <td>{{ $record->attendance_date->format('d/m/Y') }}</td>
                                <td>{{ $record->attendance_date->translatedFormat('l') }}</td>
                                <td>{{ optional($record)->site?->site_name ?? '-' }}</td>
                                <td>{{ $record->check_in_time ?? '-' }}</td>
                                <td>{{ $record->check_out_time ?? '-' }}</td>
                                <td>{{ $record->total_hours ?? '-' }}</td>
                                <td>{{ $record->regular_hours ?? '-' }}</td>
                                <td>{{ $record->overtime_hours ?? '-' }}</td>
                                <td>{{ $record->late_minutes ?? 0 }}m</td>
                                <td>Attendance</td>
                            </tr>
                        @endforeach
                    @else
                        <tr>
                            <td colspan="10" class="text-center">No records</td>
                        </tr>
                    @endif
                </tbody>
            </table>
        @else
            <div class="no-data">
                Tidak ada data absensi untuk periode ini
            </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p>Laporan ini digenerate secara otomatis pada {{ now()->translatedFormat('d F Y H:i:s') }}</p>
        </div>
    </div>
</body>
</html>
