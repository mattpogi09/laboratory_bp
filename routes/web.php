<?php

use App\Http\Controllers\AddressController;
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

    // Address Routes (for web frontend - uses session auth)
    // Note: Mobile API uses /api/address/* routes defined in routes/api.php with Sanctum auth
    Route::prefix('address')->name('address.')->group(function () {
        Route::get('/regions', [AddressController::class, 'getRegions'])->name('regions');
        Route::get('/provinces/{regionId}', [AddressController::class, 'getProvinces'])->name('provinces');
        Route::get('/cities/{provinceId}', [AddressController::class, 'getCities'])->name('cities');
        Route::get('/barangays/{cityId}', [AddressController::class, 'getBarangays'])->name('barangays');
        Route::get('/details', [AddressController::class, 'getAddressDetails'])->name('details');
    });

    // Management Routes
    // Patient routes with rate limiting (20 operations per minute)
    Route::middleware('throttle:20,1')->group(function () {
        Route::resource('patients', PatientController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('/patients/{patient}/activate', [PatientController::class, 'activate'])->name('patients.activate');
        Route::post('/patients/{patient}/deactivate', [PatientController::class, 'deactivate'])->name('patients.deactivate');
    });

    // Search endpoint with higher limit (60 searches per minute)
    Route::middleware('throttle:60,1')->get('/api/patients/search', [PatientController::class, 'search'])->name('patients.search');

    // Get test result details
    Route::get('/api/patients/test-details/{transactionTestId}', [PatientController::class, 'getTestDetails'])->name('patients.test-details');

    // User management with rate limiting (15 per minute)
    Route::middleware('throttle:15,1')->prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::put('/{id}', [UserController::class, 'update'])->name('update');
        Route::post('/{id}/toggle', [UserController::class, 'toggleActive'])->name('toggle');
    });

    // Configuration routes with rate limiting (20 per minute)
    Route::middleware('throttle:20,1')->group(function () {
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
    });

    // Inventory Routes with rate limiting (25 per minute)
    Route::middleware('throttle:25,1')->prefix('inventory')->group(function () {
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
        // Read operations - relaxed limit
        Route::get('/transactions', [CashierTransactionController::class, 'index'])->name('transactions.index');
        Route::get('/transactions/history', [CashierTransactionController::class, 'history'])->name('transactions.history');
        Route::get('/transactions/{transaction}', [CashierTransactionController::class, 'show'])->name('transactions.show');

        // Write operations - moderate limit (30 per minute)
        Route::middleware('throttle:30,1')->group(function () {
            Route::post('/transactions', [CashierTransactionController::class, 'store'])->name('transactions.store');
            Route::post('/transactions/check-duplicates', [CashierTransactionController::class, 'checkDuplicateTests'])->name('transactions.check-duplicates');
        });
    });

    // Laboratory Routes
    Route::get('/lab-test-queue', [LabTestQueueController::class, 'index'])->name('lab-test-queue');
    Route::get('/lab-test-queue/enter-results/{transactionTest}', [LabTestQueueController::class, 'enterResults'])->name('lab-test-queue.enter-results');

    // Result entry with rate limiting (40 per minute)
    Route::middleware('throttle:40,1')->patch('/lab-test-queue/tests/{transactionTest}', [LabResultController::class, 'update'])->name('lab-test-queue.tests.update');

    // Patient Results Routes
    Route::get('/lab-test-queue/patient-results', [LabTestQueueController::class, 'patientResults'])->name('lab-test-queue.patient-results');
    Route::get('/lab-test-queue/result-history', [LabTestQueueController::class, 'resultHistory'])->name('lab-test-queue.result-history');

    // Email sending routes - strict rate limiting (10 per minute) to prevent spam
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/lab-test-queue/send-results', [LabTestQueueController::class, 'sendResults'])->name('lab-test-queue.send-results');
        Route::post('/lab-test-queue/notify-patient/{transaction}', [LabTestQueueController::class, 'notifyPatient'])->name('lab-test-queue.notify-patient');
    });
});

require __DIR__ . '/auth.php';
