import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { useForm, router } from '@inertiajs/react';
import { 
    Upload, X, Loader2, Plus, Trash2, Calendar, 
    Check, Sparkles, Building2, HelpCircle 
} from 'lucide-react';

export default function OcrScanner({ show, onClose, defaultVendors = [] }) {
    const [step, setStep] = useState(1); // 1: Upload, 2: Scanning, 3: Verify & Edit
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    
    // OCR Results
    const [vendor, setVendor] = useState('');
    const [purchasedAt, setPurchasedAt] = useState('');
    const [items, setItems] = useState([]);
    
    const fileInputRef = useRef(null);
    const dragRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // Form for bulk submission
    const { data, setData, post, processing, errors } = useForm({
        items: []
    });

    useEffect(() => {
        if (!show) {
            // Reset state on close
            setStep(1);
            setImageFile(null);
            setImagePreview(null);
            setProgress(0);
            setStatusText('');
            setVendor('');
            setPurchasedAt('');
            setItems([]);
        }
    }, [show]);

    // Handle Drag & Drop Events
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (file) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (PNG, JPG, WebP, etc.)');
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Run OCR Recognition using Tesseract.js
    const startOcrScan = async () => {
        if (!imageFile) return;
        setStep(2);
        setProgress(0);
        setStatusText('Initializing OCR Engine...');

        try {
            const result = await Tesseract.recognize(
                imageFile,
                'eng',
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                            setStatusText(`Extracting receipt text: ${Math.round(m.progress * 100)}%`);
                        } else {
                            setStatusText(m.status.charAt(0).toUpperCase() + m.status.slice(1).replace(/_/g, ' '));
                        }
                    }
                }
            );

            // Parse text
            const parsed = parseReceiptText(result.data.text);
            
            setVendor(parsed.vendor);
            setPurchasedAt(parsed.date);
            setItems(parsed.items);
            setStep(3);
        } catch (error) {
            console.error('OCR Scanning failed', error);
            alert('OCR Scan failed. Please try a clearer receipt photo or enter manually.');
            setStep(1);
        }
    };

    // Parse extracted receipt text
    const parseReceiptText = (text) => {
        const lines = text.split('\n');
        let detectedVendor = '';
        let detectedDate = '';
        const extractedItems = [];

        const commonVendors = [
            { name: 'DMart', keywords: ['dmart', 'avenue supermarts', 'avenue'] },
            { name: 'Star Bazaar', keywords: ['star bazaar', 'trent', 'star hyper'] },
            { name: 'Reliance Smart', keywords: ['reliance smart', 'reliance retail', 'smart bazaar'] },
            { name: 'Reliance Fresh', keywords: ['reliance fresh'] },
            { name: 'Big Bazaar', keywords: ['big bazaar', 'future retail'] },
            { name: 'Blinkit', keywords: ['blinkit', 'grofers'] },
            { name: 'Zepto', keywords: ['zepto'] },
            { name: 'Swiggy Instamart', keywords: ['instamart', 'swiggy'] },
            { name: 'Spencer\'s', keywords: ['spencer'] },
            { name: 'Nature\'s Basket', keywords: ['nature\'s basket', 'natures basket'] }
        ];

        // 1. Detect Vendor
        for (let i = 0; i < Math.min(lines.length, 10); i++) {
            const lineLower = lines[i].toLowerCase();
            for (const vendor of commonVendors) {
                if (vendor.keywords.some(kw => lineLower.includes(kw))) {
                    detectedVendor = vendor.name;
                    break;
                }
            }
            if (detectedVendor) break;
        }

        if (!detectedVendor) {
            const textLower = text.toLowerCase();
            for (const vendor of commonVendors) {
                if (vendor.keywords.some(kw => textLower.includes(kw))) {
                    detectedVendor = vendor.name;
                    break;
                }
            }
        }

        // Fallback: Use first non-empty readable line
        if (!detectedVendor) {
            for (let i = 0; i < Math.min(lines.length, 5); i++) {
                const cleanLine = lines[i].replace(/[^\w\s]/g, '').trim();
                if (cleanLine.length > 3 && /[a-zA-Z]/.test(cleanLine)) {
                    detectedVendor = cleanLine.substring(0, 25);
                    break;
                }
            }
        }
        if (!detectedVendor) {
            detectedVendor = 'Local Vendor';
        }

        // 2. Detect Date
        const dateRegexes = [
            /\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/, // DD/MM/YYYY
            /\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/, // YYYY-MM-DD
            /\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})\b/  // DD/MM/YY
        ];

        for (const line of lines) {
            let match = line.match(dateRegexes[0]);
            if (match) {
                const day = match[1].padStart(2, '0');
                const month = match[2].padStart(2, '0');
                const year = match[3];
                detectedDate = `${year}-${month}-${day}`;
                break;
            }
            match = line.match(dateRegexes[1]);
            if (match) {
                detectedDate = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
                break;
            }
            match = line.match(dateRegexes[2]);
            if (match) {
                const day = match[1].padStart(2, '0');
                const month = match[2].padStart(2, '0');
                const year = '20' + match[3];
                detectedDate = `${year}-${month}-${day}`;
                break;
            }
        }

        if (!detectedDate) {
            detectedDate = new Date().toISOString().split('T')[0];
        }

        // 3. Extract items
        const itemLines = [];
        const stopWords = ['total', 'subtotal', 'cgst', 'sgst', 'vat', 'tax', 'cash', 'card', 'change', 'saved', 'items', 'net amt', 'amount', 'round off', 'balance', 'discount', 'welcome', 'thank you', 'tel:', 'phone:', 'gstin', 'cin:'];

        for (const line of lines) {
            const lineLower = line.toLowerCase().trim();
            if (lineLower.length < 5) continue;
            if (stopWords.some(word => lineLower.includes(word))) continue;
            itemLines.push(line);
        }

        for (const line of itemLines) {
            const tokens = line.trim().split(/\s+/);
            const numbers = [];
            
            tokens.forEach((token) => {
                const cleanToken = token.replace(/[^\d.]/g, '');
                if (cleanToken && !isNaN(cleanToken) && cleanToken.includes('.')) {
                    numbers.push(parseFloat(cleanToken));
                } else if (cleanToken && !isNaN(cleanToken) && /^\d+$/.test(cleanToken)) {
                    numbers.push(parseInt(cleanToken, 10));
                }
            });

            if (numbers.length === 0) continue;

            let qty = 1;
            let rate = 0;
            let value = 0;
            let hsn = '';
            let descriptionWords = [];

            let firstTokenIsHsn = false;
            if (/^\d{4,10}$/.test(tokens[0])) {
                hsn = tokens[0];
                firstTokenIsHsn = true;
            }

            if (numbers.length >= 3) {
                const candidateNumbers = numbers.slice(firstTokenIsHsn ? 1 : 0);
                let matched = false;
                
                for (let i = candidateNumbers.length - 3; i >= 0; i--) {
                    const n1 = candidateNumbers[i];
                    const n2 = candidateNumbers[i+1];
                    const n3 = candidateNumbers[i+2];
                    
                    if (Math.abs(n1 * n2 - n3) < 1.0) {
                        qty = n1;
                        rate = n2;
                        value = n3;
                        matched = true;
                        const n1Index = tokens.indexOf(tokens.find(t => t.includes(String(n1))));
                        descriptionWords = tokens.slice(firstTokenIsHsn ? 1 : 0, n1Index);
                        break;
                    }
                    if (Math.abs(n2 * n1 - n3) < 1.0) {
                        rate = n1;
                        qty = n2;
                        value = n3;
                        matched = true;
                        const n1Index = tokens.indexOf(tokens.find(t => t.includes(String(n1))));
                        descriptionWords = tokens.slice(firstTokenIsHsn ? 1 : 0, n1Index);
                        break;
                    }
                }

                if (!matched) {
                    const len = candidateNumbers.length;
                    value = candidateNumbers[len - 1];
                    rate = candidateNumbers[len - 2];
                    qty = candidateNumbers[len - 3];
                    
                    const qtyToken = tokens.find(t => t.includes(String(qty)));
                    const qtyIndex = tokens.indexOf(qtyToken);
                    descriptionWords = tokens.slice(firstTokenIsHsn ? 1 : 0, qtyIndex > 0 ? qtyIndex : tokens.length - 3);
                }
            } else if (numbers.length === 2) {
                const candidateNumbers = numbers;
                value = candidateNumbers[1];
                const n1 = candidateNumbers[0];
                
                if (n1 > 0 && n1 < 100 && value / n1 > 5) {
                    qty = n1;
                    rate = value / qty;
                } else {
                    rate = n1;
                    qty = value / rate;
                }
                
                const n1Index = tokens.indexOf(tokens.find(t => t.includes(String(n1))));
                descriptionWords = tokens.slice(firstTokenIsHsn ? 1 : 0, n1Index > 0 ? n1Index : tokens.length - 2);
            } else if (numbers.length === 1) {
                value = numbers[0];
                rate = value;
                qty = 1;
                descriptionWords = tokens.slice(firstTokenIsHsn ? 1 : 0, tokens.length - 1);
            }

            let particulars = descriptionWords.join(' ').trim();
            particulars = particulars.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9%gGkKlLpP]+$/g, '').trim();

            if (particulars.length >= 3 && /[a-zA-Z]/.test(particulars) && value > 0) {
                let unit = 'pcs';
                const particularsLower = particulars.toLowerCase();
                if (particularsLower.includes('kg') || particularsLower.includes('k.g.')) {
                    unit = 'kg';
                } else if (particularsLower.includes(' gm') || particularsLower.includes('g ') || particularsLower.endsWith('g')) {
                    unit = 'g';
                } else if (particularsLower.includes(' ml') || particularsLower.endsWith('ml')) {
                    unit = 'ml';
                } else if (particularsLower.includes(' ltr') || particularsLower.endsWith('l') || particularsLower.includes(' liter')) {
                    unit = 'l';
                } else if (particularsLower.includes('pkt') || particularsLower.includes('packet')) {
                    unit = 'pkt';
                }

                extractedItems.push({
                    purchased_at: detectedDate,
                    hsn: hsn || '-',
                    particulars: particulars.substring(0, 100),
                    qty_kg: Number(qty) || 1,
                    unit: unit,
                    n_rate: Number(rate) || Number(value),
                    value: Number(value),
                    vendor: detectedVendor
                });
            }
        }

        return {
            vendor: detectedVendor,
            date: detectedDate,
            items: extractedItems
        };
    };

    // Item Table Handlers
    const handleItemChange = (index, field, val) => {
        const updated = [...items];
        updated[index][field] = val;
        
        // Recalculate value if qty or rate changes
        if (field === 'qty_kg' || field === 'n_rate') {
            const q = parseFloat(updated[index].qty_kg) || 0;
            const r = parseFloat(updated[index].n_rate) || 0;
            updated[index].value = Math.round((q * r) * 100) / 100;
        }
        setItems(updated);
    };

    const handleVendorChange = (val) => {
        setVendor(val);
        // Bulk update vendor on items
        const updated = items.map(item => ({ ...item, vendor: val }));
        setItems(updated);
    };

    const handleDateChange = (val) => {
        setPurchasedAt(val);
        // Bulk update date on items
        const updated = items.map(item => ({ ...item, purchased_at: val }));
        setItems(updated);
    };

    const handleDeleteItem = (index) => {
        setItems(items.filter((_, idx) => idx !== index));
    };

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                purchased_at: purchasedAt || new Date().toISOString().split('T')[0],
                hsn: '-',
                particulars: 'New Item',
                qty_kg: 1,
                unit: 'pcs',
                n_rate: 0,
                value: 0,
                vendor: vendor || 'Local Vendor'
            }
        ]);
    };

    // Submit all items
    const handleSaveAll = (e) => {
        e.preventDefault();
        if (items.length === 0) {
            alert('No items to save. Please scan a receipt or add items manually.');
            return;
        }

        router.post(route('expenses.store-bulk'), { items }, {
            onSuccess: () => {
                onClose();
            },
            onError: (err) => {
                console.error('Error storing bulk OCR items:', err);
                alert('Failed to store items. Please check that all fields are valid.');
            }
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-gray-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white select-none">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-xl">
                            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight">Smart OCR Receipt Scanner</h3>
                            <p className="text-xs text-blue-100 font-medium">Extract expenses automatically using AI character recognition</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between items-center px-10 py-4 bg-gray-50 border-b border-gray-100 select-none">
                    <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
                        <span className={`text-xs font-bold ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Upload Receipt</span>
                    </div>
                    <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                        <div className={`h-full bg-blue-600 transition-all duration-500 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
                        <span className={`text-xs font-bold ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>AI Recognition</span>
                    </div>
                    <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                        <div className={`h-full bg-blue-600 transition-all duration-500 ${step === 3 ? 'w-full' : 'w-0'}`} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</span>
                        <span className={`text-xs font-bold ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Verify & Save</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
                    
                    {/* Step 1: Upload */}
                    {step === 1 && (
                        <div className="max-w-xl mx-auto py-10">
                            <div 
                                ref={dragRef}
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                                className={`border-3 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                                    isDragging 
                                    ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' 
                                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50'
                                }`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                                    accept="image/*" 
                                    className="hidden" 
                                />
                                
                                {imagePreview ? (
                                    <div className="relative group w-48 h-64 rounded-2xl overflow-hidden shadow-md">
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Receipt preview" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-xs font-bold">Change Image</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-lg font-black text-gray-700 mb-1">Drag and drop your receipt image</h4>
                                        <p className="text-sm text-gray-400 font-medium mb-6">Supports PNG, JPG, JPEG, and WebP formats</p>
                                        <button 
                                            type="button"
                                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                                        >
                                            Choose File
                                        </button>
                                    </>
                                )}
                            </div>

                            {imageFile && (
                                <div className="mt-8 flex justify-center">
                                    <button 
                                        onClick={startOcrScan}
                                        className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-md rounded-2xl shadow-lg shadow-blue-500/25 flex items-center gap-3 transition-transform hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <Sparkles className="w-5 h-5 text-yellow-300" />
                                        Start OCR Extraction
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Scanning */}
                    {step === 2 && (
                        <div className="max-w-md mx-auto py-20 flex flex-col items-center justify-center text-center">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-pulse" />
                                </div>
                            </div>
                            <h4 className="text-xl font-black text-gray-700 mb-2">{statusText}</h4>
                            <p className="text-sm text-gray-500 font-medium mb-6">Reading text. Please do not close the window.</p>

                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-2 shadow-inner">
                                <div 
                                    className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs font-black text-blue-600">{progress}% Complete</span>
                        </div>
                    )}

                    {/* Step 3: Verify & Edit */}
                    {step === 3 && (
                        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[500px]">
                            
                            {/* Left: Image Reference */}
                            <div className="w-full lg:w-1/3 bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Receipt Reference</span>
                                <div className="flex-1 overflow-y-auto max-h-[400px] lg:max-h-none rounded-xl border bg-white flex items-start justify-center p-2">
                                    <img src={imagePreview} className="max-w-full h-auto object-contain rounded" alt="Receipt reference" />
                                </div>
                            </div>

                            {/* Right: Table Edit */}
                            <div className="flex-1 flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Extracted Information</span>
                                
                                {/* Meta Information Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                    <div>
                                        <label className="text-xs font-bold text-blue-700 mb-1 ml-1 block uppercase tracking-wider">Detected Vendor</label>
                                        <div className="relative">
                                            <input 
                                                list="ocr-vendors"
                                                type="text" 
                                                value={vendor} 
                                                onChange={(e) => handleVendorChange(e.target.value)}
                                                className="w-full border-blue-200 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-xl px-4 py-2.5 bg-white text-sm font-semibold"
                                                placeholder="Vendor Name"
                                            />
                                            <datalist id="ocr-vendors">
                                                {defaultVendors.map((v, i) => <option key={i} value={v} />)}
                                            </datalist>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-blue-700 mb-1 ml-1 block uppercase tracking-wider">Purchase Date</label>
                                        <input 
                                            type="date" 
                                            value={purchasedAt} 
                                            onChange={(e) => handleDateChange(e.target.value)}
                                            className="w-full border-blue-200 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-xl px-4 py-2.5 bg-white text-sm font-semibold"
                                        />
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="flex-1 overflow-x-auto border border-gray-200 rounded-2xl mb-4 bg-white">
                                    <table className="w-full border-collapse text-left text-sm text-gray-500">
                                        <thead className="bg-gray-50 text-xs font-bold text-gray-700 uppercase tracking-wider border-b select-none">
                                            <tr>
                                                <th className="px-4 py-3">Particulars (Item)</th>
                                                <th className="px-3 py-3 w-24">Qty</th>
                                                <th className="px-3 py-3 w-28">Unit</th>
                                                <th className="px-3 py-3 w-28">Rate (₹)</th>
                                                <th className="px-3 py-3 w-28">Value (₹)</th>
                                                <th className="px-4 py-3 w-16">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {items.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-2">
                                                        <input 
                                                            type="text" 
                                                            value={item.particulars}
                                                            onChange={(e) => handleItemChange(index, 'particulars', e.target.value)}
                                                            className="w-full border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-0 rounded-lg p-2 text-sm font-semibold"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input 
                                                            type="number" 
                                                            step="0.001"
                                                            value={item.qty_kg}
                                                            onChange={(e) => handleItemChange(index, 'qty_kg', e.target.value)}
                                                            className="w-full border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-0 rounded-lg p-2 text-sm font-semibold text-center"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select 
                                                            value={item.unit}
                                                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                            className="w-full border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-0 rounded-lg p-2 text-sm font-semibold bg-white cursor-pointer"
                                                        >
                                                            <option value="pcs">Pieces</option>
                                                            <option value="kg">KG</option>
                                                            <option value="g">Grams</option>
                                                            <option value="l">Liters</option>
                                                            <option value="ml">ML</option>
                                                            <option value="pkt">Packet</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input 
                                                            type="number" 
                                                            step="0.01"
                                                            value={item.n_rate}
                                                            onChange={(e) => handleItemChange(index, 'n_rate', e.target.value)}
                                                            className="w-full border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-0 rounded-lg p-2 text-sm font-semibold text-right"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input 
                                                            type="number" 
                                                            step="0.01"
                                                            value={item.value}
                                                            onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                                                            className="w-full border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-0 rounded-lg p-2 text-sm font-semibold text-right bg-gray-50/50"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleDeleteItem(index)}
                                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {items.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-10 text-gray-400 font-medium">
                                                        No items found. Click "+ Add Row" to input manually or re-scan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Table Actions */}
                                <div className="flex justify-between items-center">
                                    <button 
                                        type="button" 
                                        onClick={handleAddItem}
                                        className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Item Row
                                    </button>

                                    <div className="flex gap-3">
                                        <button 
                                            type="button" 
                                            onClick={() => setStep(1)}
                                            className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-sm rounded-xl transition-all"
                                        >
                                            Scan Again
                                        </button>
                                        <button 
                                            onClick={handleSaveAll}
                                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
                                        >
                                            <Check className="w-4 h-4" />
                                            Save to Expenses ({items.length} Items)
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
