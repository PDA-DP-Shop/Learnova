import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Award } from 'lucide-react'
import LearnerLayout from '../../components/layout/LearnerLayout'
import ProgressBar from '../../components/ui/ProgressBar'
import Spinner from '../../components/ui/Spinner'
import { enrollmentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { getBadge, BADGE_LEVELS, getProgressToNextBadge } from '../../utils/badge'
import { calcCompletionPercent, formatDate } from '../../utils/progress'
import toast from 'react-hot-toast'

const MyCourses = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    enrollmentAPI.myEnrollments()
      .then(({ data }) => setEnrollments(data))
      .catch(() => toast.error('Failed to load enrollments'))
      .finally(() => setLoading(false))
  }, [])

  const badge = getBadge(user?.totalPoints || 0)
  const nextProgress = getProgressToNextBadge(user?.totalPoints || 0)

  return (
    <LearnerLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Profile Panel */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-navy-800 border border-white/10 rounded-2xl p-5 sticky top-20">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-5 pb-5 border-b border-white/8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-400 mb-3 font-sora">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <h2 className="font-bold text-slate-100 font-sora">{user?.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              </div>

              {/* Badge */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Current Badge</span>
                  <span className="text-xs text-slate-500">{user?.totalPoints || 0} pts</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-navy-900/50">
                  <span className="text-2xl">{badge.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: badge.color }}>{badge.name}</p>
                    {badge.next && <p className="text-xs text-slate-500">{badge.next - (user?.totalPoints || 0)} pts to next</p>}
                  </div>
                </div>
                {badge.next && (
                  <div className="mt-2">
                    <ProgressBar value={nextProgress} showLabel={false} size="sm" />
                  </div>
                )}
              </div>

              {/* Badge Levels */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-2">Badge Levels</p>
                <div className="space-y-1.5">
                  {BADGE_LEVELS.map((b) => {
                    const unlocked = (user?.totalPoints || 0) >= b.threshold
                    return (
                      <div key={b.name} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${unlocked ? 'opacity-100' : 'opacity-40'}`}>
                        <span className="text-sm">{b.emoji}</span>
                        <span className="text-xs text-slate-300 flex-1">{b.name}</span>
                        <span className="text-xs text-slate-500">{b.threshold}</span>
                        {unlocked && <Award size={10} style={{ color: b.color }} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Courses Grid */}
          <main className="flex-1">
            <h1 className="text-xl font-bold text-slate-100 font-sora mb-5">My Learning</h1>
            {loading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                <BookOpen size={36} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-2">No courses yet</p>
                <button onClick={() => navigate('/courses')} className="text-indigo-400 text-sm hover:text-indigo-300">Browse courses →</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {enrollments.map((enrollment) => {
                  const pct = calcCompletionPercent(enrollment.completedLessons, enrollment.totalLessons)
                  return (
                    <div
                      key={enrollment.id}
                      onClick={() => navigate(`/courses/${enrollment.courseId}`)}
                      className="bg-navy-800 border border-white/8 rounded-2xl overflow-hidden hover:border-indigo-500/30 cursor-pointer transition-all duration-200 hover:shadow-card-hover"
                    >
                      {enrollment.course.coverImage ? (
                        <img src={enrollment.course.coverImage} alt="" className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 flex items-center justify-center">
                          <BookOpen size={28} className="text-indigo-400/40" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-slate-100 mb-1 line-clamp-2">{enrollment.course.title}</h3>
                        <p className="text-xs text-slate-500 mb-3">by {enrollment.course.instructor?.name}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>{enrollment.completedLessons}/{enrollment.totalLessons} lessons</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-navy-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        {enrollment.status === 'COMPLETED' && (
                          <span className="inline-block mt-2 text-xs text-emerald-400 font-medium">✓ Completed</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </LearnerLayout>
  )
}

export default MyCourses
