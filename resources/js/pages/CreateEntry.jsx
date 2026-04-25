import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function CreateEntry({ vendors = [] }) {
    
    const { data, setData, post, processing } = useForm({
        purchased_at: new Date().toISOString().split('T')[0],
        hsn: '', particulars: '', qty_kg: '', unit: 'kg', n_rate: '', value: '', vendor: ''
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

    // Combine registered vendors with defaults, removing duplicates
    const defaultVendors = ["DMart", "Big Bazaar", "Reliance Smart", "Reliance Fresh", "Blinkit", "Zepto", "Swiggy Instamart", "Star Bazaar", "Nature's Basket", "Spencer's", "Amazon", "Flipkart", "Myntra", "Ajio", "Local Market"];
    
    const allVendors = Array.from(new Set([
        ...vendors.map(v => v.name),
        ...defaultVendors
    ]));

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Add Expense</h2>}
        >
            <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-lg">
                
                <Head title="Add Expense" />

                <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b gap-4">
                    <h2 className="text-2xl font-bold text-blue-600 text-center md:text-left">Enter New Purchase Details</h2>
                    
                    <div className="flex gap-3">
                        <Link href="/" className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 whitespace-nowrap flex items-center gap-2">
                            🏠 Dashboard
                        </Link>
                        <Link href="/expenses" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 whitespace-nowrap flex items-center gap-2">
                            📄 View History
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border-2 border-dashed border-green-400 hover:shadow-md transition-all duration-300">
                    <h3 className="text-lg font-bold mb-3 text-green-600">Bulk Upload (Upload CSV File)</h3>
                    <form onSubmit={submitCsv} className="flex flex-col md:flex-row gap-4 items-center">
                        <input type="file" accept=".csv" onChange={e => setFileData('csv_file', e.target.files[0])} className="border p-2 rounded w-full cursor-pointer" required />
                        
                        <button type="submit" disabled={fileProcessing} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 whitespace-nowrap w-full md:w-auto">
                            Upload Data
                        </button>
                    </form>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                    <h3 className="col-span-1 md:col-span-2 text-lg font-bold mb-2 text-blue-600">Manual Entry</h3>
                    
                    <div className="flex flex-col col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Purchase Date</label>
                        <input 
                            type="date" 
                            value={data.purchased_at} 
                            onChange={e => setData('purchased_at', e.target.value)} 
                            required 
                            className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all w-full md:w-1/2" 
                        />
                    </div>
                    
                    <input type="text" placeholder="HSN (Optional)" value={data.hsn} onChange={e => setData('hsn', e.target.value)} className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
                    <input type="text" placeholder="Particulars (Item Name)" value={data.particulars} onChange={e => setData('particulars', e.target.value)} required className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
                    
                    <div className="flex gap-2">
                        <input type="number" step="0.001" placeholder="Quantity (e.g. 1.500)" value={data.qty_kg} onChange={e => setData('qty_kg', e.target.value)} required className="border p-3 rounded-lg w-2/3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
                        <select value={data.unit} onChange={e => setData('unit', e.target.value)} className="border p-3 rounded-lg w-1/3 bg-gray-50 text-gray-700 font-semibold cursor-pointer hover:bg-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all">
                            <option value="kg">KG</option>
                            <option value="g">Gram (g)</option>
                            <option value="l">Liter (L)</option>
                            <option value="ml">ML</option>
                            <option value="pcs">Pieces</option>
                            <option value="pkt">Packet</option>
                        </select>
                    </div>

                    <input type="number" step="0.01" placeholder="Rate (e.g. 45.50)" value={data.n_rate} onChange={e => setData('n_rate', e.target.value)} required className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
                    <input type="number" step="0.01" placeholder="Total Value" value={data.value} onChange={e => setData('value', e.target.value)} required className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
                    <div className="w-full">
                        <input list="vendors" placeholder="Vendor Name (Select or Type)" value={data.vendor} onChange={e => setData('vendor', e.target.value)} required className="border p-3 rounded-lg shadow-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" />
                        <datalist id="vendors">
                            {allVendors.map((vendor, index) => (
                                <option key={index} value={vendor} />
                            ))}
                        </datalist>
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-gray-500 font-medium italic">Type or select from list</span>
                            <Link href={route('vendors.index')} className="text-[10px] text-blue-600 font-bold hover:underline">
                                🏢 Manage Vendor List
                            </Link>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={processing} className="bg-blue-600 text-white font-black text-lg tracking-wide py-3 rounded-lg shadow-md hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 col-span-1 md:col-span-2 mt-2">
                        SAVE ITEM
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}