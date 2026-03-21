import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const variants = {
  primary:   'bg-[#714B67] hover:bg-[#54384c] text-white shadow-lg shadow-[#714B67]/20 active:shadow-inner',
  secondary: 'bg-white hover:bg-slate-50 text-[#714B67] border-2 border-[#714B67]/20 hover:border-[#714B67]/40 shadow-sm',
  ghost:     'bg-transparent hover:bg-[#714B67]/6 text-[#714B67] hover:text-[#54384c]',
  teal:      'bg-[#017E84] hover:bg-[#015e63] text-white shadow-lg shadow-[#017E84]/20',
  danger:    'bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-100 hover:border-red-200',
  amber:     'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20',
  success:   'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20',
}

const sizes = {
  sm:   'px-3 py-1.5 text-[10px] rounded-lg gap-1.5',
  md:   'px-4 py-2 text-[11px] rounded-xl gap-2',
  lg:   'px-5 py-2.5 text-[11px] rounded-xl gap-2',
  xl:   'px-6 py-3 text-[11px] rounded-2xl gap-2.5',
  icon: 'p-2.5 rounded-xl',
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
    <motion.button
      ref={ref}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.96 } : {}}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-black uppercase tracking-widest
        transition-all duration-200 select-none outline-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2 shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </motion.button>
  )
})

Button.displayName = 'Button'
export default Button
