# OTP Password Reset System - User Guide

## Overview

The BP Diagnostic Laboratory Management System now uses a secure **6-digit OTP (One-Time Password)** system for password resets instead of traditional email links.

---

## How It Works

### For Users

#### Step 1: Request Password Reset

1. Navigate to the login page
2. Click on **"Forgot Password?"** link
3. Enter your registered email address
4. Click **"Send OTP Code"**

#### Step 2: Verify OTP

1. Check your email inbox for a message from BP Diagnostic Laboratory
2. Find the **6-digit OTP code** in the email
3. Enter the code in the verification screen
4. Click **"Verify & Continue"**

#### Step 3: Reset Password

1. After successful OTP verification, you'll be redirected to the password reset page
2. Enter your new password
3. Confirm your new password
4. Click **"Reset Password"**
5. You can now log in with your new password

---

## Security Features

### OTP Expiration

-   Each OTP is valid for **10 minutes only**
-   After 10 minutes, you must request a new OTP
-   Old OTPs are automatically deleted after expiration

### One-Time Use

-   Each OTP can only be used once
-   After verification, the OTP is marked as verified
-   After password reset, the OTP is deleted from the system

### Email Validation

-   OTPs are only sent to registered email addresses
-   Invalid email addresses will receive an error message

---

## Features

### Resend OTP

If you didn't receive the OTP email:

1. Click **"Resend OTP"** on the verification screen
2. A new OTP will be generated and sent to your email
3. The previous OTP will be invalidated

### Change Email Address

If you entered the wrong email:

1. Click **"Change Email Address"** on the verification screen
2. You'll return to the email entry screen
3. Enter the correct email address

---

## Email Format

The OTP email includes:

-   **BP Diagnostic logo and branding**
-   Large, easy-to-read **6-digit code**
-   **Security warnings** about OTP validity and sharing
-   **Expiration information** (10 minutes)
-   Professional footer with company information

---

## For Administrators

### Testing in Development

Since the system is in development mode with `MAIL_MAILER=log`:

1. OTP emails are written to `storage/logs/laravel.log`
2. Open the log file to find the OTP code
3. Search for "Your OTP Code" in the log file

### Setting Up Production Email

To enable real email sending in production:

1. Update `.env` file with SMTP settings:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@bpdiagnostic.com
MAIL_FROM_NAME="BP Diagnostic Laboratory"
```

2. For Gmail, use an **App Password** (not your regular password):
    - Go to Google Account Settings
    - Security → 2-Step Verification → App passwords
    - Generate a new app password for "Mail"
    - Use this password in `MAIL_PASSWORD`

---

## Database Structure

### password_reset_tokens Table

```sql
- email: User's email address (Primary Key)
- otp: 6-digit numeric code
- created_at: When the OTP was generated
- expires_at: When the OTP will expire (10 minutes from creation)
- is_verified: Boolean flag indicating if OTP was verified
```

---

## Technical Implementation

### OTP Generation

-   Random 6-digit number (000000 to 999999)
-   Padded with leading zeros if necessary
-   Stored securely in database

### Controllers

1. **PasswordResetLinkController**

    - `store()`: Generates and sends OTP
    - `verifyOtp()`: Validates OTP and marks as verified

2. **NewPasswordController**
    - `store()`: Resets password after OTP verification
    - Deletes OTP record after successful reset

### Routes

-   `POST /forgot-password` - Send OTP
-   `POST /verify-otp` - Verify OTP
-   `GET /reset-password/{token}` - Show reset form
-   `POST /reset-password` - Process password reset

---

## User Interface

### Step Indicator

The forgot password page shows a visual progress indicator:

-   **Step 1**: Email entry (Red circle with "1")
-   **Progress bar**: Turns red when step 2 is active
-   **Step 2**: OTP verification (Red circle with "2")

### Input Validation

-   Email field: Standard email validation
-   OTP field: Only accepts 6 numeric digits
-   Password fields: Must match and meet password requirements

---

## Troubleshooting

### Common Issues

**"We could not find a user with that email address"**

-   The email is not registered in the system
-   Check for typos in the email address
-   Contact your administrator to verify your account

**"This OTP has expired"**

-   The OTP was generated more than 10 minutes ago
-   Click "Resend OTP" to get a new code

**"The OTP you entered is incorrect"**

-   Double-check the code in your email
-   Make sure you're using the most recent OTP
-   Request a new OTP if needed

**"No OTP request found"**

-   The OTP may have expired and been deleted
-   Start the password reset process again

---

## Defense Presentation Points

1. **Enhanced Security**: OTP is more secure than email links

    - Short expiration time (10 minutes)
    - One-time use only
    - No token manipulation possible

2. **Better User Experience**:

    - Simple 2-step process
    - Visual progress indicator
    - Clear error messages
    - Easy resend option

3. **Professional Implementation**:

    - Beautiful, branded email template
    - Modern UI with BP Diagnostic branding
    - Responsive design for mobile devices
    - Comprehensive error handling

4. **Audit Trail**:
    - All OTP requests are logged
    - Database tracks verification status
    - Password reset events are recorded

---

## Migration Notes

### From Old System to OTP System

The system has been upgraded from Laravel's default password reset (using tokens and email links) to a more secure OTP-based system.

**What Changed:**

-   Password reset tokens table structure updated
-   New OTP verification step added
-   Email template replaced with OTP-specific design
-   Controllers updated to handle OTP flow

**Backward Compatibility:**

-   All existing users can use the new system immediately
-   No user data migration required
-   Email addresses remain the primary identifier

---

## Testing Checklist

-   [ ] Request OTP with valid email
-   [ ] Verify correct OTP code
-   [ ] Test OTP expiration (wait 10+ minutes)
-   [ ] Test invalid OTP codes
-   [ ] Test resend OTP functionality
-   [ ] Test change email address feature
-   [ ] Reset password successfully
-   [ ] Login with new password
-   [ ] Test with non-existent email
-   [ ] Check email formatting in log/inbox

---

**Last Updated:** December 1, 2025  
**Version:** 1.0  
**System:** BP Diagnostic Laboratory Management System
