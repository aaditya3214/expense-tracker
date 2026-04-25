import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function History({ items, filters, availableYears, availableMonths }) {
    
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const isFirstRender = useRef(true); 

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        const delaySearch = setTimeout(() => {
            router.get('/expenses', { ...filters, search: searchTerm }, { preserveState: true, replace: true, preserveScroll: true });
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const handleFilterChange = (month) => {
        router.get('/expenses', { ...filters, month }, { preserveState: true, preserveScroll: true });
    };

    const handleYearChange = (year) => {
        router.get('/expenses', { year, month: 'Overall', search: searchTerm }, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this entry?")) {
            router.delete(`/expenses/${id}`);
        }
    };

    const handleClearAll = () => {
        if (window.confirm("🚨 Are you sure? It cannot be undone! This will remove all your records permanently.")) {
            router.post(route('expenses.clear-all'));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Purchase History</h2>}>
            <div className="max-w-7xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-lg">
                <Head title="Purchase History" />

                <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black text-blue-700 tracking-tight">Purchase History</h2>
                        <p className="text-gray-500 font-medium mt-1">{filters.month} {filters.year === 'Overall' ? '' : filters.year} Records List</p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center md:justify-end gap-3 w-full md:w-auto">
                        <Link href="/" className="bg-gray-800 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-gray-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                            🏠 Dashboard
                        </Link>
                        
                        <div className="relative group/search">
                            <input 
                                type="text" 
                                placeholder="🔍 Search..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-2.5 w-full md:w-64 hover:shadow-md hover:border-blue-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none shadow-sm transition-all duration-300 font-bold" 
                            />
                        </div>

                        <button 
                            onClick={handleClearAll}
                            className="bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-red-600 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-sm"
                        >
                            🗑️ Clear All
                        </button>

                        <Link href="/expenses/create" className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
                            + Add Expense
                        </Link>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    {/* Year Filter */}
                    <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Select Year:</span>
                        <div className="flex flex-wrap gap-2">
                            {['Overall', ...availableYears].map((year) => {
                                const isActive = filters.year.toString() === year.toString();
                                return (
                                    <button
                                        key={year}
                                        onClick={() => handleYearChange(year)}
                                        className={`px-5 py-2 rounded-xl font-bold text-xs transition-all duration-300 ${
                                            isActive 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-300' 
                                            : 'bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-100 shadow-sm'
                                        }`}
                                    >
                                        {year}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Month Filter */}
                    <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Select Month:</span>
                        <div className="flex flex-wrap gap-2">
                            {['Overall', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => {
                                const isActive = filters.month === month;
                                return (
                                    <button
                                        key={month}
                                        onClick={() => handleFilterChange(month)}
                                        className={`px-4 py-2 rounded-xl font-bold text-xs transition-all duration-300 ${
                                            isActive 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-300' 
                                            : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-100 shadow-sm'
                                        }`}
                                    >
                                        {month === 'Overall' ? 'Overall' : month.substring(0, 3)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-blue-700 text-white">
                            <tr>
                                <th className="p-4">S.No.</th><th className="p-4">Date</th><th className="p-4">HSN</th><th className="p-4">Particulars</th><th className="p-4">Vendor</th><th className="p-4 text-right">Qty</th><th className="p-4">Unit</th><th className="p-4 text-right">Rate</th><th className="p-4 text-right">Value</th><th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.data.map((item, index) => (
                                <tr key={item.id} className="border-b hover:bg-blue-50 transition-colors duration-200">
                                    <td className="p-4 text-gray-500 font-bold">{(items.current_page - 1) * items.per_page + index + 1}</td>
                                    <td className="p-4 text-gray-700 font-medium whitespace-nowrap">{new Date(item.purchased_at || item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    <td className="p-4 text-gray-600 font-mono text-xs">
                                        {item.hsn ? (
                                            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200">{item.hsn}</span>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4 font-bold uppercase text-gray-800">{item.particulars}</td>
                                    <td className="p-4">
                                        <span className="bg-green-50 text-green-700 px-2.5 py-1.5 rounded-md shadow-sm text-[10px] font-black uppercase border border-green-100 tracking-wide">
                                            {item.vendor || 'N/A'}
                                        </span>
                                    </td>
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
                        <div className="text-center p-10"><p className="text-gray-500 text-lg font-medium">{searchTerm ? `No results found for "${searchTerm}".` : 'No history records found.'}</p></div>
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
        </AuthenticatedLayout>
    );
}