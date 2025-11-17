<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    $user = auth()->user();
    
    // Role-based dashboard routing
    if ($user->role === 'admin') {
        return Inertia::render('Dashboard');
    } elseif ($user->role === 'lab_staff') {
        return Inertia::render('LabStaffDashboard');
    } elseif ($user->role === 'cashier') {
        return Inertia::render('CashierDashboard');
    }
    
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Management Routes
    Route::get('/patients', function () {
        return Inertia::render('Management/Patients/Index');
    })->name('patients');
    
    Route::get('/users', function () {
        return Inertia::render('Management/Users/Index');
    })->name('users');
    
    Route::get('/services', function () {
        return Inertia::render('Management/Services/Index');
    })->name('services');
    
    // Configuration Routes
    Route::get('/inventory', function () {
        return Inertia::render('Configuration/Inventory/Index');
    })->name('inventory');
    
    Route::get('/discounts-philhealth', function () {
        return Inertia::render('Configuration/DiscountsPhilhealth/Index');
    })->name('discounts-philhealth');
    
    Route::get('/reports-logs', function () {
        return Inertia::render('Configuration/ReportsLogs/Index');
    })->name('reports-logs');
    
    // Laboratory Routes
    Route::get('/lab-test-queue', function () {
        return Inertia::render('Laboratory/LabTestQueue/Index');
    })->name('lab-test-queue');
    
    Route::get('/lab-test-queue/enter-results/{transactionId}', function ($transactionId) {
        return Inertia::render('Laboratory/LabTestQueue/EnterResults', [
            'transactionId' => $transactionId
        ]);
    })->name('lab-test-queue.enter-results');
});

require __DIR__.'/auth.php';
