const Badge = ({ children, className = '', variant = 'default', size = 'sm', dot = false }) => {
  const variants = {
    default: 'badge-indigo',
    green:   'badge-green',
    amber:   'badge-amber',
    red:     'badge-red',
    slate:   'badge-slate',
    indigo:  'badge-indigo',
  }
  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium border
      ${variants[variant] || variants.default}
      ${sizes[size] || sizes.sm}
      ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export default Badge
