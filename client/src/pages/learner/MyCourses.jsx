import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Zap, Target, Trophy, Search, PlayCircle,
  ChevronRight, Clock, CheckCircle, TrendingUp, Award
} from 'lucide-react'
import LearnerLayout from '../../components/layout/LearnerLayout'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { enrollmentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { getBadge, BADGE_LEVELS, getProgressToNextBadge } from '../../utils/badge'
import { calcCompletionPercent, formatDate } from '../../utils/progress'
import toast from 'react-hot-toast'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }
}

const MyCourses = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    enrollmentAPI.myEnrollments()
      .then(({ data }) => setEnrollments(data))
      .catch(() => toast.error('Failed to load enrollments'))
      .finally(() => setLoading(false))
  }, [])

  const badge = getBadge(user?.totalPoints || 0)
  const nextProgress = getProgressToNextBadge(user?.totalPoints || 0)
  const filtered = enrollments.filter(e => e.course.title.toLowerCase().includes(search.toLowerCase()))
  const completed = enrollments.filter(e => e.status === 'COMPLETED').length
  const inProgress = enrollments.filter(e => e.status === 'IN_PROGRESS').length

  return (
    <LearnerLayout noFooter>
      <main className="min-h-screen bg-slate-50">

        {/* Page Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-sora tracking-tight">
                  My Learning
                </h1>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  {enrollments.length} enrolled · {completed} completed · {inProgress} in progress
                </p>
              </div>
              <Button onClick={() => navigate('/courses')} className="btn-shine">
                <BookOpen size={14} />
                Browse Courses
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col xl:flex-row gap-8 items-start">

            {/* === LEFT SIDEBAR — Profile Card === */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="xl:w-72 w-full shrink-0 space-y-4"
            >
              {/* Profile Card */}
              <div className="bg-[#714B67] rounded-2xl overflow-hidden shadow-xl shadow-[#714B67]/20 text-white relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#017E84]/25 rounded-full -ml-8 -mb-8 blur-2xl" />

                {/* Profile Header */}
                <div className="relative z-10 p-6 pb-4 text-center border-b border-white/10">
                  <div className="relative inline-block mb-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-3xl font-black text-[#714B67] shadow-xl shadow-black/20 mx-auto"
                    >
                      {user?.name?.[0]?.toUpperCase()}
                    </motion.div>
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl bg-[#017E84] border-[3px] border-[#714B67] flex items-center justify-center shadow-lg">
                      <Zap size={12} fill="white" className="text-white" />
                    </div>
                  </div>
                  <h2 className="text-lg font-black text-white font-sora leading-tight">{user?.name}</h2>
                  <p className="text-[10px] text-white/50 font-black uppercase tracking-widest mt-1">
                    {badge.emoji} {badge.name}
                  </p>
                </div>

                {/* Stats */}
                <div className="relative z-10 p-6 pt-5">
                  <div className="flex justify-around mb-5">
                    <div className="text-center">
                      <p className="text-2xl font-black text-white font-sora">{user?.totalPoints || 0}</p>
                      <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mt-0.5">XP Earned</p>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div className="text-center">
                      <p className="text-2xl font-black text-white font-sora">{enrollments.length}</p>
                      <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mt-0.5">Courses</p>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div className="text-center">
                      <p className="text-2xl font-black text-white font-sora">{completed}</p>
                      <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mt-0.5">Done</p>
                    </div>
                  </div>

                  {/* XP Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">Next Level</span>
                      <span className="text-[10px] font-black bg-white text-[#714B67] px-2 py-0.5 rounded-full">
                        {badge.next ? badge.next - (user?.totalPoints || 0) : 0} XP
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${nextProgress}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                  </div>

                  {/* Badge Grid */}
                  <div className="mt-5 grid grid-cols-5 gap-1.5">
                    {BADGE_LEVELS.map(b => {
                      const unlocked = (user?.totalPoints || 0) >= b.threshold
                      return (
                        <div
                          key={b.name}
                          title={b.name}
                          className={`aspect-square rounded-xl flex items-center justify-center text-base transition-all ${
                            unlocked
                              ? 'bg-white/15 border border-white/20'
                              : 'bg-white/5 opacity-30 grayscale filter'
                          }`}
                        >
                          {b.emoji}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Weekly Goal Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                    <Target size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Weekly Goal</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stay on track</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Complete 2 modules this week to earn +200 XP and maintain your streak! 🔥
                </p>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <div className="flex gap-1">
                    {[1,2].map(i => (
                      <div key={i} className={`w-6 h-6 rounded-lg border ${
                        i === 1 ? 'bg-[#017E84] border-[#017E84]' : 'border-slate-200 bg-white'
                      } flex items-center justify-center`}>
                        {i === 1 && <CheckCircle size={12} className="text-white fill-white" />}
                      </div>
                    ))}
                  </div>
                  <span className="text-slate-400">1/2 Done</span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'In Progress', value: inProgress, icon: <TrendingUp size={16}/>, color: 'text-[#714B67]', bg: 'bg-[#714B67]/8' },
                  { label: 'Completed', value: completed, icon: <Award size={16}/>, color: 'text-[#017E84]', bg: 'bg-[#017E84]/8' },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center ${s.color} mb-3`}>
                      {s.icon}
                    </div>
                    <p className={`text-xl font-black font-sora ${s.color}`}>{s.value}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.aside>

            {/* === MAIN CONTENT === */}
            <div className="flex-1 space-y-6 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-1 group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#714B67] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search your courses..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full h-12 bg-white border-2 border-slate-200 rounded-xl pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#714B67] focus:shadow-[0_0_0_4px_rgba(113,75,103,0.08)] transition-all"
                  />
                </div>
              </div>

              {/* Course Grid */}
              {loading ? (
                <div className="flex flex-col items-center py-24 gap-4">
                  <Spinner size="xl" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading...</p>
                </div>
              ) : filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center py-24 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#714B67]/8 flex items-center justify-center text-[#714B67] mb-4">
                    <BookOpen size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-700 font-sora tracking-tight">No courses yet</h3>
                  <p className="text-slate-400 text-sm mt-2 mb-6">
                    {search ? 'No results for your search.' : 'Start learning something amazing today.'}
                  </p>
                  <Button onClick={() => navigate('/courses')}>
                    Browse Courses
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {filtered.map(en => {
                    const pct = calcCompletionPercent(en.completedLessons, en.totalLessons)
                    const isDone = en.status === 'COMPLETED'
                    const isStarted = en.status === 'IN_PROGRESS'
                    return (
                      <motion.div
                        key={en.id}
                        variants={item}
                        onClick={() => navigate(`/courses/${en.courseId}`)}
                        className="group bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:border-[#714B67]/30 hover:shadow-lg hover:shadow-[#714B67]/8 transition-all duration-300"
                      >
                        {/* Course Thumbnail */}
                        <div className="relative h-36 overflow-hidden">
                          {en.course.coverImage ? (
                            <img
                              src={en.course.coverImage}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              alt=""
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#714B67]/15 via-[#714B67]/8 to-[#017E84]/15 flex items-center justify-center">
                              <BookOpen size={36} className="text-[#714B67]/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                          {/* Status Badge */}
                          <div className="absolute top-3 left-3">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                              isDone
                                ? 'bg-[#017E84] text-white'
                                : isStarted
                                ? 'bg-[#714B67] text-white'
                                : 'bg-white/90 text-slate-700'
                            }`}>
                              {isDone ? '✓ Completed' : isStarted ? '▶ In Progress' : 'Not Started'}
                            </span>
                          </div>

                          {/* Hover Play */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-12 h-12 rounded-full bg-[#714B67] shadow-xl shadow-[#714B67]/40 flex items-center justify-center">
                              <PlayCircle size={20} className="text-white fill-white" />
                            </div>
                          </div>
                        </div>

                        {/* Course Info */}
                        <div className="p-5">
                          <h3 className="font-black text-slate-900 font-sora text-base leading-tight mb-1 group-hover:text-[#714B67] transition-colors line-clamp-1">
                            {en.course.title}
                          </h3>
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {en.course.instructor?.name}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                              <Clock size={10} />
                              {formatDate(en.updatedAt)}
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                {en.completedLessons}/{en.totalLessons} lessons
                              </span>
                              <span className="text-sm font-black text-slate-900 font-sora">{pct}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8 }}
                                className={`h-full rounded-full ${
                                  isDone ? 'bg-[#017E84]' : 'bg-[#714B67]'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Action */}
                          <div className="mt-4 flex items-center justify-between">
                            <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all group-hover:gap-2 ${
                              isDone ? 'text-[#017E84]' : 'text-[#714B67]'
                            }`}>
                              {isDone ? 'Review course' : 'Continue learning'}
                              <ChevronRight size={12} />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </LearnerLayout>
  )
}

export default MyCourses
