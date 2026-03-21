import { Link, NavLink, useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { getBadge } from '../../utils/badge'

const LearnerNavbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const badge = user ? getBadge(user.totalPoints || 0) : null

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-navy-900/90 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <GraduationCap size={15} className="text-white" />
          </div>
          <span className="font-bold text-slate-100 font-sora text-sm">Learnova</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden sm:flex items-center gap-1">
          <NavLink to="/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} text-sm`}>
            <BookOpen size={14} />
            <span>Courses</span>
          </NavLink>
          {user && (
            <NavLink to="/my-courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} text-sm`}>
              <User size={14} />
              <span>My Learning</span>
            </NavLink>
          )}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-400">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-slate-200 leading-none">{user.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{badge?.emoji} {user.totalPoints} pts</p>
                </div>
                <ChevronDown size={12} className="text-slate-400" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-48 bg-navy-800 border border-white/10 rounded-xl shadow-2xl z-20 py-1 animate-fade-in">
                    {(user.role === 'ADMIN' || user.role === 'INSTRUCTOR') && (
                      <Link
                        to="/admin/courses"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-colors"
                      >
                        Back to Backoffice
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm text-slate-300 hover:text-slate-100 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default LearnerNavbar
