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
    { key: null, label: 'Total Learners', count: data.stats.total, color: 'border-odoo/20 bg-odoo/5', textColor: 'text-odoo' },
    { key: 'YET_TO_START', label: 'Draft Mode', count: data.stats.yetToStart, color: 'border-slate-100 bg-slate-50', textColor: 'text-slate-400' },
    { key: 'IN_PROGRESS', label: 'Active Session', count: data.stats.inProgress, color: 'border-amber-100 bg-amber-50', textColor: 'text-amber-600' },
    { key: 'COMPLETED', label: 'Mastery Achieved', count: data.stats.completed, color: 'border-emerald-100 bg-emerald-50', textColor: 'text-emerald-600' },
  ]

  const col = (id) => visibleCols.includes(id)

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 font-sora">Reporting</h1>
          <div className="flex items-center gap-2">
            <SearchInput value={search} onChange={setSearch} placeholder="Search name or course…" className="w-56" />
            <button onClick={() => setPanelOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors bg-white shadow-sm">
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
              className={`text-left p-6 rounded-2xl border transition-all duration-300 ${color} ${statusFilter === key ? 'ring-2 ring-offset-2' : 'hover:scale-[1.02] shadow-sm hover:shadow-lg'}`}
            >
              <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest leading-none">{label}</p>
              <p className={`text-3xl font-black font-sora ${textColor}`}>{count}</p>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50/50">
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
                  <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    {col('srNo') && <td className="px-4 py-4 text-slate-400 font-medium">{i + 1}</td>}
                    {col('course') && <td className="px-4 py-4 font-black text-slate-900 font-sora">{e.course?.title}</td>}
                    {col('participant') && (
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-slate-900 font-bold">{e.user?.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{e.user?.email}</p>
                        </div>
                      </td>
                    )}
                    {col('enrolledDate') && <td className="px-4 py-3 text-slate-400">{formatDate(e.enrolledAt)}</td>}
                    {col('startDate') && <td className="px-4 py-3 text-slate-400">{formatDate(e.startedAt)}</td>}
                    {col('timeSpent') && <td className="px-4 py-3 text-center text-slate-400">{e.timeSpent}m</td>}
                    {col('completion') && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div className="h-full bg-odoo-teal rounded-full" style={{ width: `${e.completionPercent || 0}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-900">{e.completionPercent || 0}%</span>
                        </div>
                      </td>
                    )}
                    {col('completedDate') && <td className="px-4 py-3 text-slate-400">{formatDate(e.completedAt)}</td>}
                    {col('status') && (
                      <td className="px-4 py-3 text-center">
                        <Badge variant={e.status === 'COMPLETED' ? 'green' : e.status === 'IN_PROGRESS' ? 'odoo' : 'slate'} dot>
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
          <div className="fixed inset-0 z-30 bg-slate-900/10 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-slate-200 z-40 p-8 shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 font-sora tracking-tighter">Surface Config</h3>
              <button onClick={() => setPanelOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 border border-slate-100 transition-all">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {ALL_COLUMNS.map((col) => (
                <label key={col.id} className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-slate-50 cursor-pointer group transition-all">
                  <input
                    type="checkbox"
                    checked={visibleCols.includes(col.id)}
                    onChange={(e) => {
                      if (e.target.checked) setVisibleCols((v) => [...v, col.id])
                      else setVisibleCols((v) => v.filter((c) => c !== col.id))
                    }}
                    className="w-5 h-5 rounded-lg border-slate-200 bg-white text-odoo focus:ring-odoo focus:ring-offset-0 transition-all"
                  />
                  <span className="text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{col.label}</span>
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
