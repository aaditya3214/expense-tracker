<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DmartReceipt;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth; // 👈 PRO FIX: Auth को इंपोर्ट किया गया है

class DmartReceiptController extends Controller
{
    // 1. SHOW HISTORY 
    public function index(Request $request)
    {
        $search = $request->input('search');

        // 👈 PRO FIX: query() जोड़ा गया ताकि VS Code लाल लाइन न दिखाए
        $items = DmartReceipt::query()
            ->where('user_id', Auth::id()) 
            ->latest()
            ->when($search, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('particulars', 'like', "%{$search}%")
                      ->orWhere('hsn', 'like', "%{$search}%");
                });
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('History', [
            'items' => $items,
            'filters' => $request->only(['search'])
        ]);
    }

    // 2. PRINT REPORT 
    public function printReport(Request $request)
    {
        $search = $request->input('search');

        $items = DmartReceipt::query()
            ->where('user_id', Auth::id())
            ->latest()
            ->when($search, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('particulars', 'like', "%{$search}%")
                      ->orWhere('hsn', 'like', "%{$search}%");
                });
            })
            ->get();

        return Inertia::render('PrintReport', [
            'items' => $items,
            'searchQuery' => $search
        ]);
    }

    // 3. EXPORT EXCEL 
    public function exportExcel(Request $request)
    {
        $search = $request->input('search');

        $items = DmartReceipt::query()
            ->where('user_id', Auth::id())
            ->latest()
            ->when($search, function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('particulars', 'like', "%{$search}%")
                      ->orWhere('hsn', 'like', "%{$search}%");
                });
            })
            ->get(); 

        $fileName = 'Expense_Report_' . date('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($items) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, ['S.No.', 'Date', 'HSN', 'Particulars', 'Quantity', 'Unit', 'Rate (Rs)', 'Total Value (Rs)']);
            
            foreach ($items as $index => $item) {
                fputcsv($file, [
                    $index + 1,
                    $item->created_at->format('d M Y'), 
                    $item->hsn,
                    $item->particulars,
                    $item->qty_kg,
                    $item->unit,
                    $item->n_rate,
                    $item->value
                ]);
            }
            fclose($file);
        }, $fileName);
    }

    // 4. CREATE PAGE
    public function create()
    {
        return Inertia::render('CreateEntry');
    }

    // 5. MANUAL SAVE 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'hsn' => 'nullable|string', 
            'particulars' => 'required|string', 
            'qty_kg' => 'required|numeric',
            'unit' => 'required|string', 
            'n_rate' => 'required|numeric', 
            'value' => 'required|numeric',
        ]);

        $validated['user_id'] = Auth::id(); // 👈 PRO FIX

        DmartReceipt::create($validated);
        
        return redirect()->route('expenses.index');
    }

    // 6. CSV BULK IMPORT 
    public function import(Request $request)
    {
        $request->validate(['csv_file' => 'required|mimes:csv,txt']);
        $file = $request->file('csv_file');
        $fileHandle = fopen($file->getPathname(), 'r');
        fgetcsv($fileHandle); 
        
        while (($row = fgetcsv($fileHandle)) !== false) {
            DmartReceipt::create([
                'user_id' => Auth::id(), // 👈 PRO FIX
                'hsn' => $row[0], 
                'particulars' => $row[1], 
                'qty_kg' => $row[2], 
                'unit' => 'kg', 
                'n_rate' => $row[3], 
                'value' => $row[4],
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