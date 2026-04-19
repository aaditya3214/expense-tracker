<?php

use App\Http\Controllers\DmartReceiptController;
use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\VendorController;
use App\Models\DmartReceipt; // 👈 PRO FIX: Auth को इंपोर्ट किया गया है
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/home', function () {
    return redirect('/');
})->name('home');

// --- DASHBOARD ROUTE ---
Route::get('/', function () {

    // 🔒 PRO SECURITY FIX: सिर्फ उसी यूज़र का डेटा लाओ जो लॉगिन है
    $userId = Auth::id(); // 👈 PRO FIX: auth()->id() की जगह Auth::id()

    // 1. Monthly Data
    $monthlyData = DmartReceipt::query() // 👈 PRO FIX: query() जोड़ा गया
        ->where('user_id', $userId)
        ->select(
            DB::raw('MONTHNAME(created_at) as month'),
            DB::raw('SUM(value) as total')
        )
        ->groupBy('month')
        ->orderByRaw('MIN(created_at)')
        ->get();

    // 2. Top 5 Items (Total Spend)
    $itemData = DmartReceipt::query()
        ->where('user_id', $userId)
        ->select(
            'particulars as name',
            DB::raw('SUM(value) as value')
        )
        ->groupBy('particulars')
        ->orderBy('value', 'desc')
        ->take(5)
        ->get();

    // 🆕 3. Top 5 Vendors (Product Count)
    $vendorData = DmartReceipt::query()
        ->where('user_id', $userId)
        ->select(
            'vendor as name',
            DB::raw('COUNT(*) as value'),
            DB::raw('SUM(value) as total_spend')
        )
        ->groupBy('vendor')
        ->orderBy('value', 'desc')
        ->take(5)
        ->get();

    // 4. Costliest Single Item (Per Unit Rate)
    $costliestItem = DmartReceipt::query()
        ->where('user_id', $userId)
        ->select('particulars as name', 'n_rate as price')
        ->orderBy('n_rate', 'desc')
        ->first();

    return Inertia::render('Dashboard', [
        'monthlyData' => $monthlyData,
        'itemData' => $itemData,
        'vendorData' => $vendorData,
        'costliestItem' => $costliestItem,
    ]);

})->middleware(['auth', 'verified'])->name('dashboard');

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
