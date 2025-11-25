<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <title>Lab Test Results</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #dc2626;
      padding-bottom: 15px;
    }

    .header h1 {
      color: #dc2626;
      margin: 0;
      font-size: 24px;
    }

    .header p {
      margin: 5px 0;
      color: #666;
    }

    .patient-info {
      background-color: #f9fafb;
      padding: 15px;
      margin-bottom: 20px;
      border-left: 4px solid #dc2626;
    }

    .patient-info h3 {
      margin: 0 0 10px 0;
      color: #dc2626;
    }

    .info-row {
      margin: 5px 0;
    }

    .info-label {
      font-weight: bold;
      display: inline-block;
      width: 150px;
    }

    .test-section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }

    .test-header {
      background-color: #dc2626;
      color: white;
      padding: 10px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .test-status {
      background-color: #10b981;
      color: white;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 11px;
      float: right;
    }

    .result-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }

    .result-table td {
      padding: 8px;
      border: 1px solid #e5e7eb;
    }

    .result-table td:first-child {
      font-weight: bold;
      background-color: #f9fafb;
      width: 180px;
    }

    .remarks-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 10px;
      margin-top: 10px;
    }

    .remarks-box strong {
      color: #92400e;
    }

    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10px;
      color: #666;
      border-top: 1px solid #e5e7eb;
      padding-top: 15px;
    }

    .confidential {
      background-color: #fee2e2;
      color: #991b1b;
      padding: 10px;
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
      border: 2px solid #dc2626;
    }
  </style>
</head>

<body>
  <div class="header">
    <h1>BP DIAGNOSTIC LABORATORY</h1>
    <p>Laboratory Test Results Report</p>
    <p style="font-size: 10px;">Transaction: {{ $transaction->transaction_number }}</p>
    <p style="font-size: 10px;">Date: {{ now()->format('F d, Y') }}</p>
  </div>

  <div class="confidential">
    🔒 CONFIDENTIAL MEDICAL REPORT - This document is password protected
  </div>

  <div class="patient-info">
    <h3>Patient Information</h3>
    <div class="info-row">
      <span class="info-label">Full Name:</span>
      <span>{{ $transaction->patient ? $transaction->patient->first_name . ' ' . $transaction->patient->last_name : $transaction->patient_full_name }}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Email:</span>
      <span>{{ $transaction->patient ? $transaction->patient->email : 'N/A' }}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Address:</span>
      <span>{{ $transaction->patient ? $transaction->patient->address : 'N/A' }}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Transaction Date:</span>
      <span>{{ $transaction->created_at->format('F d, Y') }}</span>
    </div>
  </div>

  @foreach($transaction->tests as $test)
    <div class="test-section">
      <div class="test-header">
        {{ $test->test_name }}
        <span class="test-status">{{ strtoupper($test->status) }}</span>
      </div>

      @if($test->result_values && is_array($test->result_values))
        <table class="result-table">
          <tr>
            <td style="width: 30%;">Tests of the patient</td>
            <td>{{ $test->test_name }}</td>
          </tr>
          <tr>
            <td style="width: 30%;">Result Value</td>
            <td>
              <strong style="color: #dc2626; font-size: 14px;">{{ $test->result_values['result_value'] ?? 'N/A' }}</strong>
            </td>
          </tr>
          @if(isset($test->result_values['normal_range']) && $test->result_values['normal_range'])
            <tr>
              <td style="width: 30%;">Normal Range</td>
              <td style="font-size: 11px; color: #666;">
                {{ $test->result_values['normal_range'] }}
              </td>
            </tr>
          @endif
        </table>
      @else
        <table class="result-table">
          <tr>
            <td style="width: 30%;">Result Status</td>
            <td><strong style="color: #dc2626;">Test Completed</strong></td>
          </tr>
          @if($test->result_notes)
            <tr>
              <td style="width: 30%;">Result</td>
              <td><strong>{{ $test->result_notes }}</strong></td>
            </tr>
          @endif
        </table>
      @endif

      @if($test->result_notes)
        <div class="remarks-box">
          <strong>Remarks / Notes:</strong><br>
          {{ $test->result_notes }}
        </div>
      @endif
    </div>
  @endforeach

  @if(isset($documentPaths) && count($documentPaths) > 0)
    <div style="margin-top: 30px; page-break-before: always;">
      <div
        style="background-color: #dc2626; color: white; padding: 10px; font-size: 14px; font-weight: bold; margin-bottom: 15px;">
        📎 ATTACHED RESULT IMAGES
      </div>

      @foreach($documentPaths as $document)
        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <p style="font-weight: bold; margin-bottom: 10px; color: #dc2626;">{{ $document['name'] }}</p>
          @php
            $imagePath = storage_path('app/public/' . $document['path']);
            $imageData = null;
            $extension = '';
            $mimeType = 'image/jpeg';

            if (file_exists($imagePath)) {
              $imageData = base64_encode(file_get_contents($imagePath));
              $extension = strtolower(pathinfo($imagePath, PATHINFO_EXTENSION));

              if ($extension === 'png') {
                $mimeType = 'image/png';
              } elseif (in_array($extension, ['jpg', 'jpeg'])) {
                $mimeType = 'image/jpeg';
              } elseif ($extension === 'pdf') {
                $mimeType = 'application/pdf';
              }
            }
          @endphp
          @if($imageData && in_array($extension, ['jpg', 'jpeg', 'png']))
            <img src="data:{{ $mimeType }};base64,{{ $imageData }}"
              style="max-width: 100%; height: auto; border: 1px solid #e5e7eb;">
          @elseif($imageData && $extension === 'pdf')
            <p style="background-color: #fee2e2; padding: 10px; border-left: 4px solid #dc2626;">
              📄 PDF Document: {{ $document['name'] }}<br>
              <span style="font-size: 10px; color: #666;">Size: {{ number_format($document['size'] / 1024, 2) }} KB</span>
            </p>
          @else
            <p style="background-color: #f3f4f6; padding: 10px;">
              📎 File: {{ $document['name'] }}<br>
              <span style="font-size: 10px; color: #666;">Size:
                {{ isset($document['size']) ? number_format($document['size'] / 1024, 2) : '0' }} KB</span>
            </p>
          @endif
        </div>
      @endforeach
    </div>
  @endif

  <div class="footer">
    <p><strong>BP Diagnostic Laboratory</strong></p>
    <p>This is a computer-generated report. For any concerns, please contact our laboratory.</p>
    <p>© {{ date('Y') }} BP Diagnostic Laboratory. All rights reserved.</p>
    <p style="margin-top: 10px; color: #dc2626;">
      <strong>CONFIDENTIAL:</strong> This document contains private health information.
    </p>
  </div>
</body>

</html>