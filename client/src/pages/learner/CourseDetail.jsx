import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock, BookOpen, Play, FileText, Image, HelpCircle, Search, Star, MessageSquare, ShieldCheck, Sparkles, Trophy, Globe, Zap, ChevronRight, Users, Lock, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import LearnerLayout from '../../components/layout/LearnerLayout'
import Tabs from '../../components/ui/Tabs'
import ProgressBar from '../../components/ui/ProgressBar'
import StarRating from '../../components/ui/StarRating'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { courseAPI, enrollmentAPI, reviewAPI, userAPI, paymentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatDuration } from '../../utils/time'
import PointsPopup from '../../components/ui/PointsPopup'
import FakeRazorpayModal from '../../components/ui/FakeRazorpayModal'
import { calcCompletionPercent, formatDate } from '../../utils/progress'
import { generateCertificate } from '../../utils/generateCertificate'
import toast from 'react-hot-toast'

const LESSON_ICONS = { VIDEO: Play, DOCUMENT: FileText, IMAGE: Image, QUIZ: HelpCircle }
const LESSON_ICON_CLASSES = { VIDEO: 'text-[#017E84]', DOCUMENT: 'text-sky-400', IMAGE: 'text-pink-400', QUIZ: 'text-amber-400' }

const formatTime = (seconds) => {
  const m = Math.floor((seconds || 0) / 60);
  const s = (seconds || 0) % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
}

