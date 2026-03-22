import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, Users, Plus, GripVertical, Trash2, Edit2, Video, FileText, Image, HelpCircle, ExternalLink, Upload, CheckCircle2, Circle, Clock } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import Button from '../../components/ui/Button'
import Tabs from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import Toggle from '../../components/ui/Toggle'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { courseAPI, lessonAPI, quizAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { formatDuration } from '../../utils/time'
import CourseOptionsTab from '../../components/admin/CourseOptionsTab'

const LESSON_ICONS = { VIDEO: Video, DOCUMENT: FileText, IMAGE: Image, QUIZ: HelpCircle }
const LESSON_CLASSES = { VIDEO: 'lesson-icon-video', DOCUMENT: 'lesson-icon-document', IMAGE: 'lesson-icon-image', QUIZ: 'lesson-icon-quiz' }

const LessonEditorModal = ({ isOpen, onClose, courseId, lesson, quizzes = [], onSaved }) => {
  const [tab, setTab] = useState('content')
  const [form, setForm] = useState({ title: '', type: 'VIDEO', videoUrl: '', duration: '', description: '', allowDownload: false, quizId: '' })
  const [attachUrl, setAttachUrl] = useState('')
  const [attachName, setAttachName] = useState('')
  const [contentFile, setContentFile] = useState(null)
  const [fileDeleted, setFileDeleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localVideoDuration, setLocalVideoDuration] = useState(null) // client-side preview duration

  // Inline quiz state
  const makeBlankQuestion = () => ({
    text: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]
  })
  const [questions, setQuestions] = useState([makeBlankQuestion()])

  useEffect(() => {
    if (lesson) {
      setForm({ 
        title: lesson.title, 
        type: lesson.type, 
        videoUrl: lesson.videoUrl || '', 
        duration: lesson.duration || '', 
        description: lesson.description || '', 
        allowDownload: lesson.allowDownload || false,
        quizId: lesson.quizId || ''
      })
      setFileDeleted(false); setContentFile(null); setLocalVideoDuration(null)
      // Load existing inline quiz questions if editing a QUIZ lesson
      if (lesson.type === 'QUIZ' && lesson.quizId) {
        lessonAPI.getQuiz(lesson.id).then(res => {
          const loaded = res.data.questions
          if (loaded && loaded.length > 0) {
            setQuestions(loaded.map(q => ({
              text: q.text,
              options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
            })))
          } else {
            setQuestions([makeBlankQuestion()])
          }
        }).catch(() => setQuestions([makeBlankQuestion()]))
      } else {
        setQuestions([makeBlankQuestion()])
      }
    } else {
      setForm({ title: '', type: 'VIDEO', videoUrl: '', duration: '', description: '', allowDownload: false, quizId: '' })
      setFileDeleted(false); setContentFile(null); setLocalVideoDuration(null)
      setQuestions([makeBlankQuestion()])
    }
  }, [lesson, isOpen])

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  // Question builder helpers
  const addQuestion = () => setQuestions(q => [...q, makeBlankQuestion()])
  const removeQuestion = (i) => setQuestions(q => q.filter((_, idx) => idx !== i))
  const updateQuestion = (i, text) => setQuestions(q => q.map((q2, idx) => idx === i ? { ...q2, text } : q2))
  const updateOption = (qi, oi, text) => setQuestions(q => q.map((q2, idx) => idx === qi ? {
    ...q2, options: q2.options.map((o, oidx) => oidx === oi ? { ...o, text } : o)
  } : q2))
  const setCorrect = (qi, oi) => setQuestions(q => q.map((q2, idx) => idx === qi ? {
    ...q2, options: q2.options.map((o, oidx) => ({ ...o, isCorrect: oidx === oi }))
  } : q2))

  const handleSave = async () => {
    if (!form.title) return toast.error('Title required')
    if (form.type === 'QUIZ') {
      if (questions.length === 0) return toast.error('Add at least 1 question')
      for (let i = 0; i < questions.length; i++) {
        if (!questions[i].text.trim()) return toast.error(`Question ${i + 1} needs text`)
        if (questions[i].options.some(o => !o.text.trim())) return toast.error(`Question ${i + 1}: all options need text`)
      }
    }
    setSaving(true)
    try {
      const fd = new FormData()
      for (const [k, v] of Object.entries(form)) fd.append(k, v)
      if (form.type === 'QUIZ') fd.append('inlineQuestions', JSON.stringify(questions))
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
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save lesson'
      toast.error(msg)
    } finally { setSaving(false) }
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
            <div className="grid grid-cols-4 gap-2">
              {['VIDEO', 'DOCUMENT', 'IMAGE', 'QUIZ'].map((t) => (
                <button key={t} type="button" onClick={() => set('type')(t)} className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${form.type === t ? 'border-[#714B67] bg-[#714B67]/5 text-[#714B67] shadow-lg shadow-[#714B67]/5' : 'border-slate-100 text-slate-400 hover:border-slate-200 bg-slate-50/50'}`}>
                  <span className={`p-2 rounded-xl mb-1 ${LESSON_CLASSES[t]}`}>{renderTypeIcon(t)}</span>
                  {t === 'QUIZ' ? 'Module Quiz' : (t.charAt(0) + t.slice(1).toLowerCase())}
                </button>
              ))}
            </div>
          </div>
          {form.type === 'VIDEO' && (
            <div className="space-y-4">
              {/* Duration: auto if file selected, manual otherwise */}
              {contentFile ? (
                <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Duration Auto-Detected</p>
                    <p className="text-xs font-bold text-emerald-700">
                      {localVideoDuration != null ? `~${localVideoDuration} min — auto-set on save` : 'Calculating from video...'}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Duration (minutes) <span className="text-slate-300">— or upload video to auto-detect</span></label>
                  <input type="number" value={form.duration} onChange={(e) => set('duration')(e.target.value)} placeholder="30" className="input-base w-32" />
                </div>
              )}
              <div 
                className={`relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all cursor-pointer ${contentFile ? 'border-[#714B67] bg-[#714B67]/5' : 'border-slate-200 hover:border-[#714B67] bg-slate-50'}`}
                onClick={() => document.getElementById('video-file').click()}
              >
                <input 
                  id="video-file" type="file" className="hidden" 
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    setContentFile(file)
                    const url = URL.createObjectURL(file)
                    const vid = document.createElement('video')
                    vid.preload = 'metadata'
                    vid.onloadedmetadata = () => {
                      setLocalVideoDuration(Math.round(vid.duration / 60) || 1)
                      URL.revokeObjectURL(url)
                    }
                    vid.src = url
                  }} 
                />
                <Video size={32} className={`mx-auto mb-3 ${contentFile ? 'text-[#714B67]' : 'text-slate-300'}`} />
                {contentFile ? (
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest leading-tight">{contentFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">{(contentFile.size / (1024*1024)).toFixed(1)} MB</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Select Video Asset</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to upload from device</p>
                  </>
                )}
              </div>
              
              {lesson?.fileUrl && !contentFile && !fileDeleted && (
                <div className="p-4 bg-[#714B67]/5 border border-[#714B67]/20 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#714B67] shadow-sm">
                         <div className="lesson-icon-video p-1.5 rounded-lg"><Video size={14} /></div>
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[10px] font-black text-[#714B67] uppercase tracking-widest leading-none mb-1">Active Video</p>
                         <p className="text-xs font-bold text-slate-500 truncate">{lesson.fileUrl.split('/').pop()}</p>
                      </div>
                   </div>
                   <button onClick={() => setFileDeleted(true)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                   </button>
                </div>
              )}

              <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100">
                <Toggle checked={form.allowDownload} onChange={set('allowDownload')} label="Allow Direct Download" />
              </div>
            </div>
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

              {form.type === 'DOCUMENT' && (
                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100">
                  <Toggle checked={form.allowDownload} onChange={set('allowDownload')} label="Allow Direct Download" />
                </div>
              )}
            </div>
          )}

          {form.type === 'QUIZ' && (
            <div className="space-y-4">
              {/* Info banner */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <HelpCircle size={14} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-0.5">Module Quiz</p>
                  <p className="text-[10px] text-amber-700 font-medium leading-relaxed">These questions appear as a checkpoint at the end of this lesson. Add questions and mark the correct answer for each.</p>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {questions.map((q, qi) => (
                  <div key={qi} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                    {/* Question header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#714B67] uppercase tracking-widest">Question {qi + 1}</span>
                      {questions.length > 1 && (
                        <button type="button" onClick={() => removeQuestion(qi)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    {/* Question text */}
                    <input
                      type="text"
                      placeholder="Type your question here…"
                      value={q.text}
                      onChange={e => updateQuestion(qi, e.target.value)}
                      className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:border-[#714B67] transition-colors"
                    />
                    {/* Options */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Options — click circle to mark correct</p>
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${opt.isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                          <button type="button" onClick={() => setCorrect(qi, oi)} className="shrink-0">
                            {opt.isCorrect
                              ? <CheckCircle2 size={16} className="text-emerald-500" />
                              : <Circle size={16} className="text-slate-300" />}
                          </button>
                          <input
                            type="text"
                            placeholder={`Option ${oi + 1}`}
                            value={opt.text}
                            onChange={e => updateOption(qi, oi, e.target.value)}
                            className="flex-1 text-sm font-medium text-slate-700 bg-transparent outline-none placeholder:text-slate-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add question */}
              <button
                type="button"
                onClick={addQuestion}
                className="w-full py-3 border-2 border-dashed border-[#714B67]/30 hover:border-[#714B67] rounded-2xl text-[10px] font-black text-[#714B67]/60 hover:text-[#714B67] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Plus size={12} /> Add Another Question
              </button>
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
  { id: 'quiz', label: 'Final Assessment' },
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
          title: data.title, description: data.description || '',
          tags: data.tags || [],
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
              className="text-xl font-bold text-slate-900 bg-transparent border-none outline-none focus:ring-0 w-full font-sora p-0"
              placeholder="Course Title…"
            />
            <div className="flex items-center gap-3 mt-0.5">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lessons.length} Modules</span>
               <div className="w-1 h-1 rounded-full bg-slate-300" />
               <div className="flex items-center gap-1">
                  <Clock size={11} className="text-[#017E84]" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{formatDuration(lessons.reduce((s, l) => s + (l.duration || 0), 0))}</span>
               </div>
            </div>
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
          <CourseOptionsTab
            courseData={form}
            courseId={id}
            onChange={(field, value) => setForm(f => ({ ...f, [field]: value }))}
          />
        )}

        {/* FINAL ASSESSMENT TAB */}
        {activeTab === 'quiz' && (
          <div>
            {/* Header */}
            <div className="p-4 bg-[#714B67]/5 border border-[#714B67]/20 rounded-2xl flex items-start gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#714B67]/10 flex items-center justify-center shrink-0">
                <HelpCircle size={18} className="text-[#714B67]" />
              </div>
              <div>
                <p className="text-xs font-black text-[#714B67] uppercase tracking-widest mb-0.5">Final Course Assessment</p>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">These quizzes appear as the <strong>final exam</strong> at the end of the course — separate from per-module quizzes. Learners earn XP rewards upon passing.</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Final Assessments ({quizzes.length})</h3>
              <Button size="sm" icon={<Plus size={14} />} onClick={createQuiz}>Add Assessment</Button>
            </div>
            {quizzes.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl text-slate-500 text-sm bg-white">
                <HelpCircle size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="font-bold">No final assessments yet</p>
                <p className="text-xs text-slate-400 mt-1">Add a course-level quiz for learners to complete at the end.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quizzes.map((q) => (
                  <div key={q.id} className="flex items-center gap-3 p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="lesson-icon-quiz p-1.5 rounded-lg"><HelpCircle size={14} /></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{q.title}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{q.questions?.length || 0} questions · Final Assessment</p>
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
        quizzes={quizzes}
        onSaved={handleLessonSaved}
      />
    </AdminLayout>
  )
}

export default CourseForm
