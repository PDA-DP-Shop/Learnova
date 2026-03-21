import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, X, CreditCard, Landmark, Smartphone, Wallet, ChevronRight, CheckCircle2 } from 'lucide-react'
import Spinner from './Spinner'

const FAKE_DELAY = (ms) => new Promise(resolve => setTimeout(resolve, m))

const FakeRazorpayModal = ({ isOpen, onClose, amount, name, description, onSuccess }) => {
  const [step, setStep] = useState(1) // 1: Methods, 2: Processing, 3: Success
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setSelectedMethod(null)
      setPhone('')
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  if (!isOpen) return null

  const handlePay = () => {
    if (!selectedMethod) return
    setStep(2) // Processing
    
    // Simulate network latency
    setTimeout(() => {
      setStep(3) // Success
      setTimeout(() => {
        onSuccess({
          razorpay_payment_id: `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          razorpay_order_id: `order_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          razorpay_signature: `sig_${Math.random().toString(36).substring(2, 15).toUpperCase()}`
        })
      }, 1500)
    }, 2500)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 pb-20 pt-20">
        {/* Dark overlay specifically matching Razorpay style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={step === 1 ? onClose : undefined}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[850px] bg-white rounded-xl shadow-2xl flex flex-col md:flex-row h-[500px] overflow-hidden overscroll-none"
        >
          {/* Close Button mapping to standard top-right floating */}
          {step === 1 && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-black/5 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X size={16} />
            </button>
          )}

          {/* Left Sidebar (Business Details) */}
          <div className="md:w-[320px] bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 flex flex-col justify-between hidden sm:flex shrink-0">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-6 shadow-lg shadow-black/20">
                <ShieldCheck size={24} className="text-[#3399cc]" />
              </div>
              <h2 className="text-xl font-bold mb-1 truncate">{name || 'Company Name'}</h2>
              <p className="text-sm text-slate-400 font-medium mb-8 truncate">{description || 'Order Description'}</p>
              
              <div className="h-px w-full bg-white/10 mb-8" />
              
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Amount to pay</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-sora">₹</span>
                <span className="text-4xl font-black font-sora tracking-tighter">{amount || '0.00'}</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
              <ShieldCheck size={14} /> Secured by Razorpay
            </div>
          </div>

          {/* Right Area (Payment Methods / Loading) */}
          <div className="flex-1 bg-slate-50 relative">
            
            {/* Payment Methods Structure */}
            {step === 1 && (
              <div className="h-full flex flex-col">
                <div className="sm:hidden bg-slate-900 text-white p-6 pb-8">
                  <h2 className="font-bold truncate">{name}</h2>
                  <div className="text-2xl font-black font-sora mt-2 tracking-tighter">₹ {amount}</div>
                </div>

                <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Select Payment Method</p>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'upi', label: 'UPI / QR', icon: <Smartphone size={18} />, color: 'text-emerald-500' },
                      { id: 'card', label: 'Card (Credit/Debit)', icon: <CreditCard size={18} />, color: 'text-indigo-500' },
                      { id: 'netbanking', label: 'Netbanking', icon: <Landmark size={18} />, color: 'text-amber-500' },
                      { id: 'wallet', label: 'Wallet', icon: <Wallet size={18} />, color: 'text-rose-500' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          selectedMethod === method.id 
                            ? 'border-[#3399cc] bg-[#3399cc]/5 shadow-sm' 
                            : 'border-slate-200 bg-white hover:border-[#3399cc]/30 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center ${method.color}`}>
                            {method.icon}
                          </div>
                          <span className="font-bold text-slate-700">{method.label}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? 'border-[#3399cc]' : 'border-slate-300'}`}>
                           {selectedMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-[#3399cc]" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {selectedMethod && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-slate-200 overflow-hidden"
                      >
                        <label className="block text-xs font-bold text-slate-500 mb-2">Phone Number</label>
                        <div className="flex gap-2 mb-6">
                           <div className="h-12 bg-white border-2 border-slate-200 rounded-xl px-4 flex items-center font-bold text-slate-700 shrink-0">+91</div>
                           <input 
                             type="text" 
                             placeholder="10-digit mobile number"
                             value={phone}
                             onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                             className="flex-1 h-12 bg-white border-2 border-slate-200 rounded-xl px-4 font-medium focus:outline-none focus:border-[#3399cc]"
                           />
                        </div>

                        <button
                          onClick={handlePay}
                          disabled={phone.length < 10}
                          className="w-full h-12 rounded-xl bg-[#3399cc] text-white font-black text-sm uppercase tracking-widest hover:bg-[#2b82ac] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#3399cc]/20 flex items-center justify-center gap-2"
                        >
                          Pay ₹{amount} <ChevronRight size={16} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            )}

            {/* Processing State */}
            {step === 2 && (
              <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center p-8 text-center">
                <Spinner size="xl" className="text-[#3399cc]" />
                <h3 className="mt-8 text-xl font-bold text-slate-900">Processing Payment</h3>
                <p className="mt-2 text-sm text-slate-500">Please do not close or refresh this window.</p>
                <div className="mt-8 px-6 py-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 text-xs font-bold w-full max-w-sm">
                  Do not press back button.
                </div>
              </div>
            )}

            {/* Success State */}
            {step === 3 && (
              <div className="absolute inset-0 bg-emerald-500 z-20 flex flex-col items-center justify-center p-8 text-white text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-900/20"
                >
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </motion.div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">Payment Successful</h3>
                <p className="text-emerald-100 font-medium">Redirecting to course access...</p>
              </div>
            )}
            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default FakeRazorpayModal
