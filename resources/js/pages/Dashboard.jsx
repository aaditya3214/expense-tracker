import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';

const formatLocalDate = (dateStr, options) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-IN', options);
};

const getPresetDates = (presetName) => {
    const today = new Date();
    const format = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    if (presetName && presetName.startsWith('month_')) {
        const monthKey = presetName.split('_')[1];
        const monthIndex = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
        }[monthKey];
        
        const firstDay = new Date(today.getFullYear(), monthIndex, 1);
        const lastDay = new Date(today.getFullYear(), monthIndex + 1, 0);
        return { start_date: format(firstDay), end_date: format(lastDay) };
    }

    switch (presetName) {
        case 'today':
            return { start_date: format(today), end_date: format(today) };
        case 'tomorrow':
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return { start_date: format(tomorrow), end_date: format(tomorrow) };
        case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return { start_date: format(yesterday), end_date: format(yesterday) };
        case 'last_7':
            const last7 = new Date(today);
            last7.setDate(today.getDate() - 6);
            return { start_date: format(last7), end_date: format(today) };
        case 'last_30':
            const last30 = new Date(today);
            last30.setDate(today.getDate() - 29);
            return { start_date: format(last30), end_date: format(today) };
        case 'last_3_months':
            const last3m = new Date(today);
            last3m.setDate(today.getDate() - 89);
            return { start_date: format(last3m), end_date: format(today) };
        case 'this_month':
            const firstDayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return { start_date: format(firstDayMonth), end_date: format(lastDayMonth) };
        case 'this_quarter':
            const currentMonth = today.getMonth();
            let quarterStartMonth = 0;
            if (currentMonth >= 3 && currentMonth <= 5) quarterStartMonth = 3;
            else if (currentMonth >= 6 && currentMonth <= 8) quarterStartMonth = 6;
            else if (currentMonth >= 9 && currentMonth <= 11) quarterStartMonth = 9;
            const firstDayQuarter = new Date(today.getFullYear(), quarterStartMonth, 1);
            const lastDayQuarter = new Date(today.getFullYear(), quarterStartMonth + 3, 0);
            return { start_date: format(firstDayQuarter), end_date: format(lastDayQuarter) };
        case 'this_year':
            const firstDayYear = new Date(today.getFullYear(), 0, 1);
            const lastDayYear = new Date(today.getFullYear(), 11, 31);
            return { start_date: format(firstDayYear), end_date: format(lastDayYear) };
        case 'all_time':
        default:
            return { start_date: '', end_date: '' };
    }
};

const getActiveMonth = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const today = new Date();
    const format = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };
    
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    for (let i = 0; i < 12; i++) {
        const firstDay = new Date(today.getFullYear(), i, 1);
        const lastDay = new Date(today.getFullYear(), i + 1, 0);
        if (format(firstDay) === startDate && format(lastDay) === endDate) {
            return months[i];
        }
    }
    return '';
};

const getActivePreset = (startDate, endDate) => {
    if (!startDate && !endDate) return 'all_time';
    const presets = ['today', 'tomorrow', 'yesterday', 'last_7', 'last_30', 'last_3_months', 'this_month', 'this_quarter', 'this_year'];
    for (const p of presets) {
        const range = getPresetDates(p);
        if (range.start_date === startDate && range.end_date === endDate) {
            return p;
        }
    }
    if (getActiveMonth(startDate, endDate)) {
        return 'select_month';
    }
    return 'custom';
};

