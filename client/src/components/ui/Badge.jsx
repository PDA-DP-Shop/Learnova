import { motion } from 'framer-motion'

const Badge = ({ children, className = '', variant = 'default', size = 'sm', dot = false, pulse = false }) => {
  const variants = {
    default: 'bg-odoo/5 text-odoo border-odoo/10 shadow-sm shadow-odoo/5',
    teal:    'bg-odoo-teal/5 text-odoo-teal border-odoo-teal/10 shadow-sm shadow-odoo-teal/5',
    green:   'bg-emerald-500/5 text-emerald-600 border-emerald-500/10',
    amber:   'bg-amber-500/5 text-amber-600 border-amber-500/10',
    red:     'bg-red-500/5 text-red-600 border-red-500/10',
    slate:   'bg-slate-100/80 text-slate-500 border-slate-200',
    odoo:    'bg-odoo text-white border-odoo/50 shadow-lg shadow-odoo/20',
  }
  
  const sizes = {
    xs: 'px-2 py-0.5 text-[9px]',
    sm: 'px-3 py-1 text-[10px]',
    md: 'px-4 py-1.5 text-xs',
  }

  return (
    <motion.span 
      initial={pulse ? { scale: 0.95, opacity: 0.8 } : {}}
      animate={pulse ? { scale: 1, opacity: 1 } : {}}
      transition={pulse ? { repeat: Infinity, duration: 2, repeatType: 'reverse' } : {}}
      className={`inline-flex items-center gap-1.5 rounded-xl font-black uppercase tracking-widest border backdrop-blur-sm
        ${variants[variant] || variants.default}
        ${sizes[size] || sizes.sm}
        ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${pulse ? 'animate-pulse' : ''} bg-current`} />
      )}
      {children}
    </motion.span>
  )
}

export default Badge
