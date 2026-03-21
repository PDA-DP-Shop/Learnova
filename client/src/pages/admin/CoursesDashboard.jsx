import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Grid, List, Edit2, Share2, Trash2, BookOpen, Users, Clock, Eye, Download } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import SearchInput from '../../components/ui/SearchInput'
import Spinner from '../../components/ui/Spinner'
import { courseAPI } from '../../services/api'
import { exportCSV } from '../../utils/exportCSV'
import toast from 'react-hot-toast'

const CourseCard = ({ course, onEdit, onDelete, onShare, onView, isAdminOnly }) => {
  const totalDuration = course.lessons?.reduce((s, l) => s + (l.duration || 0), 0) || 0
  const hours = Math.floor(totalDuration / 60)
  const mins = totalDuration % 60
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-500/30 transition-all duration-200 group shadow-sm hover:shadow-lg">
      {course.coverImage ? (
        <img src={course.coverImage} alt="" className="w-full h-28 object-cover rounded-lg mb-3 bg-slate-100" />
      ) : (
        <div className="w-full h-28 rounded-lg mb-3 bg-gradient-to-br from-indigo-50 to-violet-50 border border-slate-100 flex items-center justify-center">
          <BookOpen size={28} className="text-indigo-600/20" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{course.title}</h3>
        <Badge variant={course.isPublished ? 'green' : 'slate'} size="xs">
          {course.isPublished ? 'Live' : 'Draft'}
        </Badge>
      </div>
      {course.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {course.tags.slice(0, 3).map((t) => <span key={t} className="tag-chip">{t}</span>)}
        </div>
      )}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1"><BookOpen size={11} />{course._count?.lessons || 0} lessons</span>
        <span className="flex items-center gap-1"><Users size={11} />{course._count?.enrollments || 0}</span>
        {totalDuration > 0 && <span className="flex items-center gap-1"><Clock size={11} />{hours > 0 ? `${hours}h ` : ''}{mins}m</span>}
      </div>
      <div className="flex items-center gap-1 pt-2 border-t border-slate-100">
        {!isAdminOnly ? (
           <Button size="sm" variant="ghost" icon={<Edit2 size={13} />} onClick={() => onEdit(course.id)} className="flex-1">Edit</Button>
        ) : (
           <Button size="sm" variant="ghost" icon={<Eye size={13} />} onClick={() => onView(course.id)} className="flex-1 text-[#017E84]">View</Button>
        )}
        <Button size="sm" variant="ghost" icon={<Share2 size={13} />} onClick={() => onShare(course)} />
        <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => onDelete(course)} className="text-red-500 hover:text-red-600" />
      </div>
    </div>
  )
}