const CourseDetail = () => {
  const { id } = useParams()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [lessonSearch, setLessonSearch] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [reviewModal, setReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 0, text: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewXP, setReviewXP] = useState({ show: false, earned: 0, total: 0 })
  const [showPayment, setShowPayment] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  const [liveTime, setLiveTime] = useState(0)

  useEffect(() => {
    courseAPI.getDetail(id)
      .then(({ data: d }) => {
        setData(d)
        setLiveTime(d.enrollment?.timeSpent || 0)
        if (d.isFollowing !== undefined) setIsFollowing(d.isFollowing)
      })
      .catch(() => toast.error('Academy database connection failed'))
      .finally(() => setLoading(false))
  }, [id])

  const { course, enrollment, lessonProgress, quizAttempts, leaderboard } = data || {} 

  // Real-Time Temporal Synchronizer
  useEffect(() => {
    if (!enrollment || user?.role === 'ADMIN') return
    const timer = setInterval(() => {
      setLiveTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [enrollment, user?.role])
  const hasAccess = enrollment || user?.role === 'ADMIN'
  const completedIds = new Set(lessonProgress?.filter((p) => p.isCompleted).map((p) => p.lessonId))
  const completedQuizzes = new Set(quizAttempts?.map((a) => a.quizId))
  
  const finalQuizzes = course?.quizzes?.filter(q => q.isFinal) || []
  const hasFinalAssignment = finalQuizzes.length > 0
  const allFinalDone = hasFinalAssignment && finalQuizzes.every(q => completedQuizzes.has(q.id))

  const totalItems = (course?.lessons?.length || 0) + (course?.quizzes?.length || 0)
  const completedCount = completedIds.size + completedQuizzes.size
  const pct = calcCompletionPercent(completedCount, totalItems)

  const avgRating = course?.reviews?.length
    ? (course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length).toFixed(1)
    : null

  const filteredLessons = course?.lessons?.filter((l) =>
    !lessonSearch || l.title.toLowerCase().includes(lessonSearch.toLowerCase())
  )
  
  const filteredQuizzes = course?.quizzes?.filter((q) =>
    !lessonSearch || q.title.toLowerCase().includes(lessonSearch.toLowerCase())
  )

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return }
    if (course.accessRule === 'ON_PAYMENT') {
       navigate(`/checkout/${id}`)
       return
    }
    
    executeEnrollment()
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleRazorpayPayment = async () => {
    const res = await loadRazorpay()
    if (!res) return toast.error('Payment gateway database link failed')

    const loadingToast = toast.loading('Initiating secure acquisition...')
    try {
      const { data: order } = await paymentAPI.createOrder(id)
      
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Learnova Academy",
        description: `Enrollment: ${course.title}`,
        order_id: order.orderId,
        handler: async (response) => {
          const verifyToast = toast.loading('Verifying transaction hash...')
          try {
            await paymentAPI.verifyPayment({
              ...response,
              courseId: id
            })
            const { data: fresh } = await courseAPI.getDetail(id)
            setData(fresh)
            toast.success('Curriculum Access Mastered!', { id: verifyToast })
          } catch (err) {
            toast.error('Cryptographic verification failed', { id: verifyToast })
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#714B67",
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      toast.dismiss(loadingToast)
    } catch (err) {
      toast.error('Acquisition link failed', { id: loadingToast })
    }
  }

  const executeEnrollment = async (isSimulated = false) => {
    setEnrolling(true)
    const loadingToast = toast.loading('Syncing progress database...')
    try {
      await enrollmentAPI.enroll(id, isSimulated)
      const { data: fresh } = await courseAPI.getDetail(id)
      setData(fresh)
      toast.success('Course Access Granted!', { id: loadingToast })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Access denied', { id: loadingToast })
    } finally { setEnrolling(false) }
  }

  const submitReview = async () => {
    if (!reviewForm.rating) return toast.error('Please select a mastery rating')
    setSubmittingReview(true)
    try {
      const { data: res } = await reviewAPI.create(id, reviewForm)
      const { data: fresh } = await courseAPI.getDetail(id)
      setData(fresh)
      setReviewModal(false)
      setReviewForm({ rating: 0, text: '' })
      
      if (res.pointsEarned > 0) {
        setReviewXP({ show: true, earned: res.pointsEarned, total: res.totalPoints })
        updateUser({ totalPoints: res.totalPoints })
      } else {
        toast.success('Feedback synchronized!')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Synchronization failed')
    } finally { setSubmittingReview(false) }
  }

  const handleFollow = async () => {
    if (!user) return navigate('/login')
    if (user.id === course?.instructorId) return toast.error('Cannot follow yourself')
    try {
      const res = await userAPI.toggleFollow(course.instructorId)
      setIsFollowing(res.data.following)
      toast.success(res.data.following ? 'Subscribed to Lead' : 'Unsubscribed')
    } catch(err) {
      toast.error('Network sync failed')
    }
  }

  return (
    <LearnerLayout noFooter>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-white flex flex-col items-center justify-center gap-6"
          >
            <Spinner size="xl" />
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] animate-pulse">Establishing Immersive Stream...</p>
          </motion.div>
        ) : !data ? (
          <motion.div 
            key="not-found"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-white/5 flex items-center justify-center mb-6">
              <Globe size={32} className="text-slate-700" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-sora">Course not localized</h2>
            <p className="text-slate-500 mt-2 max-w-sm">This module either does not exist or has been archived from the public database.</p>
            <Button className="mt-8" onClick={() => navigate('/courses')}>Back to Discovery</Button>
          </motion.div>
        ) : (
          <motion.main 
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="min-h-screen bg-slate-50 font-inter selection:bg-[#714B67]/10"
          >
            {/* Immersive Header */}
            <div className="relative h-[500px] overflow-hidden">
              {/* Background Layer */}
              <div className="absolute inset-0 z-0 text-slate-950 font-sora">
                {course.coverImage ? (
                  <img src={course.coverImage} className="w-full h-full object-cover opacity-30 blur-2xl scale-110" alt="" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#714B67]/5 via-slate-50 to-slate-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/40 to-transparent" />
              </div>

              <div className="max-w-7xl mx-auto px-6 h-full relative z-10 flex flex-col justify-end pb-16">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <button 
                    onClick={() => navigate('/courses')} 
                    className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] transition-all group"
                  >
                    <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> 
                    Esc Exit Discovery
                  </button>
                </motion.div>

                <div className="flex flex-col lg:flex-row items-end gap-12">
                  {/* Cover Art */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    className="hidden lg:block shrink-0 w-[400px] h-[250px] rounded-[2.5rem] overflow-hidden border-2 border-white shadow-2xl shadow-slate-200 relative"
                  >
                    {course.coverImage ? (
                      <img src={course.coverImage} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <Globe size={60} className="text-slate-100" />
                      </div>
                    )}
                    <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                       <span className="px-4 py-1.5 bg-[#714B67] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl">
                         {course.accessRule === 'OPEN' ? 'Public Module' : 'Premium Access'}
                       </span>
                    </div>
                  </motion.div>

                  {/* Course Identity */}
                  <div className="flex-1 space-y-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                      className="flex flex-wrap gap-2"
                    >
                      {course.tags?.map((t) => (
                        <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest rounded-full">{t}</span>
                      ))}
                    </motion.div>
                    
                    <motion.h1 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="text-4xl lg:text-6xl font-black text-slate-950 font-sora tracking-tighter leading-[0.9]"
                    >
                      {course.title}
                    </motion.h1>

                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="flex items-center gap-4 text-slate-400"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-xs font-black text-[#017E84] uppercase">
                          {course.instructor?.name?.[0]}
                        </div>
                        <span className="text-sm font-bold tracking-tight">Lead by <span className="text-slate-900">{course.instructor?.name}</span></span>
                      </div>
                      {avgRating && (
                        <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                          <Star size={16} fill="currentColor" className="text-amber-500" />
                          <span className="text-sm font-black text-slate-900">{avgRating} Rating</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                        <Users size={16} className="text-[#714B67]" />
                        <span className="text-sm font-black text-slate-900">{course._count?.enrollments || 0} Learners</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Main Action */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                    className="shrink-0 w-full lg:w-auto flex flex-col gap-3"
                  >
                    {hasAccess ? (
                      <>
                        <Link 
                          to={`/courses/${id}/learn/${course.lessons?.[0]?.id}`}
                          className="w-full lg:w-auto h-20 px-12 bg-[#714B67] hover:bg-[#52364A] text-white rounded-[2rem] flex items-center justify-center gap-4 transition-all duration-300 shadow-2xl shadow-[#714B67]/30 hover:-translate-y-1 active:scale-95 text-sm font-black uppercase tracking-[0.2em]"
                        >
                          Launch Program
                          <Play size={18} fill="currentColor" />
                        </Link>
                        {pct >= 100 && allFinalDone && (
                          <button
                            onClick={() => generateCertificate({
                              userName: user?.name,
                              courseName: course?.title,
                              instructorName: course?.instructor?.name,
                              completionDate: enrollment?.completedAt || new Date().toISOString(),
                            })}
                            className="w-full lg:w-auto h-12 px-8 bg-white border-2 border-[#714B67]/20 hover:border-[#714B67]/50 text-[#714B67] rounded-2xl flex items-center justify-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest hover:-translate-y-0.5 shadow-sm"
                          >
                            <Download size={14} />
                            Certificate of Completion
                          </button>
                        )}
                        {pct >= 100 && !hasFinalAssignment && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl max-w-sm">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-relaxed">
                              ⚠️ Final Assessment Missing<br/>
                              <span className="font-medium lowercase first-letter:uppercase text-slate-500">Each certified program requires a final mastery exam. Please ask the instructor to add one.</span>
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full lg:w-auto h-20 px-12 bg-slate-900 text-white hover:bg-black rounded-[2rem] flex items-center justify-center gap-4 transition-all duration-300 shadow-2xl shadow-black/10 hover:-translate-y-1 active:scale-95 text-sm font-black uppercase tracking-[0.2em]"
                      >
                        {enrolling ? <Spinner size="sm" className="text-white" /> : (
                          <>
                            {course.accessRule === 'ON_PAYMENT' ? `Unlock All – ₹${course.price}` : 'Access Full Program'}
                            <ShieldCheck size={18} />
                          </>
                        )}
                      </button>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="flex flex-col lg:flex-row gap-16">
                {/* Main Content Pane */}
                <div className="flex-1 space-y-12">
                  <Tabs
                    tabs={[{ id: 'overview', label: 'Program Curriculum' }, { id: 'reviews', label: `Learner Feedback (${course.reviews?.length || 0})` }]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    className="sticky top-24 z-20"
                  />

                  <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                      <motion.div 
                        key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-10"
                      >
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                          <h2 className="text-2xl font-black text-slate-900 font-sora tracking-tighter">Content Delivery</h2>
                        </div>

                        <div className="space-y-3">
                          {course.lessons?.map((lesson, i) => {
                            const Icon = LESSON_ICONS[lesson.type] || BookOpen
                            const done = completedIds.has(lesson.id)
                            return (
                              <motion.button
                                key={lesson.id}
                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                onClick={() => hasAccess && navigate(`/courses/${id}/learn/${lesson.id}`)}
                                className={`w-full group flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-300 text-left relative overflow-hidden ${
                                  done ? 'bg-white opacity-60 border-slate-100' : 'bg-white border-slate-200 hover:border-[#714B67]/40 hover:bg-slate-50'
                                } ${!hasAccess && 'cursor-not-allowed'}`}
                              >
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#714B67] group-hover:scale-110 transition-all border border-slate-100">
                                  <Icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="text-[10px] font-black text-[#714B67] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                     Module {i + 1} • {lesson.type} {lesson.duration && `• ${formatDuration(lesson.duration)}`}
                                   </p>
                                   <h3 className={`text-base font-black tracking-tight ${done ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                                     {lesson.title}
                                   </h3>
                                </div>
                                <div className="shrink-0 flex items-center gap-4">
                                  {done ? (
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                      <CheckCircle2 size={24} />
                                    </div>
                                  ) : !hasAccess ? (
                                    <Lock size={20} className="text-slate-700" />
                                  ) : (
                                    <ChevronRight size={20} className="text-slate-300 group-hover:text-[#714B67] group-hover:translate-x-1 transition-all" />
                                  )}
                                </div>
                              </motion.button>
                            )
                          })}

                          {course.quizzes?.map((quiz, i) => {
                            const attempt = quizAttempts?.find(a => a.quizId === quiz.id)
                            const done = !!attempt
                            return (
                              <motion.button
                                key={quiz.id}
                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                onClick={() => hasAccess && navigate(`/courses/${id}/quiz/${quiz.id}`)}
                                className={`w-full group flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-300 text-left relative overflow-hidden mt-6 ${
                                  !hasAccess ? 'border-amber-500/10 bg-amber-500/5 cursor-not-allowed' : 'border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20'
                                }`}
                              >
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-all border border-amber-200">
                                  <Trophy size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1.5">Verification Exam {i + 1}</p>
                                   <h3 className="text-base font-black text-amber-900 tracking-tight">{quiz.title}</h3>
                                </div>
                                <div className="shrink-0 text-right">
                                  {done ? (
                                    <div>
                                      <p className="text-xl font-black text-amber-400 font-sora leading-none">{attempt.score}%</p>
                                      <p className="text-[10px] font-black text-amber-500/50 uppercase mt-1">Certified</p>
                                    </div>
                                  ) : (
                                    <Sparkles size={20} className="text-amber-400/50 group-hover:text-amber-500 animate-pulse" />
                                  )}
                                </div>
                              </motion.button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'reviews' && (
                      <motion.div 
                        key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-12"
                      >
                        {/* Mastery Summary */}
                        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden shadow-sm">
                           <div className="absolute top-0 right-0 p-8 opacity-5"><Star size={200} fill="currentColor" /></div>
                           <div className="text-center relative z-10">
                              <p className="text-7xl font-black text-slate-900 font-sora tracking-tighter mb-2">{avgRating || '0.0'}</p>
                              <div className="flex justify-center mb-4"><StarRating value={parseFloat(avgRating || 0)} readonly size={24} /></div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{course.reviews?.length || 0} Peer Reviews</p>
                           </div>
                           
                           <div className="flex-1 space-y-4 relative z-10 w-full">
                              {[5, 4, 3, 2, 1].map((n) => {
                                const count = course.reviews?.filter(r => r.rating === n).length || 0
                                const total = course.reviews?.length || 1
                                return (
                                  <div key={n} className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-slate-500 w-4">{n}</span>
                                    <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                                       <div className="h-full bg-[#714B67]/80 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 w-8">{count}</span>
                                  </div>
                                )
                              })}
                           </div>

                           {enrollment && (
                             <Button onClick={() => setReviewModal(true)} variant="primary" className="h-16 px-10 rounded-2xl relative z-10">
                               Submit Feedback
                             </Button>
                           )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {course.reviews?.map((r, i) => (
                             <div key={r.id} className="p-8 bg-white border border-slate-200 rounded-[2rem] hover:border-[#714B67]/20 transition-all shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                   <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sm font-black text-slate-900">
                                     {r.user?.name?.[0]}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-900">{r.user?.name}</p>
                                      <div className="flex items-center gap-3 mt-1">
                                         <StarRating value={r.rating} readonly size={10} />
                                         <span className="text-[10px] font-black text-slate-600 uppercase">{formatDate(r.createdAt)}</span>
                                      </div>
                                   </div>
                                </div>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed italic">"{r.text}"</p>
                             </div>
                           ))}
                           {(!course.reviews || course.reviews.length === 0) && (
                             <div className="col-span-2 text-center py-20 bg-white rounded-[2.5rem] border-dashed border-2 border-slate-100">
                                <MessageSquare size={48} className="mx-auto text-slate-800 mb-4" />
                                <p className="text-slate-500 font-black uppercase text-xs tracking-widest">No feedback synchronized for this module yet.</p>
                             </div>
                           )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sidebar Info */}
                <div className="w-full lg:w-[350px] shrink-0 space-y-8">
                   {/* Program Details Card */}
                   <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-8 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={80} fill="currentColor" className="text-[#714B67]/80" /></div>
                      
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Program Metrics</h3>
                        <div className="space-y-6">
                           {[
                               { label: 'Content Modules', value: course.lessons?.length || 0, icon: BookOpen, color: 'text-[#714B67]' },
                             { label: 'Exams & Quizzes', value: course.quizzes?.length || 0, icon: Trophy, color: 'text-amber-600' },
                             { label: 'Total Duration', value: formatDuration(course.totalDuration || 0), icon: Clock, color: 'text-sky-500' },
                             { label: 'Program Status', value: enrollment ? enrollment.status.replace(/_/g, ' ') : 'STANDBY', icon: ShieldCheck, color: 'text-[#017E84]' },
                             ...(enrollment ? [{ label: 'Time Spent', value: (() => { const h = Math.floor(liveTime/3600); const m = Math.floor((liveTime%3600)/60); const s = liveTime%60; return `${h}h ${m}m ${s}s`; })(), icon: Clock, color: 'text-blue-500 font-mono' }] : []),
                           ].map((stat, i) => (
                             <div key={i} className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color} border border-slate-100`}>
                                   <stat.icon size={18} />
                                </div>
                                <div>
                                   <p className="text-xs font-black text-slate-600 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                   <p className="text-sm font-black text-slate-900 uppercase leading-none">{stat.value}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>

                      {enrollment && (
                        <div className="pt-8 border-t border-slate-100 space-y-4">
                           <div className="flex justify-between items-end mb-2">
                              <p className="text-[10px] font-black text-[#017E84] uppercase tracking-widest">Global Completion</p>
                              <p className="text-lg font-black text-slate-900 font-sora">{pct}%</p>
                           </div>
                           <div className="h-3 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-gradient-to-r from-[#714B67] to-[#017E84] rounded-full shadow-[0_0_15px_rgba(113,75,103,0.3)]" />
                           </div>
                        </div>
                      )}

                       {!enrollment && (
                        <div className="bg-[#714B67]/5 border border-[#714B67]/10 rounded-2xl p-6">
                           <p className="text-xs font-bold text-[#714B67] leading-relaxed">
                             Secure your access profile today to begin tracking your evolution and earn verified XP milestones.
                           </p>
                        </div>
                      )}
                   </div>

                   {/* Leaderboard Segment */}
                   {leaderboard && leaderboard.length > 0 && (
                     <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] relative overflow-hidden shadow-sm">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
                          <Trophy size={16} className="text-amber-500" /> Top Scholars
                       </h3>
                       <div className="space-y-4 relative z-10">
                         {leaderboard.map((attempt, idx) => (
                           <div key={attempt.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-800 shadow-sm shrink-0">
                                 {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-black text-slate-900 truncate">{attempt.user.name}</p>
                                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Score: {attempt.score}%</p>
                              </div>
                              <div className="text-right shrink-0">
                                 <p className="text-xs font-black text-[#714B67] font-sora">{formatTime(attempt.timeTaken)}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Time</p>
                              </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Instructor Spotlight */}
                   <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] relative overflow-hidden group shadow-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#714B67]/5 to-transparent skew-y-12 translate-y-20 group-hover:translate-y-10 transition-transform duration-700" />
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 relative z-10">Academy Lead</h3>
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-[#714B67] flex items-center justify-center text-3xl font-black text-white shadow-xl">
                          {course.instructor?.name?.[0]}
                        </div>
                        <div>
                           <p className="text-lg font-black text-slate-900 leading-tight">{course.instructor?.name}</p>
                           <p className="text-[10px] font-black text-[#017E84] uppercase tracking-widest mt-1 italic">Verified Mentor</p>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6 relative z-10">
                        Driving innovation and mastery across the global learning network. Learn from the best in the industry.
                      </p>
                      <div className="flex gap-2 relative z-10 w-full">
                        <Button 
                          onClick={handleFollow} 
                          className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest ${isFollowing ? 'bg-slate-900 border-none' : 'bg-[#714B67] hover:bg-[#5a3b52]'}`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                        <Button 
                          onClick={() => navigate(`/network/${course.instructorId}`)}
                          variant="ghost" 
                          className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-900"
                        >
                          View Network Profile
                        </Button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <Modal 
        isOpen={reviewModal} 
        onClose={() => setReviewModal(false)}
        title="Sync Feedback"
        className="max-w-md bg-white border border-slate-200 rounded-[2.5rem] p-10"
      >
        <div className="space-y-10">
          <div className="text-center">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Mastery Rating</label>
            <div className="flex justify-center flex-wrap gap-4">
              <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))} size={48} />
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Testimonial Entry</label>
            <textarea
              value={reviewForm.text}
              onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
              rows={5}
              placeholder="What was your main breakthrough?..."
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#714B67]/20 transition-all resize-none shadow-inner"
            />
          </div>
          <div className="flex flex-col gap-3">
            <Button loading={submittingReview} onClick={submitReview} className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs">Transmit Review</Button>
            <button onClick={() => setReviewModal(false)} className="h-12 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Discard Draft</button>
          </div>
        </div>
      </Modal>

      {/* Payment simulation is now handled by a dedicated full-page checkout */}

      {/* XP Popup for Reviews */}
      <PointsPopup
        isOpen={reviewXP.show}
        onClose={() => setReviewXP({ ...reviewXP, show: false })}
        pointsEarned={reviewXP.earned}
        newTotal={reviewXP.total}
      />
    </LearnerLayout>
  )
}

export default CourseDetail
