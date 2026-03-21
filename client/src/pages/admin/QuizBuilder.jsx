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
        <aside className="w-64 border-r border-slate-100 flex flex-col bg-white">
          <div className="flex items-center gap-2 p-4 border-b border-slate-100">
            <button onClick={() => navigate(`/admin/courses/${courseId}/edit`)} className="p-1 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft size={14} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Quiz</p>
              <p className="text-sm font-black text-slate-900 font-sora truncate leading-tight">{quiz?.title}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-slate-50/50">
            {quiz?.questions?.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setSelectedQ(i)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm border-2 ${selectedQ === i ? 'bg-white border-indigo-500 shadow-lg shadow-indigo-600/5 text-slate-900' : 'text-slate-500 border-transparent hover:bg-white hover:border-slate-100'}`}
              >
                <span className={`font-black text-[10px] uppercase tracking-widest block mb-1 ${selectedQ === i ? 'text-indigo-600' : 'text-slate-400'}`}>Q{i + 1}</span>
                <p className="truncate font-bold leading-tight">{q.text}</p>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 space-y-2 bg-white">
            <Button size="md" variant="secondary" icon={<Plus size={13} />} onClick={addQuestion} className="w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest">Add Question</Button>
            <Button size="md" variant="ghost" icon={<Award size={13} />} onClick={() => setRewardsModal(true)} className="w-full h-11 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">Set Rewards</Button>
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
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Assessment Segment {selectedQ + 1}</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => deleteQuestion(currentQ.id)} className="text-red-500 hover:bg-red-50">Delete</Button>
                  <Button size="md" loading={saving} onClick={saveQuestion} className="h-10 px-6 rounded-xl shadow-lg shadow-indigo-600/10">Publish Segment</Button>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Inquiry Context</label>
                <textarea
                  rows={4}
                  value={currentQ.text}
                  onChange={(e) => setQuestion('text', e.target.value)}
                  className="input-base resize-none text-lg font-bold p-6 bg-slate-50 border-slate-100 rounded-2xl focus:bg-white transition-all shadow-sm"
                  placeholder="Enter your question here…"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">Option Configurations <span className="text-slate-300 font-medium">(Designate Correct Path)</span></label>
                <div className="grid grid-cols-1 gap-3">
                  {currentQ.options?.map((opt, i) => (
                    <div key={opt.id || i} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all group ${opt.isCorrect ? 'border-emerald-500 bg-emerald-50 shadow-xl shadow-emerald-600/5' : 'border-slate-100 bg-white hover:border-indigo-100 hover:bg-slate-50'}`}>
                      <button
                        type="button"
                        onClick={() => setOption(i, 'isCorrect', true)}
                        className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${opt.isCorrect ? 'border-emerald-500 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'border-slate-200 text-transparent hover:border-slate-400 bg-white group-hover:bg-slate-50'}`}
                      >
                        <Check size={14} className={opt.isCorrect ? 'opacity-100' : 'opacity-0'} />
                      </button>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => setOption(i, 'text', e.target.value)}
                        className={`flex-1 bg-transparent text-base font-bold outline-none placeholder-slate-300 ${opt.isCorrect ? 'text-emerald-900 placeholder-emerald-300' : 'text-slate-600'}`}
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
        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={() => setRewardsModal(false)}>Discard</Button>
          <Button className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/10" onClick={saveRewards}>Finalize Rewards</Button>
        </div>
      </Modal>
    </AdminLayout>
  )
}

// Need to import HelpCircle in render - now imported at top
export default QuizBuilder
