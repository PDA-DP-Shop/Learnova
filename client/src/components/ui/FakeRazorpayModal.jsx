import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, X, CreditCard, Landmark, Smartphone, Wallet, ChevronRight, CheckCircle2, History, Info, Globe, SmartphoneNfc } from 'lucide-react'
import Spinner from './Spinner'

const FakeRazorpayModal = ({ isOpen, onClose, amount, name, description, onSuccess }) => {
  const [step, setStep] = useState(0) // 0: Contact, 1: Methods, 2: Specific Details (Card), 3: Processing, 4: OTP/Success
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [selectedMethod, setSelectedMethod] = useState(null)
  
  // Card Details (for realistic simulation)
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [otp, setOtp] = useState('')

  useEffect(() => {
    if (isOpen) {
      setStep(0)
      setPhone('')
      setEmail('')
      setSelectedMethod(null)
      setCard({ number: '', expiry: '', cvv: '', name: '' })
      setOtp('')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  if (!isOpen) return null

  const handleProcess = () => {
    setStep(3) // Processing
    setTimeout(() => {
      setStep(4) // Success (Bypassing OTP for simulation but feeling real)
      setTimeout(() => {
        onSuccess({
          razorpay_payment_id: `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          razorpay_order_id: `order_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          razorpay_signature: `sig_simulated_${Date.now()}`
        })
      }, 1500)
    }, 2500)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
        {/* Backdrop - Matching Razorpay's specific semi-transparent dark shade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#001D33]/70 backdrop-blur-[2px]"
          onClick={step < 3 ? onClose : undefined}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-[720px] h-full sm:h-[600px] bg-white sm:rounded-lg shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col md:flex-row overflow-hidden"
        >
          {/* Authentic Header Bar */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-50">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#714B67] flex items-center justify-center text-white font-black text-xs shadow-sm border border-slate-100/10">
                   {name?.[0] || 'L'}
                </div>
                <div>
                   <h2 className="text-sm font-bold text-slate-900 leading-none">{name || 'Learnova Academy'}</h2>
                   <p className="text-[10px] text-slate-400 mt-1 font-medium tracking-tight truncate max-w-[120px] sm:max-w-none">{description || 'Curriculum Mastery'}</p>
                </div>
             </div>
             <div className="flex items-center gap-3 sm:gap-6">
                <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer opacity-40 hover:opacity-80 transition-opacity">
                   <Globe size={12} /> Language: EN
                </div>
                <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                   <X size={20} />
                </button>
             </div>
          </div>

          {/* Progress Indicator - Razorpay Signature Blue #3395FF */}
          <div className="absolute top-16 left-0 right-0 h-[2px] bg-slate-50 z-50">
             <motion.div 
                className="h-full bg-[#3395FF]" 
                animate={{ width: step === 0 ? '25%' : step === 1 ? '50%' : step === 2 ? '75%' : '100%' }}
                transition={{ duration: 0.8, ease: "circOut" }}
             />
          </div>

          {/* Immersive Sidebar (Merchant Branding) */}
          <div className="md:w-[250px] bg-slate-50 border-r border-slate-100 p-8 pt-24 flex flex-col justify-between shrink-0 hidden sm:flex">
             <div className="space-y-12">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Amount to pay</p>
                   <div className="flex items-baseline gap-1 animate-in slide-in-from-left duration-500">
                      <span className="text-xl font-bold text-slate-900 opacity-40">₹</span>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter font-sora">{amount || '0'}</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2 py-2 px-3 bg-white rounded-lg border border-slate-200/50 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors group">
                      <History size={14} className="text-slate-400 group-hover:text-[#3395FF] transition-colors" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Offers Available</span>
                   </div>
                   <div className="flex items-center gap-2 py-2 px-3 bg-white rounded-lg border border-slate-200/50 shadow-sm opacity-50">
                      <Info size={14} className="text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Pricing Details</span>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <div className="text-[10px] text-slate-400 font-medium leading-relaxed">
                   Trusted by <span className="text-slate-600 font-bold">5M+</span> businesses. Securely managed by <span className="font-bold text-[#3395FF]">Razorpay</span>.
                </div>
                <div className="h-0.5 w-8 bg-slate-200 rounded-full" />
             </div>
          </div>

          {/* Interaction Area (Content Steps) */}
          <div className="flex-1 bg-white relative pt-24 overflow-hidden">
             {/* Mobile Header Overlay */}
             <div className="sm:hidden absolute top-16 left-0 right-0 px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center z-40">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Amount</span>
                <span className="text-xl font-black text-slate-900 font-sora">₹{amount}</span>
             </div>

             <AnimatePresence mode="wait">
                {/* Step 0: Contact Verification */}
                {step === 0 && (
                   <motion.div 
                      key="contact"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="p-8 h-full flex flex-col justify-between"
                   >
                      <div className="space-y-8">
                         <div>
                            <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 border-l-2 border-[#3395FF] pl-4">Account Metadata</p>
                            <div className="space-y-5">
                               <div className="group transition-all">
                                  <label className={`text-[10px] font-bold transition-colors ${phone ? 'text-[#3395FF]' : 'text-slate-400'} uppercase tracking-widest block mb-2 ml-1`}>Mobile Number</label>
                                  <div className="relative">
                                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">+91</div>
                                     <input 
                                        type="text" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 font-bold text-slate-700 outline-none focus:border-[#3395FF] focus:bg-white transition-all ring-0 focus:ring-4 focus:ring-blue-500/5 shadow-sm"
                                        placeholder="Enter your number"
                                     />
                                  </div>
                               </div>
                               <div className="group transition-all">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 ml-1">Email (Optional)</label>
                                  <input 
                                     type="email" 
                                     value={email}
                                     onChange={(e) => setEmail(e.target.value)}
                                     className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-700 outline-none focus:border-[#3395FF] focus:bg-white transition-all ring-0 focus:ring-4 focus:ring-blue-500/5 shadow-sm"
                                     placeholder="user@learnova.academy"
                                  />
                               </div>
                            </div>
                         </div>
                         
                         <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex items-start gap-4">
                            <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                               Your contact metadata will be used for synchronizing the <span className="text-emerald-600 font-bold">Curriculum Access Token</span> and receipt generation.
                            </p>
                         </div>
                      </div>

                      <button 
                         disabled={phone.length < 10}
                         onClick={() => setStep(1)}
                         className="w-full h-14 bg-[#3395FF] hover:bg-[#2081ea] disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_15px_30px_rgba(51,149,255,0.3)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group"
                      >
                         Secure Checkout
                         <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                   </motion.div>
                )}

                {/* Step 1: Methods Selection */}
                {step === 1 && (
                   <motion.div 
                      key="methods"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="p-0 flex flex-col h-full"
                   >
                      <div className="px-8 flex items-center justify-between pb-6 border-b border-slate-50">
                         <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Acquisition Path</h3>
                         <button onClick={() => setStep(0)} className="text-[10px] font-bold text-[#3395FF] uppercase border-b border-[#3395FF]/20 hover:text-[#2081ea] transition-colors">{phone}</button>
                      </div>

                      <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3 mt-6">
                         {[
                            { id: 'card', label: 'Cards (Credit/Debit)', sub: 'Visa, Mastercard, RuPay, Maestro', icon: <CreditCard size={20} className="text-[#3395FF]" /> },
                            { id: 'upi', label: 'UPI / QR', sub: 'Google Pay, PhonePe, BHIM', icon: <SmartphoneNfc size={20} className="text-emerald-500" /> },
                            { id: 'nb', label: 'Netbanking', sub: 'HDFC, ICICI, SBI, AXIS', icon: <Landmark size={20} className="text-amber-600" /> },
                            { id: 'wallet', label: 'Wallet', sub: 'Mobikwik, Freecharge, More', icon: <Wallet size={20} className="text-orange-500" /> },
                         ].map((m) => (
                            <button 
                               key={m.id}
                               onClick={() => { setSelectedMethod(m.id); m.id === 'card' ? setStep(2) : handleProcess() }}
                               className="w-full group flex items-center gap-5 p-4 bg-white border border-slate-100 rounded-xl hover:border-[#3395FF]/30 hover:bg-blue-50/10 transition-all text-left shadow-sm"
                            >
                               <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white border border-slate-100/50 shadow-inner group-hover:shadow-sm transition-all">
                                  {m.icon}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-bold text-slate-800">{m.label}</p>
                                  <p className="text-[10px] text-slate-400 font-medium truncate tracking-tight">{m.sub}</p>
                               </div>
                               <ChevronRight size={16} className="text-slate-200 group-hover:text-[#3395FF] transition-all transform group-hover:translate-x-1" />
                            </button>
                         ))}
                      </div>

                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 opacity-60">
                         <div className="flex items-center gap-1.5 grayscale opacity-50">
                            <ShieldCheck size={12} className="text-slate-950" />
                            <span className="text-[8px] font-black text-slate-950 uppercase tracking-[0.2em]">Secure Session Mastered</span>
                         </div>
                      </div>
                   </motion.div>
                )}

                {/* Step 2: Card Details Input (Simulation Detail) */}
                {step === 2 && (
                   <motion.div 
                      key="card-details"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="p-8 h-full flex flex-col justify-between"
                   >
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                            <button onClick={() => setStep(1)} className="p-1 px-2 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">
                               <X size={14} className="rotate-0" />
                            </button>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Card Acquisition</h3>
                         </div>

                         <div className="space-y-5">
                            <div className="space-y-2">
                               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Card Number</label>
                               <div className="relative">
                                  <input 
                                     type="text" 
                                     value={card.number}
                                     onChange={(e) => setCard({...card, number: e.target.value.replace(/\D/g, '').slice(0,16).replace(/(\d{4})(?=\d)/g, '$1 ')})}
                                     className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-700 outline-none focus:border-[#3395FF] tracking-[0.2em] font-mono text-lg"
                                     placeholder="0000 0000 0000 0000"
                                  />
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 opacity-20">
                                     <div className="w-8 h-5 bg-slate-400 rounded-sm" />
                                     <div className="w-8 h-5 bg-slate-400 rounded-sm" />
                                  </div>
                               </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Expiry</label>
                                  <input 
                                     type="text" 
                                     value={card.expiry}
                                     onChange={(e) => setCard({...card, expiry: e.target.value.replace(/\D/g, '').slice(0,4).replace(/(\d{2})(?=\d)/g, '$1/')})}
                                     className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-700 outline-none focus:border-[#3395FF] font-mono text-lg"
                                     placeholder="MM/YY"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">CVV</label>
                                  <input 
                                     type="password" 
                                     value={card.cvv}
                                     onChange={(e) => setCard({...card, cvv: e.target.value.replace(/\D/g, '').slice(0,3)})}
                                     className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-700 outline-none focus:border-[#3395FF] font-mono text-lg"
                                     placeholder="***"
                                  />
                               </div>
                            </div>
                         </div>
                      </div>

                      <button 
                         disabled={card.number.length < 19 || card.expiry.length < 5 || card.cvv.length < 3}
                         onClick={handleProcess}
                         className="w-full h-16 bg-[#3395FF] hover:bg-[#2081ea] disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-[#3395FF]/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                      >
                         Secure Payment ₹{amount}
                      </button>
                   </motion.div>
                )}

                {/* Step 3: Immersive Processing Stage */}
                {step === 3 && (
                   <motion.div 
                      key="processing"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 text-center"
                   >
                      <div className="relative mb-12">
                         <Spinner size="xl" className="text-[#3395FF]" />
                         <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center"
                         >
                            <ShieldCheck size={32} className="text-[#3395FF]/40" />
                         </motion.div>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Synchronizing with Gateway...</h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] max-w-[240px] leading-relaxed">
                         Authenticating curriculum purchase request for <span className="text-slate-900">{name}</span>
                      </p>
                      
                      <div className="mt-12 w-full max-w-[200px] h-1 bg-slate-100 rounded-full overflow-hidden">
                         <motion.div 
                            className="h-full bg-gradient-to-r from-[#3395FF] to-blue-300" 
                            initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.5, ease: "linear" }}
                         />
                      </div>
                   </motion.div>
                )}

                {/* Step 4: Authentic Success Stage */}
                {step === 4 && (
                   <motion.div 
                      key="success"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-[#3395FF] z-[110] flex flex-col items-center justify-center p-10 text-white text-center"
                   >
                      <motion.div
                         initial={{ scale: 0, rotate: -200 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 14, stiffness: 200 }}
                         className="w-28 h-28 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-8 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
                      >
                         <CheckCircle2 size={56} className="text-white drop-shadow-lg" />
                      </motion.div>
                      <h3 className="text-3xl font-black mb-2 tracking-tight">Payment Captured</h3>
                      <p className="text-blue-100/60 text-[9px] font-black uppercase tracking-[0.4em] mb-12 select-all">Transaction: PAY_{Math.random().toString(36).slice(2,10).toUpperCase()}</p>
                      
                      <div className="space-y-6 w-full">
                         <div className="h-px w-full bg-white/10" />
                         <div className="flex flex-col items-center gap-4">
                            <Spinner size="sm" className="text-white/40" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 animate-pulse">Syncing Learnova DB...</p>
                         </div>
                      </div>

                      {/* Genuine Razorpay Disclaimer Footer (Success State) */}
                      <div className="absolute bottom-8 left-0 right-0 px-8">
                         <p className="text-[10px] text-blue-100/40 font-medium">Redirecting back to course environment. This might take a few seconds.</p>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Persistent Desktop Footer (Genuine Badge) */}
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-slate-900 flex items-center justify-between px-8 z-[60] hidden sm:flex border-t border-white/5">
             <div className="flex items-center gap-2 opacity-50 group cursor-default">
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center scale-90">
                   <ShieldCheck size={12} className="text-slate-900" />
                </div>
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] group-hover:opacity-100 transition-opacity">Powered by Razorpay Legacy API</span>
             </div>
             <div className="flex items-center gap-6 opacity-40">
                <span className="text-[9px] font-black text-white uppercase tracking-widest hover:underline cursor-pointer">Help</span>
                <span className="text-[9px] font-black text-white uppercase tracking-widest hover:underline cursor-pointer">Terms</span>
                <span className="text-[9px] font-black text-white uppercase tracking-widest hover:underline cursor-pointer">Privacy</span>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default FakeRazorpayModal
