import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Lock, CreditCard, Landmark, Smartphone, ChevronRight, CheckCircle2, History, Info, Globe, SmartphoneNfc, ArrowLeft, Heart, Zap, Shield, HelpCircle, Trophy, QrCode as QrIcon, Search } from 'lucide-react'
import { courseAPI, paymentAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import LearnerLayout from '../../components/layout/LearnerLayout'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

const Checkout = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('card')
  const [processing, setProcessing] = useState(false)
  const [statusIdx, setStatusIdx] = useState(0)
  
  const STATUS_STEPS = [
    "Establishing secure acquisition tunnel...",
    "Authorizing transaction hash...",
    "Synchronizing curriculum logic...",
    "Acquisition mastered!"
  ]

  useEffect(() => {
    if (processing) {
      const timer = setInterval(() => {
        setStatusIdx(i => Math.min(i + 1, STATUS_STEPS.length - 1))
      }, 700)
      return () => { clearInterval(timer); setStatusIdx(0) }
    }
  }, [processing])

  // Card Form State
  const [form, setForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    saveCard: false
  })
  
  // UPI Form State
  const [upiId, setUpiId] = useState('')
  const [upiVerified, setUpiVerified] = useState(false) // This now toggles between Address and QR
  const [qrCounter, setQrCounter] = useState(300) // 5 minutes

  useEffect(() => {
    courseAPI.getDetail(id)
      .then(res => setCourse(res.data.course))
      .catch(() => toast.error('Check-out link failed'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (activeTab === 'upi' && upiVerified && qrCounter > 0) {
      const timer = setInterval(() => setQrCounter(p => p - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [activeTab, upiVerified, qrCounter])

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Spinner size="xl" /></div>
  if (!course) return null

  const subtotal = course.price || 0
  const gst = Math.round(subtotal * 0.18 * 100) / 100
  const total = Math.round((subtotal + gst) * 100) / 100

  const handlePay = async (method) => {
    setProcessing(true)
    setTimeout(async () => {
      try {
        const payload = {
          courseId: id,
          amount: total,
          method,
          last4: method === 'card' ? form.cardNumber.replace(/\s/g, '').slice(-4) : null
        }
        const { data } = await paymentAPI.fakeProcess(payload)
        navigate('/payment/success', { 
          state: { 
            orderId: data.orderId,
            amount: total,
            method: method === 'card' ? `Visa •••• ${payload.last4}` : method.toUpperCase(),
            courseTitle: course.title,
            courseId: id
          } 
        })
      } catch (err) {
        toast.error('Simulation synchronization failure')
        setProcessing(false)
      }
    }, 2500)
  }

  const getCardType = (number) => {
    const first = number?.[0]
    if (first === '4') return 'Visa'
    if (first === '5') return 'Mastercard'
    if (first === '3') return 'Amex'
    if (first === '6') return 'RuPay'
    return null
  }

  const isFormValid = () => {
    if (activeTab === 'card') {
      return form.cardNumber.replace(/\s/g, '').length === 16 && form.cardName.trim() !== '' && form.expiry.length === 5 && form.cvv.length === 3
    }
    if (activeTab === 'upi') return upiVerified // In QR mode it's "valid" because scan is possible
    return true
  }

  return (
    <LearnerLayout hideNavOnMobile={true}>
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold uppercase tracking-widest text-xs">Back to Curriculum</span>
           </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-7 space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                 <h2 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Acquisition Summary</h2>
                 <div className="flex gap-6 items-center">
                    <div className="flex-1 min-w-0">
                       <p className="text-[10px] font-black text-[#3395FF] uppercase tracking-[0.2em] mb-1">Premium Curriculum</p>
                       <h3 className="font-black text-slate-900 text-lg leading-tight truncate">{course.title}</h3>
                       <p className="text-slate-500 text-sm font-medium mt-1">Lead by {course.instructor?.name}</p>
                       <div className="flex items-center gap-2 mt-3">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider rounded-lg">Lifetime Access</span>
                       </div>
                    </div>
                 </div>
                 <div className="mt-12 space-y-4 pt-8 border-t border-slate-50">
                    <div className="flex justify-between items-center text-slate-500 font-medium"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center text-slate-500 font-medium"><span>GST (18%)</span><span>₹{gst.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center py-4 border-t border-slate-100">
                       <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Total Acquisition</span>
                       <span className="font-black text-2xl text-slate-900 font-sora tracking-tighter">₹{total.toLocaleString()}</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden sticky top-8 border border-white">
                 <div className="p-8 pb-4">
                    <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                       <Lock size={18} className="text-[#3395FF]" /> Complete Acquisition
                    </h2>
                    
                    <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-2xl mb-8">
                       {[{ id: 'card', icon: <CreditCard size={16} />, label: 'Card' }, { id: 'nb', icon: <Landmark size={16} />, label: 'Netbanking' }, { id: 'upi', icon: <Smartphone size={16} />, label: 'UPI' }].map(tab => (
                          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                             {tab.icon} {tab.label}
                          </button>
                       ))}
                    </div>

                    <AnimatePresence mode="wait">
                       {activeTab === 'card' && (
                          <motion.div key="tab-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                             <div className="space-y-1.5 group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Number</label>
                                <div className="relative">
                                   <input type="text" value={form.cardNumber} onChange={(e) => setForm({...form, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')})} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-bold text-slate-700 outline-none focus:border-[#3395FF] focus:bg-white transition-all font-mono tracking-widest md:text-lg" placeholder="0000 0000 0000 0000" />
                                   <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center">
                                      {getCardType(form.cardNumber) && <span className="text-[10px] font-black text-[#3395FF] bg-blue-50 px-2 py-1 rounded-lg uppercase">{getCardType(form.cardNumber)}</span>}
                                   </div>
                                </div>
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-400">Cardholder Name</label>
                                <input type="text" value={form.cardName} onChange={(e) => setForm({...form, cardName: e.target.value.toUpperCase()})} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-bold text-slate-700 outline-none focus:border-[#3395FF] focus:bg-white transition-all" placeholder="As discovered on card" />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry</label>
                                   <input type="text" value={form.expiry} onChange={(e) => setForm({...form, expiry: e.target.value.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(?=\d)/g, '$1/')})} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-bold text-slate-700 outline-none focus:border-[#3395FF] focus:bg-white transition-all font-mono" placeholder="MM/YY" />
                                </div>
                                <div className="space-y-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVV</label>
                                   <input type="password" maxLength={3} value={form.cvv} onChange={(e) => setForm({...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})} className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-bold text-slate-700 outline-none focus:border-[#3395FF] focus:bg-white transition-all" placeholder="•••" />
                                </div>
                             </div>
                          </motion.div>
                       )}

                       {activeTab === 'nb' && (
                          <motion.div key="tab-nb" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Acquisition Bank</label>
                                <select className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-bold text-slate-700 outline-none focus:border-[#3395FF] appearance-none">
                                   <option>HDFC Bank</option><option>ICICI Bank</option><option>State Bank of India</option><option>Axis Bank</option>
                                </select>
                             </div>
                          </motion.div>
                       )}

                       {activeTab === 'upi' && (
                          <motion.div key="tab-upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                             <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                                <button onClick={() => setUpiVerified(false)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!upiVerified ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Address</button>
                                <button onClick={() => setUpiVerified(true)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${upiVerified ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>QR Code</button>
                             </div>

                             {!upiVerified ? (
                                <div className="space-y-1.5">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual ID</label>
                                   <div className="relative">
                                      <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full h-14 bg-slate-50 border rounded-2xl px-5 font-bold text-slate-700 outline-none border-slate-200 focus:border-[#3395FF]" placeholder="identity@upi" />
                                   </div>
                                </div>
                             ) : (
                                <div className="flex flex-col items-center justify-center pt-2">
                                   <Link to={`/payment/mobile-gateway?courseId=${id}&amount=${total}&title=${encodeURIComponent(course.title)}`} target="_blank" className="group relative p-4 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#3395FF]/30 transition-all cursor-pointer">
                                      <div className="w-48 h-48 bg-slate-50 rounded-2xl flex items-center justify-center relative">
                                         <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/payment/mobile-gateway?courseId=${id}&amount=${total}`)}`} className="w-40 h-40 opacity-80 group-hover:scale-105 transition-transform" alt="" />
                                         <div className="absolute inset-0 bg-[#3395FF]/5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                            <Smartphone className="text-[#3395FF] animate-bounce mb-2" size={32} />
                                            <span className="text-[9px] font-black text-[#3395FF] bg-white px-2 py-1 rounded-lg">SIMULATE SCAN</span>
                                         </div>
                                      </div>
                                   </Link>
                                   <p className="mt-4 text-[11px] font-black text-[#3395FF] font-mono tracking-widest">04:{Math.floor(qrCounter%60).toString().padStart(2, '0')}</p>
                                </div>
                             )}
                          </motion.div>
                       )}
                    </AnimatePresence>
                 </div>

                 <div className="p-8 pt-0 mt-4">
                    <button disabled={!isFormValid()} onClick={() => handlePay(activeTab)} className={`w-full group flex items-center justify-between p-1 pr-6 rounded-2xl transition-all ${isFormValid() ? 'bg-[#3395FF] hover:bg-[#2081ea] shadow-xl shadow-blue-500/20' : 'bg-slate-200 cursor-not-allowed'}`}>
                       <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center"><ShieldCheck className="text-white" size={24} /></div>
                       <span className="text-sm font-black text-white uppercase tracking-widest">Finalize Settlement • ₹{total.toLocaleString()}</span>
                       <ChevronRight className="text-white/40 group-hover:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </div>
           </div>
        </div>

         <AnimatePresence>
            {processing && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center cursor-wait">
                  {/* Digital Aura */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3395FF]/10 rounded-full blur-[120px] animate-pulse" />
                  </div>

                  <div className="max-w-md w-full relative z-10">
                     {/* Master Visual Component */}
                     <div className="relative w-24 h-24 mx-auto mb-16">
                        {/* Outer Pulse Rings */}
                        <motion.div 
                          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }} 
                          transition={{ duration: 2, repeat: Infinity }} 
                          className="absolute inset-0 border-2 border-[#3395FF]/30 rounded-[2.5rem]" 
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }} 
                          transition={{ duration: 2, delay: 0.5, repeat: Infinity }} 
                          className="absolute inset-2 border-2 border-[#3395FF]/50 rounded-[2rem]" 
                        />
                        
                        {/* Core Shield */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3395FF] to-[#017E84] rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(51,149,255,0.3)] border-2 border-white/20">
                           <Shield className="text-white animate-bounce" size={40} fill="white" />
                        </div>
                        
                        {/* Scanning Bar */}
                        <motion.div 
                          animate={{ y: [-40, 40, -40], opacity: [0, 1, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 bg-white/40 blur-sm z-20"
                        />
                     </div>

                     <div className="space-y-6">
                        <motion.h3 
                          key={statusIdx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-2xl font-black text-white tracking-tighter font-sora"
                        >
                           {STATUS_STEPS[statusIdx]}
                        </motion.h3>
                        
                        {/* Progressive Logic Bar */}
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                           <motion.div 
                             initial={{ width: "0%" }}
                             animate={{ width: `${(statusIdx + 1) * 25}%` }}
                             className="h-full bg-gradient-to-r from-[#3395FF] via-emerald-400 to-[#017E84] shadow-[0_0_15px_rgba(51,149,255,0.6)]"
                           />
                        </div>

                        <div className="flex flex-col items-center gap-1.5">
                           <p className="text-[9px] text-[#3395FF] font-black uppercase tracking-[0.4em] leading-relaxed animate-pulse">
                              Verified Protocol {statusIdx + 1}.0
                           </p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">
                              Established secure synchronization via Learnova Node 12
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Encryption Meta Tag */}
                  <div className="absolute bottom-12 flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                     <Lock size={12} className="text-[#3395FF]" />
                     <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">AES-256 Quantum Encryption Active</span>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </LearnerLayout>
  )
}

export default Checkout
