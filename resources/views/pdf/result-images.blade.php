The PHP GD extension is required, but is not installed.
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <title>Lab Result Images</title>
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

    .confidential {
      background-color: #fee2e2;
      color: #991b1b;
      padding: 10px;
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
      border: 2px solid #dc2626;
    }

    .image-section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    .image-header {
      background-color: #dc2626;
      color: white;
      padding: 10px;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .image-info {
      background-color: #f9fafb;
      padding: 8px;
      margin-bottom: 10px;
      border-left: 3px solid #dc2626;
    }

    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10px;
      color: #666;
      border-top: 1px solid #e5e7eb;
      padding-top: 15px;
    }
  </style>
</head>

<body>
  <div class="header">
    <h1>BP DIAGNOSTIC LABORATORY</h1>
    <p>Laboratory Test Result Images</p>
    <p style="font-size: 10px;">Transaction: {{ $transaction->transaction_number }}</p>
    <p style="font-size: 10px;">Date: {{ now()->format('F d, Y') }}</p>
  </div>

  <div class="confidential">
    🔒 CONFIDENTIAL MEDICAL IMAGES - This document is password protected
  </div>

  <div class="patient-info">
    <h3>Patient Information</h3>
    <div class="info-row">
      <span class="info-label">Full Name:</span>
      <span>{{ $transaction->patient ? $transaction->patient->first_name . ' ' . $transaction->patient->last_name : $transaction->patient_full_name }}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Transaction Date:</span>
      <span>{{ $transaction->created_at->format('F d, Y') }}</span>
    </div>
  </div>

  @if(isset($documentPaths) && count($documentPaths) > 0)
    @foreach($documentPaths as $index => $document)
      <div class="image-section">
        <div class="image-header">
          📎 Result Image {{ $index + 1 }} of {{ count($documentPaths) }}
        </div>

        <div class="image-info">
          <strong>File Name:</strong> {{ $document['name'] }}<br>
          <strong>Size:</strong> {{ number_format($document['size'] / 1024, 2) }} KB
        </div>

        @php
          $imagePath = storage_path('app/public/' . $document['path']);
          $extension = strtolower(pathinfo($imagePath, PATHINFO_EXTENSION));
        @endphp

        @if(file_exists($imagePath) && in_array($extension, ['jpg', 'jpeg', 'png']))
          <div style="text-align: center; margin-top: 15px;">
            <img src="{{ $imagePath }}" style="max-width: 100%; height: auto; border: 2px solid #e5e7eb; border-radius: 4px;">
          </div>
        @else
          <p style="background-color: #f3f4f6; padding: 10px; margin-top: 10px;">
            📎 File: {{ $document['name'] }}<br>
            <span style="font-size: 10px; color: #666;">This file format cannot be displayed as an image.</span>
          </p>
        @endif
      </div>

      @if($index < count($documentPaths) - 1)
        <div style="page-break-after: always;"></div>
      @endif
    @endforeach
  @else
    <div style="text-align: center; padding: 40px; background-color: #f9fafb; border: 2px dashed #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">No result images attached for this transaction.</p>
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