import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const formatLocalDate = (dateStr, options) => {
    if (!dateStr) return '';
    // If it contains a space or T, it has time. If it is just YYYY-MM-DD, parse as local.
    const cleanDateStr = dateStr.split(' ')[0].split('T')[0];
    const parts = cleanDateStr.split('-');
    if (parts.length === 3) {
        const [year, month, day] = parts;
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-IN', options);
    }
    return new Date(dateStr).toLocaleDateString('en-IN', options);
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

export default function History({ items, filters, availableYears, availableMonths }) {
    
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [preset, setPreset] = useState(() => getActivePreset(filters?.start_date, filters?.end_date));
    const [selectedMonth, setSelectedMonth] = useState(() => getActiveMonth(filters?.start_date, filters?.end_date) || ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][new Date().getMonth()]);
    const isFirstRender = useRef(true); 

    useEffect(() => {
        setStartDate(filters?.start_date || '');
        setEndDate(filters?.end_date || '');
        setPreset(getActivePreset(filters?.start_date, filters?.end_date));
        const activeMonth = getActiveMonth(filters?.start_date, filters?.end_date);
        if (activeMonth) {
            setSelectedMonth(activeMonth);
        }
    }, [filters?.start_date, filters?.end_date]);

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        const delaySearch = setTimeout(() => {
            router.get('/expenses', { ...filters, search: searchTerm }, { preserveState: true, replace: true, preserveScroll: true });
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

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
            router.get('/expenses', {
                ...filters,
                start_date: dates.start_date,
                end_date: dates.end_date,
                month: 'Overall',
                year: 'Overall',
                search: searchTerm
            }, { preserveState: true, preserveScroll: true });
            return;
        }
        
        const dates = getPresetDates(val);
        router.get('/expenses', {
            ...filters,
            start_date: dates.start_date,
            end_date: dates.end_date,
            month: 'Overall',
            year: 'Overall',
            search: searchTerm
        }, { preserveState: true, preserveScroll: true });
    };

    const handleMonthChange = (monthVal) => {
        setSelectedMonth(monthVal);
        const dates = getPresetDates(`month_${monthVal}`);
        router.get('/expenses', {
            ...filters,
            start_date: dates.start_date,
            end_date: dates.end_date,
            month: 'Overall',
            year: 'Overall',
            search: searchTerm
        }, { preserveState: true, preserveScroll: true });
    };

    const handleApplyDateRange = () => {
        if (startDate && endDate) {
            router.get('/expenses', {
                ...filters,
                start_date: startDate,
                end_date: endDate,
                month: 'Overall',
                year: 'Overall',
                search: searchTerm
            }, { preserveState: true, preserveScroll: true });
        }
    };

    const handleClearDateRange = () => {
        setStartDate('');
        setEndDate('');
        router.get('/expenses', {
            ...filters,
            start_date: '',
            end_date: '',
            month: 'Overall',
            year: 'Overall',
            search: searchTerm
        }, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this entry?")) {
            router.delete(`/expenses/${id}`);
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Purchase History</h2>}>
            <div className="max-w-7xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-lg">
                <Head title="Purchase History" />

                <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 gap-4">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black text-blue-700 tracking-tight">Purchase History</h2>
                        <p className="text-gray-500 font-medium mt-1">
                            {filters.start_date && filters.end_date 
                                ? `Records from ${formatLocalDate(filters.start_date, { day: '2-digit', month: 'short' })} to ${formatLocalDate(filters.end_date, { day: '2-digit', month: 'short', year: 'numeric' })}`
                                : `${filters.month} ${filters.year === 'Overall' ? '' : filters.year} Records List`
                            }
                        </p>
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

                        <Link href="/expenses/create" className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
                            + Add Expense
                        </Link>
                    </div>
                </div>

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
                                    <td className="p-4 text-gray-700 font-medium whitespace-nowrap">{formatLocalDate(item.purchased_at || item.created_at, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
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