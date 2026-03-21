import { useState } from 'react'

const visibilityOptions = [
  { value: 'EVERYONE',  emoji: '🌍', label: 'Everyone',  description: 'visible to public' },
  { value: 'SIGNED_IN', emoji: '🔒', label: 'Signed In', description: 'only logged-in users' },
]

const accessOptions = [
  { value: 'OPEN',          emoji: '🔓', label: 'Open',          description: 'anyone can join' },
  { value: 'ON_INVITATION', emoji: '📋', label: 'On Invitation',  description: 'must be added by instructor' },
  { value: 'ON_PAYMENT',    emoji: '💳', label: 'On Payment',     description: 'purchase required' },
]

export default function CourseOptionsTab({ courseData, onChange }) {
  const [tagInput, setTagInput] = useState(
    Array.isArray(courseData.tags) ? courseData.tags.join(', ') : courseData.tags || ''
  )

  const handleTagBlur = () => {
    const tagsArray = tagInput.split(',').map(t => t.trim()).filter(Boolean)
    onChange('tags', tagsArray)
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

        {/* Price field — slide in when ON_PAYMENT selected */}
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

    </div>
  )
}
