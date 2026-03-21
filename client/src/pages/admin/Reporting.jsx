import { useState, useEffect } from 'react'
import { Download, Filter, SlidersHorizontal, X } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import Badge from '../../components/ui/Badge'
import SearchInput from '../../components/ui/SearchInput'
import Spinner from '../../components/ui/Spinner'
import { reportingAPI } from '../../services/api'
import { formatDate, getStatusColor, getStatusLabel } from '../../utils/progress'
import toast from 'react-hot-toast'

const ALL_COLUMNS = [
  { id: 'srNo', label: 'Sr No', default: true },
  { id: 'course', label: 'Course Name', default: true },
  { id: 'participant', label: 'Participant', default: true },
  { id: 'enrolledDate', label: 'Enrolled Date', default: true },
  { id: 'startDate', label: 'Start Date', default: true },
  { id: 'timeSpent', label: 'Time Spent', default: false },
  { id: 'completion', label: 'Completion %', default: true },
  { id: 'completedDate', label: 'Completed Date', default: false },
  { id: 'status', label: 'Status', default: true },
]

const Reporting = () => {
  const [data, setData] = useState({ enrollments: [], stats: { total: 0, yetToStart: 0, inProgress: 0, completed: 0 } })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS.filter((c) => c.default).map((c) => c.id))
  const [panelOpen, setPanelOpen] = useState(false)

  const load = (status) => {
    setLoading(true)
    reportingAPI.get(status ? { status } : {})
      .then(({ data: d }) => setData(d))
      .catch(() => toast.error('Failed to load reporting data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(statusFilter) }, [statusFilter])

  const filtered = data.enrollments.filter((e) => {
    const q = search.toLowerCase()
    return !q || e.user?.name?.toLowerCase().includes(q) || e.course?.title?.toLowerCase().includes(q)
  })

  const stats = [
    { key: null, label: 'Total', count: data.stats.total, color: 'border-indigo-500/30 bg-indigo-500/8', textColor: 'text-indigo-400' },
    { key: 'YET_TO_START', label: 'Yet to Start', count: data.stats.yetToStart, color: 'border-slate-500/30 bg-slate-500/5', textColor: 'text-slate-400' },
    { key: 'IN_PROGRESS', label: 'In Progress', count: data.stats.inProgress, color: 'border-amber-500/30 bg-amber-500/8', textColor: 'text-amber-400' },
    { key: 'COMPLETED', label: 'Completed', count: data.stats.completed, color: 'border-emerald-500/30 bg-emerald-500/8', textColor: 'text-emerald-400' },
  ]

  const col = (id) => visibleCols.includes(id)

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-100 font-sora">Reporting</h1>
          <div className="flex items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search name or course…" className="w-56" />
            <button onClick={() => setPanelOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 border border-white/10 rounded-lg hover:border-white/20 transition-colors">
              <SlidersHorizontal size={14} />
              Columns
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(({ key, label, count, color, textColor }) => (
            <button
              key={label}
              onClick={() => setStatusFilter(statusFilter === key ? null : key)}
              className={`text-left p-4 rounded-xl border transition-all duration-200 ${color} ${statusFilter === key ? 'ring-1 ring-offset-0' : 'hover:opacity-90'}`}
            >
              <p className="text-xs text-slate-400 mb-1">{label}</p>
              <p className={`text-3xl font-bold font-sora ${textColor}`}>{count}</p>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-navy-800 border border-white/10 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-slate-400 text-xs">
                  {col('srNo') && <th className="text-left px-4 py-3 font-medium w-12">#</th>}
                  {col('course') && <th className="text-left px-4 py-3 font-medium">Course</th>}
                  {col('participant') && <th className="text-left px-4 py-3 font-medium">Participant</th>}
                  {col('enrolledDate') && <th className="text-left px-4 py-3 font-medium">Enrolled</th>}
                  {col('startDate') && <th className="text-left px-4 py-3 font-medium">Started</th>}
                  {col('timeSpent') && <th className="text-center px-4 py-3 font-medium">Time</th>}
                  {col('completion') && <th className="text-center px-4 py-3 font-medium">Completion</th>}
                  {col('completedDate') && <th className="text-left px-4 py-3 font-medium">Completed</th>}
                  {col('status') && <th className="text-center px-4 py-3 font-medium">Status</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    {col('srNo') && <td className="px-4 py-3 text-slate-500">{i + 1}</td>}
                    {col('course') && <td className="px-4 py-3 font-medium text-slate-200">{e.course?.title}</td>}
                    {col('participant') && (
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-slate-200">{e.user?.name}</p>
                          <p className="text-xs text-slate-500">{e.user?.email}</p>
                        </div>
                      </td>
                    )}
                    {col('enrolledDate') && <td className="px-4 py-3 text-slate-400">{formatDate(e.enrolledAt)}</td>}
                    {col('startDate') && <td className="px-4 py-3 text-slate-400">{formatDate(e.startedAt)}</td>}
                    {col('timeSpent') && <td className="px-4 py-3 text-center text-slate-400">{e.timeSpent}m</td>}
                    {col('completion') && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${e.completionPercent || 0}%` }} />
                          </div>
                          <span className="text-xs text-slate-400">{e.completionPercent || 0}%</span>
                        </div>
                      </td>
                    )}
                    {col('completedDate') && <td className="px-4 py-3 text-slate-400">{formatDate(e.completedAt)}</td>}
                    {col('status') && (
                      <td className="px-4 py-3 text-center">
                        <Badge variant={e.status === 'COMPLETED' ? 'green' : e.status === 'IN_PROGRESS' ? 'indigo' : 'slate'} dot>
                          {getStatusLabel(e.status)}
                        </Badge>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-12 text-slate-500">No data found</div>}
          </div>
        )}
      </div>

      {/* Column Customizer Panel */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/30" onClick={() => setPanelOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-72 bg-navy-800 border-l border-white/10 z-40 p-5 animate-slide-in-right">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-200">Customize Columns</h3>
              <button onClick={() => setPanelOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {ALL_COLUMNS.map((col) => (
                <label key={col.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleCols.includes(col.id)}
                    onChange={(e) => {
                      if (e.target.checked) setVisibleCols((v) => [...v, col.id])
                      else setVisibleCols((v) => v.filter((c) => c !== col.id))
                    }}
                    className="w-4 h-4 rounded border-white/20 bg-navy-700 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-300">{col.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}

export default Reporting
