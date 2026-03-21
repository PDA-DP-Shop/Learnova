import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, CheckCircle2, HelpCircle, Trophy, Target, Award, Play, Clock } from 'lucide-react'
import { quizAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PointsPopup from '../../components/ui/PointsPopup'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import ProgressBar from '../../components/ui/ProgressBar'
import CelebrationOverlay from '../../components/ui/CelebrationOverlay'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const PHASE = { INTRO: 'intro', QUESTION: 'question', DONE: 'done' }

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const QuizPlayer = () => {
  const { id: courseId, quizId } = useParams()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState(PHASE.INTRO)
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [pointsPopup, setPointsPopup] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    quizAPI.get(quizId)
      .then(({ data }) => setQuiz(data))
      .catch(() => toast.error('Failed to load quiz'))
      .finally(() => setLoading(false))

    return () => clearInterval(timerRef.current)
  }, [quizId])

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
      <Spinner size="xl" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Initializing Assessment...</p>
    </div>
  )
  if (!quiz) return <div className="text-center py-32 text-slate-500 font-bold">Assessment data unavailable</div>

  const questions = quiz.questions || []
  const currentQ = questions[currentQIdx]
  const isLast = currentQIdx === questions.length - 1
  const totalQ = questions.length

  const start = () => {
    setAnswers({})
    setCurrentQIdx(0)
    setTimeElapsed(0)
    setPhase(PHASE.QUESTION)
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)
  }

  const selectAnswer = (questionId, optionId) => {
    setAnswers((a) => ({ ...a, [questionId]: optionId }))
  }

  const proceed = async () => {
    if (!answers[currentQ?.id]) return toast.error('Please select an option')

    if (!isLast) {
      setCurrentQIdx((i) => i + 1)
    } else {
      clearInterval(timerRef.current)

      if (user?.role === 'ADMIN') {
        toast.success('Admin: Assessment sandbox complete.')
        setResult({ score: 100, pointsEarned: 0, attemptNo: 'Sandbox', correctCount: totalQ, totalQ })
        setPhase(PHASE.DONE)
        return
      }

      setSubmitting(true)
      try {
        const { data } = await quizAPI.submitAttempt(quizId, { answers, timeTaken: timeElapsed })
        setResult(data)
        updateUser({ totalPoints: data.totalPoints })
        setPhase(PHASE.DONE)
        if (data.pointsEarned > 0) {
          setPointsPopup(true)
          if (data.score === 100) setShowConfetti(true)
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Submission failed')
      } finally { setSubmitting(false) }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter selection:bg-[#714B67]/10">
      {/* Dynamic Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card bg-white/80 border-slate-100 px-4 sm:px-8 py-4 flex items-center gap-6 z-50 rounded-none border-t-0"
      >
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-black text-slate-900 font-sora tracking-tight leading-none truncate">{quiz.title}</h2>
          {phase === PHASE.QUESTION && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black text-[#714B67] uppercase tracking-widest">Question {currentQIdx + 1} of {totalQ}</span>
              <div className="w-24 bg-slate-50 h-1.5 rounded-full overflow-hidden border border-slate-100">
                <motion.div
                  className="bg-[#714B67] h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentQIdx / totalQ) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        {phase === PHASE.QUESTION && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm ml-4">
            <Clock size={12} className="text-[#017E84]" />
            {formatTime(timeElapsed)}
          </div>
        )}
        {phase === PHASE.INTRO && (
          <div className="hidden sm:block">
            <span className="tag-chip text-amber-600 bg-amber-50 border-amber-100 px-4">Knowledge Check</span>
          </div>
        )}
      </motion.div>

      {/* Dynamic Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {/* INTRO PHASE */}
          {phase === PHASE.INTRO && (
            <motion.div
              key="intro"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              className="w-full max-w-xl glass-card bg-white p-8 sm:p-12 text-center shadow-xl shadow-[#714B67]/5"
            >
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400/20 to-orange-600/20 flex items-center justify-center border border-amber-500/20 shadow-2xl shadow-amber-500/10">
                  <HelpCircle size={48} className="text-amber-500 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-xs font-black text-[#714B67]">
                  {totalQ}
                </div>
              </div>

              <h1 className="text-3xl font-black text-slate-900 font-sora mb-4 tracking-tighter leading-tight">{quiz.title}</h1>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8 max-w-sm mx-auto">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-relaxed">
                  ⚠️ Mastery Protocol: 100% score required to unlock XP rewards. Points are awarded once per assessment based on current attempt.
                </p>
              </div>
              <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto leading-relaxed">
                Test your mastery of the material. Earn points for speed and accuracy. Ready to begin?
              </p>

              {quiz.rewards && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center hover:border-[#714B67]/20 transition-colors">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em] mb-1">Attempt {n}{n === 4 ? '+' : ''}</p>
                      <p className="text-xl font-black text-[#714B67] font-sora">{quiz.rewards[`attempt${n}`]}</p>
                      <p className="text-[9px] font-bold text-slate-600 uppercase">Points</p>
                    </div>
                  ))}
                </div>
              )}

              <Button size="xl" onClick={start} iconRight={<Play size={18} />} className="px-12 h-16 shadow-[#714B67]/10 shadow-2xl uppercase tracking-widest font-black text-xs mb-12">
                Launch Assessment
              </Button>

              {/* Attempt History Section */}
              {quiz.userAttempts?.length > 0 && (
                <div className="mt-4 pt-12 border-t border-slate-100 text-left">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Previous Performance Registry</h3>
                    <span className="text-[10px] font-black text-[#714B67] bg-[#714B67]/5 px-3 py-1 rounded-full border border-[#714B67]/10">
                      {quiz.userAttempts.length} Attempt{quiz.userAttempts.length > 1 ? 's' : ''} Record
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                    {quiz.userAttempts.map((att, idx) => (
                      <div key={att.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-[#714B67]/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${att.score === 100 ? 'bg-[#017E84] text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                            #{quiz.userAttempts.length - idx}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 font-sora">{att.score}% Mastery</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                              {new Date(att.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-black font-sora ${att.pointsEarned > 0 ? 'text-[#714B67]' : 'text-slate-300'}`}>
                            {att.pointsEarned > 0 ? `+${att.pointsEarned}` : 'Locked'}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">XP Reward</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* QUESTION PHASE */}
          {phase === PHASE.QUESTION && currentQ && (
            <motion.div
              key={currentQ.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <div className="mb-10 text-center">
                <span className="text-[10px] font-black text-[#714B67] bg-[#714B67]/5 px-4 py-1.5 rounded-full border border-[#714B67]/10 uppercase tracking-[0.2em]">Curriculum Quiz</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-sora mt-5 tracking-tight leading-tight">{currentQ.text}</h2>
              </div>

              <div className="space-y-3 mb-12">
                {currentQ.options?.map((opt, i) => {
                  const selected = answers[currentQ.id] === opt.id
                  return (
                    <motion.button
                      key={opt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => selectAnswer(currentQ.id, opt.id)}
                      className={`group w-full flex items-center gap-5 p-5 rounded-3xl border-2 text-left transition-all duration-300 relative overflow-hidden ${selected
                          ? 'border-[#714B67]/80 bg-[#714B67]/5 shadow-xl shadow-[#714B67]/5'
                          : 'border-slate-100 bg-white hover:border-[#714B67]/10 hover:bg-slate-50'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all font-black text-sm ${selected ? 'border-[#714B67]/80 bg-[#714B67] text-white shadow-lg shadow-[#714B67]/20' : 'border-slate-100 text-slate-300 group-hover:border-slate-200'}`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className={`flex-1 text-sm sm:text-base font-bold transition-colors ${selected ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                        {opt.text}
                      </span>
                      {selected && (
                        <motion.div
                          layoutId="active-indicator"
                          className="w-2 h-2 rounded-full bg-[#714B67]/80 mr-2"
                        />
                      )}
                    </motion.button>
                  )
                })}
              </div>

              <Button
                size="xl"
                className="w-full h-16 shadow-xl shadow-[#714B67]/10 rounded-3xl"
                loading={submitting && isLast}
                disabled={!answers[currentQ.id]}
                iconRight={!isLast ? <ChevronRight size={20} /> : <CheckCircle2 size={20} />}
                onClick={proceed}
              >
                {isLast ? 'Complete Assessment' : 'Confirm & Continue'}
              </Button>
            </motion.div>
          )}

          {/* DONE PHASE */}
          {phase === PHASE.DONE && result && (
            <motion.div
              key="done"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-xl glass-card bg-white p-8 sm:p-12 text-center shadow-xl shadow-[#714B67]/5"
            >
              <motion.div
                initial={{ rotate: -10, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400/20 to-teal-600/20 flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10"
              >
                <Trophy size={48} className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]" />
              </motion.div>

              <h2 className="text-4xl font-black text-slate-900 font-sora mb-2 tracking-tighter">Assessment Complete</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-10">Excellent performance, Learner</p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Target size={40} className="text-slate-400" /></div>
                  <p className="text-3xl sm:text-4xl font-black text-slate-900 font-sora tracking-tighter mb-1">{result.score}%</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy</p>
                </div>
                <div className="bg-[#714B67]/5 border border-[#714B67]/10 rounded-3xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Award size={40} className="text-[#714B67]" /></div>
                  <p className="text-3xl sm:text-4xl font-black text-[#714B67] font-sora tracking-tighter mb-1">
                    {result.pointsEarned > 0 ? `+${result.pointsEarned}` : 'Locked'}
                  </p>
                  <p className="text-[10px] font-black text-[#714B67]/50 uppercase tracking-widest">
                    {result.pointsEarned > 0 ? 'XP Earned' : 'Mastery XP'}
                  </p>
                </div>
                <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-3xl p-6 relative overflow-hidden group flex items-center justify-between">
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity"><Clock size={50} className="text-slate-400 -mr-4 -mt-4" /></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10 w-full">Time Taken</p>
                  <p className="text-3xl font-black text-slate-900 font-sora tracking-tighter relative z-10">{formatTime(timeElapsed)}</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-10 text-xs font-medium text-slate-500">
                You correctly answered <span className="text-slate-900 font-black">{result.correct}</span> out of <span className="text-slate-900 font-black">{result.total}</span> questions.
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="secondary" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-wider text-xs" onClick={start}>Restart Assessment</Button>
                <Button className="flex-1 h-14 rounded-2xl font-black uppercase tracking-wider text-xs shadow-[#714B67]/20 shadow-xl" onClick={() => navigate(`/courses/${courseId}`)}>Return to Course</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CelebrationOverlay
          isOpen={showConfetti}
          onClose={() => setShowConfetti(false)}
          courseTitle="Assessment Mastered!"
        />
      </div>

      {/* Points Popup */}
      {result && (
        <PointsPopup
          isOpen={pointsPopup}
          onClose={() => setPointsPopup(false)}
          pointsEarned={result.pointsEarned}
          newTotal={result.totalPoints}
          score={result.score}
        />
      )}
    </div>
  )
}

export default QuizPlayer
