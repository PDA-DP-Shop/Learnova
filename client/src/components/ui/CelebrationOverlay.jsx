import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Sparkles, Command, ArrowRight, Award, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

const ConfettiParticle = ({ color, x, y, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, x, y }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0.5],
      x: x + (Math.random() - 0.5) * 800,
      y: y + (Math.random() * -1000) - 200,
      rotate: [0, 180, 720],
    }}
    transition={{ 
      duration: 4, 
      delay, 
      ease: [0.23, 1, 0.32, 1]
    }}
    className={`fixed w-2 h-2 rounded-sm ${color} z-[600] pointer-events-none shadow-sm`}
  />
)

const CelebrationOverlay = ({ isOpen, onClose, courseTitle }) => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (isOpen) {
      const newParticles = []
      const colors = ['bg-[#714B67]', 'bg-[#017E84]', 'bg-amber-400', 'bg-slate-900', 'bg-emerald-500']
      
      const launchPoints = [
        { x: -100, y: window.innerHeight + 100 },
        { x: window.innerWidth + 100, y: window.innerHeight + 100 },
        { x: window.innerWidth / 2, y: window.innerHeight + 100 }
      ]

      launchPoints.forEach(point => {
        for (let i = 0; i < 50; i++) {
          newParticles.push({
            id: Math.random(),
            color: colors[Math.floor(Math.random() * colors.length)],
            x: point.x,
            y: point.y,
            delay: Math.random() * 2
          })
        }
      })
      setParticles(newParticles)
    } else {
      setParticles([])
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Brand Backdrop Layer - NOW OPAQUE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#F8FAFC] pointer-events-auto"
            onClick={onClose}
          >
             {/* Brand Gradients - More intense on opaque background */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-[#714B67]/20 rounded-full blur-[200px] -translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 right-0 w-[1000px] h-[1000px] bg-[#017E84]/15 rounded-full blur-[200px] translate-x-1/3 translate-y-1/3" />
             </div>
             
             {/* Noise texture for premium feel on solid background */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
          </motion.div>

          {/* Particle Layer */}
          {particles.map(p => (
            <ConfettiParticle key={p.id} {...p} />
          ))}

          {/* Master Celebration Card - RETAINS GLASS BLUR */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 60 }}
            className="relative w-full max-w-xl bg-white/60 border border-white rounded-[3rem] p-10 lg:p-14 shadow-[0_50px_100px_-20px_rgba(113,75,103,0.15)] text-center relative z-10 overflow-hidden backdrop-blur-[40px] border-white/50"
          >
            {/* Design Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#714B67]/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#017E84]/5 rounded-full blur-3xl -ml-16 -mb-16" />

            <div className="relative z-20 flex flex-col items-center">
              {/* Profile/Brand Icon */}
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, bounce: 0.6 }}
                className="w-28 h-28 rounded-3xl bg-[#714B67] flex items-center justify-center mb-8 shadow-[0_20px_40px_rgba(113,75,103,0.3)] border-4 border-white relative overflow-hidden group"
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                 <Trophy size={48} className="text-white drop-shadow-lg relative z-10" fill="currentColor" />
                 
                 {/* Inner Glow Shine */}
                 <motion.div 
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[30deg] z-[5]"
                 />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center gap-3">
                   <div className="h-px w-8 bg-slate-200" />
                   <p className="text-[10px] font-black text-[#714B67] uppercase tracking-[0.4em] font-dm-sans">Evolution Complete</p>
                   <div className="h-px w-8 bg-slate-200" />
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-black text-slate-900 font-sora tracking-tighter leading-[0.9] mb-4">
                  Magnificent Mastery
                </h1>

                <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-50 border border-slate-100 rounded-full shadow-inner">
                   <Sparkles size={16} className="text-[#017E84]" />
                   <p className="text-sm font-bold text-[#017E84] font-sora truncate max-w-[280px]">
                      {courseTitle}
                   </p>
                </div>
              </motion.div>

              {/* Status Section - Matching .badge styles */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-10 grid grid-cols-2 gap-4 w-full"
              >
                <div className="p-6 bg-slate-100/50 border border-slate-200/50 rounded-[2rem] flex flex-col items-center gap-2 shadow-sm">
                   <Award size={20} className="text-[#714B67]" />
                   <div>
                     <p className="text-lg font-black text-slate-900 font-sora leading-tight">Verified</p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Assessment Protocol</p>
                   </div>
                </div>
                <div className="p-6 bg-[#017E84]/10 border border-[#017E84]/20 rounded-[2rem] flex flex-col items-center gap-2 shadow-sm">
                   <Star size={20} className="text-[#017E84]" fill="currentColor" />
                   <div>
                     <p className="text-lg font-black text-[#017E84] font-sora leading-tight">Mastery</p>
                     <p className="text-[9px] font-black text-[#017E84]/40 uppercase tracking-widest mt-0.5">Recognition status</p>
                   </div>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={onClose}
                className="mt-12 w-full h-16 bg-[#714B67] hover:bg-[#54384c] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(113,75,103,0.3)] transition-all flex items-center justify-center gap-3 group pointer-events-auto active:scale-95 btn-shine"
              >
                Synchronize to Dashboard
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </motion.button>
              
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest"
              >
                 Learnova Curriculum Engine v.1.0
              </motion.p>
            </div>
          </motion.div>

          {/* Flash Effect */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-[#714B67]/10 z-[700] pointer-events-none"
          />
        </div>
      )}
    </AnimatePresence>
  )
}

export default CelebrationOverlay
