<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DmartReceipt;
use Inertia\Inertia;

class DmartReceiptController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $items = DmartReceipt::latest()
            ->when($search, function ($query, $search) {
                $query->where('particulars', 'like', "%{$search}%")
                      ->orWhere('hsn', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('History', [
            'items' => $items,
            'filters' => $request->only(['search'])
        ]);
    }

    public function printReport(Request $request)
    {
        $search = $request->input('search');

        $items = DmartReceipt::latest()
            ->when($search, function ($query, $search) {
                $query->where('particulars', 'like', "%{$search}%")
                      ->orWhere('hsn', 'like', "%{$search}%");
            })
            ->get();

        return Inertia::render('PrintReport', [
            'items' => $items,
            'searchQuery' => $search
        ]);
    }

    public function exportExcel(Request $request)
    {
        $search = $request->input('search');

        $items = DmartReceipt::latest()
            ->when($search, function ($query, $search) {
                $query->where('particulars', 'like', "%{$search}%")
                      ->orWhere('hsn', 'like', "%{$search}%");
            })
            ->get(); 

        $fileName = 'Expense_Report_' . date('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($items) {
            $file = fopen('php://output', 'w');
            
            // 👇 Excel की पहली लाइन में Date जोड़ा गया है 👇
            fputcsv($file, ['S.No.', 'Date', 'HSN', 'Particulars', 'Quantity', 'Unit', 'Rate (Rs)', 'Total Value (Rs)']);
            
            foreach ($items as $index => $item) {
                fputcsv($file, [
                    $index + 1,
                    $item->created_at->format('d M Y'), // तारीख यहाँ प्रिंट होगी (e.g. 29 Mar 2026)
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

    public function create()
    {
        return Inertia::render('CreateEntry');
    }

    public function store(Request $request)
    {
        $request->validate([
            'hsn' => 'nullable|string', 'particulars' => 'required|string', 'qty_kg' => 'required|numeric',
            'unit' => 'required|string', 'n_rate' => 'required|numeric', 'value' => 'required|numeric',
        ]);
        DmartReceipt::create($request->all());
        return redirect()->route('expenses.index');
    }

    public function import(Request $request)
    {
        $request->validate(['csv_file' => 'required|mimes:csv,txt']);
        $file = $request->file('csv_file');
        $fileHandle = fopen($file->getPathname(), 'r');
        fgetcsv($fileHandle);
        while (($row = fgetcsv($fileHandle)) !== false) {
            DmartReceipt::create([
                'hsn' => $row[0], 'particulars' => $row[1], 'qty_kg' => $row[2], 
                'unit' => 'kg', 'n_rate' => $row[3], 'value' => $row[4],
            ]);
        }
        fclose($fileHandle);
        return redirect()->route('expenses.index');
    }

    public function destroy($id)
    {
        $item = DmartReceipt::findOrFail($id);
        $item->delete();
        return redirect()->back();
    }
}