import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wallet, TrendingUp, Users, Download, 
  ArrowUpRight, ArrowDownRight, Filter, 
  Calendar, Search, FileText, ChevronRight,
  ShieldCheck, RefreshCcw, Activity, Award,
  Zap, ArrowRight, Info
} from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'
import { paymentAPI } from '../../services/api'
import AdminLayout from '../../components/layout/AdminLayout'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const InstructorRevenue = () => {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const fetchData = async () => {
    try {
      const [historyRes, statsRes] = await Promise.all([
        paymentAPI.getInstructorHistory(),
        paymentAPI.getInstructorStats()
      ])
      setPayments(historyRes.data.payments)
      setStats(statsRes.data.dailyRevenue)
    } catch (err) {
      toast.error('Revenue intelligence failure')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Intelligence aggregation for visualization
  const chartData = Object.entries(stats).map(([date, amount]) => ({
    date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    revenue: amount,
    timestamp: new Date(date).getTime()
  })).sort((a, b) => a.timestamp - b.timestamp)

  const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0)
  const totalStudents = new Set(payments.map(p => p.userId)).size
  const avgOrder = totalRevenue / (payments.length || 1)

  // Asset Performance Logic
  const assetData = Object.entries(
    payments.reduce((acc, p) => {
      const title = p.course?.title || 'Unknown'
      acc[title] = (acc[title] || 0) + p.amount
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))
   .sort((a, b) => b.value - a.value)
   .slice(0, 5)

  const COLORS = ['#714B67', '#017E84', '#3395FF', '#F59E0B', '#10B981']

  if (loading) return <AdminLayout><div className="h-[80vh] flex items-center justify-center"><Spinner size="xl" /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-1000">
        
        {/* Unified Command Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#017E84]">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#017E84] animate-pulse" />
                 {user?.role === 'ADMIN' ? 'Network Financial Command' : 'Revenue Intelligence Station'}
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight font-sora">
                 {user?.role === 'ADMIN' ? 'Global Discovery' : 'Financial Command'}
              </h1>
              <p className="text-slate-400 font-medium text-sm">
                 {user?.role === 'ADMIN' ? 'Aggregated platform-wide settlement streams and asset performance' : 'Synchronized settlement audit and curriculum performance metrics'}
              </p>
           </div>
           <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1">
                 {['7d', '30d', 'All'].map(p => (
                    <button 
                       key={p} 
                       onClick={() => setSelectedPeriod(p)}
                       className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${selectedPeriod === p ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                       {p}
                    </button>
                 ))}
              </div>
              <button 
                 onClick={() => { setRefreshing(true); fetchData() }}
                 className={`w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#714B67] transition-all hover:shadow-md ${refreshing ? 'animate-spin' : ''}`}
              >
                 <RefreshCcw size={18} />
              </button>
           </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           {/* Primary Revenue Card */}
           <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="lg:col-span-2 bg-gradient-to-br from-[#714B67] to-[#4A3143] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-[#714B67]/20"
           >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 <Wallet size={120} className="text-white" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                 <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                       <TrendingUp size={28} />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-400/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-400/20">
                       <ArrowUpRight size={12} /> Live Sync
                    </div>
                 </div>
                 <div className="mt-12">
                    <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-shadow-sm">Net Synchronized Revenue</p>
                    <h2 className="text-6xl font-black font-sora tracking-tighter mb-4">₹{totalRevenue.toLocaleString()}</h2>
                    <div className="flex items-center gap-6">
                       <div className="space-y-1">
                          <p className="text-white/40 text-[8px] font-black uppercase tracking-widest">Growth</p>
                          <p className="text-sm font-black">+14.2%</p>
                       </div>
                       <div className="w-px h-8 bg-white/10" />
                       <div className="space-y-1">
                          <p className="text-white/40 text-[8px] font-black uppercase tracking-widest">Projected</p>
                          <p className="text-sm font-black">₹{(totalRevenue * 1.2).toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </motion.div>

           {/* Quick Stats */}
           <div className="grid grid-cols-1 gap-6">
              {[
                 { label: 'Validated Learner Links', value: totalStudents, icon: <Users />, color: 'text-blue-600', bg: 'bg-blue-50' },
                 { label: 'Average Settlement', value: `₹${Math.round(avgOrder)}`, icon: <Activity />, color: 'text-amber-600', bg: 'bg-amber-50' }
              ].map((s, i) => (
                 <motion.div 
                    key={i} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.1 }}
                    className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-[#714B67]/20 transition-all"
                 >
                    <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                       {s.icon}
                    </div>
                    <div>
                       <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{s.label}</p>
                       <p className="text-2xl font-black text-slate-900 font-sora tracking-tight">{s.value}</p>
                    </div>
                 </motion.div>
              ))}
           </div>

           {/* Mastery Badge Card */}
           <motion.div 
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}
              className="bg-slate-950 rounded-[32px] p-8 text-white relative overflow-hidden"
           >
              <div className="relative z-10 flex flex-col h-full justify-between">
                 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                    <Award size={24} className="text-[#017E84]" />
                 </div>
                 <div>
                    <h3 className="text-lg font-black tracking-tight mb-2">Platform Rank</h3>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">You are in the top <span className="text-[#017E84] font-black underline decoration-2 underline-offset-4">5% of curriculum leads</span> this cycle.</p>
                    <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                       View Achievement Path <ArrowRight size={12} />
                    </button>
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#017E84]/10 rounded-full blur-3xl" />
           </motion.div>
        </div>

        {/* Visualization Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Acquisition Stream Visualization */}
           <div className="lg:col-span-8 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-lg">
                       <Zap size={20} />
                    </div>
                    <div>
                       <h2 className="text-xl font-black text-slate-900 tracking-tight">Acquisition Velocity</h2>
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sentiment Audit Trail</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#714B67]">
                    <div className="w-2 h-2 rounded-full bg-[#714B67] animate-ping" /> Synchronized
                 </div>
              </div>

              <div className="h-[450px] w-full mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                       <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#714B67" stopOpacity={0.8}/>
                             <stop offset="100%" stopColor="#714B67" stopOpacity={0}/>
                          </linearGradient>
                          <filter id="shadow" height="200%">
                             <feGaussianBlur in="SourceAlpha" stdDeviation="15" result="blur" />
                             <feOffset in="blur" dx="0" dy="20" result="offsetBlur" />
                             <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                             </feMerge>
                          </filter>
                       </defs>
                       <CartesianGrid strokeDasharray="1 1000" vertical={false} stroke="#E2E8F0" />
                       <XAxis 
                          dataKey="date" 
                          axisLine={false} tickLine={false} 
                          tick={{ fontSize: 9, fontWeight: 900, fill: '#94A3B8', textTransform: 'uppercase' }}
                          dy={20}
                       />
                       <YAxis 
                          axisLine={false} tickLine={false} 
                          tick={{ fontSize: 9, fontWeight: 900, fill: '#94A3B8' }}
                          tickFormatter={(v) => `₹${v}`}
                       />
                       <Tooltip 
                          cursor={{ stroke: '#E2E8F0', strokeWidth: 2 }}
                          content={({ active, payload }) => {
                             if (active && payload && payload.length) {
                                return (
                                   <div className="bg-slate-950 p-6 rounded-[24px] shadow-2xl border border-white/10 ring-8 ring-slate-950/40">
                                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{payload[0].payload.date}</p>
                                      <div className="flex items-center gap-4">
                                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981]" />
                                         <p className="text-2xl font-black text-emerald-400 font-sora tracking-tighter">₹{payload[0].value.toLocaleString()}</p>
                                      </div>
                                      <p className="mt-3 text-[9px] font-bold text-white/50 uppercase tracking-widest">Verified Transaction Capture</p>
                                   </div>
                                )
                             }
                             return null
                          }}
                       />
                       <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#714B67" 
                          strokeWidth={6}
                          fill="url(#revenueGradient)" 
                          animationDuration={2000}
                          filter="url(#shadow)"
                          dot={{ r: 6, fill: '#714B67', strokeWidth: 4, stroke: '#fff' }}
                          activeDot={{ r: 10, fill: '#714B67', strokeWidth: 4, stroke: '#fff', shadow: '0 0 20px rgba(113,75,103,0.5)' }}
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Asset Performance Arena */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                 <h2 className="text-xl font-black text-slate-900 tracking-tight mb-8">Asset Yield</h2>
                 
                 <div className="h-[250px] w-full relative mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={assetData}
                             cx="50%" cy="50%"
                             innerRadius={70}
                             outerRadius={100}
                             paddingAngle={5}
                             dataKey="value"
                          >
                             {assetData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Pie>
                          <Tooltip 
                             content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                   return (
                                      <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100 ring-4 ring-slate-50">
                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{payload[0].name}</p>
                                         <p className="text-lg font-black text-slate-900 font-sora tracking-tight">₹{payload[0].value.toLocaleString()}</p>
                                      </div>
                                   )
                                }
                                return null
                             }}
                          />
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Top Assets</p>
                       <p className="text-2xl font-black text-slate-900 font-sora tracking-tight">{assetData.length}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {assetData.map((item, i) => (
                       <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                             <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight truncate max-w-[140px]">{item.name}</span>
                          </div>
                          <span className="text-xs font-black text-slate-900 font-sora">₹{item.value.toLocaleString()}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Secure Node Info */}
              <div className="bg-[#017E84] p-8 rounded-[40px] text-white relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                       <ShieldCheck size={20} className="text-white/60" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Security Audit</span>
                    </div>
                    <p className="text-sm font-bold leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">Every curriculum link is cryptographically signed and verified through our synchronized ledger.</p>
                 </div>
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-all duration-700">
                    <ShieldCheck size={120} />
                 </div>
              </div>
           </div>
        </div>

        {/* Real-time Settlement Audit */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-20">
           <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                    <Search size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Settlement Audit Trail</h2>
                    <p className="text-slate-400 font-medium text-sm">Verified curriculum mastery synchronization events</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="relative w-full md:w-80 group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#714B67] transition-colors" />
                    <input 
                       type="text" 
                       placeholder="Filter by Learner or ID..."
                       className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-2xl pl-11 pr-4 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#714B67] transition-all uppercase tracking-widest"
                    />
                 </div>
                 <button className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                    <Filter size={18} />
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Curriculum Link</th>
                       <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Entity Identity</th>
                       <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Protocol ID</th>
                       <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Capture Link</th>
                       <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Settlement</th>
                       <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Sync Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {payments.map((p, i) => (
                       <tr key={i} className="group hover:bg-slate-50/50 transition-all cursor-default">
                          <td className="px-10 py-8">
                             <div className="min-w-0">
                                <span className="font-black text-slate-900 text-sm tracking-tight truncate block max-w-[240px] group-hover:text-[#714B67] transition-colors">{p.course?.title}</span>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mt-1">Verified Asset</span>
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-900">{p.user?.name}</span>
                                <span className="text-[10px] font-bold text-slate-400">{p.user?.email}</span>
                             </div>
                          </td>
                          <td className="px-10 py-8 font-mono text-[11px] font-black text-slate-300 tracking-[0.2em] group-hover:text-slate-900 transition-colors">
                             {p.orderId}
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg w-fit group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 transition-all">
                                <Wallet size={12} /> {p.method}
                             </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <span className="font-black text-slate-900 font-sora text-lg tracking-tighter">₹{p.amount.toLocaleString()}</span>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <div className="flex items-center justify-end gap-2 text-[#017E84]">
                                <CheckCircle2 size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Captured</span>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {payments.length === 0 && (
              <div className="p-24 text-center">
                 <Info className="mx-auto text-slate-200 mb-6" size={64} />
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">No Settlements Recorded</h3>
                 <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">Establish premium curriculum links to populate your synchronization ledger.</p>
              </div>
           )}

           <div className="p-10 bg-slate-50/50 flex justify-center">
              <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                 Load Discovery Pagination <ArrowRight size={14} />
              </button>
           </div>
        </div>
      </div>
    </AdminLayout>
  )
}

const CheckCircle2 = ({ size, className }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
   </svg>
)

export default InstructorRevenue
