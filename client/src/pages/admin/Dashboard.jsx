import { useState, useEffect } from 'react'
import { Users, BookOpen, Clock, Activity, Target } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import AdminLayout from '../../components/layout/AdminLayout'
import { reportingAPI } from '../../services/api'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'

const COLORS = ['#017E84', '#F43F5E', '#10B981']

const AdminOverview = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reportingAPI.get()
      .then(res => setStats(res.data))
      .catch((e) => console.error("Reporting fetch error", e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout><div className="flex items-center justify-center p-32"><Spinner size="lg" /></div></AdminLayout>

  const pieData = [
    { name: 'Completed', value: stats?.stats?.completed || 0 },
    { name: 'Yet to Start', value: stats?.stats?.yetToStart || 0 },
    { name: 'In Progress', value: stats?.stats?.inProgress || 0 },
  ].filter(d => d.value > 0)

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto font-inter">
        <header className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#017E84] mb-1">Status Report</p>
          <h1 className="text-3xl font-bold font-sora text-[#714B67]">Platform Overview</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
              <Users size={120} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
              <Users size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-500 mb-1">Total Enrollments</h3>
            <p className="text-4xl font-black text-slate-900 font-sora tracking-tight">{stats?.platform?.totalEnrollments || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
              <BookOpen size={120} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#714B67]/10 flex items-center justify-center text-[#714B67] mb-4">
              <BookOpen size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-500 mb-1">Active Courses</h3>
            <p className="text-4xl font-black text-slate-900 font-sora tracking-tight">{stats?.platform?.totalCourses || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
              <Target size={120} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#017E84]/10 flex items-center justify-center text-[#017E84] mb-4">
              <Target size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-500 mb-1">Feedback</h3>
            <p className="text-4xl font-black text-slate-900 font-sora tracking-tight">{stats?.platform?.totalReviews || 0}</p>
          </div>

          {user?.role === 'ADMIN' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group lg:col-span-1">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                <Users size={120} />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
                <Users size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-500 mb-1">Network Users</h3>
              <p className="text-4xl font-black text-slate-900 font-sora tracking-tight">{stats?.platform?.totalNetworkUsers || 0}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity size={18} className="text-[#017E84]" /> Engagement Distribution
            </h3>
            <div className="h-[250px] w-full flex items-center justify-center relative">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 text-sm font-medium">Not enough data to graph</div>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
               {pieData.map((lbl, idx) => (
                 <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} /> {lbl.name}
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#714B67] mb-6">Recent Activity Vector</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#714B67]">
                  <Activity size={16} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">System Operations Normal</p>
                  <p className="text-xs text-slate-500 mt-0.5">All platform microservices are responding accurately.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#017E84]">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Last Synced Aggregations</p>
                  <p className="text-xs text-slate-500 mt-0.5">Data structures synchronized.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}

export default AdminOverview
