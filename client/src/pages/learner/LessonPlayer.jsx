import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CheckCircle2, BookOpen, Play, FileText, Image, HelpCircle, Paperclip, ExternalLink, Download, PanelLeftClose, PanelLeftOpen, ArrowLeft, CheckCheck } from 'lucide-react'
import { courseAPI, progressAPI, enrollmentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { calcCompletionPercent } from '../../utils/progress'
import Spinner from '../../components/ui/Spinner'
import ProgressBar from '../../components/ui/ProgressBar'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const LESSON_ICONS = { VIDEO: Play, DOCUMENT: FileText, IMAGE: Image, QUIZ: HelpCircle }

function getYoutubeEmbedUrl(url) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  if (url.includes('drive.google.com')) {
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`
  }
  return url
}

const LessonPlayer = () => {
  const { id: courseId, lessonId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [marking, setMarking] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    courseAPI.getDetail(courseId)
      .then(({ data: d }) => setData(d))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [courseId])

  if (loading) return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <Spinner size="xl" />
    </div>
  )
  if (!data) return <div className="text-center py-32 text-slate-500">Not found</div>

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
    if (isDone) return
    setMarking(true)
    try {
      await progressAPI.markComplete(currentLesson.id)
      // Refresh data
      const { data: fresh } = await courseAPI.getDetail(courseId)
      setData(fresh)
      toast.success('Lesson marked complete!')
    } catch { toast.error('Failed to mark complete') } finally { setMarking(false) }
  }

  const handleNext = async () => {
    if (!isDone) await markComplete()
    if (nextLesson) navigate(`/courses/${courseId}/learn/${nextLesson.id}`)
  }

  const handleCompleteCourse = async () => {
    setCompleting(true)
    try {
      await enrollmentAPI.complete(courseId)
      toast.success('🎉 Course completed!')
      navigate(`/courses/${courseId}`)
    } catch { toast.error('Failed to complete course') } finally { setCompleting(false) }
  }

  const embedUrl = currentLesson?.type === 'VIDEO' ? getYoutubeEmbedUrl(currentLesson.videoUrl) : null

  return (
    <div className="flex h-screen bg-navy-900 overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-72 shrink-0 flex flex-col border-r border-white/8 bg-navy-900 overflow-hidden">
          {/* Sidebar Header */}
          <div className="flex items-center gap-2 p-4 border-b border-white/8">
            <button onClick={() => navigate(`/courses/${courseId}`)} className="p-1 rounded hover:bg-white/5 text-slate-400">
              <ArrowLeft size={14} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{course.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{pct}% complete</p>
            </div>
          </div>
          {/* Progress */}
          <div className="px-4 py-2 border-b border-white/8">
            <div className="w-full h-1 bg-navy-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          {/* Lesson List */}
          <div className="flex-1 overflow-y-auto py-2">
            {lessons.map((lesson, i) => {
              const Icon = LESSON_ICONS[lesson.type] || BookOpen
              const isActive = lesson.id === currentLesson?.id
              const done = completedIds.has(lesson.id)
              return (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/courses/${courseId}/learn/${lesson.id}`)}
                  className={`w-full flex items-start gap-2.5 px-4 py-3 text-left hover:bg-white/4 transition-colors group ${isActive ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : ''}`}
                >
                  <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${done ? 'bg-indigo-500 text-white' : isActive ? 'border-2 border-indigo-500 text-indigo-500' : 'border border-white/20 text-slate-600'}`}>
                    {done ? <CheckCircle2 size={12} /> : <span className="text-[10px]">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${isActive ? 'text-indigo-300' : done ? 'text-slate-500' : 'text-slate-300'}`}>{lesson.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Icon size={10} className="text-slate-600" />
                      {lesson.duration && <span className="text-[10px] text-slate-600">{lesson.duration}m</span>}
                    </div>
                    {/* Attachments */}
                    {lesson.attachments?.map((a) => (
                      <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 mt-1 text-[10px] text-indigo-400 hover:text-indigo-300" onClick={(e) => e.stopPropagation()}>
                        <Paperclip size={9} />{a.name}
                      </a>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 shrink-0">
          <button onClick={() => setSidebarOpen((v) => !v)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors">
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-200 truncate">{currentLesson?.title}</h2>
            {currentLesson?.type && (
              <p className="text-xs text-slate-500 capitalize">{currentLesson.type.toLowerCase()}</p>
            )}
          </div>
          {isDone && <span className="flex items-center gap-1 text-xs text-indigo-400"><CheckCircle2 size={13} />Done</span>}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Video Player */}
            {currentLesson?.type === 'VIDEO' && embedUrl && (
              <div className="relative w-full mb-6 rounded-2xl overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={embedUrl}
                  title={currentLesson.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Document */}
            {currentLesson?.type === 'DOCUMENT' && currentLesson.fileUrl && (
              <div className="mb-6 bg-navy-800 border border-white/10 rounded-2xl overflow-hidden">
                <iframe src={currentLesson.fileUrl} className="w-full h-[70vh]" title={currentLesson.title} />
                {currentLesson.allowDownload && (
                  <a href={currentLesson.fileUrl} download className="flex items-center gap-2 px-4 py-3 border-t border-white/8 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Download size={14} />Download
                  </a>
                )}
              </div>
            )}

            {/* Image */}
            {currentLesson?.type === 'IMAGE' && currentLesson.fileUrl && (
              <div className="mb-6 text-center">
                <img src={currentLesson.fileUrl} alt={currentLesson.title} className="max-w-full max-h-[70vh] mx-auto rounded-2xl border border-white/10 object-contain" />
              </div>
            )}

            {/* Quiz placeholder - redirect to QuizPlayer */}
            {currentLesson?.type === 'QUIZ' && (
              <div className="mb-6 text-center py-16 bg-navy-800 border border-white/10 rounded-2xl">
                <HelpCircle size={40} className="text-amber-400 mx-auto mb-3" />
                <p className="text-slate-300 text-sm mb-4">This lesson contains a quiz</p>
                {course.quizzes?.[0] && (
                  <Button onClick={() => navigate(`/courses/${courseId}/quiz/${course.quizzes[0].id}`)}>Take Quiz</Button>
                )}
              </div>
            )}

            {/* Description */}
            {currentLesson?.description && (
              <div className="mb-6 bg-navy-800 border border-white/8 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">About this lesson</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{currentLesson.description}</p>
              </div>
            )}

            {/* Attachments */}
            {currentLesson?.attachments?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Attachments</h3>
                <div className="space-y-2">
                  {currentLesson.attachments.map((a) => (
                    <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-navy-800 border border-white/8 rounded-lg text-sm text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-colors">
                      <ExternalLink size={13} />
                      {a.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="shrink-0 border-t border-white/8 px-4 py-3 flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={<ChevronLeft size={14} />} disabled={!prevLesson} onClick={() => navigate(`/courses/${courseId}/learn/${prevLesson.id}`)}>
            Previous
          </Button>

          <div className="flex-1 text-center text-xs text-slate-500">
            {currentIndex + 1} / {totalLessons}
          </div>

          {!isDone && (
            <Button variant="secondary" size="sm" loading={marking} icon={<CheckCheck size={14} />} onClick={markComplete}>
              Mark Done
            </Button>
          )}

          {allDone && enrollment?.status !== 'COMPLETED' ? (
            <Button size="sm" loading={completing} onClick={handleCompleteCourse}>
              Complete Course 🎉
            </Button>
          ) : nextLesson ? (
            <Button size="sm" iconRight={<ChevronRight size={14} />} onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => navigate(`/courses/${courseId}`)}>
              Back to Course
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

export default LessonPlayer
