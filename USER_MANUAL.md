# Laboratory Management System - User Manual

**Complete Transaction Workflow Guide**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Cashier Operations](#cashier-operations)
3. [Lab Staff Operations](#lab-staff-operations)
4. [Admin Operations](#admin-operations)
5. [Reports & Analytics](#reports--analytics)

---

# System Overview

## System Purpose

This Laboratory Management System handles the complete workflow of laboratory operations from patient registration and payment through test processing, result delivery, and financial reconciliation.

## User Roles

-   **Cashier**: Handles patient registration, test orders, and payments
-   **Lab Staff**: Processes tests, enters results, and manages result delivery
-   **Admin**: Monitors all operations, manages system configuration, and reviews financial data

---

# Cashier Operations

## 1. Patient Registration & Transaction

### Step 1: Access Transaction Page

1. Login with cashier credentials
2. System automatically redirects to **Cashier Transactions** page
3. Or navigate: Dashboard → Transactions

### Step 2: Start New Transaction

1. Click **"New Transaction"** button (top right)
2. Transaction form appears

### Step 3: Patient Information

#### Option A: Search Existing Patient

1. Click **"Search Patient"** button
2. Type patient name or email in search box
3. Click on patient from results list
4. Patient information auto-fills

#### Option B: Enter New Patient

1. Fill in patient details:

    - **First Name** (required)
    - **Last Name** (required)
    - **Middle Name** (optional)
    - **Email** (optional - for result delivery)
    - **Contact Number** (required)
    - **Date of Birth** (optional)
    - **Age** (required)
    - **Gender** (required)

2. Address Information:
    - Select **Region**
    - Select **Province** (loads based on region)
    - Select **City** (loads based on province)
    - Select **Barangay** (loads based on city)
    - Enter **Street Address** (optional)

### Step 4: Select Lab Tests

1. Click **"Add Test"** button
2. Select test from dropdown:
    - Tests show: Name, Code, Category, Price
    - Example: "Complete Blood Count (CBC) - ₱400.00"
3. Test appears in selected tests list
4. Repeat to add multiple tests
5. Remove test: Click ❌ icon next to test name
6. **Total Amount** updates automatically

### Step 5: Apply Discounts (Optional)

#### Option A: Senior Citizen / PWD Discount

1. Check **"Senior Citizen"** or **"PWD"** checkbox
2. Select discount type from dropdown
3. Discount applies automatically (usually 20%)
4. **Net Total** recalculates

#### Option B: PhilHealth

1. Check **"PhilHealth"** checkbox
2. Select PhilHealth plan from dropdown
3. Coverage applies based on plan (e.g., 50%)
4. **PhilHealth Amount** and **Net Total** update

**Note:** You can combine discounts (e.g., Senior + PhilHealth)

### Step 6: Payment

1. **Payment Method:**

    - Select: **Cash** or **Non-Cash** (Card, GCash, etc.)

2. **For Cash Payment:**

    - Enter **Amount Tendered** (amount customer gives)
    - System calculates **Change Due** automatically
    - Example: Net Total ₱400, Tendered ₱500 → Change ₱100

3. **Payment Status:**
    - Paid (default)
    - Pending (for later payment)

### Step 7: Finalize Transaction

1. Review all details
2. Click **"Process Transaction"** button
3. System generates:
    - ✅ Transaction Number (e.g., TXN-20251201-0001)
    - ✅ Receipt Number (e.g., REC-20251201-0001)
    - ✅ Queue Number (for lab)

### Step 8: Print/Email Receipt

1. **Receipt Preview** appears automatically
2. Options:

    - **Print Receipt** - For customer
    - **Email Receipt** - If patient email provided
    - **Close** - Return to transactions page

3. Receipt includes:
    - Patient information
    - List of tests ordered
    - Pricing breakdown
    - Discounts applied
    - Payment details
    - QR code for verification

---

## 2. View Transaction History

### Access Transaction History

1. Top navigation → **"Transaction History"**
2. Or Dashboard → Transactions → History tab

### Features

-   **Search**: By transaction number, receipt number, or patient name
-   **Pagination**: 50 transactions per page
-   **Status Indicators**:
    -   🟢 **Completed** - All tests done
    -   🟡 **Processing** - Tests in progress
    -   🔵 **Pending** - Tests not started
    -   🟣 **Released** - Results given to patient

### View Transaction Details

1. Click **"View"** button on any transaction
2. Shows:
    - Complete patient information
    - All tests with status
    - Payment breakdown
    - Receipt copy
    - Timeline of events

---

## 3. End-of-Day Cash Reconciliation

### When to Do This

-   End of shift or business day
-   Before closing cash drawer
-   After all transactions are completed

### Step 1: Navigate to Reconciliation

1. Top navigation → **"Cash Reconciliation"**
2. Click **"Reconcile Today"** button

### Step 2: Review Expected Cash

System displays:

-   **Total Transactions**: Count of cash payments today
-   **Expected Cash**: System-calculated total from all transactions
-   **Transaction List**: All cash payments for verification

### Step 3: Count Physical Cash

1. Remove all cash from drawer
2. Count by denomination:
    - ₱1000 bills
    - ₱500 bills
    - ₱100 bills
    - ₱50 bills
    - ₱20 bills
    - Coins
3. Calculate total

### Step 4: Enter Actual Cash

1. Type counted amount in **"Actual Cash"** field
2. Click **"Calculate Variance"** button

### Step 5: Review Variance

System shows:

-   **Expected Cash**: ₱12,450.00
-   **Actual Cash**: ₱12,450.00
-   **Variance**: ₱0.00

**Status Indicators:**

-   ✅ **Balanced** (₱0) - Perfect! Green badge
-   🔵 **Overage** (+₱50) - Extra cash found, Blue badge
-   🔴 **Shortage** (-₱50) - Cash missing, Red badge

### Step 6: Add Notes (Required for Variance)

If variance exists:

-   Explain the difference
-   Example notes:
    -   "Found extra ₱20 bill from yesterday"
    -   "Recounted twice, verified all receipts"
    -   "Customer returned for wrong change, -₱50"

### Step 7: Submit Reconciliation

1. Review all information
2. Click **"Submit Reconciliation"**
3. **Important**: Cannot edit after submission

### Step 8: Confirmation

-   Success message appears
-   Reconciliation saved permanently
-   Admin receives notification (if variance exists)

---

# Lab Staff Operations

## 1. Lab Test Queue

### Access Lab Queue

1. Login with lab staff credentials
2. System redirects to **Lab Test Queue**
3. Or Dashboard → Lab Test Queue

### Queue Overview

**Four Status Tabs:**

1. **Pending** (🔵) - Tests waiting to be started
2. **Processing** (🟡) - Tests currently being performed
3. **Completed** (🟢) - Tests done, results entered
4. **Released** (🟣) - Results given to patient

**Stats Display:**

-   Pending count
-   Processing count
-   Completed today count

### Features

-   Each tab shows 10-25 tests per page
-   **Pagination** for easy navigation
-   **Search** within each status
-   **Full History** tab shows all tests

---

## 2. Process Lab Tests

### Step 1: Select Test from Queue

1. Go to **Pending** or **Processing** tab
2. Find test to work on
3. Click **"Enter Results"** button

### Step 2: Update Test Status

1. Test details page opens
2. Change status:
    - **Pending** → **Processing** (when you start)
    - **Processing** → **Completed** (when done)

### Step 3: Enter Test Results

1. Fill in result fields based on test type
2. Common fields:
    - **Hemoglobin**: e.g., 13.5
    - **RBC Count**: e.g., 4.5
    - **WBC Count**: e.g., 7.5
    - **Reference Ranges**: Auto-displayed
3. Add **Remarks** if needed:
    - "Normal values"
    - "Slightly elevated, recommend follow-up"
    - "Critical value, notify physician"

### Step 4: Save Results

1. Click **"Save Results"** button
2. Test status changes to **Completed**
3. Test moves to Completed tab

### Step 5: Quality Check

1. Review results for accuracy
2. Verify calculations
3. Check against reference ranges
4. If error found, edit results immediately

---

## 3. Patient Results Management

### View Completed Tests

1. Navigate to **Patient Results** page
2. Shows all patients with completed tests
3. Features:
    - **Search**: By transaction number or patient name
    - **Sort**: By date, patient name
    - **Pagination**: 20 patients per page

### Patient Result Details

Click on patient to see:

-   Patient information
-   All tests ordered
-   Individual test results
-   Completion status
-   Result delivery status

---

## 4. Send Results to Patient

### Method 1: Email Results

#### Step 1: Select Patient

1. Go to **Patient Results** page
2. Find patient with all tests completed
3. Click **"Send Results via Email"** button

#### Step 2: Verify Email

-   System shows patient email
-   If no email: Error message appears
-   Update patient email if needed

#### Step 3: Send

1. Click **"Confirm Send"**
2. System generates PDF with:
    - Patient details
    - All test results
    - Reference ranges
    - Laboratory information
    - Digital signature
3. Email sent automatically
4. Confirmation message appears

#### Step 4: Record Submission

-   Submission saved in system
-   Appears in **Submission History**
-   Test status → **Released**

### Method 2: Notify for Pickup

#### Step 1: Select Patient

1. Go to **Patient Results** page
2. Click **"Notify Patient (Pickup)"** button

#### Step 2: Send Notification

1. System sends email notification:
    - "Your test results are ready for pickup"
    - Laboratory hours
    - Contact information
2. Patient email required

#### Step 3: Confirmation

-   Notification logged
-   Patient can pick up at front desk
-   Results printed and ready

---

## 5. Result Submission History

### Access History

1. Navigate to **Submission History** page
2. Shows all sent results

### Information Displayed

-   **Date & Time**: When results sent
-   **Patient Name**
-   **Transaction Number**
-   **Submission Type**: Email or Pickup notification
-   **Sent By**: Lab staff name
-   **Status**: Delivered/Pending

### Features

-   **Search**: By patient or transaction
-   **Filter**: By submission type
-   **Pagination**: 20 records per page
-   **Export**: Download history as CSV

---

# Admin Operations

## 1. Dashboard Overview

### Access Dashboard

1. Login with admin credentials
2. System shows **Admin Dashboard**

### Dashboard Sections

#### Statistics Cards

1. **Total Revenue**

    - Today/Week/Month/Year
    - Trend indicator (↑ or ↓)
    - Comparison with previous period

2. **Patient Count**

    - Unique patients served
    - Trend comparison

3. **Pending Tests**

    - Count of tests waiting
    - Link to lab queue

4. **Low Stock Items**
    - Inventory warnings
    - Critical stock alerts

#### Revenue Chart

-   Hourly (day view)
-   Daily (week view)
-   Weekly (month view)
-   Monthly (year view)

#### Test Status Distribution

-   Pie chart showing:
    -   Pending tests
    -   Processing tests
    -   Completed tests
    -   Released tests

#### Alerts Section

🚨 **Critical Alerts**:

-   Out of stock items
-   Cash discrepancies
-   Unreconciled cash
-   System issues

⚠️ **Warnings**:

-   Low stock items
-   Pending tests backlog
-   Missing reconciliations

ℹ️ **Info**:

-   Daily summaries
-   Reminders

---

## 2. Monitor Cash Reconciliation

### Access Reconciliation Monitoring

1. Top navigation → **"Cash Reconciliation"**
2. Admin view shows ALL cashiers

### Summary Statistics

Top cards display:

1. **Total Reconciliations**

    - Count: 45 days
    - Total reconciled

2. **Balanced**

    - Count: 38
    - Percentage: 84.4%
    - Green indicator

3. **Total Overage**

    - Count: 4 instances
    - Total: ₱250.00
    - Blue indicator

4. **Total Shortage**
    - Count: 3 instances
    - Total: ₱180.00
    - Red indicator

### Reconciliation Table

Shows all reconciliations with:

-   **Date**
-   **Cashier Name**
-   **Expected Cash**
-   **Actual Cash**
-   **Variance**
-   **Status Badge**
-   **Transaction Count**
-   **Actions** (View button)

### Filter & Search

-   **Status Filter**: All / Balanced / Overage / Shortage
-   **Search**: By date or cashier name
-   **Pagination**: 15 records per page

### View Details

Click **"View"** on any reconciliation:

1. **Summary Cards**:

    - Expected cash
    - Actual cash
    - Variance
    - Reconciled by (cashier + time)

2. **Cashier Notes**:

    - Explanation of variance
    - Any issues noted

3. **Transaction Breakdown**:
    - Complete list of all transactions
    - Each payment amount
    - Total verification

### Investigation Process

**When Variance Found:**

1. Review summary cards
2. Read cashier notes
3. Check transaction list
4. Cross-reference with receipts
5. Interview cashier if needed
6. Document findings

**Red Flags:**

-   No notes for variance
-   Repeated shortages (same cashier)
-   Round number variances (₱50, ₱100)
-   Pattern of issues

---

## 3. User Management

### Access Users

1. Dashboard → Configuration → **Users**

### View All Users

Table shows:

-   **Name**
-   **Username**
-   **Email**
-   **Role** (Admin/Cashier/Lab Staff)
-   **Status** (Active/Inactive)
-   **Actions**

### Create New User

1. Click **"Add User"** button
2. Fill in form:
    - Full Name
    - Username (unique)
    - Email (unique)
    - Password
    - Role selection
3. Click **"Create User"**

### Edit User

1. Click **"Edit"** button
2. Update information
3. Save changes

**Note**: Cannot edit primary admin account

### Activate/Deactivate User

1. Click toggle switch
2. Confirm action
3. User access enabled/disabled

**Protections**:

-   Cannot deactivate yourself
-   Cannot deactivate primary admin

---

## 4. Patient Management

### Access Patients

1. Dashboard → Configuration → **Patients**

### Patient List

Features:

-   **Search**: Name, email, contact
-   **Pagination**: 25 per page
-   **Status**: Active/Inactive
-   **Transaction History**: Per patient

### View Patient Details

Click on patient name:

-   Full patient information
-   Address details
-   All transactions
-   Test history
-   Total spent

### Add New Patient

1. Click **"Add Patient"**
2. Enter details (same as cashier transaction)
3. Save patient

### Edit Patient

1. Click **"Edit"**
2. Update information
3. Save changes

### Deactivate Patient

-   Click toggle switch
-   Patient hidden from searches
-   Transaction history preserved
-   Can reactivate anytime

---

## 5. Service Management (Lab Tests)

### Access Services

1. Dashboard → Configuration → **Services**

### Service List

Shows:

-   **Test Name**
-   **Code**
-   **Category**
-   **Price**
-   **Status** (Active/Inactive)

### Add New Test

1. Click **"Add Service"**
2. Fill in:
    - Test Name
    - Test Code (unique)
    - Category (dropdown)
    - Price
    - Description
3. Save

### Edit Test

1. Click **"Edit"**
2. Modify details
3. Update price if needed
4. Save

### Activate/Deactivate Test

-   Toggle switch
-   Inactive tests hidden from cashier
-   Can reactivate anytime

---

## 6. Inventory Management

### Access Inventory

1. Dashboard → Configuration → **Inventory**

### Inventory Items Tab

Shows:

-   **Item Name**
-   **Current Stock**
-   **Minimum Level**
-   **Unit**
-   **Status** (In Stock / Low Stock / Out of Stock)

**Status Colors**:

-   🟢 **Green**: In stock (above minimum)
-   🟡 **Yellow**: Low stock (at or below minimum)
-   🔴 **Red**: Out of stock (0 quantity)

### Add New Item

1. Click **"Add Item"**
2. Fill in:
    - Item name
    - Initial quantity
    - Unit (pcs, boxes, bottles)
    - Minimum stock level
3. Save

### Stock In (Add Stock)

1. Click **"Stock In"** button
2. Enter:
    - Quantity to add
    - Supplier name (optional)
    - Notes
3. Submit
4. Stock increases automatically

### Stock Out (Remove Stock)

1. Click **"Stock Out"** button
2. Enter:
    - Quantity to remove
    - Reason (dropdown)
    - Notes
3. Submit
4. Stock decreases

### Adjust Stock

1. Click **"Adjust"** button
2. Enter new stock level
3. Reason (damaged, expired, etc.)
4. Submit

### Transaction History Tab

Shows all inventory movements:

-   Date & time
-   Item name
-   Type (In/Out/Adjustment)
-   Quantity
-   Previous stock → New stock
-   User who made change
-   Reason/notes

---

## 7. Discount & PhilHealth Configuration

### Access Configuration

1. Dashboard → Configuration → **Discounts & PhilHealth**

### Discounts Tab

#### View Discounts

-   **Name** (Senior Citizen, PWD, etc.)
-   **Rate** (20%, 10%, etc.)
-   **Description**
-   **Status** (Active/Inactive)

#### Add Discount

1. Click **"Add Discount"**
2. Enter:
    - Discount name
    - Rate (percentage)
    - Description
3. Save

#### Edit/Activate Discount

-   Modify rate or details
-   Toggle active status

### PhilHealth Plans Tab

#### View Plans

-   **Plan Name**
-   **Coverage Rate** (50%, 75%, etc.)
-   **Description**
-   **Status**

#### Add Plan

1. Click **"Add PhilHealth Plan"**
2. Enter:
    - Plan name
    - Coverage percentage
    - Description
3. Save

---

# Reports & Analytics

## 1. Access Reports

1. Dashboard → **Reports & Logs**

## 2. Financial Report

### Overview

Shows all financial transactions with revenue analysis.

### Features

-   **Date Range Filter**: Day/Week/Month/Year or Custom
-   **Search**: Transaction number, patient name
-   **Pagination**: 50 records per page

### Summary Statistics

-   **Total Revenue**: Sum of all net payments
-   **Total Discounts**: Total discount amount given
-   **Transaction Count**: Number of transactions

### Transaction Table

Columns:

-   Date
-   Transaction Number
-   Patient Name
-   Tests Performed
-   Total Amount
-   Discount Applied
-   Net Amount
-   Payment Method
-   Payment Status

### Export

-   Click **"Export CSV"**
-   Opens in Excel
-   Includes summary at bottom

---

## 3. Lab Report

### Overview

Shows all lab tests performed and their status.

### Summary Statistics

-   **Total Tests**: Count of all tests
-   **Pending**: Not started
-   **Processing**: In progress
-   **Completed**: Results entered
-   **Released**: Given to patient

### Test Table

Columns:

-   Date
-   Patient Name
-   Test Name
-   Status
-   Performed By (lab staff)
-   Completed Date

### Export

-   CSV download
-   Filterable by date range

---

## 4. Inventory Log

### Overview

Tracks all inventory movements.

### Summary

-   **Total Transactions**: Count of movements
-   **Stock In**: Total additions
-   **Stock Out**: Total removals

### Transaction Table

Columns:

-   Date & Time
-   Item Name
-   Type (In/Out/Adjustment)
-   Quantity
-   Previous → New Stock
-   Performed By
-   Reason

### Export

-   CSV with full history

---

## 5. Audit Log

### Overview

Complete system activity log.

### Features

-   **Filter by Category**:

    -   User Management
    -   Patient Management
    -   Service Management
    -   Inventory Management
    -   Transactions
    -   Lab Operations
    -   Cash Reconciliation

-   **Filter by Severity**:
    -   Info
    -   Warning
    -   Critical

### Log Entries

Shows:

-   **Date & Time**
-   **User**: Who performed action
-   **Action Type**: What was done
-   **Description**: Details
-   **Severity Level**

### Search

-   By user name
-   By action type
-   By description keywords

---

## 6. Cash Reconciliation Report

### Overview

Financial accountability tracking.

### Summary Statistics

1. **Total Reconciliations**: Days counted
2. **Balanced**: Perfect matches (₱0 variance)
    - Count and percentage
3. **Overage**: Extra cash found
    - Count and total amount
4. **Shortage**: Missing cash
    - Count and total amount
5. **Net Variance**: Overall difference

### Reconciliation Table

Columns:

-   Date
-   Cashier
-   Expected Cash
-   Actual Cash
-   Variance
-   Status
-   Transaction Count

### Filtering

-   By status (Balanced/Overage/Shortage)
-   By date range
-   Search by cashier

### Export

-   CSV with summary statistics
-   Full reconciliation details

---

## Best Practices

### For Cashiers

1. **Verify patient information** before processing
2. **Double-check test selection** to avoid errors
3. **Count change carefully** to prevent discrepancies
4. **Print receipts** for all transactions
5. **Reconcile daily** before end of shift

### For Lab Staff

1. **Update status** when starting tests
2. **Enter results accurately** - double-check values
3. **Add remarks** for abnormal values
4. **Verify email** before sending results
5. **Keep queue organized** - process oldest first

### For Admin

1. **Monitor dashboard daily** for alerts
2. **Review reconciliations** weekly for patterns
3. **Check inventory** for low stock items
4. **Audit logs regularly** for security
5. **Export reports monthly** for accounting

---

## Troubleshooting

### Common Issues

**Problem**: Cannot process transaction

-   **Solution**: Check if all required fields filled
-   Verify patient information is complete
-   Ensure at least one test is selected

**Problem**: Receipt not printing

-   **Solution**: Check printer connection
-   Try "Print Receipt" button again
-   Use PDF download option

**Problem**: Cannot find patient

-   **Solution**: Try different search terms
-   Check spelling
-   Search by partial name
-   Create new patient if not found

**Problem**: Test results not saving

-   **Solution**: Check all required fields
-   Verify status is "Completed"
-   Check internet connection

**Problem**: Cash reconciliation shows variance

-   **Solution**: Recount physical cash
-   Verify all transactions recorded
-   Check for unprocessed transactions
-   Add notes explaining difference

**Problem**: Inventory shows wrong stock

-   **Solution**: Use "Adjust Stock" feature
-   Enter correct amount
-   Document reason in notes

---

## System Information

### Technical Details

-   **Platform**: Web-based (browser access)
-   **Database**: PostgreSQL
-   **Framework**: Laravel + React
-   **Supported Browsers**: Chrome, Firefox, Edge

### Performance

-   **Page Load**: < 500ms average
-   **Search**: Real-time results
-   **Pagination**: 10-50 records per page
-   **Concurrent Users**: Up to 50

### Security

-   **Password Protection**: Required for all users
-   **Role-Based Access**: Each role sees relevant features
-   **Audit Trail**: All actions logged
-   **Data Encryption**: Secure connections (HTTPS)

---

## Support

For technical issues or questions:

1. Check this manual first
2. Contact system administrator
3. Review audit logs for error details
4. Document issue for troubleshooting

---

**Last Updated**: December 1, 2025  
**Version**: 1.0  
**System**: Laboratory BP Management System
