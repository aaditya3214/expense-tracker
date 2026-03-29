import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function CreateEntry() {
    
    const { data, setData, post, processing } = useForm({
        hsn: '', particulars: '', qty_kg: '', unit: 'kg', n_rate: '', value: ''
    });

    const { data: fileData, setData: setFileData, post: postFile, processing: fileProcessing } = useForm({
        csv_file: null
    });

    const submit = (e) => {
        e.preventDefault();
        post('/expenses'); 
    };

    const submitCsv = (e) => {
        e.preventDefault();
        postFile('/expenses/import'); 
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-lg">
            
            <Head title="Add Expense" />

            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-blue-600">Enter New Purchase Product Details</h2>
                <Link href="/expenses" className="text-blue-600 font-bold hover:underline">
                    ← Back to History
                </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border-2 border-dashed border-green-400">
                <h3 className="text-lg font-bold mb-3 text-green-600">Bulk Upload (Upload CSV File)</h3>
                <form onSubmit={submitCsv} className="flex gap-4 items-center">
                    <input type="file" accept=".csv" onChange={e => setFileData('csv_file', e.target.files[0])} className="border p-2 rounded w-full" required />
                    <button type="submit" disabled={fileProcessing} className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700 whitespace-nowrap">
                        Upload Data
                    </button>
                </form>
            </div>

            <form onSubmit={submit} className="grid grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="col-span-2 text-lg font-bold mb-2 text-blue-600">Manual Entry</h3>
                
                <input type="text" placeholder="HSN (Optional)" value={data.hsn} onChange={e => setData('hsn', e.target.value)} className="border p-3 rounded" />
                
                <input type="text" placeholder="Particulars (Item Name)" value={data.particulars} onChange={e => setData('particulars', e.target.value)} required className="border p-3 rounded" />
                
                <div className="flex gap-2">
                    <input type="number" step="0.001" placeholder="Quantity (e.g. 1.500)" value={data.qty_kg} onChange={e => setData('qty_kg', e.target.value)} required className="border p-3 rounded w-2/3" />
                    
                    <select value={data.unit} onChange={e => setData('unit', e.target.value)} className="border p-3 rounded w-1/3 bg-gray-50 text-gray-700 font-semibold cursor-pointer hover:bg-gray-100">
                        <option value="kg">KG</option>
                        <option value="g">Gram (g)</option>
                        <option value="l">Liter (L)</option>
                        <option value="ml">ML</option>
                        <option value="pcs">Pieces</option>
                        <option value="pkt">Packet</option>
                    </select>
                </div>

                <input type="number" step="0.01" placeholder="Rate (e.g. 45.50)" value={data.n_rate} onChange={e => setData('n_rate', e.target.value)} required className="border p-3 rounded" />
                
                <input type="number" step="0.01" placeholder="Total Value" value={data.value} onChange={e => setData('value', e.target.value)} required className="border p-3 rounded" />
                
                <button type="submit" disabled={processing} className="bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition col-span-2 mt-2">
                    Save Item
                </button>
            </form>
        </div>
    );
}