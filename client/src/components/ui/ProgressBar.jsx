const ProgressBar = ({ value = 0, showLabel = true, size = 'md', color = 'indigo', className = '' }) => {
  const clamp = Math.min(100, Math.max(0, value))
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' }
  const colors = {
    indigo: 'bg-indigo-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
  }
  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full ${heights[size] || heights.md} bg-navy-700 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${colors[color] || colors.indigo} rounded-full transition-all duration-700 ease-out progress-glow`}
          style={{ width: `${clamp}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-400 mt-1 block">{clamp}% complete</span>
      )}
    </div>
  )
}

export default ProgressBar
