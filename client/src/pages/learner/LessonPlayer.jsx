import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, CheckCircle2, BookOpen, Play, FileText, Image, HelpCircle, Paperclip, ExternalLink, Download, PanelLeftClose, PanelLeftOpen, ArrowLeft, Sparkles, GraduationCap } from 'lucide-react'
import { courseAPI, progressAPI, enrollmentAPI, quizAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { calcCompletionPercent } from '../../utils/progress'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import PointsPopup from '../../components/ui/PointsPopup'
import CelebrationOverlay from '../../components/ui/CelebrationOverlay'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const LESSON_ICONS = { VIDEO: Play, DOCUMENT: FileText, IMAGE: Image, QUIZ: HelpCircle }

function getYoutubeEmbedUrl(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1`
  if (url.includes('drive.google.com')) {
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`
  }
  return url
}

const LessonPlayer = () => {
  const { id: courseId, lessonId } = useParams()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [marking, setMarking] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [pointsInfo, setPointsInfo] = useState({ show: false, earned: 0, total: 0 })
  const [showCelebration, setShowCelebration] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const deltaAccumulator = useRef(0)
  
  // Inline Quiz State
  const [quizPhase, setQuizPhase] = useState('intro') // intro, question, done
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitting, setQuizSubmitting] = useState(false)
  const [quizResult, setQuizResult] = useState(null)

  useEffect(() => {
    if (data?.enrollment?.timeSpent) {
      setSessionTime(data.enrollment.timeSpent)
    }
  }, [data?.enrollment?.timeSpent])

  useEffect(() => {
    if (!data) return
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1)
      deltaAccumulator.current += 1

      if (deltaAccumulator.current >= 15) {
        const delta = deltaAccumulator.current
        deltaAccumulator.current = 0
        if (user?.role !== 'ADMIN') {
          enrollmentAPI.updateTime(courseId, delta).catch(() => {})
        }
      }
    }, 1000)

    return () => {
      clearInterval(timer)
      if (deltaAccumulator.current > 0 && user?.role !== 'ADMIN') {
        enrollmentAPI.updateTime(courseId, deltaAccumulator.current).catch(() => {})
      }
    }
  }, [data, courseId])

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    courseAPI.getDetail(courseId)
      .then(({ data: d }) => setData(d))
      .catch(() => toast.error('Failed to load course details'))
      .finally(() => setLoading(false))
  }, [courseId])

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
      <Spinner size="xl" />
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Entering Classroom...</span>
    </div>
  )
  if (!data || !data.course) return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 p-8">
     <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-[#714B67]">
        <GraduationCap size={40} />
     </div>
     <div className="text-center">
        <h2 className="text-xl font-black text-slate-900 font-sora mb-2">Curriculum Not Prepared</h2>
        <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto mb-8">This portal requires the course foundation to be active. Please verify your connection or contact support.</p>
        <Button onClick={() => navigate('/courses')}>Global Discovery</Button>
     </div>
  </div>

  const { course, enrollment, lessonProgress } = data
  const completedIds = new Set(lessonProgress?.filter((p) => p.isCompleted).map((p) => p.lessonId))
  const lessons = course.lessons || []
  const currentLesson = lessons.find((l) => l.id === lessonId) || lessons[0]
  const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id)
  const nextLesson = lessons[currentIndex + 1]
  const prevLesson = lessons[currentIndex - 1]
  const totalLessons = lessons.length
  const completedCount = completedIds.size
  const pct = calcCompletionPercent(completedCount, totalLessons)
  const allDone = completedCount >= totalLessons
  const isDone = completedIds.has(currentLesson?.id)

  const markComplete = async () => {
    if (isDone || user?.role === 'ADMIN') return
    setMarking(true)
    try {
      const { data: res } = await progressAPI.markComplete(currentLesson.id)
      const { data: fresh } = await courseAPI.getDetail(courseId)
      setData(fresh)
      
      if (res.pointsEarned > 0) {
        setPointsInfo({ show: true, earned: res.pointsEarned, total: res.totalPoints })
        updateUser({ totalPoints: res.totalPoints })
      } else {
        toast.success('Progress updated!')
      }
    } catch { toast.error('Failed to update progress') } finally { setMarking(false) }
  }

  const handleNext = async () => {
    if (!isDone) await markComplete()
    if (nextLesson) navigate(`/courses/${courseId}/learn/${nextLesson.id}`)
  }

  const handleCompleteCourse = async () => {
    if (user?.role === 'ADMIN') {
      toast.success('Admin: Program walkthrough complete.')
      return navigate(`/courses/${courseId}`)
    }
    setCompleting(true)
    try {
      const { data: res } = await enrollmentAPI.complete(courseId)
      
      if (res.pointsEarned > 0) {
        setPointsInfo({ show: true, earned: res.pointsEarned, total: res.totalPoints })
        updateUser({ totalPoints: res.totalPoints })
      } else {
        setShowCelebration(true)
      }
    } catch { toast.error('Failed to complete course') } finally { setCompleting(false) }
  }

  const embedUrl = currentLesson?.type === 'VIDEO' && currentLesson.videoUrl ? getYoutubeEmbedUrl(currentLesson.videoUrl) : null
  const isNativeVideo = currentLesson?.type === 'VIDEO' && currentLesson.fileUrl && !currentLesson.videoUrl

  // Quiz Helpers
  const handleInlineQuizSubmit = async () => {
    if (!currentLesson?.quiz?.id) return
    setQuizSubmitting(true)
    try {
      const { data: res } = await quizAPI.submitAttempt(currentLesson.quiz.id, { 
        answers: quizAnswers, 
        timeTaken: 0 // Simplification for inline module quizzes
      })
      setQuizResult(res)
      setQuizPhase('done')
      if (res.pointsEarned > 0) {
        setPointsInfo({ show: true, earned: res.pointsEarned, total: res.totalPoints })
        updateUser({ totalPoints: res.totalPoints })
      }
      // Auto-mark lesson as complete if they passed well?
      if (res.score >= 80 && !isDone && user?.role !== 'ADMIN') {
        markComplete()
      }
    } catch (err) { 
      const msg = err?.response?.data?.message || 'Failed to submit quiz'
      toast.error(msg)
      console.error('Quiz Submit Error:', err)
    } finally { setQuizSubmitting(false) }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="shrink-0 flex flex-col border-r border-slate-200 bg-white relative z-20 shadow-2xl shadow-slate-200/50"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-slate-100 space-y-4">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate(`/courses/${courseId}`)} className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#714B67] hover:bg-[#714B67]/5 border border-slate-100 active:scale-95 transition-all">
                  <ArrowLeft size={16} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-[#714B67] uppercase tracking-widest leading-none mb-1">Learning Track</p>
                  <p className="text-xs font-black text-slate-900 truncate">{course.title}</p>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter text-slate-500">
                  <span>Course Mastery</span>
                  <span className="text-[#017E84]">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#714B67] to-[#017E84]" 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            {/* Lesson List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-1 scroll-smooth">
              <div className="px-6 mb-4 mt-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Curriculum Roadmap</h3>
              </div>
              {lessons.map((lesson, i) => {
                const Icon = LESSON_ICONS[lesson.type] || BookOpen
                const isActive = lesson.id === currentLesson?.id
                const done = completedIds.has(lesson.id)
                return (
                  <button
                    key={lesson.id}
                    onClick={() => navigate(`/courses/${courseId}/learn/${lesson.id}`)}
                    className={`w-full flex items-start gap-4 px-6 py-4 text-left transition-all relative overflow-hidden group ${isActive ? 'bg-[#714B67]/5' : 'hover:bg-slate-50'}`}
                  >
                    {isActive && <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-[#714B67]/80" />}
                    <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${done ? 'bg-[#714B67] border-[#714B67] text-white shadow-lg shadow-[#714B67]/20 scale-95' : isActive ? 'bg-white border-[#714B67] text-[#714B67] scale-105' : 'bg-white border-slate-100 text-slate-300 group-hover:border-slate-300'}`}>
                      {done ? <CheckCircle2 size={16} strokeWidth={3} /> : <span className="text-[10px] font-black font-sora">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[32px]">
                      <p className={`text-xs font-bold leading-tight ${isActive ? 'text-[#714B67]' : done ? 'text-slate-500' : 'text-slate-400'}`}>{lesson.title}</p>
                      <div className="flex items-center gap-2 mt-1 opacity-70">
                        <Icon size={12} className={isActive ? 'text-[#017E84]' : 'text-slate-400'} />
                        {lesson.duration && <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{lesson.duration} min</span>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 flex items-center gap-4 px-8 border-b border-slate-200 bg-white shrink-0 z-10 shadow-sm">
          <button onClick={() => setSidebarOpen((v) => !v)} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all border border-slate-100 shadow-sm hover:shadow-md active:scale-95">
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Session</p>
            <h2 className="text-base font-black text-slate-900 truncate font-sora">{currentLesson?.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-slate-500 font-black text-xs font-mono shadow-inner tracking-widest">
              ⏱ {formatTime(sessionTime)}
            </div>
            {isDone ? (
              <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 shadow-sm">
                <CheckCircle2 size={14} strokeWidth={3} /> Completed
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-600 text-[10px] font-black uppercase px-4 py-2 rounded-xl border border-amber-100 flex items-center gap-2 shadow-sm">
                <Spinner size="xs" color="text-amber-500" /> In Progress
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-[1400px] mx-auto px-6 py-12 lg:px-12">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentLesson?.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* Media Wrapper */}
                <div className="mb-12 rounded-[2.5rem] overflow-hidden border-4 border-white bg-slate-100 shadow-[0_20px_60px_-15px_rgba(113,75,103,0.15)] relative group">
                  {currentLesson?.type === 'VIDEO' && (
                    <div className="relative w-full aspect-video bg-slate-950">
                      {embedUrl ? (
                        <iframe
                          src={embedUrl}
                          title={currentLesson.title}
                          className="absolute inset-0 w-full h-full border-none"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : currentLesson?.fileUrl ? (
                        <video
                          key={currentLesson.fileUrl}
                          src={currentLesson.fileUrl}
                          controls
                          className="absolute inset-0 w-full h-full object-contain"
                          controlsList="nodownload"
                          playsInline
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-slate-900">
                           <Play size={48} className="text-slate-700 mb-4 opacity-20" />
                           <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Video Stream Unavailable</p>
                        </div>
                      )}
                    </div>
                  )}

                  {currentLesson?.type === 'DOCUMENT' && (
                    <div className="relative w-full min-h-[75vh] flex flex-col bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative group">
                      {/* Interactive Document Portal */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-10">
                         <div className="w-24 h-24 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                           <FileText size={48} className="text-white drop-shadow-lg" />
                         </div>
                         <h2 className="text-3xl font-black text-white font-sora mb-4 tracking-tight">System Document Portal</h2>
                         <p className="text-white/60 font-medium mb-12 max-w-sm mx-auto uppercase tracking-widest text-[10px]">Registry: Learn Protocol V.1 // {currentLesson.title}</p>
                         
                         <div className="flex items-center gap-4">
                            <a 
                              href={currentLesson.fileUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="px-8 h-14 bg-white text-slate-950 text-xs font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 hover:-translate-y-1 transition-all shadow-2xl shadow-white/10"
                            >
                              <ExternalLink size={16} /> Open Desktop View
                            </a>
                            {currentLesson.allowDownload && (
                              <a 
                                href={currentLesson.fileUrl} 
                                download 
                                className="px-8 h-14 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 hover:bg-white/20 transition-all shadow-xl"
                              >
                                <Download size={16} /> Save Asset
                              </a>
                            )}
                         </div>
                      </div>
                      
                      {/* Subtle Background Layer */}
                      <div className="absolute inset-0 opacity-20 pointer-events-none">
                         <div className="absolute top-0 right-0 w-96 h-96 bg-[#714B67] rounded-full blur-[120px] -mr-48 -mt-48" />
                         <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#017E84] rounded-full blur-[120px] -ml-48 -mb-48" />
                      </div>

                      {/* Fallback hidden frame (to trigger cache/validation) */}
                      {currentLesson.fileUrl && (
                        <iframe src={currentLesson.fileUrl} className="sr-only" aria-hidden="true" title="content-prefetch" />
                      )}
                    </div>
                  )}

                  {currentLesson?.type === 'IMAGE' && (
                    <div className="w-full min-h-[60vh] flex items-center justify-center p-12 bg-white">
                      {currentLesson.fileUrl ? (
                        <img src={currentLesson.fileUrl} alt={currentLesson.title} className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl border border-slate-100 object-contain hover:scale-[1.01] transition-transform duration-500" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center">
                           <Image size={48} className="text-slate-200 mb-4" />
                           <p className="text-sm font-black text-slate-400 uppercase tracking-widest leading-relaxed">Visual Asset Not Found</p>
                        </div>
                      )}
                    </div>
                  )}

                  {currentLesson?.type === 'QUIZ' && currentLesson.quiz && (
                    <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
                      <AnimatePresence mode="wait">
                        {quizPhase === 'intro' && (
                          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 px-8 text-center bg-gradient-to-br from-[#714B67] to-[#017E84]">
                             <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-6 border border-white/20">
                               <HelpCircle size={40} className="text-white" />
                             </div>
                             <h2 className="text-3xl font-black text-white mb-4">Module Checkpoint</h2>
                             <p className="text-white/70 max-w-sm mx-auto mb-10 text-sm">Verify your understanding of this module. Complete the quiz to earn points and proceed.</p>
                             <Button size="xl" variant="secondary" onClick={() => { setQuizPhase('question'); setCurrentQuizIdx(0); setQuizAnswers({}) }} className="px-10 shadow-2xl">
                               Start Quiz
                             </Button>
                          </motion.div>
                        )}

                        {quizPhase === 'question' && (
                          <motion.div key="question" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="p-12 sm:p-20 bg-white min-h-[500px] flex flex-col justify-center">
                            <div className="mb-8">
                               <span className="text-[10px] font-black text-[#714B67] uppercase tracking-widest bg-[#714B67]/5 px-3 py-1 rounded-full">Question {currentQuizIdx + 1} of {currentLesson.quiz.questions.length}</span>
                               <h3 className="text-2xl font-black text-slate-900 mt-4 leading-tight">{currentLesson.quiz.questions[currentQuizIdx].text}</h3>
                            </div>
                            <div className="space-y-3 mb-10">
                              {currentLesson.quiz.questions[currentQuizIdx].options.map((opt, oi) => {
                                const selected = quizAnswers[currentLesson.quiz.questions[currentQuizIdx].id] === opt.id
                                return (
                                  <button 
                                    key={opt.id} 
                                    onClick={() => setQuizAnswers(prev => ({ ...prev, [currentLesson.quiz.questions[currentQuizIdx].id]: opt.id }))}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${selected ? 'border-[#714B67] bg-[#714B67]/5 text-slate-900' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                                  >
                                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center text-xs font-black shrink-0 ${selected ? 'bg-[#714B67] border-[#714B67] text-white' : 'border-slate-100 text-slate-300'}`}>
                                      {String.fromCharCode(65 + oi)}
                                    </div>
                                    <span className="font-bold">{opt.text}</span>
                                  </button>
                                )
                              })}
                            </div>
                            <div className="flex justify-end pt-4 border-t border-slate-100">
                              {currentQuizIdx < currentLesson.quiz.questions.length - 1 ? (
                                <Button disabled={!quizAnswers[currentLesson.quiz.questions[currentQuizIdx].id]} onClick={() => setCurrentQuizIdx(v => v + 1)}>
                                  Next Question
                                </Button>
                              ) : (
                                <Button 
                                  loading={quizSubmitting} 
                                  disabled={!quizAnswers[currentLesson.quiz.questions[currentQuizIdx].id]} 
                                  onClick={handleInlineQuizSubmit}
                                >
                                  Submit Results
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {quizPhase === 'done' && quizResult && (
                          <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-12 sm:p-20 text-center bg-white min-h-[500px] flex flex-col justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6 text-emerald-600">
                               <CheckCircle2 size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Check complete!</h2>
                            <p className="text-slate-500 font-medium mb-8">You mastered the checkpoint with {quizResult.score}% accuracy.</p>
                            
                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-10">
                               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                  <p className="text-2xl font-black text-slate-900">{quizResult.score}%</p>
                                  <p className="text-[10px] font-black uppercase text-slate-400">Score</p>
                               </div>
                               <div className="p-4 rounded-2xl bg-[#714B67]/5 border border-[#714B67]/10 text-[#714B67]">
                                  <p className="text-2xl font-black">+{quizResult.pointsEarned}</p>
                                  <p className="text-[10px] font-black uppercase">XP Reward</p>
                               </div>
                            </div>

                            <Button onClick={() => setQuizPhase('intro')}>Retry Checkpoint</Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  {currentLesson?.type === 'QUIZ' && !currentLesson.quiz && (
                    <div className="py-32 px-8 text-center bg-slate-900 rounded-[2.5rem]">
                       <HelpCircle size={48} className="text-slate-700 mx-auto mb-6 opacity-20" />
                       <h2 className="text-xl font-black text-white">Assessment Arriving Soon</h2>
                       <p className="text-white/40 text-sm mt-2">The instructor is currently compiling the module questions.</p>
                    </div>
                  )}
                </div>

                {/* Lesson Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {currentLesson?.description && (
                      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-[#714B67]/5 flex items-center justify-center text-[#017E84] border border-[#714B67]/10">
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900 font-sora tracking-tight">Lesson Overview</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Insights</p>
                          </div>
                        </div>
                        <p className="text-slate-600 text-base leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          {currentLesson.description}
                        </p>
                      </section>
                    )}
                  </div>

                  <aside className="space-y-6">
                    {(currentLesson?.attachments && currentLesson.attachments.length > 0) && (
                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                              <Paperclip size={18} />
                           </div>
                           <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Course Materials</h3>
                        </div>
                        <div className="space-y-3">
                          {currentLesson.attachments.map((a) => (
                            <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 hover:text-[#714B67] hover:border-[#714B67]/30 hover:bg-[#714B67]/5 transition-all group shadow-sm hover:shadow-md">
                              <span className="truncate flex-1">{a.name}</span>
                              <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-gradient-to-br from-[#714B67]/5 to-[#017E84]/5 p-8 rounded-[2.5rem] border border-[#714B67]/10 shadow-sm relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#017E84]/10 rounded-full blur-2xl" />
                      <div className="w-14 h-14 rounded-[1.5rem] bg-white flex items-center justify-center mb-6 text-[#017E84] shadow-md border border-slate-100 relative z-10">
                        <GraduationCap size={28} />
                      </div>
                      <h3 className="text-[10px] font-black text-[#714B67] uppercase tracking-[0.2em] mb-2 relative z-10">Learning Goal</h3>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed relative z-10">
                        Refine your critical skills, engage with the comprehensive material, and achieve ultimate module mastery.
                      </p>
                    </div>
                  </aside>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="h-24 shrink-0 border-t border-slate-200 px-8 flex items-center justify-between bg-white z-20 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.1)]">
          <Button variant="ghost" size="xl" disabled={!prevLesson} onClick={() => navigate(`/courses/${courseId}/learn/${prevLesson.id}`)} className="text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-bold rounded-2xl">
            <span className="hidden sm:inline flex items-center gap-2"><ArrowLeft size={16} /> Previous Lesson</span>
          </Button>

          <div className="flex items-center gap-4">
            {!isDone ? (
              <Button size="xl" loading={marking} onClick={markComplete} className="px-10 rounded-2xl shadow-[#714B67]/20 shadow-2xl h-14 text-xs font-black uppercase tracking-[0.2em] hover:-translate-y-1 transition-all">
                Mark as Completed
              </Button>
            ) : allDone && enrollment?.status !== 'COMPLETED' ? (
              <Button size="xl" loading={completing} onClick={handleCompleteCourse} className="px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 shadow-2xl h-14 text-xs font-black uppercase tracking-[0.2em] hover:-translate-y-1 transition-all">
                Finish Course 🎉
              </Button>
            ) : nextLesson ? (
              <Button size="xl" onClick={handleNext} className="px-10 rounded-2xl shadow-[#714B67]/20 shadow-2xl h-14 text-xs font-black uppercase tracking-[0.2em] hover:-translate-y-1 transition-all">
                Proceed 
              </Button>
            ) : (
              <Button variant="outline" size="xl" onClick={() => navigate(`/courses/${courseId}`)} className="text-[#017E84] border-[#017E84]/30 rounded-2xl font-black uppercase tracking-widest text-xs h-14 px-8">
                Course Outline
              </Button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <div className="flex -space-x-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-10 h-10 rounded-xl border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm relative z-[3-i]">
                  {user.name?.[0]}
                </div>
              ))}
            </div>
            <div className="hidden lg:block border-l border-slate-200 pl-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Collaborative</p>
              <p className="text-xs font-bold text-slate-900 leading-none">Learning with 34 others</p>
            </div>
          </div>
        </footer>
      </main>
      {/* Points Popup */}
      <PointsPopup
        isOpen={pointsInfo.show}
        onClose={() => {
          setPointsInfo({ ...pointsInfo, show: false });
          if (allDone && enrollment?.status !== 'COMPLETED') {
            setShowCelebration(true);
          }
        }}
        pointsEarned={pointsInfo.earned}
        newTotal={pointsInfo.total}
      />

      <CelebrationOverlay
        isOpen={showCelebration}
        onClose={() => navigate(`/courses/${courseId}`)}
        courseTitle={course?.title}
        userName={user?.name}
        instructorName={course?.instructor?.name}
        completionDate={new Date().toISOString()}
      />
    </div>
  )
}

export default LessonPlayer
