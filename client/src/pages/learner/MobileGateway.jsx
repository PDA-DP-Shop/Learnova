import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Smartphone, CheckCircle2, ChevronRight, X, Lock, Fingerprint, Zap, Shield, HelpCircle, ArrowLeft, ArrowDownCircle } from 'lucide-react'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

const MobileGateway = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const courseId = searchParams.get('courseId')
  const amount = searchParams.get('amount')
  const courseTitle = searchParams.get('title')
  
  const [step, setStep] = useState(0) // 0: Landing, 1: Authenticating, 2: Success
  const [pin, setPin] = useState('')

  useEffect(() => {
    if (!courseId || !amount) {
      navigate('/courses')
    }
  }, [courseId, amount, navigate])

  const handlePay = () => {
    if (pin.length < 4) {
      toast.error('Identity Identification Required')
      return
    }
    setStep(1)
    setTimeout(() => {
      setStep(2)
      setTimeout(() => {
        // Success link back to main platform
        // In a real scan, the phone would notify the server, and the desktop would auto-update.
        // For simulation, we provide a "Return to Dashboard" link.
        window.close() // Close the "Phone" tab if it was opened via link
      }, 3000)
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-4 overflow-hidden font-sans">
      {/* Phone Case Frame (Interactive Simulation) */}
      <div className="relative w-full max-w-[390px] h-full sm:h-[800px] bg-[#0F172A] sm:rounded-[60px] sm:border-[8px] border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
        
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-slate-800 rounded-b-3xl z-50 hidden sm:block" />

        {/* Status Bar */}
        <div className="h-14 flex items-center justify-between px-8 pt-4 z-40">
           <span className="text-white font-black text-sm tracking-tight">09:41</span>
           <div className="flex gap-2 text-white opacity-80 scale-90">
              <Zap size={14} /> <Shield size={14} />
           </div>
        </div>

        <div className="flex-1 bg-[#F8FAFC] relative flex flex-col overflow-hidden">
           
           <AnimatePresence mode="wait">
              {step === 0 && (
                 <motion.div 
                    key="landing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="flex-1 p-6 flex flex-col"
                 >
                    {/* App Header */}
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" className="w-8 grayscale opacity-80" alt="" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Simulated UPI Interface</p>
                          <h2 className="text-sm font-black text-slate-900 tracking-tight mt-1">Acquisition Gateway</h2>
                       </div>
                    </div>

                    {/* Merchant Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 mb-8 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-5">
                          <ShieldCheck size={80} className="text-slate-900" />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Paying to</p>
                       <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight truncate">LEARNOVA MASTERY</h3>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 w-fit px-2 py-1 rounded-lg">Merchant verified ✓</p>
                       
                       <div className="mt-8 pt-8 border-t border-dashed border-slate-100">
                          <div className="flex items-baseline gap-1">
                             <span className="text-xl font-bold text-slate-400 tracking-tight">₹</span>
                             <span className="text-5xl font-black text-slate-900 tracking-tighter font-sora">{amount}</span>
                             <span className="text-sm font-bold text-slate-400 lowercase italic ml-1 mb-1">.00</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Ref: SYNC_{courseId.slice(0,8).toUpperCase()}</p>
                       </div>
                    </div>

                    {/* Identity Identification (PIN) */}
                    <div className="flex-1 space-y-6">
                       <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
                          <InfoIcon size={18} className="text-blue-500 mt-1 shrink-0" />
                          <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                             This acquisition link is secured via <span className="font-bold underline">End-to-End HSM Identity Verification</span>. Please enter your terminal PIN to finalize.
                          </p>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Enter Acquisition PIN</label>
                          <div className="flex gap-4">
                             {[0,1,2,3].map(i => (
                                <div key={i} className={`flex-1 h-16 rounded-2xl border-2 transition-all flex items-center justify-center text-xl font-black ${pin[i] ? 'border-slate-900 bg-white text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-300'}`}>
                                   {pin[i] ? '•' : ''}
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Custom Keypad (Mobile Style) */}
                    <div className="grid grid-cols-3 gap-2 mt-auto pb-4">
                       {[1,2,3,4,5,6,7,8,9,0].map(n => (
                          <button 
                             key={n} 
                             onClick={() => pin.length < 4 && setPin(p => p + n)}
                             className="h-14 bg-white rounded-2xl font-black text-slate-900 text-lg shadow-sm active:scale-95 transition-all outline-none border border-slate-50"
                          >
                             {n}
                          </button>
                       ))}
                       <button onClick={() => setPin('')} className="h-14 bg-slate-100 rounded-2xl font-bold text-slate-500 text-xs uppercase tracking-widest">Clear</button>
                       <button onClick={handlePay} className="col-span-2 h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">FINAL LINK ➔</button>
                    </div>
                 </motion.div>
              )}

              {step === 1 && (
                 <motion.div 
                    key="syncing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex-1 bg-slate-900 p-8 flex flex-col items-center justify-center text-center text-white"
                 >
                    <div className="relative mb-12">
                       <Spinner size="xl" className="text-white" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Fingerprint size={32} className="text-white/20" />
                       </div>
                    </div>
                    <h2 className="text-xl font-black tracking-tight mb-2">Establishing Secure Link</h2>
                    <p className="text-[11px] text-white/30 font-black uppercase tracking-[0.4em] leading-relaxed max-w-[200px]">
                       Capturing curriculum mastery token for terminal identification
                    </p>
                    <div className="mt-12 w-full max-w-[120px] h-[2px] bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                          className="h-full bg-white shadow-[0_0_10px_white]" 
                          initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.2 }}
                       />
                    </div>
                 </motion.div>
              )}

              {step === 2 && (
                 <motion.div 
                    key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 bg-emerald-500 p-8 flex flex-col items-center justify-center text-center text-white"
                 >
                    <motion.div 
                       initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                       className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-700/40"
                    >
                       <CheckCircle2 size={56} className="text-emerald-500" />
                    </motion.div>
                    <h2 className="text-2xl font-black tracking-tighter mb-2 italic uppercase">Payment Capturd</h2>
                    <p className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.3em] font-mono select-all">TXN ID: LRN_SIM_{Math.random().toString(36).slice(2,10).toUpperCase()}</p>
                    
                    <div className="mt-16 p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 w-full space-y-4">
                       <div className="flex justify-between items-center px-2">
                          <span className="text-[10px] font-black uppercase text-emerald-100/60">Final Settlement</span>
                          <span className="text-xl font-black font-sora tracking-tighter">₹{amount}.00</span>
                       </div>
                    </div>

                    <p className="mt-12 text-[10px] text-emerald-100 font-medium leading-relaxed opacity-60">
                       Please verify your <span className="font-bold underline">Desktop Terminal</span>. The curriculum mastery has been synchronized with your profile.
                    </p>
                    
                    <button onClick={() => window.close()} className="mt-8 px-6 py-3 bg-white text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Close Simulator</button>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>

        {/* Home Indicator */}
        <div className="h-8 flex items-center justify-center pb-2 z-40">
           <div className="w-32 h-1 bg-slate-800 rounded-full" />
        </div>
      </div>
    </div>
  )
}

const InfoIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)

export default MobileGateway
