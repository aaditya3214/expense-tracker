<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DmartReceiptController;
use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;

Route::get('/home', function () {
    return redirect('/');
})->name('home');

// --- DASHBOARD ROUTE ---
Route::get('/', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');


// 🔒 SECURITY GUARD & EXPENSES ROUTES
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/expenses', [DmartReceiptController::class, 'index'])->name('expenses.index');
    Route::get('/expenses/create', [DmartReceiptController::class, 'create'])->name('expenses.create');
    Route::get('/expenses/print', [DmartReceiptController::class, 'printReport'])->name('expenses.print');
    Route::get('/expenses/export', [DmartReceiptController::class, 'exportExcel'])->name('expenses.export');
    Route::post('/expenses', [DmartReceiptController::class, 'store']);
    Route::post('/expenses/import', [DmartReceiptController::class, 'import']);
    Route::post('/expenses/clear-all', [DmartReceiptController::class, 'clearAll'])->name('expenses.clear-all');
    Route::delete('/expenses/{id}', [DmartReceiptController::class, 'destroy'])->name('expenses.destroy');

    Route::get('/vendors', [VendorController::class, 'index'])->name('vendors.index');
    Route::post('/vendors', [VendorController::class, 'store'])->name('vendors.store');
    Route::get('/vendor-explorer', [VendorController::class, 'explorer'])->name('vendors.explorer');
    Route::get('/vendors/{id}/products', [VendorController::class, 'showProducts'])->name('vendors.products');
    Route::delete('/vendors/{id}', [VendorController::class, 'destroy'])->name('vendors.destroy');
});

Route::get('/settings/appearance', [AppearanceController::class, 'edit'])->name('appearance.edit');
Route::get('/settings/security', [SecurityController::class, 'edit'])->name('security.edit');
Route::patch('/settings/security', [SecurityController::class, 'update'])->name('security.update');

require __DIR__.'/auth.php';
