<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            padding: 30px;
            text-align: center;
        }
        .header img {
            width: 80px;
            height: 80px;
            margin-bottom: 10px;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
        }
        .otp-box {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 2px solid #dc2626;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .otp-code {
            font-size: 42px;
            font-weight: bold;
            color: #dc2626;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .message {
            font-size: 15px;
            color: #555;
            margin-bottom: 15px;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #856404;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 13px;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{ asset('images/logo.png') }}" alt="BP Diagnostic Logo">
            <h1>BP Diagnostic Laboratory</h1>
        </div>
        
        <div class="content">
            <p class="greeting">Hello {{ $userName }},</p>
            
            <p class="message">
                We received a request to reset your password for your BP Diagnostic Laboratory Management System account.
            </p>
            
            <p class="message">
                Use the following One-Time Password (OTP) to complete your password reset:
            </p>
            
            <div class="otp-box">
                <div class="otp-label">Your OTP Code</div>
                <div class="otp-code">{{ $otp }}</div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>This OTP is valid for <strong>10 minutes</strong> only</li>
                    <li>Do not share this code with anyone</li>
                    <li>If you didn't request this, please ignore this email</li>
                </ul>
            </div>
            
            <p class="message">
                Enter this code on the password reset page to proceed with resetting your password.
            </p>
            
            <p class="message">
                If you have any questions or concerns, please contact your system administrator.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>BP Diagnostic Laboratory Management System</strong></p>
            <p>&copy; {{ date('Y') }} BP Diagnostic Laboratory. All rights reserved.</p>
            <p style="margin-top: 15px; font-size: 12px; color: #999;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
