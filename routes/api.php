<?php

use App\Http\Controllers\Api\AuthController as MobileAuthController;
use App\Http\Controllers\Api\DashboardController as MobileDashboardController;
use App\Http\Controllers\Api\DiscountController as MobileDiscountController;
use App\Http\Controllers\Api\InventoryController as MobileInventoryController;
use App\Http\Controllers\Api\LabQueueController as MobileLabQueueController;
use App\Http\Controllers\Api\PatientController as MobilePatientController;
use App\Http\Controllers\Api\PhilHealthPlanController as MobilePhilHealthPlanController;
use App\Http\Controllers\Api\ReportController as MobileReportController;
use App\Http\Controllers\Api\ServiceController as MobileServiceController;
use App\Http\Controllers\Api\UserController as MobileUserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [MobileAuthController::class, 'login'])->name('mobile.login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [MobileAuthController::class, 'logout'])->name('mobile.logout');

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/dashboard', MobileDashboardController::class)->name('mobile.dashboard');

    Route::get('/patients', [MobilePatientController::class, 'index'])->name('mobile.patients.index');
    Route::get('/patients/{patient}', [MobilePatientController::class, 'show'])->name('mobile.patients.show');
    Route::post('/patients', [MobilePatientController::class, 'store'])->name('mobile.patients.store');
    Route::put('/patients/{patient}', [MobilePatientController::class, 'update'])->name('mobile.patients.update');
    Route::get('/tests/{id}', [MobilePatientController::class, 'testDetails'])->name('mobile.tests.show');

    // Address API Routes - use /addr/ prefix instead of /address/ to avoid Yajra package middleware conflict
    Route::get('/addr/regions', [\App\Http\Controllers\AddressController::class, 'getRegions'])->name('mobile.address.regions');
    Route::get('/addr/provinces/{regionId}', [\App\Http\Controllers\AddressController::class, 'getProvinces'])->name('mobile.address.provinces');
    Route::get('/addr/cities/{provinceId}', [\App\Http\Controllers\AddressController::class, 'getCities'])->name('mobile.address.cities');
    Route::get('/addr/barangays/{cityId}', [\App\Http\Controllers\AddressController::class, 'getBarangays'])->name('mobile.address.barangays');

    Route::get('/inventory', [MobileInventoryController::class, 'index'])->name('mobile.inventory.index');
    Route::get('/inventory/transactions', [MobileInventoryController::class, 'transactions'])->name('mobile.inventory.transactions');

    Route::get('/lab-queue/summary', [MobileLabQueueController::class, 'summary'])->name('mobile.lab-queue.summary');
    Route::get('/lab-queue/tests', [MobileLabQueueController::class, 'index'])->name('mobile.lab-queue.tests');

    Route::get('/reports/overview', [MobileReportController::class, 'overview'])->name('mobile.reports.overview');
    Route::get('/reports/financial', [MobileReportController::class, 'financial'])->name('mobile.reports.financial');
    Route::get('/reports/inventory-log', [MobileReportController::class, 'inventoryLog'])->name('mobile.reports.inventory-log');
    Route::get('/reports/audit-log', [MobileReportController::class, 'auditLog'])->name('mobile.reports.audit-log');
    Route::get('/reports/lab-report', [MobileReportController::class, 'labReport'])->name('mobile.reports.lab-report');
    Route::get('/reports/reconciliation', [MobileReportController::class, 'reconciliation'])->name('mobile.reports.reconciliation');

    // User Management Routes
    Route::get('/users', [MobileUserController::class, 'index'])->name('mobile.users.index');
    Route::post('/users', [MobileUserController::class, 'store'])->name('mobile.users.store');
    Route::put('/users/{id}', [MobileUserController::class, 'update'])->name('mobile.users.update');
    Route::post('/users/{id}/toggle', [MobileUserController::class, 'toggleActive'])->name('mobile.users.toggle');

    // Service Management Routes
    Route::get('/services', [MobileServiceController::class, 'index'])->name('mobile.services.index');
    Route::get('/services/categories', [MobileServiceController::class, 'categories'])->name('mobile.services.categories');
    Route::post('/services', [MobileServiceController::class, 'store'])->name('mobile.services.store');
    Route::put('/services/{id}', [MobileServiceController::class, 'update'])->name('mobile.services.update');
    Route::post('/services/{id}/toggle', [MobileServiceController::class, 'toggleActive'])->name('mobile.services.toggle');

    // Discount Management Routes
    Route::get('/discounts', [MobileDiscountController::class, 'index'])->name('mobile.discounts.index');
    Route::post('/discounts', [MobileDiscountController::class, 'store'])->name('mobile.discounts.store');
    Route::put('/discounts/{id}', [MobileDiscountController::class, 'update'])->name('mobile.discounts.update');
    Route::post('/discounts/{id}/toggle', [MobileDiscountController::class, 'toggleActive'])->name('mobile.discounts.toggle');

    // PhilHealth Plan Management Routes
    Route::get('/philhealth-plans', [MobilePhilHealthPlanController::class, 'index'])->name('mobile.philhealth-plans.index');
    Route::post('/philhealth-plans', [MobilePhilHealthPlanController::class, 'store'])->name('mobile.philhealth-plans.store');
    Route::put('/philhealth-plans/{id}', [MobilePhilHealthPlanController::class, 'update'])->name('mobile.philhealth-plans.update');
    Route::post('/philhealth-plans/{id}/toggle', [MobilePhilHealthPlanController::class, 'toggleActive'])->name('mobile.philhealth-plans.toggle');

    // Cash Reconciliation Routes
    Route::get('/reconciliations', [\App\Http\Controllers\Api\ReconciliationController::class, 'index'])->name('mobile.reconciliations.index');
    Route::get('/reconciliations/create', [\App\Http\Controllers\Api\ReconciliationController::class, 'create'])->name('mobile.reconciliations.create');
    Route::post('/reconciliations', [\App\Http\Controllers\Api\ReconciliationController::class, 'store'])->name('mobile.reconciliations.store');
    Route::get('/reconciliations/{id}', [\App\Http\Controllers\Api\ReconciliationController::class, 'show'])->name('mobile.reconciliations.show');
});
