const Toggle = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label className={`flex items-center gap-3 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`w-11 h-6 rounded-full transition-all duration-300 ease-in-out border-2 ${checked ? 'bg-[#017E84] border-[#017E84] shadow-[0_0_15px_rgba(1,126,132,0.4)]' : 'bg-slate-100 border-slate-300 shadow-inner'}`} />
        <div
          className={`absolute left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${checked ? 'translate-x-[20px]' : 'translate-x-0'}`}
        />
      </div>
      {label && <span className="text-xs font-black uppercase tracking-widest text-slate-700">{label}</span>}
    </label>
  )
}

export default Toggle
