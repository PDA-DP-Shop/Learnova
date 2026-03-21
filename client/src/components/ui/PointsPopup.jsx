import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap } from 'lucide-react'
import { getBadge, getProgressToNextBadge } from '../../utils/badge'
import ProgressBar from './ProgressBar'

const PointsPopup = ({ isOpen, onClose, pointsEarned, newTotal, score }) => {
  const badge = getBadge(newTotal)
  const nextProgress = getProgressToNextBadge(newTotal)

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
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative bg-navy-800 border border-indigo-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors">
              <X size={16} />
            </button>

            {/* Points burst */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring' }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center"
            >
              <Zap size={36} className="text-indigo-400" fill="currentColor" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <p className="text-slate-400 text-sm mb-1">You earned</p>
              <p className="text-5xl font-bold text-indigo-400 font-sora mb-1">
                +{pointsEarned}
              </p>
              <p className="text-slate-300 text-sm mb-1">points</p>
              {score !== undefined && (
                <p className="text-emerald-400 text-xs mt-2 mb-4">Quiz score: {score}%</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-5 pt-4 border-t border-white/8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{badge.emoji}</span>
                  <span className="text-sm font-semibold text-slate-200">{badge.name}</span>
                </div>
                <span className="text-xs text-slate-400">{newTotal} pts total</span>
              </div>
              {badge.next && (
                <>
                  <ProgressBar value={nextProgress} showLabel={false} size="sm" />
                  <p className="text-xs text-slate-500 mt-1">{badge.next - newTotal} pts to next level</p>
                </>
              )}
            </motion.div>

            <button
              onClick={onClose}
              className="mt-5 w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
            >
              Continue
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default PointsPopup
