import { Link, NavLink, useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, User, LogOut, ChevronDown, Sparkles, Zap, Trophy, Menu, X, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import { getBadge, getProgressToNextBadge } from '../../utils/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { userAPI } from '../../services/api'

const LearnerNavbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const unreadCount = notifications.filter((n) => !n.read).length
  
  const badge = user ? getBadge(user.totalPoints || 0) : null
  const progressToNext = user ? getProgressToNextBadge(user.totalPoints || 0) : 0

  useEffect(() => {
    if (user) {
      userAPI.getNotifications().then(res => setNotifications(res.data)).catch(() => {})
    }
  }, [user])

  const handleOpenNotifs = async () => {
    setNotifOpen(!notifOpen)
    if (!notifOpen && unreadCount > 0) {
      userAPI.markNotificationsRead().then(() => {
        setNotifications(notifications.map((n) => ({ ...n, read: true })))
      }).catch(() => {})
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setMenuOpen(false)
    setMobileOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6 py-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#714B67] to-[#017E84] flex items-center justify-center shadow-lg shadow-[#714B67]/25 group-hover:shadow-[#714B67]/40 group-hover:scale-105 transition-all duration-300">
              <GraduationCap size={22} className="text-white drop-shadow" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-[#714B67] font-sora text-xl tracking-tight block leading-none">Learnova</span>
              <span className="text-[9px] font-black text-[#017E84] uppercase tracking-[0.2em] block mt-0.5">Mastery Platform</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200">
            <NavLink
              to="/courses"
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
                  isActive
                    ? 'bg-[#714B67] text-white shadow-lg shadow-[#714B67]/30'
                    : 'text-slate-600 hover:text-[#714B67] hover:bg-[#714B67]/8'
                }`
              }
            >
              <BookOpen size={14} />
              <span>Discover</span>
            </NavLink>
            {user && (
              <NavLink
                to="/my-courses"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
                    isActive
                      ? 'bg-[#714B67] text-white shadow-lg shadow-[#714B67]/30'
                      : 'text-slate-600 hover:text-[#714B67] hover:bg-[#714B67]/8'
                  }`
                }
              >
                <User size={14} />
                <span>My Learning</span>
              </NavLink>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {/* XP Progress (Desktop) */}
            {user && (
              <div className="hidden lg:flex items-center gap-3">
                <div className="relative group cursor-help">
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-[#714B67] uppercase tracking-widest">Level</span>
                      <span className="text-[11px] font-black text-slate-800">{user.totalPoints} XP</span>
                    </div>
                    <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNext}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[#714B67] to-[#017E84] rounded-full"
                      />
                    </div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute top-full right-0 mt-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl min-w-[180px] text-center">
                      <span className="text-xl mb-2 block">{badge?.emoji}</span>
                      <p className="text-xs font-black text-white uppercase tracking-tight mb-1">{badge?.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                        {badge?.next ? `${badge.next - user.totalPoints} XP to next` : 'Max Rank!'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#714B67]/10 to-[#017E84]/10 border border-[#714B67]/15 flex items-center justify-center text-lg shadow-inner">
                  {badge?.emoji}
                </div>
              </div>
            )}

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={handleOpenNotifs}
                  className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all hover:border-slate-300 relative group"
                >
                  <Bell size={18} className={`transition-transform duration-300 ${unreadCount > 0 ? 'animate-pulse text-[#714B67]' : ''}`} />
                  {unreadCount > 0 && (
                     <div className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-slate-50" />
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[-1]"
                        onClick={() => setNotifOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                        className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-black/10 z-50 py-2 overflow-hidden flex flex-col max-h-[400px]"
                      >
                         <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                           <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Network Alerts</span>
                           {unreadCount > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest">{unreadCount} New</span>}
                         </div>
                         <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                           {notifications.length === 0 ? (
                             <div className="text-center py-8">
                               <Bell size={24} className="mx-auto text-slate-300 mb-2" />
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Catching up on silence</p>
                             </div>
                           ) : (
                             <div className="space-y-1">
                               {notifications.map((n) => (
                                 <button
                                   key={n.id}
                                   onClick={() => {
                                     setNotifOpen(false)
                                     if (n.link) navigate(n.link)
                                   }}
                                   className={`w-full text-left p-3 rounded-xl transition-all ${!n.read ? 'bg-[#714B67]/5' : 'hover:bg-slate-50'}`}
                                 >
                                    <p className={`text-xs leading-relaxed ${!n.read ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>{n.message}</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</p>
                                 </button>
                               ))}
                             </div>
                           )}
                         </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Profile Dropdown / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="flex items-center gap-2.5 bg-white border-2 border-slate-200 hover:border-[#714B67]/40 p-1.5 pr-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#714B67] flex items-center justify-center text-sm font-black text-white shadow-sm">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[11px] font-black text-slate-900 leading-none">{user.name.split(' ')[0]}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mt-0.5">{user.role}</p>
                  </div>
                  <ChevronDown size={13} className={`text-slate-400 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[-1]"
                        onClick={() => setMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                        className="absolute right-0 mt-3 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-black/10 z-50 py-2 overflow-hidden"
                      >
                        {/* User Info */}
                        <div className="bg-[#714B67] px-4 py-4 mb-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-base">
                              {user.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-white leading-tight">{user.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] text-white/60 uppercase tracking-widest font-black">{badge?.emoji} {badge?.name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white/80 rounded-full" style={{ width: `${progressToNext}%` }} />
                            </div>
                            <span className="text-[9px] text-white/60 font-black uppercase">{user.totalPoints} XP</span>
                          </div>
                        </div>

                        <div className="px-2 py-1 space-y-0.5">
                          {(user.role === 'ADMIN' || user.role === 'INSTRUCTOR') && (
                            <Link
                              to="/admin/courses"
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#714B67] hover:bg-[#714B67] hover:text-white transition-all rounded-xl group"
                            >
                              <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                              Instructor Panel
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-xl group"
                          >
                            <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-[#714B67] transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 bg-[#714B67] hover:bg-[#54384c] text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#714B67]/25 hover:shadow-[#714B67]/40 btn-shine active:scale-95"
                >
                  <Zap size={13} className="fill-white" />
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#714B67] hover:text-[#714B67] transition-all"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                <NavLink
                  to="/courses"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-[#714B67] text-white' : 'text-slate-700 hover:bg-slate-50'}`
                  }
                >
                  <BookOpen size={16} /> Discover Courses
                </NavLink>
                {user && (
                  <NavLink
                    to="/my-courses"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-[#714B67] text-white' : 'text-slate-700 hover:bg-slate-50'}`
                    }
                  >
                    <User size={16} /> My Learning
                  </NavLink>
                )}
                {user && (user.role === 'ADMIN' || user.role === 'INSTRUCTOR') && (
                  <Link
                    to="/admin/courses"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest text-[#017E84] hover:bg-[#017E84]/8 transition-all"
                  >
                    <Sparkles size={16} /> Instructor Panel
                  </Link>
                )}
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                ) : (
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full text-center py-3 rounded-xl border-2 border-slate-200 text-[12px] font-black uppercase tracking-widest text-slate-700">Sign In</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full text-center py-3 rounded-xl bg-[#714B67] text-white text-[12px] font-black uppercase tracking-widest shadow-lg shadow-[#714B67]/25">Join Free</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}

export default LearnerNavbar
