import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Trophy, Star, Sparkles, ChevronRight } from 'lucide-react'
import { getBadge, getProgressToNextBadge } from '../../utils/badge'

const PointsPopup = ({ isOpen, onClose, pointsEarned, newTotal, score }) => {
  const badge = getBadge(newTotal)
  const nextProgress = getProgressToNextBadge(newTotal)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white border border-slate-100 rounded-[3rem] p-12 max-w-sm w-full text-center shadow-[0_40px_100px_-20px_rgba(113,75,103,0.3)] overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#714B67]/10 blur-[100px] -z-10 rounded-full" />
            
            <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-all p-2 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 z-50">
              <X size={20} />
            </button>

            {/* Achievement Icon */}
            <div className="relative inline-block mb-10 mt-4">
              <motion.div
                initial={{ rotate: -20, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, bounce: 0.6 }}
                className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-[#714B67] to-[#017E84] flex items-center justify-center shadow-xl shadow-[#714B67]/30 relative z-10"
              >
                <Zap size={56} className="text-white drop-shadow-lg" fill="currentColor" />
              </motion.div>
              
              {/* Spinning Rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-x-[-20px] inset-y-[-20px] border-2 border-dashed border-[#714B67]/20 rounded-full"
              />
              
              {/* Particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1.2, 0],
                    x: Math.cos(i * 45 * Math.PI / 180) * 100,
                    y: Math.sin(i * 45 * Math.PI / 180) * 100
                  }}
                  transition={{ 
                    duration: 2, 
                    delay: 0.4 + (i * 0.1), 
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full bg-[#017E84]/40"
                />
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="space-y-2 mb-10"
            >
              <p className="text-[10px] font-black text-[#017E84] uppercase tracking-[0.4em]">Milestone Achieved</p>
              <h2 className="text-6xl font-black text-[#714B67] font-sora tracking-tighter drop-shadow-sm">
                +{pointsEarned} <span className="text-xl text-[#714B67]/70 font-medium ml-1">XP</span>
              </h2>
              {score !== undefined && (
                <div className="inline-flex items-center gap-2 bg-[#017E84]/10 border border-[#017E84]/20 px-5 py-2 rounded-full mt-3 shadow-sm">
                  <Star size={14} className="text-[#017E84]" fill="currentColor" />
                  <span className="text-[10px] font-black text-[#017E84] uppercase tracking-widest leading-none">Proficiency: {score}%</span>
                </div>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.5 }} 
              className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 relative overflow-hidden shadow-inner text-left"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <span className="text-3xl bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">{badge.emoji}</span>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current</p>
                    <p className="text-sm font-black text-[#714B67]">{badge.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-sm font-black text-[#017E84]">{newTotal} XP</p>
                </div>
              </div>

              {badge.next && (
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <span>Rank Progress</span>
                    <span>{newTotal} / {badge.next} XP</span>
                  </div>
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden p-1 border border-slate-200/50 shadow-inner">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#714B67] to-[#017E84] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${nextProgress}%` }}
                      transition={{ duration: 1.5, ease: 'circOut', delay: 0.8 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              onClick={onClose}
              className="mt-10 w-full bg-[#714B67] hover:bg-[#52364a] text-white rounded-2xl py-5 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-[#714B67]/20 transition-all hover:shadow-2xl hover:shadow-[#714B67]/30 active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <span className="relative z-10">Continue Learning</span>
              <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1.5 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default PointsPopup
