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
        $search = $request->input('search');

        // Using query() builder for better IDE support and static analysis
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
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('History', [
            'items' => $items,
            'filters' => $request->only(['search']),
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
