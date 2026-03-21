import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, Star, Tag, Play, Lock, ShoppingCart } from 'lucide-react'
import LearnerLayout from '../../components/layout/LearnerLayout'
import SearchInput from '../../components/ui/SearchInput'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { courseAPI, enrollmentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const CourseCard = ({ course, enrollment, onEnroll }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const avgRating = course.reviews?.length ? (course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length).toFixed(1) : null

  const getButtonState = () => {
    if (!user) return { label: 'Get Started', variant: 'primary', action: () => navigate('/register') }
    if (course.accessRule === 'ON_PAYMENT' && !enrollment) return { label: `Buy — $${course.price}`, variant: 'amber', action: () => toast('Payments coming soon!') }
    if (!enrollment) return { label: 'Enroll Free', variant: 'primary', action: () => onEnroll(course.id) }
    if (enrollment.status === 'YET_TO_START') return { label: 'Start Learning', variant: 'primary', action: () => navigate(`/courses/${course.id}`) }
    if (enrollment.status === 'IN_PROGRESS') return { label: 'Continue', variant: 'secondary', action: () => navigate(`/courses/${course.id}`) }
    return { label: 'Review Course', variant: 'ghost', action: () => navigate(`/courses/${course.id}`) }
  }

  const btn = getButtonState()

  return (
    <div className="bg-navy-800 border border-white/8 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 hover:shadow-card-hover group flex flex-col">
      {/* Cover */}
      {course.coverImage ? (
        <img src={course.coverImage} alt={course.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-navy-800 flex items-center justify-center">
          <BookOpen size={36} className="text-indigo-400/40" />
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Tags */}
        {course.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {course.tags.slice(0, 2).map((t) => <span key={t} className="tag-chip text-[10px]">{t}</span>)}
          </div>
        )}

        <h3 className="font-semibold text-slate-100 mb-1.5 line-clamp-2 text-sm leading-snug">{course.title}</h3>

        {course.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{course.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 mt-auto">
          <span className="flex items-center gap-1"><BookOpen size={11} />{course._count?.lessons || 0} lessons</span>
          <span className="flex items-center gap-1"><Users size={11} />{course._count?.enrollments || 0}</span>
          {avgRating && <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" />{avgRating}</span>}
        </div>

        <button
          onClick={btn.action}
          className={`w-full py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
            btn.variant === 'primary' ? 'bg-indigo-500 hover:bg-indigo-600 text-white' :
            btn.variant === 'secondary' ? 'bg-navy-700 hover:bg-navy-600 text-slate-200 border border-white/10' :
            btn.variant === 'amber' ? 'bg-amber-500 hover:bg-amber-600 text-white' :
            'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          {btn.label}
        </button>
      </div>
    </div>
  )
}

const CoursesPage = () => {
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    courseAPI.listPublic().then(({ data }) => setCourses(data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (user) enrollmentAPI.myEnrollments().then(({ data }) => setEnrollments(data)).catch(() => {})
  }, [user])

  const filtered = courses.filter((c) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  )

  const getEnrollment = (courseId) => enrollments.find((e) => e.courseId === courseId)

  const handleEnroll = async (courseId) => {
    if (!user) { toast.error('Please sign in to enroll'); return }
    try {
      const { data } = await enrollmentAPI.enroll(courseId)
      setEnrollments((e) => [...e, data])
      toast.success('Enrolled successfully!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to enroll')
    }
  }

  return (
    <LearnerLayout>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/8 py-12 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-60 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 font-sora mb-3">
            Explore Courses
          </h1>
          <p className="text-slate-400 mb-6">Learn new skills with expert-led courses. Free and paid options available.</p>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by title or tag…" className="max-w-md mx-auto" />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            {search ? 'No courses match your search' : 'No courses available yet'}
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">{filtered.length} course{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} enrollment={getEnrollment(course.id)} onEnroll={handleEnroll} />
              ))}
            </div>
          </>
        )}
      </div>
    </LearnerLayout>
  )
}

export default CoursesPage