// Isolated Pie Chart component to prevent dashboard-wide re-renders on hover
const Top5ExpensesChart = ({ data, colors }) => {
    const [activeIndex, setActiveIndex] = useState(-1);

    return (
        <ResponsiveContainer width="100%" height={350} debounce={50}>
            <PieChart>
                <Pie 
                    data={data} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={70} 
                    outerRadius={100} 
                    paddingAngle={5} 
                    dataKey="value"
                    activeIndex={activeIndex}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(-1)}
                >
                    {data.map((entry, index) => {
                        const opacity = activeIndex === -1 ? 1 : activeIndex === index ? 1 : 0.3;

                        return (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={colors[index % colors.length]} 
                                style={{ outline: 'none', transition: 'all 0.3s ease', opacity: opacity }} 
                            />
                        );
                    })}
                </Pie>
                <Tooltip 
                    formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                />
                <Legend verticalAlign="bottom" height={40} iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default function Dashboard({ monthlyData, itemData, vendorData, costliestItem, filters, availableMonths, availableYears, totalRecords }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [preset, setPreset] = useState(() => getActivePreset(filters.start_date, filters.end_date));
    const [selectedMonth, setSelectedMonth] = useState(() => getActiveMonth(filters.start_date, filters.end_date) || ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][new Date().getMonth()]);

    React.useEffect(() => {
        setStartDate(filters.start_date || '');
        setEndDate(filters.end_date || '');
        setPreset(getActivePreset(filters.start_date, filters.end_date));
        const activeMonth = getActiveMonth(filters.start_date, filters.end_date);
        if (activeMonth) {
            setSelectedMonth(activeMonth);
        }
    }, [filters.start_date, filters.end_date]);
    
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']; // blue-500, green-500, amber-500, red-500, purple-500
    const DARK_COLORS = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED']; // blue-600, green-600, amber-600, red-600, purple-600

    const safeMonthlyData = React.useMemo(() => monthlyData.map(item => ({ ...item, total: Number(item.total) })), [monthlyData]);
    const safeItemData = React.useMemo(() => itemData.map(item => ({ ...item, value: Number(item.value) })), [itemData]);
    const safeVendorData = React.useMemo(() => vendorData.map(item => ({ ...item, value: Number(item.value), total_spend: Number(item.total_spend) })), [vendorData]);
    const safeCostliest = React.useMemo(() => costliestItem || { name: 'N/A', price: 0 }, [costliestItem]);

    // Pie Chart hover index (MOVED TO Top5ExpensesChart component)

    const totalExpense = React.useMemo(() => {
        return (filters.month === 'Overall') 
            ? safeMonthlyData.reduce((sum, item) => sum + item.total, 0)
            : (safeMonthlyData.find(m => m.month === filters.month)?.total || 0);
    }, [filters.month, safeMonthlyData]);

    const highestMonth = React.useMemo(() => safeMonthlyData.length > 0 ? safeMonthlyData.reduce((max, item) => (item.total > max.total ? item : max), safeMonthlyData[0]) : { month: 'N/A', total: 0 }, [safeMonthlyData]);
    const topItem = React.useMemo(() => safeItemData.length > 0 ? safeItemData[0] : { name: 'N/A', value: 0 }, [safeItemData]);

    // Check if we have data for the current selection
    const hasDataForSelection = (filters.month === 'Overall' && !filters.start_date) ? (totalRecords > 0) : (totalExpense > 0 || (filters.start_date && totalRecords > 0));

    // Base layout wrapper to avoid duplication
    const DashboardWrapper = ({ children }) => (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <div className="bg-gray-50 p-6 md:p-10" style={{ minHeight: 'calc(100vh - 65px)' }}>
                <Head title="Dashboard" />
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </AuthenticatedLayout>
    );

    const FilterBar = () => {
        return (
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-8">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Date Range:</span>
                    
                    <select
                        value={preset}
                        onChange={(e) => handlePresetChange(e.target.value)}
                        className="border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-white hover:border-blue-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all duration-300 shadow-sm"
                    >
                        <option value="all_time">All Time (Overall)</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="last_7">Last 7 Days</option>
                        <option value="last_30">Last 30 Days</option>
                        <option value="last_3_months">Last 3 Months (Quarter)</option>
                        <option value="this_month">This Month</option>
                        <option value="this_quarter">This Quarter</option>
                        <option value="this_year">This Year</option>
                        <option value="select_month">Select Month...</option>
                        <option value="custom">Custom Range...</option>
                    </select>

                    {preset === 'select_month' && (
                        <select
                            value={selectedMonth}
                            onChange={(e) => handleMonthChange(e.target.value)}
                            className="border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-white hover:border-blue-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all duration-300 shadow-sm animate-fadeIn"
                        >
                            <option value="jan">January</option>
                            <option value="feb">February</option>
                            <option value="mar">March</option>
                            <option value="apr">April</option>
                            <option value="may">May</option>
                            <option value="jun">June</option>
                            <option value="jul">July</option>
                            <option value="aug">August</option>
                            <option value="sep">September</option>
                            <option value="oct">October</option>
                            <option value="nov">November</option>
                            <option value="dec">December</option>
                        </select>
                    )}

                    {preset === 'custom' && (
                        <div className="flex flex-wrap items-center gap-2 animate-fadeIn">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all duration-300"
                            />
                            <span className="text-gray-400 font-bold text-xs">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all duration-300"
                            />
                            <button
                                onClick={handleApplyDateRange}
                                disabled={!startDate || !endDate}
                                className={`px-5 py-2 rounded-xl font-bold text-xs transition-all duration-300 ${
                                    startDate && endDate
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Apply Range
                            </button>
                        </div>
                    )}

                    {(filters.start_date || filters.end_date) && (
                        <button
                            onClick={handleClearDateRange}
                            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold text-xs transition-all duration-300"
                        >
                            Reset
                        </button>
                    )}
                </div>

                {(filters.start_date && filters.end_date) && (
                    <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100">
                        {preset !== 'custom' ? `${preset.replace('_', ' ')}: ` : ''}
                        {formatLocalDate(filters.start_date, { day: '2-digit', month: 'short' })} - {formatLocalDate(filters.end_date, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                )}
            </div>
        );
    };

    // If no data at all in the system
    if (totalRecords === 0) {
        return (
            <AuthenticatedLayout
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
            >
                <div className="bg-gray-50 flex flex-col items-center justify-center p-6" style={{ minHeight: 'calc(100vh - 65px)' }}>
                    <Head title="Welcome to Dashboard" />
                    <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-200 text-center max-w-lg">
                        <div className="text-6xl mb-6">🗑️</div>
                        <h2 className="text-3xl font-black text-blue-700 mb-2">No Records Found</h2>
                        <p className="text-gray-600 mb-8 font-medium">Your database is empty. Please upload a CSV, scan a receipt or add an expense manually to see the magic happen!</p>
                        <div className="flex justify-center">
                            <Link href="/expenses/create" className="w-full sm:w-auto bg-blue-600 text-white font-black text-md py-3.5 px-8 rounded-xl shadow-md hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 inline-block">
                                + Add Expense
                            </Link>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const handlePresetChange = (val) => {
        if (val === 'custom') {
            setPreset('custom');
            return;
        }
        if (val === 'select_month') {
            setPreset('select_month');
            const currentMonthShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][new Date().getMonth()];
            const targetMonth = selectedMonth || currentMonthShort;
            setSelectedMonth(targetMonth);
            const dates = getPresetDates(`month_${targetMonth}`);
            router.get('/', {
                ...filters,
                start_date: dates.start_date,
                end_date: dates.end_date,
                month: 'Overall',
                year: 'Overall'
            }, { preserveState: true, preserveScroll: true });
            return;
        }
        
        const dates = getPresetDates(val);
        router.get('/', {
            ...filters,
            start_date: dates.start_date,
            end_date: dates.end_date,
            month: 'Overall',
            year: 'Overall'
        }, { preserveState: true, preserveScroll: true });
    };

    const handleMonthChange = (monthVal) => {
        setSelectedMonth(monthVal);
        const dates = getPresetDates(`month_${monthVal}`);
        router.get('/', {
            ...filters,
            start_date: dates.start_date,
            end_date: dates.end_date,
            month: 'Overall',
            year: 'Overall'
        }, { preserveState: true, preserveScroll: true });
    };

    const handleApplyDateRange = () => {
        if (startDate && endDate) {
            router.get('/', {
                ...filters,
                start_date: startDate,
                end_date: endDate,
                month: 'Overall',
                year: 'Overall'
            }, { preserveState: true, preserveScroll: true });
        }
    };

    const handleClearDateRange = () => {
        setStartDate('');
        setEndDate('');
        router.get('/', {
            ...filters,
            start_date: '',
            end_date: '',
            month: 'Overall',
            year: 'Overall'
        }, { preserveState: true, preserveScroll: true });
    };

    // If a month is selected but has no data
    if (!hasDataForSelection) {
        return (
            <DashboardWrapper>
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <h2 className="text-3xl font-black text-blue-700 tracking-tight">Expenses Dashboard</h2>
                        <p className="text-gray-500 font-medium mt-1">Purchase Product Summary</p>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-end gap-3 w-full md:w-auto">
                        <Link href="/expenses/create" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300+ Add Expense">+ Add Expense</Link>
                    </div>
                </div>

                <FilterBar />

                <div className="bg-white p-20 rounded-2xl shadow-xl border border-gray-200 text-center mx-auto max-w-2xl mt-20">
                    <div className="text-7xl mb-6">📅</div>
                    <h2 className="text-3xl font-black text-blue-700 mb-4">{filters.start_date && filters.end_date ? 'Date Range' : filters.month} Overview</h2>
                    <div className="bg-blue-50 text-blue-700 py-3 px-6 rounded-full inline-block font-black text-sm uppercase tracking-widest mb-6">
                        No Purchases Found
                    </div>
                    <p className="text-gray-600 mb-8 font-medium text-lg leading-relaxed">
                        It looks like you didn't record any expenses for this period. 
                        Your charts and cards will appear once you add some data!
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => {
                            handleClearDateRange();
                            handleFilterChange('Overall');
                        }} className="bg-gray-800 text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-900 transition-all">
                            View Overall Dashboard
                        </button>
                        <Link href="/expenses/create" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-all">
                            Add Expense
                        </Link>
                    </div>
                </div>
            </DashboardWrapper>
        );
    }

    // Display the full analytics dashboard
    return (
        <DashboardWrapper>
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="mb-4 md:mb-0 text-center md:text-left">
                    <h2 className="text-3xl font-black text-blue-700 tracking-tight">Expenses Dashboard</h2>
                    <p className="text-gray-500 font-medium mt-1">
                        {filters.start_date && filters.end_date 
                            ? 'Custom Date Range' 
                            : `${filters.month} ${filters.year === 'Overall' ? '' : filters.year}`
                        } Expenses Summary
                    </p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-end gap-3 w-full md:w-auto">
                    <Link 
                        href={route('vendors.explorer')} 
                        className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-sm"
                    >
                        🔍 Explorer
                    </Link>
                    <Link 
                        href={route('vendors.index')} 
                        className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-sm"
                    >
                        🏢 Vendors
                    </Link>
                    <Link 
                        href="/expenses" 
                        className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-sm"
                    >
                        📄 History
                    </Link>
                    <Link 
                        href="/expenses/create" 
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-sm"
                    >
                        + Add
                    </Link>
                </div>
            </div>

            <FilterBar />

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
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{filters.month === 'Overall' ? 'Highest Month' : 'Month'}</p>
                        <h3 className="text-xl font-black text-gray-800 mt-1">{filters.month === 'Overall' ? highestMonth.month : filters.month}</h3>
                        <p className="text-xs font-bold text-green-600 mt-1">₹{(filters.month === 'Overall' ? highestMonth.total : totalExpense).toLocaleString('en-IN')}</p>
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
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 min-w-0">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">📊 Monthly Expenditure</h3>
                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={350} debounce={50}>
                            <BarChart data={safeMonthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontWeight: 600 }} />
                                <YAxis tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} width={80} tickMargin={5} />
                                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Bar dataKey="total" name="Total Spent (₹)" radius={[6, 6, 0, 0]} barSize={40}>
                                    {safeMonthlyData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.month === filters.month ? '#2563EB' : '#93C5FD'} 
                                            style={{ transition: 'all 0.3s ease' }}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 min-w-0">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">🏆 Top 5 Expenses</h3>
                    <div className="w-full flex justify-center items-center">
                        <Top5ExpensesChart data={safeItemData} colors={COLORS} />
                    </div>
                </div>

            </div>

            {/* --- VENDOR PRODUCT ANALYTICS (Bottom Full Width) --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 mb-8 min-w-0">
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">🏢 Top Vendors (by Product Count)</h3>
                <div className="w-full">
                    <ResponsiveContainer width="100%" height={350} debounce={50}>
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

        </DashboardWrapper>
    );
}