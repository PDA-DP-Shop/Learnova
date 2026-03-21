import { useState, useEffect } from 'react'
import { Users, Trash2, Mail, Shield, User, Search, Award, Ban, CheckCircle, Download } from 'lucide-react'
import AdminLayout from '../../components/layout/AdminLayout'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import SearchInput from '../../components/ui/SearchInput'
import Spinner from '../../components/ui/Spinner'
import { adminUsersAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { exportCSV } from '../../utils/exportCSV'
import toast from 'react-hot-toast'

const UsersDashboard = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [toggling, setToggling] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    adminUsersAPI.list()
      .then(({ data }) => setUsers(data))
      .catch(() => toast.error('Failed to load network users'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleToggleStatus = async (user) => {
    if (user.id === currentUser.id) return toast.error('You cannot change your own status')
    
    const action = user.isActive ? 'Disable' : 'Enable'
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return

    setToggling(user.id)
    try {
      const { data } = await adminUsersAPI.toggleStatus(user.id, { isActive: !user.isActive })
      setUsers(users.map((u) => u.id === user.id ? { ...u, isActive: data.isActive } : u))
      toast.success(`User successfully ${data.isActive ? 'restored' : 'banned'}.`)
    } catch {
      toast.error(`Failed to ${action} user.`)
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async (user) => {
    if (user.id === currentUser.id) return toast.error('You cannot delete yourself')
    if (!window.confirm(`Are you sure you want to explicitly ban and permanently remove ${user.name}? This cannot be undone.`)) return

    setDeleting(user.id)
    try {
      await adminUsersAPI.delete(user.id)
      setUsers(users.filter((u) => u.id !== user.id))
      toast.success('User permanently removed.')
    } catch {
      toast.error('Failed to remove user.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto font-inter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-sora tracking-tight">Network Users</h1>
            <p className="text-slate-500 text-sm mt-0.5 font-medium">{users.length} registered profiles</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none w-full sm:w-40 h-11 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm px-4 pr-10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#714B67]/10 focus:border-[#714B67]/30 transition-all cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="LEARNER">Learners Dashboard</option>
                <option value="INSTRUCTOR">Instructors Base</option>
                <option value="ADMIN">Administrators</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" /></svg>
              </div>
            </div>
            <SearchInput value={search} onChange={setSearch} placeholder="Search names or emails..." className="w-full sm:w-64 h-11" />
            <button
              onClick={() => exportCSV(filtered.map(u => ({
                Name: u.name,
                Email: u.email,
                Role: u.role,
                'Total XP': u.totalPoints,
                Enrollments: u._count?.enrollments || 0,
                'Courses Published': u._count?.courses || 0,
                Status: u.isActive ? 'Active' : 'Disabled',
              })), 'learnova_users')}
              className="flex items-center gap-2 h-11 px-4 bg-[#714B67] hover:bg-[#54384c] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-32"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-widest bg-slate-50 relative">
                    <th className="text-left px-6 py-4 font-black">Identity</th>
                    <th className="text-left px-6 py-4 font-black">Role</th>
                    <th className="text-center px-6 py-4 font-black hidden lg:table-cell">Engagement</th>
                    <th className="text-right px-6 py-4 font-black">Total XP</th>
                    <th className="text-center px-6 py-4 font-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-[14px] bg-[#714B67]/5 flex items-center justify-center font-black text-[#714B67] shrink-0 border border-[#714B67]/10">
                            {u.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-none mb-1">{u.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                              <Mail size={10} /> {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.role === 'ADMIN' ? 'indigo' : u.role === 'INSTRUCTOR' ? 'emerald' : 'slate'} className="font-black tracking-widest">
                          {u.role}
                        </Badge>
                        {!u.isActive && (
                          <span className="ml-2 px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest border border-red-200">
                             Disable
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
                           <span title="Enrollments" className="flex items-center gap-1"><User size={12} className="text-indigo-400" /> {u._count?.enrollments || 0}</span>
                           <span title="Courses Published" className="flex items-center gap-1"><Shield size={12} className="text-emerald-400" /> {u._count?.courses || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#714B67]/5 border border-[#714B67]/10 rounded-lg text-[#714B67] font-black">
                          <Award size={14} className="opacity-50" />
                          {u.totalPoints}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 transition-opacity">
                          {u.id !== currentUser.id ? (
                            <>
                              <Button 
                                size="sm" 
                                variant={u.isActive ? "ghost" : "primary"}
                                icon={u.isActive ? <Ban size={14} /> : <CheckCircle size={14} />} 
                                onClick={() => handleToggleStatus(u)} 
                                loading={toggling === u.id} 
                                className={u.isActive ? "text-orange-500 hover:bg-orange-50 hover:text-orange-600 rounded-xl" : "bg-emerald-500 hover:bg-emerald-600 border-none shadow-md shadow-emerald-500/20 rounded-xl"}
                              >
                                {u.isActive ? 'Disable' : 'Enable'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                icon={<Trash2 size={14} />} 
                                onClick={() => handleDelete(u)} 
                                loading={deleting === u.id} 
                                className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl"
                              >
                                
                              </Button>
                            </>
                          ) : (
                            <Badge variant="slate" className="font-black tracking-widest">YOU</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-slate-500 font-bold">
                        <Search size={32} className="opacity-20 mx-auto mb-3" />
                        No profiles matched your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default UsersDashboard
