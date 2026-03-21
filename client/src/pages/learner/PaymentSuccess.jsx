import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ChevronRight, BookOpen, LayoutDashboard, Share2, Download, History, ArrowRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import LearnerLayout from '../../components/layout/LearnerLayout'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

const PaymentSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { orderId, amount, method, courseTitle, courseId } = location.state || {}

  useEffect(() => {
    if (!location.state) {
      navigate('/courses')
      return
    }

    // High-Fidelity Confetti Burst
    const duration = 5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min, max) => Math.random() * (max - min) + min

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)

      const particleCount = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    return () => clearInterval(interval)
  }, [location.state, navigate])

  if (!location.state) return null

  return (
    <LearnerLayout hideNavOnMobile={true}>
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 py-20 overflow-hidden">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="max-w-2xl w-full bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-12 text-center relative border border-white"
        >
           {/* Animated Checkmark Backdrop */}
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 0.1 }} transition={{ duration: 1 }}
             className="absolute inset-x-0 top-0 flex items-center justify-center pointer-events-none"
           >
              <CheckCircle2 size={400} className="text-emerald-500" />
           </motion.div>

           <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/40"
              >
                 <CheckCircle2 size={56} className="text-white drop-shadow-lg" />
              </motion.div>

              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Acquisition Captured</h1>
              <p className="text-slate-500 font-medium mb-12">
                 You have successfully finalized your link with <span className="text-indigo-600 font-bold">"{courseTitle}"</span>. 
                 Curriculum access has been synchronized with your profile.
              </p>

              <div className="bg-slate-50 rounded-3xl p-8 mb-12 border border-slate-100/50 space-y-5">
                 <div className="grid grid-cols-2 gap-y-6">
                    <div className="text-left">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Acquisition ID</p>
                       <p className="font-black text-slate-900 font-mono tracking-widest text-lg">{orderId || 'LRN-0000'}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Settlement</p>
                       <p className="font-black text-slate-900 text-lg">₹{amount?.toLocaleString()}</p>
                    </div>
                    <div className="text-left pt-6 border-t border-slate-200/40">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Acquisition Method</p>
                       <p className="font-bold text-slate-700 uppercase tracking-widest text-xs">{method || 'SECURE_GATEWAY'}</p>
                    </div>
                    <div className="text-right pt-6 border-t border-slate-200/40">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                       <p className="font-bold text-slate-700 tracking-tighter text-xs">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                 </div>
                 
                 <div className="pt-4 flex items-center justify-center gap-2 group cursor-default opacity-40 hover:opacity-100 transition-opacity">
                    <Download size={14} className="text-[#3395FF]" />
                    <span className="text-[9px] font-black text-[#3395FF] uppercase tracking-widest border-b border-[#3395FF]/20">Download Settlement Receipt</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <Link to={`/courses/${courseId}`} className="w-full">
                    <button className="w-full h-16 bg-[#3395FF] hover:bg-[#2081ea] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group">
                       <BookOpen size={18} /> Start Curriculum <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                 </Link>
                 <Link to="/my-courses" className="w-full">
                    <button className="w-full h-16 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:bg-slate-50">
                       <LayoutDashboard size={18} /> View Library <ArrowRight size={18} />
                    </button>
                 </Link>
              </div>
              
              <div className="mt-12 flex flex-col items-center gap-4">
                 <div className="h-px w-8 bg-slate-200 rounded-full" />
                 <p className="text-[10px] text-slate-400 font-medium">A confirmation link has been established with your profile email.</p>
                 <div className="flex gap-4 opacity-40 grayscale scale-75 h-6">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-full" alt="" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-full" alt="" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" className="h-full" alt="" />
                 </div>
              </div>
           </div>
        </motion.div>
      </div>
    </LearnerLayout>
  )
}

export default PaymentSuccess
