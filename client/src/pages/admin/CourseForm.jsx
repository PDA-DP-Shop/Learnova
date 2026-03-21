import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, Users, Plus, GripVertical, Trash2, Edit2, Video, FileText, Image, HelpCircle, ExternalLink, Upload } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import Toggle from '../../components/ui/Toggle'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { courseAPI, lessonAPI, quizAPI } from '../../services/api'
import toast from 'react-hot-toast'

const LESSON_ICONS = { VIDEO: Video, DOCUMENT: FileText, IMAGE: Image, QUIZ: HelpCircle }
const LESSON_CLASSES = { VIDEO: 'lesson-icon-video', DOCUMENT: 'lesson-icon-document', IMAGE: 'lesson-icon-image', QUIZ: 'lesson-icon-quiz' }

const LessonEditorModal = ({ isOpen, onClose, courseId, lesson, onSaved }) => {
  const [tab, setTab] = useState('content')
  const [form, setForm] = useState({ title: '', type: 'VIDEO', videoUrl: '', duration: '', description: '', allowDownload: false })
  const [attachUrl, setAttachUrl] = useState('')
  const [attachName, setAttachName] = useState('')
  const [contentFile, setContentFile] = useState(null)
  const [fileDeleted, setFileDeleted] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (lesson) {
      setForm({ title: lesson.title, type: lesson.type, videoUrl: lesson.videoUrl || '', duration: lesson.duration || '', description: lesson.description || '', allowDownload: lesson.allowDownload || false })
      setFileDeleted(false); setContentFile(null)
    } else {
      setForm({ title: '', type: 'VIDEO', videoUrl: '', duration: '', description: '', allowDownload: false })
      setFileDeleted(false); setContentFile(null)
    }
  }, [lesson, isOpen])

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title) return toast.error('Title required')
    setSaving(true)
    try {
      const fd = new FormData()
      for (const [k, v] of Object.entries(form)) fd.append(k, v)
      if (contentFile) fd.append('file', contentFile)
      if (fileDeleted) fd.append('deleteFile', 'true')
      
      let saved
      if (lesson) {
        const { data } = await lessonAPI.update(lesson.id, fd)
        saved = data
        toast.success('Lesson updated')
      } else {
        const { data } = await lessonAPI.create(courseId, fd)
        saved = data
        toast.success('Lesson created')
      }
      onSaved(saved)
      onClose()
    } catch { toast.error('Failed to save lesson') } finally { setSaving(false) }
  }

  const addAttachment = async () => {
    if (!attachUrl || !attachName) return toast.error('URL and name required')
    try {
      const { data } = await lessonAPI.addAttachment(lesson?.id || '', { type: 'LINK', url: attachUrl, name: attachName })
      toast.success('Attachment added')
      setAttachUrl(''); setAttachName('')
      onSaved({ ...lesson, attachments: [...(lesson?.attachments || []), data] })
    } catch { toast.error('Failed to add attachment') }
  }

  const renderTypeIcon = (type) => { const Icon = LESSON_ICONS[type]; return Icon ? <Icon size={14} /> : null }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lesson ? 'Edit Lesson' : 'Add Lesson'} maxWidth="max-w-xl">
      <Tabs
        tabs={[{ id: 'content', label: 'Content' }, { id: 'description', label: 'Description' }, { id: 'attachments', label: 'Attachments' }]}
        activeTab={tab}
        onChange={setTab}
        className="mb-5 -mt-1"
      />

      {tab === 'content' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Lesson Title</label>
            <input type="text" value={form.title} onChange={(e) => set('title')(e.target.value)} placeholder="e.g. Introduction to React Hooks" className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['VIDEO', 'DOCUMENT', 'IMAGE'].map((t) => (
                <button key={t} type="button" onClick={() => set('type')(t)} className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${form.type === t ? 'border-[#714B67] bg-[#714B67]/5 text-[#714B67] shadow-lg shadow-[#714B67]/5' : 'border-slate-100 text-slate-400 hover:border-slate-200 bg-slate-50/50'}`}>
                  <span className={`p-2 rounded-xl mb-1 ${LESSON_CLASSES[t]}`}>{renderTypeIcon(t)}</span>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          {form.type === 'VIDEO' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Video URL (YouTube / Google Drive)</label>
                <input type="text" value={form.videoUrl} onChange={(e) => set('videoUrl')(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Duration (minutes)</label>
                <input type="number" value={form.duration} onChange={(e) => set('duration')(e.target.value)} placeholder="30" className="input-base w-32" />
              </div>
            </>
          )}
          {(form.type === 'DOCUMENT' || form.type === 'IMAGE') && (
            <div className="space-y-4">
              <div 
                className={`relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all cursor-pointer ${contentFile ? 'border-[#017E84] bg-[#017E84]/5' : 'border-slate-200 hover:border-[#714B67] bg-slate-50'}`}
                onClick={() => document.getElementById('lesson-file').click()}
              >
                <input 
                  id="lesson-file" type="file" className="hidden" 
                  accept={form.type === 'IMAGE' ? 'image/*' : 'application/pdf,.doc,.docx,.txt'}
                  onChange={(e) => setContentFile(e.target.files[0])} 
                />
                <Upload size={32} className={`mx-auto mb-3 ${contentFile ? 'text-[#017E84]' : 'text-slate-300'}`} />
                {contentFile ? (
                  <p className="text-xs font-black text-[#017E84] uppercase tracking-widest">{contentFile.name}</p>
                ) : (
                  <>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Select new {form.type.toLowerCase()}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to browse system storage</p>
                  </>
                )}
              </div>

              {/* Show Existing File if any and no new file selected */}
              {lesson?.fileUrl && !contentFile && !fileDeleted && (
                <div className="p-4 bg-[#017E84]/5 border border-[#017E84]/20 rounded-2xl flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#017E84] shadow-sm shrink-0 border border-slate-100">
                    {form.type === 'IMAGE' ? <Image size={24} /> : <FileText size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-[#017E84] uppercase tracking-widest leading-none mb-1">Active Asset</p>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {lesson.fileUrl.split('/').pop().split('?')[0]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <a 
                      href={lesson.fileUrl} target="_blank" rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-[#017E84] transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button 
                      type="button"
                      onClick={() => setFileDeleted(true)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}

              {fileDeleted && !contentFile && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 border border-rose-100">
                         <Trash2 size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">Marked for Removal</p>
                         <p className="text-xs font-bold text-slate-500">Asset will be purged on save</p>
                      </div>
                   </div>
                   <button onClick={() => setFileDeleted(false)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 px-3 py-1.5 bg-white rounded-lg border border-slate-100 shadow-sm transition-all">Undo</button>
                </div>
              )}

              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100">
                <Toggle checked={form.allowDownload} onChange={set('allowDownload')} label="Allow Direct Download" />
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'description' && (
        <textarea
          value={form.description}
          onChange={(e) => set('description')(e.target.value)}
          rows={8}
          placeholder="Describe what learners will get from this lesson…"
          className="input-base resize-none"
        />
      )}

      {tab === 'attachments' && (
        <div className="space-y-4">
          {lesson?.attachments?.length > 0 && (
            <div className="space-y-2">
              {lesson.attachments.map((a) => (
                <div key={a.id} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <ExternalLink size={13} className="text-slate-400" />
                  <span className="flex-1 text-sm text-slate-600 truncate">{a.name}</span>
                </div>
              ))}
            </div>
          )}
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-slate-500 mb-2">Add external link</p>
            <input type="text" value={attachName} onChange={(e) => setAttachName(e.target.value)} placeholder="Name" className="input-base mb-2" />
            <input type="text" value={attachUrl} onChange={(e) => setAttachUrl(e.target.value)} placeholder="https://..." className="input-base mb-2" />
            <Button size="sm" onClick={addAttachment} disabled={!lesson}>Add Link</Button>
            {!lesson && <p className="text-xs text-slate-500 mt-1">Save the lesson first to add attachments.</p>}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-white/10">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button loading={saving} onClick={handleSave}>Save Lesson</Button>
      </div>
    </Modal>
  )
}

const TABS = [
  { id: 'content', label: 'Content' },
  { id: 'description', label: 'Description' },
  { id: 'options', label: 'Options' },
  { id: 'quiz', label: 'Quizzes' },
]

const CourseForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content')
  const [saving, setSaving] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const [lessonModal, setLessonModal] = useState(false)
  const [editLesson, setEditLesson] = useState(null)
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [form, setForm] = useState({ title: '', description: '', tags: '', website: '', visibility: 'EVERYONE', accessRule: 'OPEN', price: '', rewardXP: 500 })

  useEffect(() => {
    if (!id) return
    courseAPI.get(id)
      .then(({ data }) => {
        setCourse(data)
        setLessons(data.lessons || [])
        setQuizzes(data.quizzes || [])
        setForm({
          title: data.title, description: data.description || '', tags: (data.tags || []).join(', '),
          website: data.website || '', visibility: data.visibility, accessRule: data.accessRule, price: data.price || '',
          rewardXP: data.rewardXP || 500,
        })
      })
      .catch(() => toast.error('Failed to load course'))
      .finally(() => setLoading(false))
  }, [id])

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('tags', JSON.stringify(form.tags.split(',').map((t) => t.trim()).filter(Boolean)));
      fd.append('website', form.website);
      fd.append('visibility', form.visibility);
      fd.append('accessRule', form.accessRule);
      if (form.price) fd.append('price', parseFloat(form.price));
      fd.append('rewardXP', form.rewardXP);
      if (coverFile) fd.append('coverImage', coverFile);

      const { data } = await courseAPI.updateForm(id, fd)
      setCourse(data)
      setCoverFile(null)
      toast.success('Course saved')
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  const handlePublishToggle = async () => {
    try {
      const { data } = await courseAPI.togglePublish(id)
      setCourse((c) => ({ ...c, isPublished: data.isPublished }))
      toast.success(data.isPublished ? 'Course published!' : 'Course unpublished')
    } catch { toast.error('Failed to toggle publish') }
  }

  const handleLessonSaved = (saved) => {
    setLessons((prev) => {
      const idx = prev.findIndex((l) => l.id === saved.id)
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n }
      return [...prev, saved]
    })
  }

  const deleteLesson = async (lessonId) => {
    try {
      await lessonAPI.delete(lessonId)
      setLessons((l) => l.filter((x) => x.id !== lessonId))
      toast.success('Lesson deleted')
    } catch { toast.error('Failed to delete lesson') }
  }

  const createQuiz = async () => {
    const title = prompt('Quiz title:')
    if (!title) return
    try {
      const { data } = await quizAPI.create(id, { title })
      setQuizzes((q) => [...q, data])
      navigate(`/admin/courses/${id}/quiz/${data.id}`)
    } catch { toast.error('Failed to create quiz') }
  }

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><Spinner size="lg" /></div></AdminLayout>

  const LessonIcon = ({ type }) => { const Icon = LESSON_ICONS[type] || FileText; return <Icon size={14} /> }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate('/admin/courses')}>Back</Button>
          <div className="flex-1">
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title')(e.target.value)}
              className="text-xl font-bold text-slate-900 bg-transparent border-none outline-none focus:ring-0 w-full font-sora"
              placeholder="Course Title…"
            />
          </div>
          <div className="flex items-center gap-2">
            <Toggle checked={course?.isPublished} onChange={handlePublishToggle} />
            <span className={`text-xs font-black uppercase tracking-widest ${course?.isPublished ? 'text-emerald-500' : 'text-slate-400'}`}>
              {course?.isPublished ? 'Live' : 'Draft'}
            </span>
            <Button variant="secondary" size="sm" icon={<Eye size={13} />} onClick={() => window.open(`/courses/${id}`, '_blank')}>Preview</Button>
            <Button size="sm" loading={saving} onClick={handleSave}>Save</Button>
          </div>
        </div>

        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

        {/* CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900">Lessons ({lessons.length})</h3>
              <Button size="sm" icon={<Plus size={14} />} onClick={() => { setEditLesson(null); setLessonModal(true) }}>Add Content</Button>
            </div>
            {lessons.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm bg-white shadow-sm">
                No lessons yet. Add your first lesson.
              </div>
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson, i) => {
                  const cls = LESSON_CLASSES[lesson.type] || 'badge-slate'
                  return (
                    <div key={lesson.id} className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 transition-all group shadow-sm">
                      <GripVertical size={14} className="text-slate-600 cursor-grab" />
                      <div className={`p-1.5 rounded-lg ${cls}`}>
                        <LessonIcon type={lesson.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{lesson.title}</p>
                        {lesson.duration && <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{lesson.duration}m</p>}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" icon={<Edit2 size={13} />} onClick={() => { setEditLesson(lesson); setLessonModal(true) }} />
                        <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => deleteLesson(lesson.id)} className="text-red-500 hover:text-red-600" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* DESCRIPTION TAB */}
        {activeTab === 'description' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">Cover Image</label>
              <div className="relative w-full h-48 bg-slate-50 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-indigo-400 focus-within:border-indigo-500 transition-colors flex items-center justify-center group shadow-inner">
                {coverFile ? (
                   <img src={URL.createObjectURL(coverFile)} className="w-full h-full object-cover" alt="Preview" />
                ) : course?.coverImage ? (
                   <img src={course.coverImage} className="w-full h-full object-cover" alt="Current cover" />
                ) : (
                   <div className="text-slate-400 flex flex-col items-center group-hover:text-indigo-500 transition-colors">
                      <Image size={32} className="mb-2 opacity-50 group-hover:opacity-100" />
                      <span className="text-sm font-bold">Click to upload cover</span>
                   </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => { if(e.target.files[0]) setCoverFile(e.target.files[0]) }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">Course Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description')(e.target.value)}
                rows={12}
                placeholder="Write a compelling course description…"
                className="input-base resize-none"
              />
            </div>
          </div>
        )}

        {/* OPTIONS TAB */}
        {activeTab === 'options' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Total Course Reward XP (Completion)</label>
              <input type="number" min="0" step="50" value={form.rewardXP} onChange={(e) => set('rewardXP')(e.target.value)} placeholder="500" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={(e) => set('tags')(e.target.value)} placeholder="React, JavaScript, Frontend" className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Website URL</label>
              <input type="text" value={form.website} onChange={(e) => set('website')(e.target.value)} placeholder="https://..." className="input-base" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">Visibility</label>
              <div className="space-y-2">
                {[{ v: 'EVERYONE', l: '🌍 Everyone — visible to public' }, { v: 'SIGNED_IN', l: '🔒 Signed In — only logged-in users' }].map(({ v, l }) => (
                  <label key={v} className={`radio-card bg-white border-slate-100 ${form.visibility === v ? 'selected border-indigo-500 bg-indigo-50' : ''}`}>
                    <input type="radio" className="sr-only" checked={form.visibility === v} onChange={() => set('visibility')(v)} />
                    <span className={`text-sm font-medium ${form.visibility === v ? 'text-indigo-600' : 'text-slate-600'}`}>{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Access Rule</label>
              <div className="space-y-2">
                {[
                  { v: 'OPEN', l: '🔓 Open — anyone can join' },
                  { v: 'ON_INVITATION', l: '📋 On Invitation — must be added by instructor' },
                  { v: 'ON_PAYMENT', l: '💳 On Payment — purchase required' },
                ].map(({ v, l }) => (
                  <label key={v} className={`radio-card bg-white border-slate-100 ${form.accessRule === v ? 'selected border-indigo-500 bg-indigo-50' : ''}`}>
                    <input type="radio" className="sr-only" checked={form.accessRule === v} onChange={() => set('accessRule')(v)} />
                    <span className={`text-sm font-medium ${form.accessRule === v ? 'text-indigo-600' : 'text-slate-600'}`}>{l}</span>
                  </label>
                ))}
              </div>
            </div>
            {form.accessRule === 'ON_PAYMENT' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Price (INR)</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set('price')(e.target.value)} placeholder="29.99" className="input-base w-40" />
              </div>
            )}
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Quizzes ({quizzes.length})</h3>
              <Button size="sm" icon={<Plus size={14} />} onClick={createQuiz}>Add Quiz</Button>
            </div>
            {quizzes.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-slate-500 text-sm">No quizzes yet.</div>
            ) : (
              <div className="space-y-2">
                {quizzes.map((q) => (
                  <div key={q.id} className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="lesson-icon-quiz p-1.5 rounded-lg"><HelpCircle size={14} /></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{q.title}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{q.questions?.length || 0} questions</p>
                    </div>
                    <Button size="sm" variant="secondary" icon={<Edit2 size={13} />} onClick={() => navigate(`/admin/courses/${id}/quiz/${q.id}`)}>
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <LessonEditorModal
        isOpen={lessonModal}
        onClose={() => { setLessonModal(false); setEditLesson(null) }}
        courseId={id}
        lesson={editLesson}
        onSaved={handleLessonSaved}
      />
    </AdminLayout>
  )
}

export default CourseForm
