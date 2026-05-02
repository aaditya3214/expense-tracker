<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $vendors = $request->user()->vendors()
            ->orderBy('name')
            ->get();

        return Inertia::render('Vendors', [
            'vendors' => $vendors,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'gstin' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        $request->user()->vendors()->create($validated);

        return back()->with('success', 'Vendor registered successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $vendor = $request->user()->vendors()->findOrFail($id);
        $vendor->delete();

        return back()->with('success', 'Vendor deleted successfully.');
    }

    public function showProducts(Request $request, $id)
    {
        $user = $request->user();
        $vendor = $user->vendors()->findOrFail($id);

        $search = $request->input('search');
        $selectedMonth = $request->query('month', 'Overall');
        $selectedYear = $request->query('year', 'Overall');

        // Available Filter Options for this Vendor
        $availableYears = $user->receipts()
            ->where('vendor', $vendor->name)
            ->selectRaw('DISTINCT YEAR(purchased_at) as year')
            ->orderBy('year', 'desc')
            ->pluck('year');

        $availableMonths = $user->receipts()
            ->where('vendor', $vendor->name)
            ->when($selectedYear !== 'Overall', fn ($q) => $q->whereYear('purchased_at', $selectedYear))
            ->selectRaw('DISTINCT MONTHNAME(purchased_at) as month')
            ->pluck('month');

        $products = $user->receipts()
            ->where('vendor', $vendor->name)
            ->when($selectedYear !== 'Overall', fn ($q) => $q->whereYear('purchased_at', $selectedYear))
            ->when($selectedMonth !== 'Overall', fn ($q) => $q->whereRaw('MONTHNAME(purchased_at) = ?', [$selectedMonth]))
            ->when($search, function ($query, $search) {
                $query->where('particulars', 'like', "%{$search}%");
            })
            ->orderBy('purchased_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('VendorProducts', [
            'vendor' => $vendor,
            'products' => $products,
            'filters' => [
                'search' => $search,
                'month' => $selectedMonth,
                'year' => $selectedYear,
            ],
            'availableYears' => $availableYears,
            'availableMonths' => $availableMonths,
        ]);
    }

    public function explorer(Request $request)
    {
        $vendors = $request->user()->vendors()->orderBy('name')->get();

        return Inertia::render('VendorExplorer', [
            'vendors' => $vendors,
        ]);
    }
}
