<?php

use App\Http\Controllers\CashierTransactionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LabResultController;
use App\Http\Controllers\LabTestController;
use App\Http\Controllers\LabTestQueueController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PhilHealthPlanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportLogController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Management Routes
    Route::resource('patients', PatientController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('/api/patients/search', [PatientController::class, 'search'])->name('patients.search');

    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::put('/{id}', [UserController::class, 'update'])->name('update');
        Route::post('/{id}/toggle', [UserController::class, 'toggleActive'])->name('toggle');
    });

    Route::prefix('services')->name('services.')->group(function () {
        Route::get('/', [LabTestController::class, 'index'])->name('index');
        Route::post('/', [LabTestController::class, 'store'])->name('store');
        Route::put('/{id}', [LabTestController::class, 'update'])->name('update');
        Route::post('/{id}/toggle', [LabTestController::class, 'toggleActive'])->name('toggle');
    });

    Route::prefix('discounts')->name('discounts.')->group(function () {
        Route::get('/', [DiscountController::class, 'index'])->name('index');
        Route::post('/', [DiscountController::class, 'store'])->name('store');
        Route::put('/{id}', [DiscountController::class, 'update'])->name('update');
        Route::post('/{id}/toggle', [DiscountController::class, 'toggleActive'])->name('toggle');
    });

    Route::prefix('philhealth-plans')->name('philhealth-plans.')->group(function () {
        Route::get('/', [PhilHealthPlanController::class, 'index'])->name('index');
        Route::post('/', [PhilHealthPlanController::class, 'store'])->name('store');
        Route::put('/{id}', [PhilHealthPlanController::class, 'update'])->name('update');
        Route::post('/{id}/toggle', [PhilHealthPlanController::class, 'toggleActive'])->name('toggle');
    });

    // Configuration Routes
    Route::middleware('auth')->prefix('inventory')->group(function () {
        Route::get('/', [InventoryController::class, 'index'])->name('inventory');
        Route::post('/', [InventoryController::class, 'store'])->name('inventory.store');
        Route::post('/stock-in', [InventoryController::class, 'stockIn'])->name('inventory.stock-in');
        Route::post('/stock-out', [InventoryController::class, 'stockOut'])->name('inventory.stock-out');
        Route::post('/{id}/adjust', [InventoryController::class, 'adjust'])->name('inventory.adjust');
        Route::post('/{id}/toggle', [InventoryController::class, 'toggleActive'])->name('inventory.toggle');
    });

    Route::get('/discounts-philhealth', function () {
        return Inertia::render('Configuration/DiscountsPhilhealth/Index', [
            'discounts' => \App\Models\Discount::orderBy('name')->paginate(100),
            'philHealthPlans' => \App\Models\PhilHealthPlan::orderBy('name')->paginate(100),
        ]);
    })->name('discounts-philhealth');

    Route::get('/reports-logs', [ReportLogController::class, 'index'])->name('reports-logs');

    // Cashier Routes
    Route::prefix('cashier')->name('cashier.')->group(function () {
        Route::get('/transactions', [CashierTransactionController::class, 'index'])->name('transactions.index');
        Route::get('/transactions/history', [CashierTransactionController::class, 'history'])->name('transactions.history');
        Route::post('/transactions', [CashierTransactionController::class, 'store'])->name('transactions.store');
        Route::get('/transactions/{transaction}', [CashierTransactionController::class, 'show'])->name('transactions.show');
        Route::post('/transactions/check-duplicates', [CashierTransactionController::class, 'checkDuplicateTests'])->name('transactions.check-duplicates');
    });

    // Laboratory Routes
    Route::get('/lab-test-queue', [LabTestQueueController::class, 'index'])->name('lab-test-queue');
    Route::get('/lab-test-queue/enter-results/{transactionTest}', [LabTestQueueController::class, 'enterResults'])->name('lab-test-queue.enter-results');
    Route::patch('/lab-test-queue/tests/{transactionTest}', [LabResultController::class, 'update'])->name('lab-test-queue.tests.update');

    // Patient Results Routes
    Route::get('/lab-test-queue/patient-results', [LabTestQueueController::class, 'patientResults'])->name('lab-test-queue.patient-results');
    Route::post('/lab-test-queue/send-results', [LabTestQueueController::class, 'sendResults'])->name('lab-test-queue.send-results');
    Route::get('/lab-test-queue/result-history', [LabTestQueueController::class, 'resultHistory'])->name('lab-test-queue.result-history');
});

require __DIR__ . '/auth.php';
