import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';

export default function History({ items, filters }) {
    
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const isFirstRender = useRef(true); 

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        const delaySearch = setTimeout(() => {
            router.get('/expenses', { search: searchTerm }, { preserveState: true, replace: true, preserveScroll: true });
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const handleDelete = (id) => {
        if (window.confirm("क्या आप सच में इस एंट्री को डिलीट करना चाहते हैं? 🗑️")) {
            router.delete(`/expenses/${id}`);
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-lg">
            <Head title="Purchase History" />

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-black text-blue-700">Purchase History</h2>
                
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 items-center">
                    
                    <Link href="/" className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 whitespace-nowrap flex items-center gap-2">
                        🏠 Dashboard
                    </Link>

                    {/* 🚀 ULTRA-PRO SEARCH BOX (Expands on click!) */}
                    <input 
                        type="text" 
                        placeholder="🔍 Search products..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-48 focus:md:w-64 hover:shadow-md hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all duration-300" 
                    />
                    
                    <a href={`/expenses/export?search=${searchTerm}`} className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 whitespace-nowrap flex items-center gap-2 cursor-pointer">
                        📊 Excel
                    </a>

                    <a href={`/expenses/print?search=${searchTerm}`} target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 whitespace-nowrap flex items-center gap-2 cursor-pointer">
                        🖨️ PDF
                    </a>

                    <Link href="/expenses/create" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 whitespace-nowrap">
                        + Create
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th className="p-4">S.No.</th><th className="p-4">Date</th><th className="p-4">HSN</th><th className="p-4">Particulars</th><th className="p-4 text-right">Qty</th><th className="p-4">Unit</th><th className="p-4 text-right">Rate</th><th className="p-4 text-right">Value</th><th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.data.map((item, index) => (
                            <tr key={item.id} className="border-b hover:bg-blue-50 transition-colors duration-200">
                                <td className="p-4 text-gray-500 font-bold">{(items.current_page - 1) * items.per_page + index + 1}</td>
                                <td className="p-4 text-gray-700 font-medium whitespace-nowrap">{new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                <td className="p-4 text-gray-600">{item.hsn || '-'}</td>
                                <td className="p-4 font-bold uppercase text-gray-800">{item.particulars}</td>
                                <td className="p-4 text-right text-gray-700">{item.qty_kg}</td>
                                <td className="p-4 text-gray-600 font-medium uppercase">{item.unit}</td>
                                <td className="p-4 text-right text-gray-700">₹{item.n_rate}</td>
                                <td className="p-4 text-right font-black text-blue-600">₹{item.value}</td>
                                <td className="p-4 text-center">
                                    <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-bold hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {items.data.length === 0 && (
                    <div className="text-center p-10"><p className="text-gray-500 text-lg font-medium">{searchTerm ? `"${searchTerm}" नाम का कोई आइटम नहीं मिला। 🕵️‍♂️` : 'कोई डेटा नहीं है।'}</p></div>
                )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mt-6 text-gray-600 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="mb-4 md:mb-0 text-sm font-medium">
                    Showing <span className="font-bold text-gray-900">{items.from || 0}</span> to <span className="font-bold text-gray-900">{items.to || 0}</span> of <span className="font-bold text-blue-600 text-lg">{items.total}</span> Entries
                </div>

                <div className="flex gap-1 flex-wrap">
                    {items.links.map((link, index) => {
                        if (!link.url) return <span key={index} className="px-3 py-1.5 border rounded-lg shadow-sm opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 text-sm" dangerouslySetInnerHTML={{ __html: link.label }} />;
                        return (
                            <Link key={index} href={link.url} preserveState preserveScroll className={`px-3 py-1.5 border rounded-lg shadow-sm transition-all duration-300 text-sm hover:-translate-y-0.5 ${link.active ? 'bg-blue-600 text-white font-bold border-blue-600' : 'bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md border-gray-300'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}