const Toggle = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`w-10 h-5.5 rounded-full transition-colors duration-200 ${checked ? 'bg-indigo-500' : 'bg-navy-700 border border-white/10'}`} />
        <div
          className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4.5' : 'translate-x-0'}`}
          style={{ width: 18, height: 18, top: 2, left: 2 }}
        />
      </div>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </label>
  )
}

export default Toggle
