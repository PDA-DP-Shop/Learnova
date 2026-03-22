import { useState, useEffect } from 'react'
import { UserPlus, Mail, CheckCircle, X, Loader2, Users, Send, Trash2 } from 'lucide-react'
import { enrollmentAPI } from '../../services/api'
import toast from 'react-hot-toast'

const visibilityOptions = [
  { value: 'EVERYONE',  emoji: '🌍', label: 'Everyone',  description: 'visible to public' },
  { value: 'SIGNED_IN', emoji: '🔒', label: 'Signed In', description: 'only logged-in users' },
]

const accessOptions = [
  { value: 'OPEN',          emoji: '🔓', label: 'Open',          description: 'anyone can join' },
  { value: 'ON_INVITATION', emoji: '📋', label: 'On Invitation',  description: 'must be added by instructor' },
  { value: 'ON_PAYMENT',    emoji: '💳', label: 'On Payment',     description: 'purchase required' },
]

export default function CourseOptionsTab({ courseData, courseId, onChange }) {
  const [tagInput, setTagInput] = useState(
    Array.isArray(courseData.tags) ? courseData.tags.join(', ') : courseData.tags || ''
  )

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [invited, setInvited] = useState([]) // All invited/enrolled users
  const [loadingInvited, setLoadingInvited] = useState(false)

  useEffect(() => {
    if (courseId && courseData.accessRule === 'ON_INVITATION') {
      fetchInvitedUsers()
    }
  }, [courseId, courseData.accessRule])

  const fetchInvitedUsers = async () => {
    setLoadingInvited(true)
    try {
      const { data } = await enrollmentAPI.getAttendees(courseId)
      // Normalize data to have userId consistently
      setInvited(data.map(u => ({
        userId: u.userId,
        name: u.name,
        email: u.email,
        avatar: u.avatar
      })))
    } catch (err) {
      console.error('Failed to fetch invited users', err)
    } finally {
      setLoadingInvited(false)
    }
  }

  const handleTagBlur = () => {
    const tagsArray = tagInput.split(',').map(t => t.trim()).filter(Boolean)
    onChange('tags', tagsArray)
  }

  const handleInvite = async () => {
    const email = inviteEmail.trim()
    if (!email) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }
    if (!courseId) {
      toast.error('Save the course first before inviting learners')
      return
    }

    setInviting(true)
    try {
      const { data } = await enrollmentAPI.invite(courseId, email)
      const newUser = {
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
      }
      setInvited(prev => [newUser, ...prev])
      setInviteEmail('')
      toast.success(data.message || `${email} enrolled successfully!`)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to invite learner'
      toast.error(msg)
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from this course?`)) return
    
    try {
      await enrollmentAPI.uninvite(courseId, userId)
      setInvited(prev => prev.filter(u => u.userId !== userId))
      toast.success(`${name} removed from course`)
    } catch (err) {
      toast.error('Failed to remove user')
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-2 space-y-10">

      {/* ── Tags ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onBlur={handleTagBlur}
          placeholder="React, JavaScript, Frontend"
          className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#714B67]/40 focus:border-transparent transition-all duration-200 shadow-sm"
        />
      </div>

      {/* ── Visibility ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
          Visibility
        </label>
        <div className="space-y-3">
          {visibilityOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('visibility', opt.value)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                courseData.visibility === opt.value
                  ? 'border-[#714B67] bg-[#714B67]/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className={`text-sm font-semibold ${courseData.visibility === opt.value ? 'text-[#714B67]' : 'text-gray-700'}`}>
                {opt.label}
                <span className={`font-normal ml-1 ${courseData.visibility === opt.value ? 'text-[#714B67]/70' : 'text-gray-500'}`}>
                  — {opt.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Access Rule ── */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
          Access Rule
        </label>
        <div className="space-y-3">
          {accessOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('accessRule', opt.value)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                courseData.accessRule === opt.value
                  ? 'border-[#714B67] bg-[#714B67]/5 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className={`text-sm font-semibold ${courseData.accessRule === opt.value ? 'text-[#714B67]' : 'text-gray-700'}`}>
                {opt.label}
                <span className={`font-normal ml-1 ${courseData.accessRule === opt.value ? 'text-[#714B67]/70' : 'text-gray-500'}`}>
                  — {opt.description}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* ─ Price field — ON_PAYMENT ─ */}
        {courseData.accessRule === 'ON_PAYMENT' && (
          <div className="mt-5 animate-fade-in">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Course Price (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">₹</span>
              <input
                type="number"
                min="0"
                value={courseData.price || ''}
                onChange={e => onChange('price', parseFloat(e.target.value) || 0)}
                placeholder="999"
                className="w-full pl-8 pr-5 py-4 rounded-2xl border-2 border-[#714B67]/20 bg-white text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 focus:border-transparent transition-all duration-200 shadow-sm"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              💡 Learners must pay this amount before accessing lessons.
            </p>
          </div>
        )}
      </div>

      {/* ── Invite Learners — ON_INVITATION ── */}
      {courseData.accessRule === 'ON_INVITATION' && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-xl bg-[#714B67]/10 flex items-center justify-center">
              <UserPlus size={14} className="text-[#714B67]" />
            </div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Invite Learners by Email
            </label>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 bg-[#714B67]/5 border border-[#714B67]/15 rounded-2xl mb-5">
            <Users size={16} className="text-[#714B67] mt-0.5 shrink-0" />
            <p className="text-xs text-[#714B67]/80 font-medium leading-relaxed">
              This course requires an invitation. Enter a learner's registered email address below
              to enroll them directly — they will get immediate access to all lessons.
            </p>
          </div>

          {/* Email input + send button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                placeholder="learner@example.com"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 focus:border-[#714B67]/40 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="flex items-center gap-2 px-5 py-3.5 bg-[#714B67] hover:bg-[#54384c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition-all shadow-sm whitespace-nowrap"
            >
              {inviting ? (
                <><Loader2 size={14} className="animate-spin" /> Inviting…</>
              ) : (
                <><Send size={14} /> Invite</>
              )}
            </button>
          </div>

          {/* Invited Users List */}
          <div className="mt-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
              Invited Learners ({invited.length})
            </p>
            
            {loadingInvited ? (
              <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-[#714B67]" /></div>
            ) : invited.length > 0 ? (
              <div className="space-y-2">
                {invited.map((u) => (
                  <div key={u.userId} className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm group">
                    {u.avatar ? (
                      <img src={u.avatar} className="w-8 h-8 rounded-xl object-cover" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[#714B67] font-black text-sm">
                        {(u.name || u.email || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <button 
                      onClick={() => handleRemove(u.userId, u.name)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Remove user"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-3xl">
                <p className="text-xs text-gray-400">No learners invited yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
