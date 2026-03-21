import { forwardRef } from 'react'

const variants = {
  primary:   'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm hover:shadow-glow',
  secondary: 'bg-navy-800 hover:bg-navy-700 text-slate-200 border border-white/10 hover:border-white/20',
  ghost:     'bg-transparent hover:bg-white/5 text-slate-300 hover:text-slate-100',
  danger:    'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 hover:border-red-500/40',
  amber:     'bg-amber-500 hover:bg-amber-600 text-white',
  success:   'bg-emerald-500 hover:bg-emerald-600 text-white',
}

const sizes = {
  sm:  'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md:  'px-4 py-2 text-sm rounded-lg gap-2',
  lg:  'px-5 py-2.5 text-sm rounded-xl gap-2',
  xl:  'px-6 py-3 text-base rounded-xl gap-2.5',
  icon:'p-2 rounded-lg',
}

const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  icon,
  iconRight,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium transition-all duration-150 
        disabled:opacity-50 disabled:cursor-not-allowed select-none
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </button>
  )
})

Button.displayName = 'Button'
export default Button
