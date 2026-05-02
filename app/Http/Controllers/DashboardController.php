<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $selectedMonth = $request->query('month', 'Overall');
        $selectedYear = $request->query('year', 'Overall');

        // 1. Available Years & Months for Filters
        $availableYears = $user->receipts()
            ->whereNotNull('purchased_at')
            ->select(DB::raw('DISTINCT YEAR(purchased_at) as year'))
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->filter()
            ->toArray();

        $availableMonths = $user->receipts()
            ->whereNotNull('purchased_at')
            ->when($selectedYear !== 'Overall', function ($q) use ($selectedYear) {
                $q->whereYear('purchased_at', $selectedYear);
            })
            ->select(DB::raw('DISTINCT MONTHNAME(purchased_at) as month'))
            ->pluck('month')
            ->filter()
            ->toArray();

        // 2. Base Analytics Query
        $baseQuery = $user->receipts();

        if ($selectedYear !== 'Overall') {
            $baseQuery->whereYear('purchased_at', $selectedYear);
        }

        if ($selectedMonth !== 'Overall') {
            $baseQuery->whereRaw('MONTHNAME(purchased_at) = ?', [$selectedMonth]);
        }

        // 3. Monthly Trend Data
        $trendQuery = $user->receipts()
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

        $totalRecords = $user->receipts()->count();

        return Inertia::render('Dashboard', [
            'monthlyData' => $monthlyData,
            'itemData' => $itemData,
            'vendorData' => $vendorData,
            'costliestItem' => $costliestItem,
            'totalRecords' => $totalRecords,
            'filters' => [
                'month' => $selectedMonth,
                'year' => $selectedYear,
            ],
            'availableMonths' => $availableMonths,
            'availableYears' => $availableYears,
        ]);
    }
}
