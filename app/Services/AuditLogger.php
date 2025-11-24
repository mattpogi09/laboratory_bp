<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AuditLogger
{
  protected $request;

  public function __construct(Request $request)
  {
    $this->request = $request;
  }

  /**
   * Log an audit event
   */
  public function log(
    string $actionType,
    string $actionCategory,
    string $description,
    array $metadata = [],
    string $severity = 'info',
    ?string $entityType = null,
    ?int $entityId = null,
    ?int $userId = null,
    ?string $userName = null,
    ?string $userRole = null
  ): void {
    $user = Auth::user();

    AuditLog::create([
      'user_id' => $userId ?? $user?->id,
      'user_name' => $userName ?? $user?->name ?? 'System',
      'user_role' => $userRole ?? ($user ? $user->role : 'system'),
      'action_type' => $actionType,
      'action_category' => $actionCategory,
      'description' => $description,
      'metadata' => $metadata,
      'ip_address' => $this->request->ip(),
      'severity' => $severity,
      'entity_type' => $entityType,
      'entity_id' => $entityId,
      'created_at' => now(),
    ]);
  }

  /**
   * Format database field names to human-readable labels
   */
  private function formatFieldName(string $field): string
  {
    $fieldLabels = [
      'first_name' => 'First Name',
      'last_name' => 'Last Name',
      'middle_name' => 'Middle Name',
      'email' => 'Email',
      'contact_number' => 'Contact Number',
      'address' => 'Address',
      'date_of_birth' => 'Date of Birth',
      'age' => 'Age',
      'gender' => 'Gender',
      'username' => 'Username',
      'name' => 'Name',
      'role' => 'Role',
      'is_active' => 'Status',
      'category' => 'Category',
      'price' => 'Price',
      'description' => 'Description',
      'minimum_stock' => 'Minimum Stock',
      'unit' => 'Unit',
    ];

    return $fieldLabels[$field] ?? ucwords(str_replace('_', ' ', $field));
  }

  // User Management Actions
  public function logUserCreated(array $userData): void
  {
    $this->log(
      actionType: 'user_created',
      actionCategory: 'user_management',
      description: "Created new user: {$userData['name']} with role '{$userData['role']}' (Username: {$userData['username']}, Email: {$userData['email']})",
      metadata: [
        'user_data' => [
          'name' => $userData['name'],
          'username' => $userData['username'],
          'email' => $userData['email'],
          'role' => $userData['role'],
          'is_active' => true,
        ],
      ],
      severity: 'info',
      entityType: 'User',
      entityId: $userData['id'] ?? null
    );
  }

  public function logUserUpdated(int $userId, array $oldData, array $newData): void
  {
    $changes = [];
    foreach ($newData as $key => $value) {
      if ($key === 'password')
        continue; // Never log passwords
      if (isset($oldData[$key]) && $oldData[$key] != $value) {
        $changes[$key] = [
          'from' => $oldData[$key],
          'to' => $value,
        ];
      }
    }

    $changesList = collect($changes)->map(function ($change, $field) {
      $fieldLabel = $this->formatFieldName($field);
      return "{$fieldLabel}: '{$change['from']}' → '{$change['to']}'";
    })->implode(', ');

    $this->log(
      actionType: 'user_updated',
      actionCategory: 'user_management',
      description: "Updated user '{$newData['name']}'. Changes: {$changesList}",
      metadata: [
        'user_id' => $userId,
        'changes' => $changes,
      ],
      severity: 'info',
      entityType: 'User',
      entityId: $userId
    );
  }

  public function logUserToggled(int $userId, string $userName, bool $newStatus): void
  {
    $status = $newStatus ? 'activated' : 'deactivated';
    $this->log(
      actionType: 'user_toggled',
      actionCategory: 'user_management',
      description: "User '{$userName}' has been {$status}",
      metadata: [
        'user_id' => $userId,
        'user_name' => $userName,
        'new_status' => $newStatus,
        'action' => $status,
      ],
      severity: $newStatus ? 'info' : 'warning',
      entityType: 'User',
      entityId: $userId
    );
  }

  // Service Management Actions
  public function logServiceCreated(array $serviceData): void
  {
    $this->log(
      actionType: 'service_created',
      actionCategory: 'service_management',
      description: "Created new lab test service: {$serviceData['name']} ({$serviceData['code']}) - Category: {$serviceData['category']}, Price: ₱{$serviceData['price']}",
      metadata: [
        'service_data' => $serviceData,
      ],
      severity: 'info',
      entityType: 'LabTest',
      entityId: $serviceData['id'] ?? null
    );
  }

  public function logServiceUpdated(int $serviceId, array $oldData, array $newData): void
  {
    $changes = [];
    foreach ($newData as $key => $value) {
      if (isset($oldData[$key]) && $oldData[$key] != $value) {
        $changes[$key] = [
          'from' => $oldData[$key],
          'to' => $value,
        ];
      }
    }

    $changesList = collect($changes)->map(function ($change, $field) {
      $fieldLabel = $this->formatFieldName($field);
      return "{$fieldLabel}: '{$change['from']}' → '{$change['to']}'";
    })->implode(', ');

    $this->log(
      actionType: 'service_updated',
      actionCategory: 'service_management',
      description: "Updated lab test '{$newData['name']}'. Changes: {$changesList}",
      metadata: [
        'service_id' => $serviceId,
        'changes' => $changes,
      ],
      severity: 'info',
      entityType: 'LabTest',
      entityId: $serviceId
    );
  }

  public function logServiceToggled(int $serviceId, string $serviceName, bool $newStatus): void
  {
    $status = $newStatus ? 'activated' : 'deactivated';
    $this->log(
      actionType: 'service_toggled',
      actionCategory: 'service_management',
      description: "Lab test '{$serviceName}' has been {$status}",
      metadata: [
        'service_id' => $serviceId,
        'service_name' => $serviceName,
        'new_status' => $newStatus,
        'action' => $status,
      ],
      severity: $newStatus ? 'info' : 'warning',
      entityType: 'LabTest',
      entityId: $serviceId
    );
  }

  // Inventory Actions
  public function logInventoryCreated(array $itemData): void
  {
    $this->log(
      actionType: 'inventory_item_created',
      actionCategory: 'inventory_management',
      description: "Created new inventory item: {$itemData['name']} - Initial stock: {$itemData['quantity']} {$itemData['unit']}, Min level: {$itemData['min_level']}",
      metadata: [
        'item_data' => $itemData,
      ],
      severity: 'info',
      entityType: 'InventoryItem',
      entityId: $itemData['id'] ?? null
    );
  }

  public function logInventoryStockIn(string $itemName, int $quantity, int $previousStock, int $newStock, ?string $supplier, ?string $notes): void
  {
    $this->log(
      actionType: 'inventory_stock_in',
      actionCategory: 'inventory_management',
      description: "Added stock to '{$itemName}': +{$quantity} units. Stock: {$previousStock} → {$newStock}" . ($supplier ? ", Supplier: {$supplier}" : "") . ($notes ? ", Notes: {$notes}" : ""),
      metadata: [
        'item_name' => $itemName,
        'quantity_added' => $quantity,
        'previous_stock' => $previousStock,
        'new_stock' => $newStock,
        'supplier' => $supplier,
        'notes' => $notes,
      ],
      severity: 'info'
    );
  }

  public function logInventoryStockOut(string $itemName, int $quantity, int $previousStock, int $newStock, string $reason, ?string $notes): void
  {
    $this->log(
      actionType: 'inventory_stock_out',
      actionCategory: 'inventory_management',
      description: "Removed stock from '{$itemName}': -{$quantity} units. Stock: {$previousStock} → {$newStock}, Reason: {$reason}" . ($notes ? ", Notes: {$notes}" : ""),
      metadata: [
        'item_name' => $itemName,
        'quantity_removed' => $quantity,
        'previous_stock' => $previousStock,
        'new_stock' => $newStock,
        'reason' => $reason,
        'notes' => $notes,
      ],
      severity: $newStock < 10 ? 'warning' : 'info'
    );
  }

  public function logInventoryAdjustment(string $itemName, int $previousStock, int $newStock, string $reason, ?string $notes): void
  {
    $difference = $newStock - $previousStock;
    $direction = $difference > 0 ? '+' : '';

    $this->log(
      actionType: 'inventory_adjusted',
      actionCategory: 'inventory_management',
      description: "Adjusted stock for '{$itemName}': {$direction}{$difference} units. Stock: {$previousStock} → {$newStock}, Reason: {$reason}" . ($notes ? ", Notes: {$notes}" : ""),
      metadata: [
        'item_name' => $itemName,
        'adjustment' => $difference,
        'previous_stock' => $previousStock,
        'new_stock' => $newStock,
        'reason' => $reason,
        'notes' => $notes,
      ],
      severity: 'warning'
    );
  }

  public function logInventoryToggled(int $itemId, string $itemName, bool $isActive): void
  {
    $status = $isActive ? 'activated' : 'deactivated';

    $this->log(
      actionType: 'inventory_toggled',
      actionCategory: 'inventory_management',
      description: "Item '{$itemName}' has been {$status}",
      metadata: [
        'item_name' => $itemName,
        'is_active' => $isActive,
        'status' => $status,
      ],
      severity: 'info'
    );
  }

  // Discount Management Actions
  public function logDiscountCreated(array $discountData): void
  {
    $this->log(
      actionType: 'discount_created',
      actionCategory: 'discount_management',
      description: "Created new discount: {$discountData['name']} - Rate: {$discountData['rate']}%",
      metadata: [
        'discount_data' => $discountData,
      ],
      severity: 'info',
      entityType: 'Discount',
      entityId: $discountData['id'] ?? null
    );
  }

  public function logDiscountUpdated(int $discountId, array $oldData, array $newData): void
  {
    $changes = [];
    foreach ($newData as $key => $value) {
      if (isset($oldData[$key]) && $oldData[$key] != $value) {
        $changes[$key] = [
          'from' => $oldData[$key],
          'to' => $value,
        ];
      }
    }

    $changesList = collect($changes)->map(function ($change, $field) {
      $fieldLabel = $this->formatFieldName($field);
      return "{$fieldLabel}: '{$change['from']}' → '{$change['to']}'";
    })->implode(', ');

    $this->log(
      actionType: 'discount_updated',
      actionCategory: 'discount_management',
      description: "Updated discount '{$newData['name']}'. Changes: {$changesList}",
      metadata: [
        'discount_id' => $discountId,
        'changes' => $changes,
      ],
      severity: 'info',
      entityType: 'Discount',
      entityId: $discountId
    );
  }

  public function logDiscountToggled(int $discountId, string $discountName, bool $isActive): void
  {
    $status = $isActive ? 'activated' : 'deactivated';

    $this->log(
      actionType: 'discount_toggled',
      actionCategory: 'discount_management',
      description: "Discount '{$discountName}' has been {$status}",
      metadata: [
        'discount_id' => $discountId,
        'discount_name' => $discountName,
        'is_active' => $isActive,
        'status' => $status,
      ],
      severity: 'info',
      entityType: 'Discount',
      entityId: $discountId
    );
  }

  // Patient Management Actions
  public function logPatientCreated(array $patientData): void
  {
    $this->log(
      actionType: 'patient_created',
      actionCategory: 'patient_management',
      description: "Created new patient: {$patientData['first_name']} {$patientData['last_name']} - Age: {$patientData['age']}, Gender: {$patientData['gender']}, Contact: {$patientData['contact_number']}",
      metadata: [
        'patient_data' => $patientData,
      ],
      severity: 'info',
      entityType: 'Patient',
      entityId: $patientData['id'] ?? null
    );
  }

  public function logPatientUpdated(int $patientId, array $oldData, array $newData): void
  {
    $changes = [];
    foreach ($newData as $key => $value) {
      if (isset($oldData[$key]) && $oldData[$key] != $value) {
        $changes[$key] = [
          'from' => $oldData[$key],
          'to' => $value,
        ];
      }
    }

    $changesList = collect($changes)->map(function ($change, $field) {
      $fieldLabel = $this->formatFieldName($field);
      return "{$fieldLabel}: '{$change['from']}' → '{$change['to']}'";
    })->implode(', ');

    $patientName = ($newData['first_name'] ?? '') . ' ' . ($newData['last_name'] ?? '');

    $this->log(
      actionType: 'patient_updated',
      actionCategory: 'patient_management',
      description: "Updated patient '{$patientName}'. Changes: {$changesList}",
      metadata: [
        'patient_id' => $patientId,
        'changes' => $changes,
      ],
      severity: 'info',
      entityType: 'Patient',
      entityId: $patientId
    );
  }

  public function logPatientDeleted(int $patientId, string $patientName): void
  {
    $this->log(
      actionType: 'patient_deleted',
      actionCategory: 'patient_management',
      description: "Deleted patient '{$patientName}'",
      metadata: [
        'patient_id' => $patientId,
        'patient_name' => $patientName,
      ],
      severity: 'critical',
      entityType: 'Patient',
      entityId: $patientId
    );
  }

  // Transaction Actions
  public function logTransactionCreated(array $transactionData): void
  {
    $testsStr = is_array($transactionData['tests']) ? implode(', ', $transactionData['tests']) : '';

    $this->log(
      actionType: 'transaction_created',
      actionCategory: 'transactions',
      description: "Created transaction {$transactionData['transaction_number']} for patient {$transactionData['patient_name']} - Tests: {$testsStr}, Total: ₱{$transactionData['total_amount']}, Discount: ₱{$transactionData['discount_amount']}, Net: ₱{$transactionData['net_total']}, Payment: {$transactionData['payment_method']}",
      metadata: $transactionData,
      severity: 'info',
      entityType: 'Transaction',
      entityId: $transactionData['id'] ?? null
    );
  }

  // Lab Result Actions
  public function logLabResultEntered(int $transactionTestId, string $testName, string $patientName, ?string $statusInfo = null): void
  {
    $description = "Entered lab results for '{$testName}' - Patient: {$patientName}";
    if ($statusInfo) {
      $description .= ". {$statusInfo}";
    }

    $this->log(
      actionType: 'lab_result_entered',
      actionCategory: 'lab_operations',
      description: $description,
      metadata: [
        'transaction_test_id' => $transactionTestId,
        'test_name' => $testName,
        'patient_name' => $patientName,
        'status_info' => $statusInfo,
      ],
      severity: 'info',
      entityType: 'TransactionTest',
      entityId: $transactionTestId
    );
  }

  public function logLabResultAmended(int $transactionTestId, string $testName, string $patientName, array $changes, ?string $statusChange = null): void
  {
    $changesList = collect($changes)->map(function ($change, $field) {
      $fieldLabel = $this->formatFieldName($field);
      $from = $change['from'] ?? 'empty';
      $to = $change['to'] ?? 'empty';
      return "{$fieldLabel}: '{$from}' → '{$to}'";
    })->implode(', ');

    $description = "AMENDED lab results for '{$testName}' - Patient: {$patientName}. Changes: {$changesList}";
    if ($statusChange) {
      $description .= " {$statusChange}";
    }

    $this->log(
      actionType: 'lab_result_amended',
      actionCategory: 'lab_operations',
      description: $description,
      metadata: [
        'transaction_test_id' => $transactionTestId,
        'test_name' => $testName,
        'patient_name' => $patientName,
        'changes' => $changes,
        'status_change' => $statusChange,
        'amendment_reason' => 'Data correction or update',
      ],
      severity: 'warning',
      entityType: 'TransactionTest',
      entityId: $transactionTestId
    );
  }

  // Report Actions
  public function logReportGenerated(string $reportType, ?string $dateFrom, ?string $dateTo): void
  {
    $dateRange = $dateFrom && $dateTo ? "from {$dateFrom} to {$dateTo}" : "for all dates";

    $this->log(
      actionType: 'report_generated',
      actionCategory: 'reports',
      description: "Generated {$reportType} report {$dateRange}",
      metadata: [
        'report_type' => $reportType,
        'date_from' => $dateFrom,
        'date_to' => $dateTo,
      ],
      severity: 'info'
    );
  }

  // PhilHealth Plan Actions
  public function logPhilHealthPlanCreated(array $planData): void
  {
    $this->log(
      actionType: 'philhealth_plan_created',
      actionCategory: 'configuration',
      description: "Created PhilHealth plan: {$planData['name']} with {$planData['coverage_rate']}% coverage",
      metadata: [
        'plan_data' => [
          'name' => $planData['name'],
          'coverage_rate' => $planData['coverage_rate'],
          'description' => $planData['description'] ?? null,
        ],
      ],
      severity: 'info',
      entityType: 'PhilHealthPlan',
      entityId: $planData['id'] ?? null
    );
  }

  public function logPhilHealthPlanUpdated(int $planId, array $oldData, array $newData): void
  {
    $changes = [];
    foreach ($newData as $key => $value) {
      if (isset($oldData[$key]) && $oldData[$key] != $value) {
        $changes[$key] = [
          'from' => $oldData[$key],
          'to' => $value,
        ];
      }
    }

    $changesList = collect($changes)->map(function ($change, $field) {
      $fieldLabel = $this->formatFieldName($field);
      if ($field === 'coverage_rate') {
        return "{$fieldLabel}: {$change['from']}% → {$change['to']}%";
      }
      return "{$fieldLabel}: '{$change['from']}' → '{$change['to']}'";
    })->implode(', ');

    $this->log(
      actionType: 'philhealth_plan_updated',
      actionCategory: 'configuration',
      description: "Updated PhilHealth plan: {$newData['name']}. Changes: {$changesList}",
      metadata: [
        'changes' => $changes,
        'plan_name' => $newData['name'],
      ],
      severity: 'info',
      entityType: 'PhilHealthPlan',
      entityId: $planId
    );
  }

  public function logPhilHealthPlanToggled(int $planId, string $planName, bool $isActive): void
  {
    $action = $isActive ? 'activated' : 'deactivated';
    $this->log(
      actionType: 'philhealth_plan_toggled',
      actionCategory: 'configuration',
      description: "PhilHealth plan '{$planName}' was {$action}",
      metadata: [
        'plan_name' => $planName,
        'new_status' => $isActive ? 'active' : 'inactive',
      ],
      severity: 'info',
      entityType: 'PhilHealthPlan',
      entityId: $planId
    );
  }
}
