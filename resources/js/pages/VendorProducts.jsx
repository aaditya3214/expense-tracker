import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function VendorProducts({ vendor, products, filters }) {
    const [search, setSearch] = React.useState(filters.search || '');

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    route('vendors.products', vendor.id),
                    { search },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this entry?")) {
            router.delete(`/expenses/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Vendor Products: {vendor.name}</h2>}
        >
            <Head title={`Products - ${vendor.name}`} />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                                🏢
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-900">{vendor.name}</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                        GSTIN: {vendor.gstin || 'N/A'}
                                    </span>
                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                                        📞 {vendor.contact_number || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap shadow-sm bg-gray-50/50 p-2 rounded-2xl gap-3">
                            <Link 
                                href={route('dashboard')}
                                className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center gap-2"
                            >
                                🏠 Dashboard
                            </Link>
                            <Link 
                                href={route('vendors.explorer')}
                                className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center gap-2"
                            >
                                🔍 Explorer
                            </Link>
                            <Link 
                                href="/expenses"
                                className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-700 hover:-translate-y-1 hover:shadow-lg shadow-gray-500/30 transition-all duration-300 flex items-center gap-2"
                            >
                                📄 History
                            </Link>
                            <Link 
                                href={route('vendors.index')}
                                className="bg-gray-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                            >
                                ⬅️ Back
                            </Link>
                            <Link 
                                href="/expenses/create"
                                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-2"
                            >
                                + Add Product
                            </Link>
                        </div>
                    </div>

                    {/* Products Grid / List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h4 className="text-lg font-bold text-gray-800">Purchased Products List</h4>
                                <p className="text-sm text-gray-500">History of all items bought from {vendor.name}</p>
                            </div>
                            <div className="w-full md:w-80 relative">
                                <input 
                                    type="text" 
                                    placeholder="🔍 Search products..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white hover:shadow-md hover:border-blue-400 transition-all text-sm font-medium shadow-sm outline-none"
                                />
                                <div className="absolute left-3 top-3 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                {search && (
                                    <button 
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider">S.No.</th>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Particulars</th>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider text-right">Qty</th>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Unit</th>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider text-right">Rate</th>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider text-right">Total Value</th>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {products.data.length > 0 ? (
                                        products.data.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-blue-50 transition-colors duration-200">
                                                <td className="p-5 text-sm text-gray-500 font-bold">
                                                    {(products.current_page - 1) * products.per_page + index + 1}
                                                </td>
                                                <td className="p-5 text-sm text-gray-600 font-medium">
                                                    {new Date(item.purchased_at || item.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-5">
                                                    <div className="font-bold text-gray-900">
                                                        {item.particulars}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-right font-mono font-bold text-gray-700">{item.qty_kg}</td>
                                                <td className="p-5 text-xs font-black uppercase text-gray-500">{item.unit}</td>
                                                <td className="p-5 text-right text-gray-700">₹{item.n_rate}</td>
                                                <td className="p-5 text-right font-black text-blue-600">₹{item.value}</td>
                                                <td className="p-5 text-center">
                                                    <button 
                                                        onClick={() => handleDelete(item.id)}
                                                        className="bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="p-20 text-center">
                                                <div className="text-4xl mb-4">🛒</div>
                                                <h3 className="text-lg font-bold text-gray-800">No products found for this vendor</h3>
                                                <p className="text-gray-500">You haven't added any expense entries for {vendor.name} yet.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {products.links.length > 3 && (
                            <div className="p-6 border-t border-gray-100 flex justify-center">
                                <div className="flex gap-1">
                                    {products.links.map((link, i) => (
                                        link.url ? (
                                            <Link 
                                                key={i} 
                                                href={link.url} 
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${link.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
                                            />
                                        ) : (
                                            <span 
                                                key={i}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className="px-4 py-2 rounded-lg border text-sm font-bold bg-white text-gray-300 border-gray-100 cursor-not-allowed"
                                            />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
