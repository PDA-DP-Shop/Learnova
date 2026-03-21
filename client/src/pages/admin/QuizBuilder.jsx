import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Check, Award, HelpCircle } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { quizAPI } from '../../services/api'
import toast from 'react-hot-toast'

const QuizBuilder = () => {
  const { id: courseId, quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedQ, setSelectedQ] = useState(0)
  const [rewardsModal, setRewardsModal] = useState(false)
  const [rewards, setRewards] = useState({ attempt1: 100, attempt2: 75, attempt3: 50, attempt4: 25 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    quizAPI.get(quizId).then(({ data }) => {
      setQuiz(data)
      if (data.rewards) setRewards(data.rewards)
    }).catch(() => toast.error('Failed to load quiz')).finally(() => setLoading(false))
  }, [quizId])

  const addQuestion = async () => {
    try {
      const { data } = await quizAPI.addQuestion(quizId, {
        text: 'New Question',
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
          { text: 'Option C', isCorrect: false },
          { text: 'Option D', isCorrect: false },
        ],
      })
      setQuiz((q) => ({ ...q, questions: [...(q.questions || []), data] }))
      setSelectedQ((quiz?.questions?.length || 0))
    } catch { toast.error('Failed to add question') }
  }

  const deleteQuestion = async (qId) => {
    try {
      await quizAPI.deleteQuestion(quizId, qId)
      const newQs = quiz.questions.filter((q) => q.id !== qId)
      setQuiz((q) => ({ ...q, questions: newQs }))
      setSelectedQ(Math.max(0, selectedQ - 1))
    } catch { toast.error('Failed to delete question') }
  }

  const setQuestion = (field, value) => {
    setQuiz((q) => {
      const qs = [...q.questions]
      qs[selectedQ] = { ...qs[selectedQ], [field]: value }
      return { ...q, questions: qs }
    })
  }

  const setOption = (optIdx, field, value) => {
    setQuiz((q) => {
      const qs = [...q.questions]
      const opts = [...qs[selectedQ].options]
      if (field === 'isCorrect') {
        // Only one correct answer
        opts.forEach((o, i) => { opts[i] = { ...opts[i], isCorrect: false } })
      }
      opts[optIdx] = { ...opts[optIdx], [field]: value }
      qs[selectedQ] = { ...qs[selectedQ], options: opts }
      return { ...q, questions: qs }
    })
  }

  const saveQuestion = async () => {
    const q = quiz.questions[selectedQ]
    if (!q) return
    setSaving(true)
    try {
      await quizAPI.updateQuestion(quizId, q.id, { text: q.text, options: q.options })
      toast.success('Question saved')
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  const saveRewards = async () => {
    try {
      await quizAPI.updateRewards(quizId, rewards)
      toast.success('Rewards saved!')
      setRewardsModal(false)
    } catch { toast.error('Failed to save rewards') }
  }

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><Spinner size="lg" /></div></AdminLayout>

  const currentQ = quiz?.questions?.[selectedQ]

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-0px)]">
        {/* Left Panel */}
        <aside className="w-64 border-r border-white/8 flex flex-col bg-navy-900">
          <div className="flex items-center gap-2 p-4 border-b border-white/8">
            <button onClick={() => navigate(`/admin/courses/${courseId}/edit`)} className="p-1 rounded hover:bg-white/5 text-slate-400">
              <ArrowLeft size={14} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500">Quiz</p>
              <p className="text-sm font-semibold text-slate-200 truncate">{quiz?.title}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {quiz?.questions?.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setSelectedQ(i)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm ${selectedQ === i ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                <span className="font-medium text-xs">Q{i + 1}</span>
                <p className="truncate mt-0.5 text-xs">{q.text}</p>
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-white/8 space-y-2">
            <Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={addQuestion} className="w-full">Add Question</Button>
            <Button size="sm" variant="ghost" icon={<Award size={13} />} onClick={() => setRewardsModal(true)} className="w-full">Set Rewards</Button>
          </div>
        </aside>

        {/* Right Panel - Question Editor */}
        <main className="flex-1 overflow-y-auto p-6">
          {!currentQ ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <HelpCircle size={40} className="mb-3 opacity-30" />
              <p>Select or add a question to get started</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-slate-300">Question {selectedQ + 1}</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => deleteQuestion(currentQ.id)} className="text-red-400">Delete</Button>
                  <Button size="sm" loading={saving} onClick={saveQuestion}>Save</Button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-400 mb-2">Question Text</label>
                <textarea
                  rows={3}
                  value={currentQ.text}
                  onChange={(e) => setQuestion('text', e.target.value)}
                  className="input-base resize-none text-base"
                  placeholder="Enter your question here…"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-3">Answer Options <span className="text-slate-500">(click radio to mark correct)</span></label>
                <div className="space-y-2.5">
                  {currentQ.options?.map((opt, i) => (
                    <div key={opt.id || i} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${opt.isCorrect ? 'border-emerald-500/40 bg-emerald-500/8' : 'border-white/10 bg-navy-800 hover:border-white/20'}`}>
                      <button
                        type="button"
                        onClick={() => setOption(i, 'isCorrect', true)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${opt.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600 hover:border-slate-400'}`}
                      >
                        {opt.isCorrect && <Check size={10} className="text-white" />}
                      </button>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => setOption(i, 'text', e.target.value)}
                        className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder-slate-500"
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Rewards Modal */}
      <Modal isOpen={rewardsModal} onClose={() => setRewardsModal(false)} title="Quiz Rewards">
        <p className="text-xs text-slate-500 mb-4">Set points awarded based on attempt number</p>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <span className="text-sm text-slate-400 w-28">Attempt {n}{n === 4 ? '+' : ''}</span>
              <input
                type="number"
                min="0"
                value={rewards[`attempt${n}`]}
                onChange={(e) => setRewards((r) => ({ ...r, [`attempt${n}`]: parseInt(e.target.value) || 0 }))}
                className="input-base w-24"
              />
              <span className="text-xs text-slate-500">pts</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={() => setRewardsModal(false)}>Cancel</Button>
          <Button onClick={saveRewards}>Save Rewards</Button>
        </div>
      </Modal>
    </AdminLayout>
  )
}

// Need to import HelpCircle in render - now imported at top
export default QuizBuilder
