<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Lab Test Results are Ready</title>
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
      background-color: #2563eb;
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
      border-left: 4px solid #2563eb;
      border-radius: 4px;
    }

    .test-list li {
      margin: 8px 0;
    }

    .transaction-code {
      background-color: #dbeafe;
      padding: 10px;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: bold;
      text-align: center;
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

    <p>We are pleased to inform you that your test results for the following are now ready for claiming:</p>

    <div class="test-list">
      <ul>
        @foreach($transaction->tests as $test)
          <li>{{ $test->test_name }}</li>
        @endforeach
      </ul>
    </div>

    <p>You may now visit our laboratory to pick up your results during our operating hours.</p>

    <div class="transaction-code">
      Transaction Code: {{ $transaction->transaction_number }}
    </div>

    <p>Thank you for choosing BP Diagnostic Laboratory.</p>

    <p>Best regards,<br>
      <strong>BP Diagnostic Laboratory Team</strong>
    </p>
  </div>

  <div class="footer">
    <p>This is an automated message. Please do not reply to this email.</p>
  </div>
</body>

</html>