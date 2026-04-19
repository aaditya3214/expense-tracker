import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Vendors({ vendors }) {
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        contact_number: '',
        gstin: '',
        address: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('vendors.store'), {
            onSuccess: () => {
                reset();
                setIsFormOpen(false);
            },
        });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this vendor?")) {
            router.delete(route('vendors.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Vendor Management</h2>}
        >
            <Head title="Vendors" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header Section */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div>
                            <h3 className="text-2xl font-black text-blue-700">All Vendors</h3>
                            <p className="text-gray-500 font-medium">Manage your supplier and store contact details.</p>
                        </div>
                        <div className="flex gap-4">
                            <Link 
                                href={route('dashboard')}
                                className="bg-gray-800 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-gray-900 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                🏠 Dashboard
                            </Link>
                            <button 
                                onClick={() => setIsFormOpen(!isFormOpen)}
                                className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                            >
                                {isFormOpen ? '✕ Close Form' : '+ Register New Vendor'}
                            </button>
                        </div>
                    </div>

                    {/* Registration Form */}
                    {isFormOpen && (
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
                            <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg text-sm">🏢</span>
                                Vendor Registration Form
                            </h4>
                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Vendor Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/50"
                                        placeholder="e.g. DMart, Reliance Smart"
                                        required
                                    />
                                    {errors.name && <div className="text-red-500 text-xs font-bold">{errors.name}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Contact Number</label>
                                    <input 
                                        type="text" 
                                        value={data.contact_number} 
                                        onChange={e => setData('contact_number', e.target.value)}
                                        className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/50"
                                        placeholder="Mobile or Phone number"
                                    />
                                    {errors.contact_number && <div className="text-red-500 text-xs font-bold">{errors.contact_number}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">GSTIN (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={data.gstin} 
                                        onChange={e => setData('gstin', e.target.value)}
                                        className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/50"
                                        placeholder="e.g. 27AADCB2230M1Z2"
                                    />
                                    {errors.gstin && <div className="text-red-500 text-xs font-bold">{errors.gstin}</div>}
                                </div>

                                <div className="space-y-2 md:col-span-1">
                                    <label className="text-sm font-bold text-gray-700">Address / Location</label>
                                    <input 
                                        type="text" 
                                        value={data.address} 
                                        onChange={e => setData('address', e.target.value)}
                                        className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/50"
                                        placeholder="Street, City, Area"
                                    />
                                    {errors.address && <div className="text-red-500 text-xs font-bold">{errors.address}</div>}
                                </div>

                                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="bg-blue-600 text-white font-black px-8 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : 'Save Vendor Details'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Vendors Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Vendor ID</th>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Vendor Name</th>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Contact Number</th>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider">GSTIN</th>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Address</th>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider">Created</th>
                                        <th className="p-5 text-[11px] font-black text-gray-500 uppercase tracking-wider text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {vendors.length > 0 ? (
                                        vendors.map((vendor) => (
                                            <tr key={vendor.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="p-5">
                                                    <span className="font-mono text-sm bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                                                        #{vendor.id.toString().padStart(4, '0')}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <div className="font-bold text-gray-800">{vendor.name}</div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="text-gray-600 font-medium">
                                                        {vendor.contact_number || <span className="text-gray-300 italic">Not available</span>}
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    {vendor.gstin ? (
                                                        <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100">
                                                            {vendor.gstin}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 italic text-sm">N/A</span>
                                                    )}
                                                </td>
                                                <td className="p-5 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                                                    <div className="text-gray-600 text-sm" title={vendor.address}>
                                                        {vendor.address || <span className="text-gray-300 italic">No address recorded</span>}
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="text-gray-400 text-xs">
                                                        {new Date(vendor.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <button 
                                                        onClick={() => handleDelete(vendor.id)} 
                                                        className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-bold hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-5xl mb-4">🏢</div>
                                                    <h3 className="text-xl font-bold text-gray-800">No vendors registered yet</h3>
                                                    <p className="text-gray-500 mt-2 mb-6">Start by adding your first vendor using the button above.</p>
                                                    <button 
                                                        onClick={() => setIsFormOpen(true)}
                                                        className="text-blue-600 font-bold hover:underline"
                                                    >
                                                        + Register Vendor
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
