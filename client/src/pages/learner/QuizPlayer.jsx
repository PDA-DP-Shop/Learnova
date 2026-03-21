import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, CheckCircle2, HelpCircle } from 'lucide-react'
import { quizAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import PointsPopup from '../../components/ui/PointsPopup'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import ProgressBar from '../../components/ui/ProgressBar'
import { useAuth as useAuthHook } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const PHASE = { INTRO: 'intro', QUESTION: 'question', DONE: 'done' }

const QuizPlayer = () => {
  const { id: courseId, quizId } = useParams()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState(PHASE.INTRO)
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionId: optionId }
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null) // { score, pointsEarned, totalPoints }
  const [pointsPopup, setPointsPopup] = useState(false)

  useEffect(() => {
    quizAPI.get(quizId)
      .then(({ data }) => setQuiz(data))
      .catch(() => toast.error('Failed to load quiz'))
      .finally(() => setLoading(false))
  }, [quizId])

  if (loading) return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <Spinner size="xl" />
    </div>
  )
  if (!quiz) return <div className="text-center py-32 text-slate-500">Quiz not found</div>

  const questions = quiz.questions || []
  const currentQ = questions[currentQIdx]
  const isLast = currentQIdx === questions.length - 1
  const totalQ = questions.length

  const start = () => {
    setAnswers({})
    setCurrentQIdx(0)
    setPhase(PHASE.QUESTION)
  }

  const selectAnswer = (questionId, optionId) => {
    setAnswers((a) => ({ ...a, [questionId]: optionId }))
  }

  const proceed = async () => {
    if (!answers[currentQ?.id]) return toast.error('Please select an answer')

    if (!isLast) {
      setCurrentQIdx((i) => i + 1)
    } else {
      // Submit
      setSubmitting(true)
      try {
        const { data } = await quizAPI.submitAttempt(quizId, { answers })
        setResult(data)
        updateUser({ totalPoints: data.totalPoints })
        setPhase(PHASE.DONE)
        setPointsPopup(true)
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to submit quiz')
      } finally { setSubmitting(false) }
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/8 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(`/courses/${courseId}`)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-slate-200">{quiz.title}</h2>
          {phase === PHASE.QUESTION && (
            <p className="text-xs text-slate-500">Question {currentQIdx + 1} of {totalQ}</p>
          )}
        </div>
        {phase === PHASE.QUESTION && (
          <div className="ml-auto w-32">
            <ProgressBar value={Math.round((currentQIdx / totalQ) * 100)} showLabel={false} size="sm" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">

          {/* INTRO */}
          {phase === PHASE.INTRO && (
            <div className="text-center bg-navy-800 border border-white/10 rounded-2xl p-8">
              <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                <HelpCircle size={28} className="text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-100 font-sora mb-2">{quiz.title}</h1>
              <p className="text-slate-400 text-sm mb-1">{totalQ} question{totalQ !== 1 ? 's' : ''}</p>
              <p className="text-slate-500 text-xs mb-6">Multiple attempts allowed • Earn points on each attempt</p>
              {quiz.rewards && (
                <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-navy-900 border border-white/8 rounded-xl p-2">
                      <p className="text-xs text-slate-500">Attempt {n}{n === 4 ? '+' : ''}</p>
                      <p className="text-lg font-bold text-indigo-400 font-sora">{quiz.rewards[`attempt${n}`]}</p>
                      <p className="text-xs text-slate-600">pts</p>
                    </div>
                  ))}
                </div>
              )}
              <Button size="xl" onClick={start}>Start Quiz</Button>
            </div>
          )}

          {/* QUESTION */}
          {phase === PHASE.QUESTION && currentQ && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-full">Q{currentQIdx + 1}</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-100 font-sora leading-snug">{currentQ.text}</h2>
              </div>

              <div className="space-y-3 mb-8">
                {currentQ.options?.map((opt) => {
                  const selected = answers[currentQ.id] === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectAnswer(currentQ.id, opt.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-150 ${
                        selected
                          ? 'border-indigo-500 bg-indigo-500/12 shadow-glow'
                          : 'border-white/10 bg-navy-800 hover:border-indigo-500/40 hover:bg-navy-800'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600'}`}>
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm font-medium ${selected ? 'text-slate-100' : 'text-slate-300'}`}>{opt.text}</span>
                    </button>
                  )
                })}
              </div>

              <Button
                size="lg"
                className="w-full"
                loading={submitting && isLast}
                disabled={!answers[currentQ.id]}
                iconRight={!isLast ? <ChevronRight size={16} /> : null}
                onClick={proceed}
              >
                {isLast ? 'Submit Quiz' : 'Next Question'}
              </Button>
            </div>
          )}

          {/* DONE */}
          {phase === PHASE.DONE && result && (
            <div className="text-center bg-navy-800 border border-white/10 rounded-2xl p-8 animate-fade-in">
              <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-100 font-sora mb-2">Quiz Complete!</h2>
              <p className="text-slate-400 text-sm mb-6">
                You answered {result.correct}/{result.total} questions correctly
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-navy-900 border border-white/8 rounded-xl p-4">
                  <p className="text-3xl font-bold text-slate-100 font-sora">{result.score}%</p>
                  <p className="text-xs text-slate-500">Score</p>
                </div>
                <div className="bg-navy-900 border border-indigo-500/20 rounded-xl p-4">
                  <p className="text-3xl font-bold text-indigo-400 font-sora">+{result.pointsEarned}</p>
                  <p className="text-xs text-slate-500">Points Earned</p>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={start}>Try Again</Button>
                <Button onClick={() => navigate(`/courses/${courseId}`)}>Back to Course</Button>
              </div>
            </div>
          )}
        </div>
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
