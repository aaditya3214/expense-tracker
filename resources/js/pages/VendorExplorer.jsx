import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function VendorExplorer({ vendors }) {
    const [selectedVendorId, setSelectedVendorId] = useState('');
    const [vendorSearch, setVendorSearch] = useState('');

    const filteredVendors = vendors.filter(vendor => 
        vendor.name.toLowerCase().includes(vendorSearch.toLowerCase())
    );

    // Smart Auto-Selection logic
    React.useEffect(() => {
        if (filteredVendors.length === 1) {
            setSelectedVendorId(filteredVendors[0].id.toString());
        } else if (selectedVendorId && !filteredVendors.find(v => v.id.toString() === selectedVendorId)) {
            setSelectedVendorId('');
        }
    }, [vendorSearch, filteredVendors.length]);

    const handleViewProducts = () => {
        if (!selectedVendorId) {
            alert("Please select a vendor first!");
            return;
        }
        router.get(route('vendors.products', selectedVendorId));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Vendor Explorer</h2>}
        >
            <Head title="Vendor Explorer" />

            <div className="py-12 bg-gray-50 min-h-screen flex items-center justify-center font-outfit">
                <div className="max-w-xl w-full mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 text-center relative overflow-hidden group">
                        {/* Decorative Background Element */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center text-4xl shadow-xl shadow-blue-500/40 mx-auto mb-8 animate-bounce-subtle">
                                🔍
                            </div>

                            <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Explore Products</h3>
                            <p className="text-gray-500 font-medium mb-10 leading-relaxed">Select a vendor below to see their complete history of products and spending.</p>

                            <div className="space-y-6 text-left">
                                <div>
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-3 ml-1">
                                        Search & Select Vendor
                                    </label>
                                    
                                    {/* Vendor Search Bar */}
                                    <div className="mb-4 relative group/search">
                                        <input 
                                            type="text" 
                                            placeholder="Type vendor name..." 
                                            value={vendorSearch}
                                            onChange={(e) => setVendorSearch(e.target.value)}
                                            className="w-full bg-blue-50/50 border-2 border-transparent rounded-2xl py-3 pl-10 pr-4 text-gray-800 font-bold focus:bg-white focus:border-blue-500 transition-all outline-none text-sm"
                                        />
                                        <div className="absolute left-3.5 top-3 text-gray-400 group-focus-within/search:text-blue-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="relative group/select">
                                        <select 
                                            value={selectedVendorId} 
                                            onChange={(e) => setSelectedVendorId(e.target.value)}
                                            className="no-default-arrow w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 flex pl-5 pr-12 text-gray-800 font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer outline-none !appearance-none"
                                        >
                                            <option value="">{filteredVendors.length === 0 ? 'No vendors found' : `-- Choose from ${filteredVendors.length} vendors --`}</option>
                                            {filteredVendors.map(vendor => (
                                                <option key={vendor.id} value={vendor.id}>
                                                    🏢 {vendor.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-blue-500 group-focus-within/select:text-blue-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleViewProducts}
                                    className="w-full bg-blue-600 text-white font-black text-lg py-5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group"
                                >
                                    <span>List All Products</span>
                                    <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>

                                <div className="pt-6 text-center">
                                    <Link 
                                        href={route('dashboard')}
                                        className="text-gray-400 font-bold hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        🏠 Back to Dashboard
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom Aesthetic Note */}
                    <div className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                        Visual Vendor Analytics Engaged
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s ease-in-out infinite;
                }
                /* Hide default browser arrow for Chrome, Safari, and Firefox */
                .no-default-arrow {
                    -webkit-appearance: none !important;
                    -moz-appearance: none !important;
                    appearance: none !important;
                    background-image: none !important;
                }
                .no-default-arrow::-ms-expand {
                    display: none !important;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
