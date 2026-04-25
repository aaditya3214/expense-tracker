<?php

namespace App\Http\Controllers;

use App\Models\DmartReceipt;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Authentication facade imported for secure access control

class DmartReceiptController extends Controller
{
    // 1. SHOW HISTORY
    public function index(Request $request)
    {
        $userId = Auth::id();
        $search = $request->input('search');
        $selectedMonth = $request->query('month', 'Overall');
        $selectedYear = $request->query('year', 'Overall');

        // Available Filter Options
        $availableYears = DmartReceipt::where('user_id', $userId)
            ->selectRaw('DISTINCT YEAR(purchased_at) as year')
            ->orderBy('year', 'desc')
            ->pluck('year');

        $availableMonths = DmartReceipt::where('user_id', $userId)
            ->when($selectedYear !== 'Overall', fn($q) => $q->whereYear('purchased_at', $selectedYear))
            ->selectRaw('DISTINCT MONTHNAME(purchased_at) as month')
            ->pluck('month');

        $items = DmartReceipt::query()
            ->where('user_id', $userId)
            ->when($selectedYear !== 'Overall', fn($q) => $q->whereYear('purchased_at', $selectedYear))
            ->when($selectedMonth !== 'Overall', fn($q) => $q->whereRaw('MONTHNAME(purchased_at) = ?', [$selectedMonth]))
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('particulars', 'like', "%{$search}%")
                        ->orWhere('hsn', 'like', "%{$search}%")
                        ->orWhere('vendor', 'like', "%{$search}%");
                });
            })
            ->orderBy('purchased_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('History', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'month' => $selectedMonth,
                'year' => $selectedYear
            ],
            'availableYears' => $availableYears,
            'availableMonths' => $availableMonths
        ]);
    }

    // 2. PRINT REPORT
    public function printReport(Request $request)
    {
        $search = $request->input('search');

        $items = DmartReceipt::query()
            ->where('user_id', Auth::id())
            ->orderBy('purchased_at', 'desc')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('particulars', 'like', "%{$search}%")
                        ->orWhere('hsn', 'like', "%{$search}%")
                        ->orWhere('vendor', 'like', "%{$search}%");
                });
            })
            ->get();

        return Inertia::render('PrintReport', [
            'items' => $items,
            'searchQuery' => $search,
        ]);
    }

    // 3. EXPORT EXCEL
    public function exportExcel(Request $request)
    {
        $search = $request->input('search');

        $items = DmartReceipt::query()
            ->where('user_id', Auth::id())
            ->orderBy('purchased_at', 'desc')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('particulars', 'like', "%{$search}%")
                        ->orWhere('hsn', 'like', "%{$search}%")
                        ->orWhere('vendor', 'like', "%{$search}%");
                });
            })
            ->get();

        $fileName = 'Expense_Report_'.date('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($items) {
            $file = fopen('php://output', 'w');

            fputcsv($file, ['S.No.', 'Date', 'HSN', 'Particulars', 'Quantity', 'Unit', 'Rate (Rs)', 'Total Value (Rs)']);

            foreach ($items as $index => $item) {
                fputcsv($file, [
                    $index + 1,
                    $item->purchased_at ? date('d M Y', strtotime($item->purchased_at)) : $item->created_at->format('d M Y'),
                    $item->hsn,
                    $item->particulars,
                    $item->qty_kg,
                    $item->unit,
                    $item->n_rate,
                    $item->value,
                ]);
            }
            fclose($file);
        }, $fileName);
    }

    // 4. CREATE PAGE
    public function create()
    {
        $vendors = Vendor::where('user_id', Auth::id())
            ->orderBy('name')
            ->get();

        return Inertia::render('CreateEntry', [
            'vendors' => $vendors,
        ]);
    }

    // 5. MANUAL SAVE
    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchased_at' => 'nullable|date',
            'hsn' => 'nullable|string',
            'particulars' => 'required|string',
            'qty_kg' => 'required|numeric',
            'unit' => 'required|string',
            'n_rate' => 'required|numeric',
            'value' => 'required|numeric',
            'vendor' => 'required|string',
        ]);

        $validated['user_id'] = Auth::id(); 
        $validated['purchased_at'] = $validated['purchased_at'] ?? now()->format('Y-m-d');

        // Automatically register vendor if it doesn't exist
        Vendor::firstOrCreate(
            ['user_id' => Auth::id(), 'name' => $validated['vendor']],
            ['contact_number' => 'N/A', 'gstin' => 'N/A', 'address' => 'N/A']
        );

        DmartReceipt::create($validated);

        return redirect()->route('expenses.index');
    }

    // 6. CSV BULK IMPORT
    public function import(Request $request)
    {
        $request->validate(['csv_file' => 'required|mimes:csv,txt']);
        $file = $request->file('csv_file');
        $fileHandle = fopen($file->getPathname(), 'r');
        fgetcsv($fileHandle); // Skip header

        // Ensure "DMart" vendor exists for this user
        Vendor::firstOrCreate(
            ['user_id' => Auth::id(), 'name' => 'DMart'],
            ['contact_number' => 'N/A', 'gstin' => 'N/A', 'address' => 'N/A']
        );

        while (($row = fgetcsv($fileHandle)) !== false) {
            if (empty($row[0])) {
                continue;
            }

            $particulars = $row[2] ?? 'Unknown';
            $vendorName = (str_contains(strtoupper($particulars), 'STAR')) ? 'Star Bazaar' : 'DMart';

            // Ensure the detected vendor exists
            Vendor::firstOrCreate(
                ['user_id' => Auth::id(), 'name' => $vendorName],
                ['contact_number' => 'N/A', 'gstin' => 'N/A', 'address' => 'N/A']
            );

            DmartReceipt::create([
                'user_id' => Auth::id(),
                'purchased_at' => date('Y-m-d', strtotime($row[0])),
                'hsn' => $row[1] ?? '-',
                'particulars' => $particulars,
                'qty_kg' => (float) ($row[3] ?? 0),
                'unit' => $row[4] ?? 'PCS',
                'n_rate' => (float) ($row[5] ?? 0),
                'value' => (float) ($row[6] ?? 0),
                'vendor' => $vendorName,
            ]);
        }
        fclose($fileHandle);

        return redirect()->route('expenses.index');
    }

    // 7. SECURE DELETE
    public function destroy($id)
    {
        $item = DmartReceipt::query()
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        $item->delete();

        return redirect()->back();
    }
}
