import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Users, Star, Play, Lock, ShoppingCart, HelpCircle,
  Search, Filter, Sparkles, Trophy, Globe, Zap, ArrowRight, GraduationCap, CheckCircle
} from 'lucide-react'
import LearnerLayout from '../../components/layout/LearnerLayout'
import Spinner from '../../components/ui/Spinner'
import { courseAPI, enrollmentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
}
const item = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 22, stiffness: 120 } }
}

const CourseCard = ({ course, enrollment, onEnroll }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const avgRating = course.reviews?.length
    ? (course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length).toFixed(1)
    : null

  const getButtonState = () => {
    if (!user) return { label: 'Enroll Free', icon: <ArrowRight size={14}/>, action: () => navigate('/register') }
    if (course.accessRule === 'ON_PAYMENT' && !enrollment) return { label: `Premium · ₹${course.price}`, icon: <Lock size={14}/>, action: () => navigate(`/courses/${course.id}`) }
    if (!enrollment) return { label: 'Start Learning', icon: <ArrowRight size={14}/>, action: () => onEnroll(course.id) }
    if (enrollment.status === 'YET_TO_START') return { label: 'Begin Course', icon: <Play size={14}/>, action: () => navigate(`/courses/${course.id}`) }
    if (enrollment.status === 'IN_PROGRESS') return { label: 'Continue', icon: <Play size={14}/>, action: () => navigate(`/courses/${course.id}`) }
    return { label: 'Review', icon: <CheckCircle size={14}/>, action: () => navigate(`/courses/${course.id}`) }
  }

  const btn = getButtonState()
  const isPremium = course.accessRule === 'ON_PAYMENT'
  const isEnrolled = !!enrollment
  const isCompleted = enrollment?.status === 'COMPLETED'

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      onClick={btn.action}
      className="group relative flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden cursor-pointer transition-all duration-400 hover:shadow-2xl hover:shadow-[#714B67]/10 hover:border-[#714B67]/30"
    >
      {/* Cover Image */}
      <div className="relative h-44 shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent z-10" />
        {course.coverImage ? (
          <img
            src={course.coverImage}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#714B67]/20 via-[#714B67]/10 to-[#017E84]/20 flex items-center justify-center">
            <Globe size={48} className="text-[#714B67]/30" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex gap-2">
          {isPremium ? (
            <span className="px-2.5 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-lg">
              Premium
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-[#714B67] text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-lg">
              Free
            </span>
          )}
          {isCompleted && (
            <span className="px-2.5 py-1 bg-[#017E84] text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-lg">
              ✓ Done
            </span>
          )}
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-[#714B67] shadow-xl shadow-[#714B67]/40 flex items-center justify-center scale-75 group-hover:scale-100 transition-all duration-300">
            <Play size={20} className="text-white fill-white ml-1" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category Tag */}
        {course.tags?.[0] && (
          <span className="inline-block text-[9px] font-black uppercase tracking-widest text-[#017E84] bg-[#017E84]/8 border border-[#017E84]/15 px-2.5 py-1 rounded-lg mb-3 self-start">
            {course.tags[0]}
          </span>
        )}

        {/* Title */}
        <h3 className="text-base font-black text-slate-900 font-sora leading-tight mb-2 line-clamp-2 group-hover:text-[#714B67] transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4 line-clamp-2 flex-1">
          {course.description || 'Master professional skills with expert-led curriculum and hands-on projects.'}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <BookOpen size={12} className="text-[#714B67]" />
              {course._count?.lessons || 0} Lessons
            </span>
            <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg text-emerald-600">
              <Zap size={11} className="fill-emerald-600" />
              {course.rewardXP || 500} XP
            </span>
          </div>
          {avgRating && (
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
              <Star size={11} fill="currentColor" className="text-amber-400" />
              <span className="text-[10px] font-black text-amber-700">{avgRating}</span>
            </div>
          )}
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#714B67]/10 border border-[#714B67]/15 flex items-center justify-center text-[10px] font-black text-[#714B67]">
            {course.instructor?.name?.[0] || 'A'}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {course.instructor?.name || 'Instructor'}
          </span>
          <span className="ml-auto text-[10px] font-black text-slate-500 uppercase tracking-wider">
            {course._count?.enrollments || 0} enrolled
          </span>
        </div>

        {/* CTA Button */}
        <button
          className={`w-full h-11 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all duration-200 btn-shine ${
            isEnrolled
              ? 'bg-[#017E84] text-white hover:bg-[#015e63] shadow-lg shadow-[#017E84]/20'
              : 'bg-[#714B67] text-white hover:bg-[#54384c] shadow-lg shadow-[#714B67]/25'
          }`}
        >
          {btn.icon}
          {btn.label}
        </button>
      </div>
    </motion.div>
  )
}

const CoursesPage = () => {
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('All')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin')
      return
    }
    courseAPI.listPublic()
      .then(({ data }) => setCourses(data))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false))
  }, [user, navigate])

  useEffect(() => {
    if (user) enrollmentAPI.myEnrollments().then(({ data }) => setEnrollments(data)).catch(() => {})
  }, [user])

  const allTags = ['All', ...new Set(courses.flatMap(c => c.tags || []))]

  const filtered = courses.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchTag = activeTag === 'All' || c.tags?.includes(activeTag)
    return matchSearch && matchTag
  })

  const getEnrollment = (id) => enrollments.find(e => e.courseId === id)

  const handleEnroll = async (courseId) => {
    if (!user) { navigate('/login'); return }
    const tid = toast.loading('Enrolling you...')
    try {
      const { data } = await enrollmentAPI.enroll(courseId)
      setEnrollments(e => [...e, data])
      toast.success('Enrolled successfully! 🎉', { id: tid })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Enrollment failed', { id: tid })
    }
  }

  const stats = [
    { label: 'Courses', value: courses.length, icon: <BookOpen size={18} />, color: 'text-[#714B67]' },
    { label: 'Instructors', value: new Set(courses.map(c => c.instructorId)).size, icon: <GraduationCap size={18} />, color: 'text-[#017E84]' },
    { label: 'Students', value: courses.reduce((s, c) => s + (c._count?.enrollments || 0), 0), icon: <Users size={18} />, color: 'text-amber-500' },
  ]

  return (
    <LearnerLayout noFooter>
      <main className="min-h-screen bg-white">

        {/* === HERO SECTION === */}
        {/* === HERO SECTION === */}
        <section className="relative overflow-hidden bg-white pt-24 pb-20 lg:pt-32 lg:pb-32 selection:bg-[#714B67]/20 border-b border-slate-100">
          {/* Abstract Light Engine */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#714B67]/20 to-[#017E84]/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute top-60 -left-20 w-80 h-80 bg-gradient-to-tr from-[#017E84]/10 to-teal-400/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-white to-transparent opacity-100 z-10" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              
              {/* Text Matrix */}
              <div className="flex-1 max-w-2xl text-center lg:text-left">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white/50 backdrop-blur-md text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] shadow-sm mb-8"
                >
                  <Sparkles size={14} className="text-[#017E84] animate-pulse" /> 
                  Next-Gen Learning Engine
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-black font-sora tracking-tighter text-slate-900 leading-[1.05] mb-6"
                >
                  Architect your <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#017E84] via-teal-500 to-[#714B67] drop-shadow-sm">
                    Evolution.
                  </span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-slate-500 text-lg sm:text-xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10"
                >
                  Master elite protocol architectures. Explore immersive modules, expert curriculum, and secure credentials pushing limits.
                </motion.p>
                
                {/* Search Engine */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="relative max-w-xl mx-auto lg:mx-0 group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#714B67]/20 to-[#017E84]/20 rounded-3xl opacity-0 group-hover:opacity-40 blur-lg transition-all duration-500" />
                  <div className="relative flex items-center h-16 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden focus-within:border-[#017E84]/50 focus-within:shadow-[0_0_20px_rgba(1,126,132,0.1)] transition-all duration-300">
                    <Search className="absolute left-5 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search protocols, courses, modules..." 
                      className="w-full h-full bg-transparent pl-14 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none font-bold text-sm"
                    />
                  </div>
                </motion.div>
                
                {/* Metrics */}
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="mt-12 flex flex-wrap justify-center lg:justify-start gap-8 sm:gap-14"
                >
                  {stats.map((s, i) => (
                    <div key={i} className="flex flex-col items-center lg:items-start gap-1 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-default">
                      <span className="text-4xl font-black text-slate-900 font-sora tracking-tighter drop-shadow-sm">{s.value}<span className="text-[#017E84]">+</span></span>
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center gap-1.5 opacity-80">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Hyper Visual Layer */}
              <motion.div 
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
                className="hidden lg:block relative z-20 group"
              >
                <div className="relative w-[400px] h-[480px] transition-transform duration-700 ease-out hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#714B67] to-[#017E84] rounded-[3rem] blur-2xl opacity-10" />
                  <div className="absolute inset-0 bg-white/70 border-2 border-slate-100/50 rounded-[3rem] shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col p-8 opacity-100">
                    
                    <div className="flex justify-between items-center mb-8">
                       <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                         <Globe size={24} className="text-[#017E84]" />
                       </div>
                       <span className="bg-[#017E84]/10 text-[#017E84] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Active Port</span>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 font-sora tracking-tight mb-2">Initialize Sequence</h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-8">System metrics synchronized</p>
                    
                    {/* Simulated Server Readout */}
                    <div className="space-y-4 mt-auto border-t border-slate-100 pt-6">
                      {[
                        { color: 'text-[#714B67]', bg: 'bg-[#714B67]', border: 'border-[#714B67]' },
                        { color: 'text-teal-500', bg: 'bg-teal-500', border: 'border-teal-500' },
                        { color: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500' }
                      ].map((style, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-xl ${style.bg}/10 flex items-center justify-center`}>
                            <CheckCircle size={12} className={style.color} />
                          </div>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full relative overflow-hidden">
                            <motion.div 
                              className={`absolute top-0 left-0 h-full ${style.bg} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${85 - i * 15}%` }}
                              transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Floating Holographic Badge */}
                  <div className="absolute -right-6 top-58 bg-white border border-slate-100 px-5 py-4 rounded-3xl shadow-xl flex items-center gap-4 backdrop-blur-md animate-float z-30 group-hover:border-[#017E84]/30 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                      <Trophy size={20} className="text-white drop-shadow-sm" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-black text-sm tracking-tight mb-1">Authenticated</p>
                      <p className="text-[9px] text-amber-500 font-black uppercase tracking-[0.2em]">Verified Node</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
            </div>
          </div>
        </section>

        {/* === COURSES SECTION === */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap items-center gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 border ${
                    activeTag === tag
                      ? 'bg-[#714B67] text-white border-[#714B67] shadow-lg shadow-[#714B67]/25'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#714B67]/40 hover:text-[#714B67]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
              <Filter size={14} className="text-[#714B67]" />
              <span className="text-[#714B67] font-black">{filtered.length}</span> courses found
            </div>
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Spinner size="xl" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading courses...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32 border-2 border-dashed border-slate-200 rounded-3xl">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-slate-400 font-sora">No courses found</h3>
              <p className="text-slate-400 text-sm mt-2">Try a different search term or filter</p>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filtered.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    enrollment={getEnrollment(course.id)}
                    onEnroll={handleEnroll}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </main>
    </LearnerLayout>
  )
}

export default CoursesPage
