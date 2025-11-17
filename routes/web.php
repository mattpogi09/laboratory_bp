<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
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
});

require __DIR__.'/auth.php';
