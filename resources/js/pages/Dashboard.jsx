import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';

export default function Dashboard({ monthlyData, itemData, vendorData, costliestItem }) {
    
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']; // blue-500, green-500, amber-500, red-500, purple-500
    const DARK_COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED']; // blue-600, green-600, amber-600, red-600, purple-600

    const safeMonthlyData = monthlyData.map(item => ({ ...item, total: Number(item.total) }));
    const safeItemData = itemData.map(item => ({ ...item, value: Number(item.value) }));
    const safeVendorData = vendorData.map(item => ({ ...item, value: Number(item.value), total_spend: Number(item.total_spend) }));
    const safeCostliest = costliestItem || { name: 'N/A', price: 0 };

    // Pie Chart hover index
    const [activeIndex, setActiveIndex] = useState(-1);

    const totalExpense = safeMonthlyData.reduce((sum, item) => sum + item.total, 0);
    const highestMonth = safeMonthlyData.length > 0 ? safeMonthlyData.reduce((max, item) => (item.total > max.total ? item : max), safeMonthlyData[0]) : { month: 'N/A', total: 0 };
    const topItem = safeItemData.length > 0 ? safeItemData[0] : { name: 'N/A', value: 0 };

    // Show welcome screen and hide analytics if no data is present
    if (safeMonthlyData.length === 0) {
        return (
            <AuthenticatedLayout
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
            >
                <div className="bg-gray-50 flex flex-col items-center justify-center p-6" style={{ minHeight: 'calc(100vh - 65px)' }}>
                    <Head title="Welcome to Dashboard" />
                    <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-200 text-center max-w-lg">
                        <div className="text-6xl mb-6">👋</div>
                        <h2 className="text-3xl font-black text-blue-700 mb-2">Welcome!</h2>
                        <p className="text-gray-600 mb-8 font-medium">Your dashboard is currently empty because you haven't added any expenses yet. Let's start tracking your purchases!</p>
                        <Link href="/expenses/create" className="bg-blue-600 text-white font-black text-lg py-3 px-8 rounded-xl shadow-md hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 inline-block">
                            + Add Your First Expense
                        </Link>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Display the full analytics dashboard when expenses are found
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <div className="bg-gray-50 p-6 md:p-10" style={{ minHeight: 'calc(100vh - 65px)' }}>
                <Head title="Dashboard" />

                <div className="max-w-7xl mx-auto">
                    
                    {/* --- HEADER --- */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="mb-4 md:mb-0 text-center md:text-left">
                            <h2 className="text-3xl font-black text-blue-700 tracking-tight">Expenses Dashboard</h2>
                            <p className="text-gray-500 font-medium mt-1">Purchase Product Summary</p>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-end gap-4">
                            <Link 
                                href={route('vendors.explorer')} 
                                className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                            >
                                🔍 Explorer
                            </Link>
                            <Link 
                                href={route('vendors.index')} 
                                className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
                            >
                                🏢 Vendors
                            </Link>
                            <Link 
                                href="/expenses" 
                                className="bg-gray-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                            >
                                📄 View History
                            </Link>
                            <Link 
                                href="/expenses/create" 
                                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                            >
                                + Add Expense
                            </Link>
                        </div>
                    </div>

                    {/* --- 4 KPI CARDS GRID --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        
                        <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center border-b-4 border-b-blue-600 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default">
                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Expenses</p>
                                <h3 className="text-2xl font-black text-gray-800 mt-1">₹{totalExpense.toLocaleString('en-IN')}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl shadow-inner shrink-0 transition-all duration-300 group-hover:scale-125 group-hover:bg-blue-100 group-hover:rotate-12">
                                💰
                            </div>
                        </div>

                        <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center border-b-4 border-b-green-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default">
                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Highest Month</p>
                                <h3 className="text-xl font-black text-gray-800 mt-1">{highestMonth.month}</h3>
                                <p className="text-xs font-bold text-green-600 mt-1">₹{highestMonth.total.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xl shadow-inner shrink-0 transition-all duration-300 group-hover:scale-125 group-hover:bg-green-100 group-hover:-rotate-12">
                                📈
                            </div>
                        </div>

                        <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center border-b-4 border-b-orange-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default">
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Most Spent On</p>
                                <h3 className="text-sm font-black text-gray-800 mt-1 truncate" title={topItem.name}>{topItem.name}</h3>
                                <p className="text-xs font-bold text-orange-600 mt-1">Total: ₹{topItem.value.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-xl shadow-inner shrink-0 ml-2 transition-all duration-300 group-hover:scale-125 group-hover:bg-orange-100 group-hover:rotate-12">
                                🛒
                            </div>
                        </div>

                        <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center border-b-4 border-b-purple-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default">
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Costliest Single Item</p>
                                <h3 className="text-sm font-black text-gray-800 mt-1 truncate" title={safeCostliest.name}>{safeCostliest.name}</h3>
                                <p className="text-xs font-bold text-purple-600 mt-1">Price: ₹{safeCostliest.price.toLocaleString('en-IN')} / unit</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl shadow-inner shrink-0 ml-2 transition-all duration-300 group-hover:scale-125 group-hover:bg-purple-100 group-hover:-rotate-12">
                                💎
                            </div>
                        </div>

                    </div>

                    {/* --- CHARTS SECTION --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">📊 Monthly Expenditure</h3>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={safeMonthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontWeight: 600 }} />
                                        <YAxis tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} width={100} tickMargin={5} />
                                        <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                        <Bar dataKey="total" name="Total Spent (₹)" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">🏆 Top 5 Expenses</h3>
                            <div className="h-[400px] flex justify-center items-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={safeItemData} 
                                            cx="50%" 
                                            cy="45%" 
                                            innerRadius={80} 
                                            outerRadius={120} 
                                            paddingAngle={5} 
                                            dataKey="value"
                                            activeIndex={activeIndex}
                                            onMouseEnter={(_, index) => setActiveIndex(index)}
                                            onMouseLeave={() => setActiveIndex(-1)}
                                        >
                                            {safeItemData.map((entry, index) => {
                                                const isHovered = activeIndex === index;
                                                const isAnythingHovered = activeIndex !== -1;
                                                const opacity = (!isAnythingHovered || isHovered) ? 1 : 0.25;

                                                return (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={COLORS[index % COLORS.length]} 
                                                        style={{ outline: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', opacity: opacity }} 
                                                    />
                                                );
                                            })}
                                        </Pie>
                                        <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                        <Legend verticalAlign="bottom" height={80} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                    {/* --- VENDOR PRODUCT ANALYTICS (Bottom Full Width) --- */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">🏢 Top Vendors (by Product Count)</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={safeVendorData} 
                                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontWeight: 600 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <Tooltip 
                                        formatter={(value, name, props) => [
                                            `${value} Products`, 
                                            `Total Spend: ₹${props.payload.total_spend.toLocaleString('en-IN')}`
                                        ]} 
                                        cursor={{ fill: '#F3F4F6' }} 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                                    />
                                    <Bar dataKey="value" name="Products Count" fill="#FB923C" radius={[6, 6, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}