const CoursesDashboard = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('kanban') // 'kanban' | 'list'
  const [search, setSearch] = useState('')
  const [newModal, setNewModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newRewardXP, setNewRewardXP] = useState(500)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    courseAPI.list().then(({ data }) => setCourses(data)).catch(() => toast.error('Failed to load courses')).finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
  const drafts = filtered.filter((c) => !c.isPublished)
  const published = filtered.filter((c) => c.isPublished)

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const { data } = await courseAPI.create({ title: newTitle.trim(), rewardXP: parseInt(newRewardXP) || 500 })
      setNewModal(false)
      setNewTitle('')
      setNewRewardXP(500)
      navigate(`/admin/courses/${data.id}/edit`)
    } catch { toast.error('Failed to create course') } finally { setCreating(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await courseAPI.delete(deleteTarget.id)
      setCourses((c) => c.filter((x) => x.id !== deleteTarget.id))
      toast.success('Course deleted')
    } catch { toast.error('Failed to delete') } finally { setDeleteTarget(null) }
  }

  const handleShare = (course) => {
    const url = `${window.location.origin}/courses/${course.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied!')
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900 font-sora">My Courses</h1>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <SearchInput value={search} onChange={setSearch} placeholder="Search courses..." className="w-full sm:w-64" />
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
              <Button size="sm" variant={view === 'kanban' ? 'primary' : 'ghost'} onClick={() => setView('kanban')} icon={<Grid size={15} />} />
              <Button size="sm" variant={view === 'list' ? 'primary' : 'ghost'} onClick={() => setView('list')} icon={<List size={15} />} />
            </div>
            {user?.role !== 'ADMIN' && (
               <Button onClick={() => setNewModal(true)} icon={<Plus size={16} />}>New</Button>
            )}
            <button
              onClick={() => exportCSV(filtered.map(c => ({
                Title: c.title,
                Instructor: c.instructor?.name || '',
                Tags: (c.tags || []).join('; '),
                Lessons: c._count?.lessons || 0,
                Enrolled: c._count?.enrollments || 0,
                Status: c.isPublished ? 'Published' : 'Draft',
                'Duration (min)': c.lessons?.reduce((s, l) => s + (l.duration || 0), 0) || 0,
              })), 'learnova_courses')}
              className="flex items-center gap-2 h-9 px-4 bg-[#714B67] hover:bg-[#54384c] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
            >
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : view === 'kanban' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest pl-1">Draft <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-1">{drafts.length}</span></h3>
              <div className="space-y-3">
                {drafts.map((c) => (
                    <CourseCard key={c.id} course={c} onEdit={(id) => navigate(`/admin/courses/${id}/edit`)} onView={(id) => navigate(`/courses/${id}`)} isAdminOnly={user?.role === 'ADMIN'} onDelete={setDeleteTarget} onShare={handleShare} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest pl-1">Published <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-1">{published.length}</span></h3>
                <div className="space-y-3">
                  {published.map((c) => (
                    <CourseCard key={c.id} course={c} onEdit={(id) => navigate(`/admin/courses/${id}/edit`)} onView={(id) => navigate(`/courses/${id}`)} isAdminOnly={user?.role === 'ADMIN'} onDelete={setDeleteTarget} onShare={handleShare} />
                  ))}
                </div>
              </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs bg-slate-50/50">
                  <th className="text-left px-4 py-3 font-medium">Course</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Tags</th>
                  <th className="text-center px-4 py-3 font-medium hidden sm:table-cell">Lessons</th>
                  <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">Enrolled</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{c.title}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex gap-1">{c.tags?.slice(0, 2).map((t) => <span key={t} className="tag-chip">{t}</span>)}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400 hidden sm:table-cell">{c._count?.lessons || 0}</td>
                    <td className="px-4 py-3 text-center text-slate-400 hidden lg:table-cell">{c._count?.enrollments || 0}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={c.isPublished ? 'green' : 'slate'}>{c.isPublished ? 'Published' : 'Draft'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {user?.role === 'ADMIN' ? (
                          <Button size="sm" variant="ghost" icon={<Eye size={13} />} onClick={() => navigate(`/courses/${c.id}`)} className="text-[#017E84]" />
                        ) : (
                          <Button size="sm" variant="ghost" icon={<Edit2 size={13} />} onClick={() => navigate(`/admin/courses/${c.id}/edit`)} />
                        )}
                        <Button size="sm" variant="ghost" icon={<Share2 size={13} />} onClick={() => handleShare(c)} />
                        <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => setDeleteTarget(c)} className="text-red-500" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-12 text-slate-500">No courses found</div>}
          </div>
        )}
      </div>

      {/* New Course Modal */}
      <Modal isOpen={newModal} onClose={() => setNewModal(false)} title="New Course">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">Course name</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Introduction to React"
              className="input-base"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setNewModal(false)}>Cancel</Button>
            <Button loading={creating} onClick={handleCreate} disabled={!newTitle.trim()}>Create Course</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Course">
        <p className="text-slate-600 text-sm mb-4">
          Are you sure you want to delete <strong className="text-slate-900">"{deleteTarget?.title}"</strong>? This will also delete all lessons and quizzes.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </AdminLayout>
  )
}

export default CoursesDashboard
