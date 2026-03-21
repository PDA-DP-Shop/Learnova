import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock, BookOpen, Play, FileText, Image, HelpCircle, Search, Star, MessageSquare } from 'lucide-react'
import LearnerLayout from '../../components/layout/LearnerLayout'
import Tabs from '../../components/ui/Tabs'
import ProgressBar from '../../components/ui/ProgressBar'
import StarRating from '../../components/ui/StarRating'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import { courseAPI, enrollmentAPI, reviewAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { calcCompletionPercent, formatDate } from '../../utils/progress'
import toast from 'react-hot-toast'

const LESSON_ICONS = { VIDEO: Play, DOCUMENT: FileText, IMAGE: Image, QUIZ: HelpCircle }
const LESSON_ICON_CLASSES = { VIDEO: 'text-violet-400', DOCUMENT: 'text-sky-400', IMAGE: 'text-pink-400', QUIZ: 'text-amber-400' }

const CourseDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [lessonSearch, setLessonSearch] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [reviewModal, setReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 0, text: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    courseAPI.getDetail(id)
      .then(({ data: d }) => setData(d))
      .catch(() => toast.error('Failed to load course'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LearnerLayout><div className="flex justify-center py-32"><Spinner size="lg" /></div></LearnerLayout>
  if (!data) return <LearnerLayout><div className="text-center py-32 text-slate-500">Course not found</div></LearnerLayout>

  const { course, enrollment, lessonProgress } = data
  const completedIds = new Set(lessonProgress?.filter((p) => p.isCompleted).map((p) => p.lessonId))
  const totalLessons = course.lessons?.length || 0
  const completedCount = completedIds.size
  const pct = calcCompletionPercent(completedCount, totalLessons)

  const avgRating = course.reviews?.length
    ? (course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length).toFixed(1)
    : null

  const filteredLessons = course.lessons?.filter((l) =>
    !lessonSearch || l.title.toLowerCase().includes(lessonSearch.toLowerCase())
  )

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return }
    setEnrolling(true)
    try {
      await enrollmentAPI.enroll(id)
      const { data: fresh } = await courseAPI.getDetail(id)
      setData(fresh)
      toast.success('Enrolled!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to enroll')
    } finally { setEnrolling(false) }
  }

  const handleLessonClick = (lesson) => {
    if (!enrollment) { toast('Please enroll first'); return }
    navigate(`/courses/${id}/learn/${lesson.id}`)
  }

  const submitReview = async () => {
    if (!reviewForm.rating) return toast.error('Please select a rating')
    setSubmittingReview(true)
    try {
      const { data: review } = await reviewAPI.create(id, reviewForm)
      setData((d) => ({
        ...d,
        course: { ...d.course, reviews: [review, ...(d.course.reviews?.filter((r) => r.userId !== user.id) || [])] },
      }))
      setReviewModal(false)
      toast.success('Review submitted!')
    } catch { toast.error('Failed to submit review') } finally { setSubmittingReview(false) }
  }

  return (
    <LearnerLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => navigate('/my-courses')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-5 transition-colors">
          <ArrowLeft size={14} /> My Courses
        </button>

        {/* Course Header */}
        <div className="flex flex-col md:flex-row gap-5 mb-6">
          {course.coverImage ? (
            <img src={course.coverImage} alt="" className="w-full md:w-48 h-32 object-cover rounded-xl shrink-0" />
          ) : (
            <div className="w-full md:w-48 h-32 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 flex items-center justify-center shrink-0">
              <BookOpen size={28} className="text-indigo-400/40" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap gap-1 mb-2">
              {course.tags?.map((t) => <span key={t} className="tag-chip">{t}</span>)}
            </div>
            <h1 className="text-xl font-bold text-slate-100 font-sora mb-1">{course.title}</h1>
            <p className="text-sm text-slate-500 mb-3">by {course.instructor?.name}</p>
            {enrollment ? (
              <ProgressBar value={pct} size="md" />
            ) : (
              <Button loading={enrolling} onClick={handleEnroll} size="md">
                {course.accessRule === 'ON_PAYMENT' ? `Buy – $${course.price}` : 'Enroll Free'}
              </Button>
            )}
          </div>
        </div>

        <Tabs
          tabs={[{ id: 'overview', label: 'Overview' }, { id: 'reviews', label: `Reviews (${course.reviews?.length || 0})` }]}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Total', value: totalLessons, icon: BookOpen },
                { label: 'Completed', value: completedCount, icon: CheckCircle2 },
                { label: 'Remaining', value: totalLessons - completedCount, icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-navy-800 border border-white/8 rounded-xl p-3 text-center">
                  <Icon size={16} className="text-indigo-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-slate-100 font-sora">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Lesson search */}
            <div className="flex items-center gap-2 mb-4">
              <Search size={14} className="text-slate-500" />
              <input
                type="text"
                value={lessonSearch}
                onChange={(e) => setLessonSearch(e.target.value)}
                placeholder="Search lessons…"
                className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none flex-1"
              />
            </div>

            {/* Lesson List */}
            <div className="space-y-2">
              {filteredLessons?.map((lesson, i) => {
                const Icon = LESSON_ICONS[lesson.type] || BookOpen
                const iconClass = LESSON_ICON_CLASSES[lesson.type] || 'text-slate-400'
                const done = completedIds.has(lesson.id)
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    className="w-full flex items-center gap-3 p-3.5 bg-navy-800 border border-white/8 rounded-xl hover:border-indigo-500/30 text-left transition-all duration-150 group"
                  >
                    <span className="text-xs text-slate-600 w-5 shrink-0">{i + 1}</span>
                    <div className={`p-1.5 rounded-lg bg-navy-700/50 ${iconClass}`}>
                      <Icon size={14} />
                    </div>
                    <span className={`flex-1 text-sm ${done ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{lesson.title}</span>
                    {lesson.duration && <span className="text-xs text-slate-600 shrink-0">{lesson.duration}m</span>}
                    {done && <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />}
                  </button>
                )
              })}
              {!filteredLessons?.length && <p className="text-center text-slate-500 py-8 text-sm">No lessons found</p>}
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div>
            {/* Rating Summary */}
            {avgRating && (
              <div className="flex items-center gap-4 mb-6 p-4 bg-navy-800 border border-white/8 rounded-xl">
                <div className="text-center">
                  <p className="text-4xl font-bold text-amber-400 font-sora">{avgRating}</p>
                  <StarRating value={parseFloat(avgRating)} readonly size={16} className="mt-1" />
                  <p className="text-xs text-slate-500 mt-1">{course.reviews?.length} review{course.reviews?.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )}

            {enrollment && (
              <div className="mb-4">
                <Button size="sm" icon={<MessageSquare size={13} />} onClick={() => setReviewModal(true)}>
                  Write a Review
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {course.reviews?.map((review) => (
                <div key={review.id} className="p-4 bg-navy-800 border border-white/8 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-semibold text-indigo-400">
                      {review.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{review.user?.name}</p>
                      <StarRating value={review.rating} readonly size={12} />
                    </div>
                    <span className="ml-auto text-xs text-slate-500">{formatDate(review.createdAt)}</span>
                  </div>
                  {review.text && <p className="text-sm text-slate-400">{review.text}</p>}
                </div>
              ))}
              {!course.reviews?.length && <p className="text-center text-slate-500 py-8 text-sm">No reviews yet. Be the first!</p>}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Write a Review">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2">Rating</label>
            <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))} size={28} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Your thoughts (optional)</label>
            <textarea
              value={reviewForm.text}
              onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
              rows={4}
              placeholder="Share your experience…"
              className="input-base resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setReviewModal(false)}>Cancel</Button>
            <Button loading={submittingReview} onClick={submitReview}>Submit Review</Button>
          </div>
        </div>
      </Modal>
    </LearnerLayout>
  )
}

export default CourseDetail
