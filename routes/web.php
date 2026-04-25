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
Route::get('/', function (Illuminate\Http\Request $request) {
    $userId = Auth::id();
    $selectedMonth = $request->query('month', 'Overall');
    $selectedYear = $request->query('year', 'Overall');

    // 1. Available Years & Months for Filters
    $availableYears = DmartReceipt::query()
        ->where('user_id', $userId)
        ->select(DB::raw('DISTINCT YEAR(purchased_at) as year'))
        ->orderBy('year', 'desc')
        ->pluck('year')
        ->toArray();

    $availableMonths = DmartReceipt::query()
        ->where('user_id', $userId)
        ->when($selectedYear !== 'Overall', function($q) use ($selectedYear) {
            $q->whereYear('purchased_at', $selectedYear);
        })
        ->select(DB::raw('DISTINCT MONTHNAME(purchased_at) as month'))
        ->pluck('month')
        ->toArray();

    // 2. Base Analytics Query
    $baseQuery = DmartReceipt::query()->where('user_id', $userId);
    
    if ($selectedYear !== 'Overall') {
        $baseQuery->whereYear('purchased_at', $selectedYear);
    }
    
    if ($selectedMonth !== 'Overall') {
        $baseQuery->whereRaw('MONTHNAME(purchased_at) = ?', [$selectedMonth]);
    }

    // 3. Monthly Trend Data
    $trendQuery = DmartReceipt::query()
        ->where('user_id', $userId)
        ->select(
            DB::raw('MONTHNAME(purchased_at) as month'),
            DB::raw('MONTH(purchased_at) as month_num'),
            DB::raw('SUM(value) as total')
        )
        ->groupBy('month', 'month_num')
        ->orderBy('month_num');

    if ($selectedYear !== 'Overall') {
        $trendQuery->whereYear('purchased_at', $selectedYear);
    }

    $monthlyData = $trendQuery->get();

    // 4. Top 5 Items
    $itemData = (clone $baseQuery)
        ->select('particulars as name', DB::raw('SUM(value) as value'))
        ->groupBy('particulars')
        ->orderBy('value', 'desc')
        ->take(5)
        ->get();

    // 5. Top 5 Vendors
    $vendorData = (clone $baseQuery)
        ->select('vendor as name', DB::raw('COUNT(*) as value'), DB::raw('SUM(value) as total_spend'))
        ->groupBy('vendor')
        ->orderBy('value', 'desc')
        ->take(5)
        ->get();

    // 6. Costliest Single Item
    $costliestItem = (clone $baseQuery)
        ->select('particulars as name', 'n_rate as price')
        ->orderBy('n_rate', 'desc')
        ->first();

    $totalRecords = DmartReceipt::where('user_id', $userId)->count();

    return Inertia::render('Dashboard', [
        'monthlyData' => $monthlyData,
        'itemData' => $itemData,
        'vendorData' => $vendorData,
        'costliestItem' => $costliestItem,
        'totalRecords' => $totalRecords,
        'filters' => [
            'month' => $selectedMonth,
            'year' => $selectedYear
        ],
        'availableMonths' => $availableMonths,
        'availableYears' => $availableYears
    ]);

})->middleware(['auth', 'verified'])->name('dashboard');

// --- CLEAR ALL RECORDS ---
Route::post('/expenses/clear-all', function () {
    DmartReceipt::where('user_id', Auth::id())->delete();
    // Also clear vendors that were auto-created? Maybe just keep them.
    return redirect()->route('dashboard');
})->middleware(['auth'])->name('expenses.clear-all');

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
