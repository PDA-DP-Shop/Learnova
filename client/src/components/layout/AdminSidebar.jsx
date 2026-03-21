import { NavLink, useNavigate } from 'react-router-dom'
import { BookOpen, BarChart2, LogOut, GraduationCap, ChevronLeft, LayoutDashboard, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/courses',   icon: BookOpen,  label: 'Courses' },
  { to: '/admin/reporting', icon: BarChart2, label: 'Analytics' },
]

const AdminSidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className={`flex flex-col h-full border-r border-slate-200 transition-all duration-300 bg-white z-50 text-slate-600 ${collapsed ? 'w-20' : 'w-[280px]'}`}>
      {/* Logo Header */}
      <div className={`flex items-center h-24 border-b border-slate-100 ${collapsed ? 'justify-center px-4' : 'px-8 gap-4'}`}>
        {!collapsed && (
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#714B67] to-[#017E84] flex items-center justify-center shrink-0 shadow-lg shadow-[#714B67]/20 border border-[#714B67]/10">
            <GraduationCap size={20} className="text-white" />
          </div>
        )}
          <div className="flex-1 min-w-0">
            <span className="font-black text-slate-900 font-sora text-xl block leading-none mb-1 tracking-tight">Learnova</span>
            <div className="flex items-center gap-1.5 opacity-90">
               <div className={`w-1 h-1 rounded-full animate-pulse ${user?.role === 'ADMIN' ? 'bg-[#017E84]' : 'bg-[#714B67]'}`} />
               <span className={`text-[9px] font-black uppercase tracking-[0.2em] leading-none ${user?.role === 'ADMIN' ? 'text-[#017E84]' : 'text-[#714B67]'}`}>
                 {user?.role === 'ADMIN' ? 'Admin Station' : 'Instructor Station'}
               </span>
            </div>
          </div>
        <button
          onClick={onToggle}
          className={`p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-[#714B67] transition-all border border-slate-100 ${collapsed ? 'w-12 h-12 flex items-center justify-center' : 'ml-auto'}`}
        >
          <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-5 space-y-2 overflow-y-auto custom-scrollbar">
        {!collapsed && <p className="px-3 mb-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Metrics</p>}
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-2xl transition-all duration-300 group ${collapsed ? 'justify-center p-3 h-12 w-12 mx-auto' : 'px-5 py-3.5'} 
               ${isActive ? 'bg-[#714B67] text-white shadow-lg shadow-[#714B67]/20 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-[#714B67] font-medium'}`
            }
          >
            <Icon size={18} className={`shrink-0 transition-transform duration-300 group-hover:scale-110`} />
            {!collapsed && (
              <span className="text-sm tracking-wide truncate">{label}</span>
            )}
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin/users"
            title={collapsed ? 'Users' : undefined}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-2xl transition-all duration-300 group ${collapsed ? 'justify-center p-3 h-12 w-12 mx-auto' : 'px-5 py-3.5'} 
               ${isActive ? 'bg-[#017E84] text-white shadow-lg shadow-[#017E84]/20 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-[#714B67] font-medium'} mt-2`
            }
          >
            <Users size={18} className={`shrink-0 transition-transform duration-300 group-hover:scale-110`} />
            {!collapsed && <span className="text-sm tracking-wide truncate">Network Users</span>}
          </NavLink>
        )}
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-100 p-5 bg-slate-50/50">
        <div className={`flex items-center gap-4 rounded-2xl bg-white border border-slate-200 shadow-sm ${collapsed ? 'justify-center p-2 h-12 w-12 mx-auto mb-2' : 'px-4 py-3 mb-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-[#714B67]/10 flex items-center justify-center text-xs font-black text-[#714B67] shrink-0 border border-[#714B67]/20">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">{user?.role?.toLowerCase()}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full rounded-2xl transition-all border border-transparent hover:border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold ${collapsed ? 'justify-center p-3 h-12 w-12 mx-auto' : 'px-5 py-3.5'}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span className="text-xs font-black uppercase tracking-[0.2em]">System Bypass</span>}
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
