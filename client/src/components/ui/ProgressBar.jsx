const ProgressBar = ({ value = 0, showLabel = true, size = 'md', color = 'indigo', className = '' }) => {
  const clamp = Math.min(100, Math.max(0, value))
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' }
  const colors = {
    indigo: 'bg-odoo-teal',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
  }
  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full ${heights[size] || heights.md} bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50`}>
        <div
          className={`h-full ${colors[color] || colors.indigo} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${clamp}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 block">{clamp}% Proficiency Reached</span>
      )}
    </div>
  )
}

export default ProgressBar
