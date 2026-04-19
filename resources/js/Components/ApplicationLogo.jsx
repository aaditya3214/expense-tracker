export default function ApplicationLogo(props) {
    return (
        <div className={`flex items-center gap-2 select-none ${props.className || ''}`}>
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="text-white text-lg rotate-3">💸</span>
            </div>
            <div className="flex flex-col leading-none justify-center h-full">
                <span className="text-xl font-black text-blue-800 tracking-tight leading-tight">Expense</span>
                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase leading-none">Tracker</span>
            </div>
        </div>
    );
}
