import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Users, ArrowLeft, Download, Mail, Award, Clock, CheckCircle2, BookOpen, Search, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLayout from '../../components/layout/AdminLayout'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { enrollmentAPI, courseAPI } from '../../services/api'
import { exportCSV } from '../../utils/exportCSV'
import { generateCertificate } from '../../utils/generateCertificate'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  COMPLETED: 'green',
  IN_PROGRESS: 'indigo',
  YET_TO_START: 'slate',
}

const formatTime = (secs) => {
  if (!secs) return '0m'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const CourseAttendees = () => {
  const { id: courseId } = useParams()
  const navigate = useNavigate()
  const [attendees, setAttendees] = useState([])
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    Promise.all([
      enrollmentAPI.getAttendees(courseId),
      courseAPI.get(courseId),
    ])
      .then(([attRes, courseRes]) => {
        setAttendees(attRes.data)
        setCourse(courseRes.data)
      })
      .catch(() => toast.error('Failed to load attendees'))
      .finally(() => setLoading(false))
  }, [courseId])

  const filtered = attendees.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: attendees.length,
    completed: attendees.filter(a => a.status === 'COMPLETED').length,
    inProgress: attendees.filter(a => a.status === 'IN_PROGRESS').length,
    avgProgress: attendees.length ? Math.round(attendees.reduce((s, a) => s + a.progress, 0) / attendees.length) : 0,
  }

  const handleExport = () => {
    exportCSV(filtered.map(a => ({
      Name: a.name,
      Email: a.email,
      Status: a.status,
      'Progress (%)': a.progress,
      'Lessons Completed': a.lessonsCompleted,
      'Total Lessons': a.totalLessons,
      'Time Spent': formatTime(a.timeSpent),
      'Enrolled On': new Date(a.enrolledAt).toLocaleDateString('en-IN'),
      'Completed On': a.completedAt ? new Date(a.completedAt).toLocaleDateString('en-IN') : '',
      'Total XP': a.totalPoints,
    })), `${course?.title || 'course'}_attendees`)
  }

  const handleIssueCertificate = (attendee) => {
    generateCertificate({
      userName: attendee.name,
      courseName: course?.title,
      instructorName: course?.instructor?.name,
      completionDate: attendee.completedAt || new Date().toISOString(),
      isParticipation: attendee.status !== 'COMPLETED',
    })
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto font-inter">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#714B67] hover:border-[#714B67]/30 transition-all shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#017E84]">Course Attendees</p>
            <h1 className="text-2xl font-bold text-slate-900 font-sora">{course?.title || 'Loading...'}</h1>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 h-10 px-5 bg-[#714B67] hover:bg-[#54384c] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Enrolled', value: stats.total, icon: Users, color: 'indigo' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'emerald' },
            { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'amber' },
            { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: BookOpen, color: 'violet' },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-500 mb-3`}>
                <Icon size={18} />
              </div>
              <p className="text-3xl font-black text-slate-900 font-sora">{value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full h-11 pl-9 pr-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#714B67]/10 focus:border-[#714B67]/30 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-11 px-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#714B67]/10 focus:border-[#714B67]/30 transition-all"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="YET_TO_START">Yet to Start</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-32"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-widest bg-slate-50">
                    <th className="text-left px-6 py-4 font-black">Learner</th>
                    <th className="text-center px-4 py-4 font-black">Status</th>
                    <th className="text-center px-4 py-4 font-black hidden md:table-cell">Progress</th>
                    <th className="text-center px-4 py-4 font-black hidden lg:table-cell">Time Spent</th>
                    <th className="text-center px-4 py-4 font-black hidden lg:table-cell">XP</th>
                    <th className="text-center px-4 py-4 font-black hidden sm:table-cell">Enrolled</th>
                    <th className="text-right px-6 py-4 font-black">Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((a, i) => (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                      >
                        {/* Learner */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {a.avatar ? (
                              <img src={a.avatar} alt="" className="w-9 h-9 rounded-[14px] object-cover border border-slate-100" />
                            ) : (
                              <div className="w-9 h-9 rounded-[14px] bg-[#714B67]/10 flex items-center justify-center text-[#714B67] font-black text-sm border border-[#714B67]/10">
                                {a.name[0]?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 leading-none">{a.name}</p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Mail size={10} />{a.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 text-center">
                          <Badge variant={STATUS_COLORS[a.status] || 'slate'}>
                            {a.status?.replace(/_/g, ' ')}
                          </Badge>
                        </td>

                        {/* Progress */}
                        <td className="px-4 py-4 hidden md:table-cell">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#714B67] to-[#017E84] transition-all"
                                style={{ width: `${a.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-black text-slate-500">{a.progress}% · {a.lessonsCompleted}/{a.totalLessons} lessons</span>
                          </div>
                        </td>

                        {/* Time Spent */}
                        <td className="px-4 py-4 text-center hidden lg:table-cell">
                          <span className="flex items-center justify-center gap-1 text-slate-500 font-bold text-xs">
                            <Clock size={12} /> {formatTime(a.timeSpent)}
                          </span>
                        </td>

                        {/* XP */}
                        <td className="px-4 py-4 text-center hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#714B67]/5 border border-[#714B67]/10 rounded-lg text-[#714B67] font-black text-xs">
                            <Award size={11} /> {a.totalPoints}
                          </span>
                        </td>

                        {/* Enrolled Date */}
                        <td className="px-4 py-4 text-center text-slate-400 text-xs font-medium hidden sm:table-cell">
                          {new Date(a.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Certificate */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleIssueCertificate(a)}
                            title={a.status === 'COMPLETED' ? 'Issue Completion Certificate' : 'Issue Participation Certificate'}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 border-[#714B67]/20 text-[#714B67] rounded-xl hover:bg-[#714B67] hover:text-white hover:border-[#714B67] transition-all"
                          >
                            <Download size={11} />
                            {a.status === 'COMPLETED' ? 'Completion' : 'Participation'}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <Users size={40} className="opacity-10 mx-auto mb-3 text-slate-900" />
                        <p className="text-slate-500 font-bold">No attendees found</p>
                        <p className="text-slate-400 text-xs mt-1">Try adjusting your filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default CourseAttendees
