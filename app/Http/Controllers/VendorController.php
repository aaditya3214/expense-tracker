<?php

namespace App\Http\Controllers;

use App\Models\DmartReceipt;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function index()
    {
        $vendors = Vendor::where('user_id', Auth::id())
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

        $validated['user_id'] = Auth::id();

        Vendor::create($validated);

        return back()->with('success', 'Vendor registered successfully.');
    }

    public function destroy($id)
    {
        $vendor = Vendor::where('user_id', Auth::id())->findOrFail($id);
        $vendor->delete();

        return back()->with('success', 'Vendor deleted successfully.');
    }

    public function showProducts(Request $request, $id)
    {
        $vendor = Vendor::where('user_id', Auth::id())->findOrFail($id);
        $search = $request->input('search');

        $products = DmartReceipt::where('user_id', Auth::id())
            ->where('vendor', $vendor->name)
            ->when($search, function ($query, $search) {
                $query->where('particulars', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('VendorProducts', [
            'vendor' => $vendor,
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }

    public function explorer(Request $request)
    {
        $vendors = Vendor::where('user_id', Auth::id())->orderBy('name')->get();

        return Inertia::render('VendorExplorer', [
            'vendors' => $vendors,
        ]);
    }
}
