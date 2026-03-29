<?php

use App\Http\Controllers\DmartReceiptController;
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

// 🔒 SECURITY GUARD
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- 🛒 Expense Tracker Routes ---
    Route::get('/expenses', [DmartReceiptController::class, 'index'])->name('expenses.index');
    Route::get('/expenses/create', [DmartReceiptController::class, 'create'])->name('expenses.create');
    
    // 👇 PDF और EXCEL के राऊट्स 👇
    Route::get('/expenses/print', [DmartReceiptController::class, 'printReport'])->name('expenses.print');
    Route::get('/expenses/export', [DmartReceiptController::class, 'exportExcel'])->name('expenses.export');
    
    Route::post('/expenses', [DmartReceiptController::class, 'store']);
    Route::post('/expenses/import', [DmartReceiptController::class, 'import']);
    Route::delete('/expenses/{id}', [DmartReceiptController::class, 'destroy'])->name('expenses.destroy');
});

require __DIR__.'/auth.php';