<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Lab Test Results</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      background-color: #dc2626;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }

    .content {
      background-color: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }

    .test-list {
      background-color: white;
      padding: 15px;
      margin: 20px 0;
      border-left: 4px solid #dc2626;
      border-radius: 4px;
    }

    .test-list li {
      margin: 8px 0;
    }

    .transaction-code {
      background-color: #fee2e2;
      padding: 10px;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: bold;
      text-align: center;
    }

    .attachment-notice {
      background-color: #fef3c7;
      padding: 15px;
      margin: 20px 0;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
    }

    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>

<body>
  <div class="header">
    <h1>BP Diagnostic Laboratory</h1>
  </div>

  <div class="content">
    <p>Dear
      <strong>{{ $transaction->patient ? $transaction->patient->first_name . ' ' . $transaction->patient->last_name : $transaction->patient_full_name }}</strong>,
    </p>

    <p>Greetings from BP Diagnostic Laboratory!</p>

    <p>We are pleased to inform you that your laboratory test results are now ready. Please find the complete results in
      the attached encrypted PDF file.</p>

    @foreach($transaction->tests as $test)
      <div
        style="margin-bottom: 25px; border-left: 4px solid #dc2626; background-color: white; padding: 15px; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: #dc2626;">{{ $test->test_name }}</h3>

        @if($test->result_values && is_array($test->result_values))
          <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <tr>
              <td
                style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold; width: 40%;">
                Test Parameter
              </td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">
                {{ $test->test_name }}
              </td>
            </tr>
            <tr>
              <td
                style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold; width: 40%;">
                Result Value
              </td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">
                <strong
                  style="color: #dc2626; font-size: 14px;">{{ $test->result_values['result_value'] ?? 'N/A' }}</strong>
              </td>
            </tr>
            @if(isset($test->result_values['normal_range']) && $test->result_values['normal_range'])
              <tr>
                <td
                  style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold; width: 40%;">
                  Normal Range
                </td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">
                  <span style="font-size: 12px; color: #6b7280;">
                    {{ $test->result_values['normal_range'] }}
                  </span>
                </td>
              </tr>
            @endif
          </table>
        @endif

        @if($test->result_notes)
          <div
            style="background-color: #fef3c7; padding: 10px; margin-top: 10px; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <p style="margin: 0; font-size: 12px;"><strong style="color: #92400e;">Remarks / Notes:</strong></p>
            <p style="margin: 5px 0 0 0; color: #92400e; font-size: 12px;">{{ $test->result_notes }}</p>
          </div>
        @endif
      </div>
    @endforeach

    <div class="attachment-notice"
      style="background-color: #fef3c7; padding: 15px; margin: 20px 0; border-left: 4px solid #f59e0b; border-radius: 4px;">
      <p style="margin: 0;"><strong>📎 Attachments
          ({{ count($documentPaths) > 0 ? '2 PDF files' : '1 PDF file' }}):</strong></p>

      <p style="margin: 10px 0 5px 0;"><strong>1. Lab_Results_{{ $transaction->transaction_number }}.pdf</strong></p>
      <p style="margin: 0 0 0 20px; font-size: 13px; color: #666;">
        ✓ Contains your test results with values and normal ranges<br>
        ✓ Password-protected for your privacy
      </p>

      @if(count($documentPaths) > 0)
        <p style="margin: 10px 0 5px 0;"><strong>2. Lab_Result_Images_{{ $transaction->transaction_number }}.pdf</strong>
        </p>
        <p style="margin: 0 0 0 20px; font-size: 13px; color: #666;">
          ✓ Contains {{ count($documentPaths) }} uploaded result image(s)<br>
          ✓ Hard copy results captured by lab staff<br>
          ✓ Password-protected for your privacy
        </p>
      @endif

      <div style="margin-top: 12px; padding: 10px; background-color: #dc2626; color: white; border-radius: 4px;">
        <strong>🔒 PDF Password:</strong> Your surname (last name) in UPPERCASE<br>
        <span style="font-size: 11px; opacity: 0.9;">Example: If your name is "Juan Dela Cruz", the password is
          "DELACRUZ"</span>
      </div>
    </div>

    <div class="transaction-code">
      Transaction Code: {{ $transaction->transaction_number }}
    </div>

    <p>If you have any questions about your results, please don't hesitate to contact us or visit our laboratory.</p>

    <p>Thank you for choosing BP Diagnostic Laboratory.</p>

    <p>Best regards,<br>
      <strong>BP Diagnostic Laboratory Team</strong>
    </p>
  </div>

  <div class="footer">
    <p>This is an automated message. Please do not reply to this email.</p>
    <p style="margin-top: 10px; font-size: 12px;">For inquiries, please contact us during our operating hours.</p>
  </div>
</body>

</html>