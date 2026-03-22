import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, BarChart2, LogOut, GraduationCap, 
  ChevronLeft, LayoutDashboard, Users, Wallet,
  Settings, HelpCircle, Shield, Zap
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/courses',   icon: BookOpen,  label: 'Curriculum' },
  { to: '/admin/revenue',   icon: Wallet,    label: 'Revenue' },
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
    <aside 
      className={`flex flex-col h-full border-r border-slate-200 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] bg-white z-[100] relative overflow-visible ${collapsed ? 'w-24' : 'w-[280px]'}`}
    >
      {/* Floating Toggle Trigger */}
      <button
        onClick={onToggle}
        className="absolute -right-4 top-10 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-[#714B67] hover:border-[#714B67]/30 shadow-xl shadow-slate-200/50 transition-all z-[110] group"
      >
        <ChevronLeft size={14} className={`transition-transform duration-500 ${collapsed ? 'rotate-180' : ''} group-hover:scale-125`} />
      </button>

      {/* Logo Protocol Header */}
      <div className={`flex items-center h-24 border-b border-slate-50 transition-all duration-300 ${collapsed ? 'justify-center' : 'px-8 gap-4'}`}>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-[#714B67] to-[#4A3143] flex items-center justify-center shrink-0 shadow-xl shadow-[#714B67]/20 border border-white/20 transition-all duration-500 ${collapsed ? 'scale-90 rotate-[5deg]' : ''}`}>
          <GraduationCap size={24} className="text-white" />
        </div>
        
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 min-w-0"
          >
            <span className="font-black text-slate-900 font-sora text-xl block leading-none mb-1.5 tracking-tighter italic">Learnova</span>
            <div className="flex items-center gap-1.5 opacity-90 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg w-fit">
               <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${user?.role === 'ADMIN' ? 'bg-[#017E84]' : 'bg-[#714B67]'}`} />
               <span className={`text-[8px] font-black uppercase tracking-[0.2em] leading-none ${user?.role === 'ADMIN' ? 'text-[#017E84]' : 'text-[#714B67]'}`}>
                 {user?.role === 'ADMIN' ? 'Platform Lead' : 'Curriculum Lead'}
               </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation Discovery Arena */}
      <nav className="flex-1 py-10 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="px-4 mb-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic"
          >
            Tactical Metrics
          </motion.p>
        )}
        
        <div className="space-y-1.5">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-[20px] transition-all duration-500 group relative
                 ${collapsed ? 'justify-center p-3 h-14 w-14 mx-auto' : 'px-6 py-4'} 
                 ${isActive 
                    ? 'bg-slate-950 text-white shadow-2xl shadow-slate-900/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`
              }
            >
              <Icon size={20} className={`shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:stroke-[2.5px]`} />
              {!collapsed && (
                <span className="text-xs font-black uppercase tracking-widest truncate">{label}</span>
              )}
              {collapsed && (
                 <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/5 rounded-2xl transition-colors pointer-events-none" />
              )}
            </NavLink>
          ))}

          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin/users"
              title={collapsed ? 'Network Users' : undefined}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-[20px] transition-all duration-500 group relative mt-4
                 ${collapsed ? 'justify-center p-3 h-14 w-14 mx-auto' : 'px-6 py-4'} 
                 ${isActive 
                    ? 'bg-[#017E84] text-white shadow-2xl shadow-[#017E84]/30' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`
              }
            >
              <Users size={20} className={`shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:stroke-[2.5px]`} />
              {!collapsed && <span className="text-xs font-black uppercase tracking-widest truncate">Entity Network</span>}
            </NavLink>
          )}
        </div>
      </nav>

      {/* Security & Identity Footer */}
      <div className="p-4 space-y-4">
        <div className={`p-1 bg-slate-100 rounded-[24px] ${collapsed ? 'flex flex-col items-center gap-1' : 'space-y-1'}`}>
           <div className={`flex items-center gap-3 rounded-[20px] transition-all bg-white border border-slate-200/50 shadow-sm ${collapsed ? 'p-1.5 h-12 w-12 justify-center' : 'px-4 py-3'}`}>
             <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-50 flex items-center justify-center text-xs font-black text-slate-900 shrink-0 border border-slate-200">
               {user?.name?.[0]?.toUpperCase()}
             </div>
             {!collapsed && (
               <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-black text-slate-950 truncate uppercase tracking-widest italic">{user?.name}</p>
                 <div className="flex items-center gap-1 mt-0.5">
                    <Shield size={8} className="text-slate-400" />
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Verified Identity</p>
                 </div>
               </div>
             )}
           </div>

           <button
             onClick={handleLogout}
             className={`flex items-center gap-4 rounded-[20px] transition-all text-red-500 hover:bg-red-50 hover:text-red-600 group ${collapsed ? 'justify-center p-3 h-12 w-12 mx-auto' : 'px-6 py-4'}`}
             title={collapsed ? 'System Bypass' : undefined}
           >
             <LogOut size={18} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
             {!collapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em]">System Bypass</span>}
           </button>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar
