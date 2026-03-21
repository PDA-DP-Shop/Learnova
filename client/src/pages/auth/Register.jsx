import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Sparkles, Trophy, Users, CheckCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'LEARNER' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const user = await register(form.name, form.email, form.password, form.role)
      toast.success(`Welcome, ${user.name}! 🎉`)
      navigate(user.role === 'ADMIN' || user.role === 'INSTRUCTOR' ? '/admin/courses' : '/courses')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: <Sparkles size={18} className="text-amber-400" />, title: 'Expert-Led Content', desc: 'Hand-picked courses from industry professionals.' },
    { icon: <Trophy size={18} className="text-[#714B67]" />, title: 'Earn Badges & XP', desc: 'Get recognized and track your skill growth.' },
    { icon: <Users size={18} className="text-[#017E84]" />, title: 'Community Access', desc: 'Connect with thousands of learners globally.' },
  ]

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">

      {/* Right side (hero) — shown first on large screens */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-1 relative items-center justify-center p-14 bg-slate-50 border-l border-slate-100 overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#714B67]/8 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#017E84]/6 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-sm w-full space-y-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#714B67] to-[#017E84] flex items-center justify-center shadow-xl shadow-[#714B67]/25">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <span className="font-black text-[#714B67] font-sora text-xl block leading-none">Learnova</span>
              <span className="text-[10px] font-black text-[#017E84] uppercase tracking-widest">Mastery Platform</span>
            </div>
          </Link>

          <div>
            <h2 className="text-3xl font-black text-slate-900 font-sora leading-tight mb-3 tracking-tight">
              Start your{' '}
              <span style={{ background: 'linear-gradient(135deg,#714B67,#017E84)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                learning journey
              </span>
            </h2>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              Join thousands of learners mastering skills every day through expert-led courses.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-[#714B67]/30 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm font-sora">{f.title}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Left side (form) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
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
            <h1 className="text-3xl font-black text-slate-900 font-sora tracking-tight mb-2">Create account</h1>
            <p className="text-slate-500 font-medium">Join the Learnova mastery community.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Jane Doe"
                  className="input-base pl-11"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="name@example.com"
                  className="input-base pl-11"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  className="input-base pl-11 pr-12"
                  autoComplete="new-password"
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

            {/* Role */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'LEARNER', icon: <GraduationCap size={16}/>, label: 'Learner' },
                  { value: 'INSTRUCTOR', icon: <User size={16}/>, label: 'Instructor' }
                ].map(({ value, icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: value }))}
                    className={`radio-card justify-center py-3 transition-all ${form.role === value ? 'selected' : ''}`}
                  >
                    <span className={form.role === value ? 'text-[#714B67]' : 'text-slate-400'}>{icon}</span>
                    <span className={`font-black text-xs uppercase tracking-wider ${form.role === value ? 'text-[#714B67]' : 'text-slate-600'}`}>{label}</span>
                    {form.role === value && <CheckCircle size={14} className="text-[#714B67] ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" size="xl" loading={loading} className="w-full mt-2 btn-shine" iconRight={<ArrowRight size={14}/>}>
              Create Free Account
            </Button>

            <p className="text-center text-xs text-slate-400">
              By joining, you agree to our{' '}
              <span className="text-[#714B67] font-black cursor-pointer hover:underline">Terms</span>
              {' '}and{' '}
              <span className="text-[#714B67] font-black cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-white px-4 text-slate-400 font-black">Already a member?</span>
              </div>
            </div>

            <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/login')}>
              Sign In to Your Account
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
