import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, Zap, BookOpen, Trophy } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.name}! 👋`)
      navigate(user.role === 'ADMIN' || user.role === 'INSTRUCTOR' ? '/admin' : '/my-courses')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">

      {/* Left Hero Panel */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-1 relative items-center justify-center p-14 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #714B67 0%, #54384c 50%, #017E84 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/5 -mt-32 -ml-32 blur-xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#017E84]/30 -mb-20 -mr-20 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />

        <div className="relative z-10 max-w-sm text-white space-y-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center shadow-xl">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <span className="font-black text-white font-sora text-xl block leading-none">Learnova</span>
              <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Mastery Platform</span>
            </div>
          </Link>

          <div>
            <h2 className="text-4xl font-black font-sora leading-tight mb-4 tracking-tight">
              Your gateway to{' '}
              <span className="text-white/80">unlimited</span>{' '}
              knowledge.
            </h2>
            <p className="text-white/60 font-medium leading-relaxed">
              Unlock exclusive content, earn badges, and accelerate your career with expert-led learning.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: <BookOpen size={16}/>, text: 'Expert-led video lessons' },
              { icon: <Trophy size={16}/>, text: 'Interactive quizzes & rewards' },
              { icon: <Zap size={16}/>, text: 'Industry-recognized badges' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <span className="text-sm font-semibold text-white/80">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <div className="flex -space-x-3">
              {['#714B67', '#017E84', '#D97706', '#54384c'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center text-white text-[10px] font-black" style={{ background: c }}>
                  {String.fromCharCode(65+i)}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-black text-white">Join 10,000+ learners</p>
              <p className="text-[10px] text-white/50 font-medium">mastering new skills daily</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Form Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white relative"
      >
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#714B67] to-[#017E84] flex items-center justify-center shadow-md">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-black text-[#714B67] font-sora text-lg">Learnova</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 font-sora tracking-tight mb-2">Welcome back</h1>
            <p className="text-slate-500 font-medium">Sign in to continue your learning journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-base pl-11"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Password</label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pl-11 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" size="xl" loading={loading} className="w-full btn-shine" iconRight={<ArrowRight size={14}/>}>
              Sign In to Dashboard
            </Button>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-white px-4 text-slate-500 font-black">New here?</span>
              </div>
            </div>

            <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/register')}>
              Create a Free Account
            </Button>
          </form>

          <p className="text-center text-[11px] text-slate-400 font-medium mt-6">
            By signing in, you agree to our{' '}
            <span className="text-[#714B67] font-black cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-[#714B67] font-black cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
