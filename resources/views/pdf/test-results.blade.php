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
    @if(file_exists(public_path('images/bp_logo.png')))
      <div style="text-align: center; margin-bottom: 10px;">
        <img src="{{ public_path('images/bp_logo.png') }}" alt="BP Diagnostic Logo" style="max-width: 120px; height: auto;">
      </div>
    @endif
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
      
      @if($test->performedBy)
        <div style="background-color: #eff6ff; padding: 10px; margin-bottom: 10px; border-left: 3px solid #3b82f6; font-size: 11px;">
          <strong style="color: #1e40af;">Processed By:</strong> {{ $test->performedBy->name }}<br>
          <span style="color: #6b7280;">{{ $test->performedBy->email }}</span>
        </div>
      @endif

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

  <div class="footer">
    <p><strong>BP Diagnostic Laboratory</strong></p>
    <p>This is a computer-generated report. For any concerns, please contact our laboratory.</p>
    <p>© {{ date('Y') }} BP Diagnostic Laboratory. All rights reserved.</p>
    <p style="margin-top: 10px; color: #dc2626;">
      <strong>CONFIDENTIAL:</strong> This document contains private health information.
    </p>
    @if(isset($documentPaths) && count($documentPaths) > 0)
      <p style="margin-top: 10px; color: #666; font-size: 10px;">
        <strong>Note:</strong> Result images are provided in a separate encrypted PDF attachment.
      </p>
    @endif
  </div>
</body>

</html>