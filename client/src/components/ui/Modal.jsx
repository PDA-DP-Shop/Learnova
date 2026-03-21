import { useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg', showClose = true }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`relative w-full ${maxWidth} bg-white border border-slate-100 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col max-h-[90vh]`}
          >
            {(title || showClose) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 shadow-sm bg-slate-50/20 shrink-0">
                {title && <h2 className="text-base font-black text-slate-900 font-sora tracking-tighter uppercase tracking-widest text-xs">{title}</h2>}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white transition-all shadow-sm border border-transparent hover:border-slate-100"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
            <div className="px-6 py-5 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Modal
