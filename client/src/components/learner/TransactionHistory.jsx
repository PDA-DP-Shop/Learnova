import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Download, ShieldCheck, ChevronRight, Search, FileText, CheckCircle2, X, Printer, Share2, Wallet, Calendar, Tag, User } from 'lucide-react'
import { paymentAPI } from '../../services/api'
import Spinner from '../ui/Spinner'
import toast from 'react-hot-toast'

const TransactionHistory = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  const handlePrint = (receipt) => {
      const printWindow = window.open('', '_blank');
      const html = `
         <html>
            <head>
               <title>Settlement Receipt - ${receipt.orderId}</title>
               <style>
                  body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #0F172A; }
                  .header { background: #3395FF; padding: 40px; border-radius: 24px 24px 0 0; color: white; display: flex; justify-content: space-between; align-items: center; }
                  .content { border: 1px solid #E2E8F0; border-top: none; padding: 40px; border-radius: 0 0 24px 24px; }
                  .badge { font-size: 10px; font-weight: 900; color: #3395FF; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
                  .title { font-size: 24px; font-weight: 900; margin: 0; }
                  .amount-card { background: #F8FAFC; padding: 32px; border-radius: 20px; border: 1px solid #E2E8F0; margin: 32px 0; }
                  .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #E2E8F0; font-size: 14px; }
                  .total { font-size: 32px; font-weight: 900; text-align: right; margin-top: 24px; }
                  .footer { margin-top: 40px; font-size: 10px; color: #94A3B8; text-align: center; text-transform: uppercase; letter-spacing: 2px; }
               </style>
            </head>
            <body>
               <div class="header">
                  <div>
                     <h3 class="title">Settlement Receipt</h3>
                     <p style="opacity: 0.8; font-size: 12px; margin-top: 5px;">Order ID: ${receipt.orderId}</p>
                  </div>
                  <div style="font-size: 24px;">⚖️</div>
               </div>
               <div class="content">
                  <div class="row" style="border: none;">
                     <div>
                        <div class="badge">Curriculum Link</div>
                        <div style="font-weight: 800; font-size: 16px;">${receipt.course?.title}</div>
                     </div>
                     <div style="text-align: right;">
                        <div class="badge">Capture Date</div>
                        <div style="font-weight: 800;">${new Date(receipt.createdAt).toLocaleDateString()}</div>
                     </div>
                  </div>
                  <div class="amount-card">
                     <div class="row"><span>Base Settlement</span><span>₹${(receipt.amount / 1.18).toFixed(2)}</span></div>
                     <div class="row"><span>Regulatory GST (18%)</span><span>₹${(receipt.amount - receipt.amount / 1.18).toFixed(2)}</span></div>
                     <div class="total">₹${receipt.amount.toLocaleString()}</div>
                  </div>
                  <div class="footer">Verified by Learnova Trust Protocol • Team AntiGravity</div>
               </div>
               <script>window.print(); setTimeout(() => window.close(), 500);</script>
            </body>
         </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
   };

  useEffect(() => {
    paymentAPI.getHistory()
      .then(res => setPayments(res.data.payments))
      .catch(() => toast.error('Ledger discovery failed'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-12 flex justify-center"><Spinner size="lg" /></div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Acquisition Ledger</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Verified records of your curriculum mastery settlements</p>
         </div>
         <div className="flex items-center gap-3 p-1.5 bg-slate-100 rounded-2xl w-full md:w-fit">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest text-[#3395FF]">
               <CheckCircle2 size={14} /> Synced
            </div>
            <div className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400`}>
               Personal Audit
            </div>
         </div>
      </div>

      {payments.length === 0 ? (
         <div className="bg-white rounded-[32px] p-20 text-center border border-slate-100 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <History size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">No Records Found</h3>
            <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">Your acquisition ledger is currently empty. Synchronize premium curriculum to populate this deck.</p>
         </div>
      ) : (
         <div className="grid gap-4">
            {payments.map((p) => (
               <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-100 hover:border-[#3395FF]/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all group cursor-pointer"
                  onClick={() => setSelectedReceipt(p)}
               >
                  <div className="flex items-center gap-5">
                     <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[9px] font-black text-[#3395FF] uppercase tracking-[0.2em]">{p.orderId}</span>
                           <span className="w-1 h-1 bg-slate-200 rounded-full" />
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-black text-slate-900 leading-tight truncate">{p.course?.title || 'Unknown Curriculum'}</h4>
                        <div className="flex items-center gap-4 mt-2">
                           <div className="flex items-center gap-1.5 opacity-50">
                              <Wallet size={12} className="text-slate-900" />
                              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{p.method}</span>
                           </div>
                           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg">
                              <CheckCircle2 size={10} />
                              <span className="text-[9px] font-black uppercase tracking-widest">Captured</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-50">
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement</p>
                        <p className="text-xl font-black text-slate-900 font-sora tracking-tighter">₹{p.amount.toLocaleString()}</p>
                     </div>
                     <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#3395FF] group-hover:text-white transition-all shadow-inner group-hover:shadow-lg group-hover:shadow-blue-500/30">
                        <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      )}

      {/* High-Fidelity Receipt Overlay */}
      <AnimatePresence>
         {selectedReceipt && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                  onClick={() => setSelectedReceipt(null)}
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  className="relative w-full max-w-xl bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
               >
                  {/* Receipt Header Badge */}
                  <div className="h-24 bg-[#3395FF] flex items-center justify-between px-10">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                           <ShieldCheck size={28} className="text-white" />
                        </div>
                        <div>
                           <h3 className="text-white font-black text-lg tracking-tight">Settlement Receipt</h3>
                           <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">{selectedReceipt.orderId}</p>
                        </div>
                     </div>
                     <button onClick={() => setSelectedReceipt(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all">
                        <X size={20} />
                     </button>
                  </div>

                  <div className="p-10 space-y-10">
                     {/* Identity Section */}
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settled by</p>
                           <p className="font-black text-slate-900 flex items-center gap-2 italic">{selectedReceipt.course?.title}</p>
                        </div>
                        <div className="text-right space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acquisition Date</p>
                           <p className="font-bold text-slate-700">{new Date(selectedReceipt.createdAt).toLocaleDateString()}</p>
                        </div>
                     </div>

                     {/* Details Table */}
                     <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100/50">
                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest pb-4 border-b border-slate-200/50">
                              <span>Curriculum Link</span>
                              <span>Amount</span>
                           </div>
                           <div className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-3">
                                 <Tag size={14} className="text-[#3395FF]" />
                                 <span className="font-black text-slate-900 text-sm truncate max-w-[200px]">{selectedReceipt.course?.title}</span>
                              </div>
                              <span className="font-black text-slate-900 text-sm italic">₹{selectedReceipt.amount.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center py-4 border-t-2 border-slate-950/5 mt-4">
                              <span className="font-black text-slate-950 uppercase tracking-[0.2em] text-[10px]">Total Captured</span>
                              <span className="font-black text-2xl text-slate-950 font-sora tracking-tighter">₹{selectedReceipt.amount.toLocaleString()}</span>
                           </div>
                        </div>
                     </div>

                     {/* Metadata Footer */}
                     <div className="grid grid-cols-2 gap-8 pt-6">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 opacity-40">
                              <Wallet size={12} className="text-slate-900" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Acquisition Method</span>
                           </div>
                           <p className="text-xs font-bold text-slate-600 uppercase tracking-widest ml-5">{selectedReceipt.method}</p>
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 opacity-40">
                              <Shield size={12} className="text-slate-900" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Verified Hash</span>
                           </div>
                           <p className="text-[9px] font-mono text-slate-400 ml-5 truncate select-all">{selectedReceipt.id}</p>
                        </div>
                     </div>
                  </div>

                  {/* Print / Download CTA */}
                  <div className="p-10 pt-0 flex gap-4">
                     <button onClick={() => handlePrint(selectedReceipt)} className="flex-1 h-16 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95">
                        <Download size={18} /> Download Ledger
                     </button>
                     <button className="w-16 h-16 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center transition-all">
                        <Share2 size={20} />
                     </button>
                  </div>

                  {/* Trust Footer */}
                  <div className="h-10 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 opacity-40 group cursor-default">
                     <ShieldCheck size={12} className="text-slate-900" />
                     <span className="text-[8px] font-black text-slate-900 uppercase tracking-[0.2em] group-hover:opacity-100">Learnova Verified Acquisition Link</span>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  )
}

export default TransactionHistory
