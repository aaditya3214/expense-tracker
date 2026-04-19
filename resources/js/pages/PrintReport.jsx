import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

export default function PrintReport({ items, searchQuery }) {
    
    useEffect(() => {
        setTimeout(() => {
            window.print();
        }, 500);
    }, []);

    return (
        <div className="p-8 max-w-6xl mx-auto bg-white text-black font-sans">
            <Head title="Export PDF - Report" />

            <div className="mb-8 text-center border-b-2 border-gray-800 pb-4">
                <h1 className="text-3xl font-black uppercase tracking-widest text-gray-900">Product Purchase Report</h1>
                <p className="text-gray-600 mt-2 font-medium">Generated on: {new Date().toLocaleDateString()}</p>
                {searchQuery && <p className="text-gray-500 text-sm mt-1">Search Filter: "{searchQuery}"</p>}
                <p className="text-blue-600 font-bold mt-2">Total Items Found: {items.length}</p>
            </div>

            <table className="w-full text-left border-collapse border border-gray-300">
                <thead className="bg-gray-200 text-gray-900 border-b-2 border-gray-800">
                    <tr>
                        <th className="p-3 border border-gray-300">S.No.</th>
                        <th className="p-3 border border-gray-300">Date</th> {/* Added Date Header */}
                        <th className="p-3 border border-gray-300">HSN</th>
                        <th className="p-3 border border-gray-300">Particulars</th>
                        <th className="p-3 text-right border border-gray-300">Quantity</th>
                        <th className="p-3 border border-gray-300">Unit</th>
                        <th className="p-3 text-right border border-gray-300">Rate</th>
                        <th className="p-3 text-right border border-gray-300">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={item.id} className="border-b border-gray-300">
                            <td className="p-3 border border-gray-300 font-bold text-gray-700">{index + 1}</td>
                            
                            {/* Format date for professional display */}
                            <td className="p-3 border border-gray-300 text-gray-800 whitespace-nowrap">
                                {new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            
                            <td className="p-3 border border-gray-300 text-gray-700">{item.hsn || '-'}</td>
                            <td className="p-3 border border-gray-300 font-bold uppercase">{item.particulars}</td>
                            <td className="p-3 text-right border border-gray-300 text-gray-700">{item.qty_kg}</td>
                            <td className="p-3 border border-gray-300 font-medium uppercase text-gray-700">{item.unit}</td>
                            <td className="p-3 text-right border border-gray-300 text-gray-700">₹{item.n_rate}</td>
                            <td className="p-3 text-right border border-gray-300 font-bold text-gray-900">₹{item.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {items.length === 0 && (
                <div className="text-center p-10">
                    <p className="text-gray-500 text-lg font-medium">No records found.</p>
                </div>
            )}
        </div>
    );
}