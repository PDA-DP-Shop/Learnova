import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Users, BookOpen, Star, ArrowLeft, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react'
import LearnerLayout from '../../components/layout/LearnerLayout'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { userAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NetworkProfile = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userAPI.getProfile(id)
      .then(({ data: d }) => setData(d))
      .catch(() => {
        toast.error('Identity not found')
        navigate('/courses')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleFollow = async () => {
    if (!user) return navigate('/login')
    if (user.id === id) return toast.error('Cannot follow yourself')
    try {
      const res = await userAPI.toggleFollow(id)
      setData(prev => ({
        ...prev,
        isFollowing: res.data.following,
        profile: {
          ...prev.profile,
          _count: {
             ...prev.profile._count,
             followers: prev.profile._count.followers + (res.data.following ? 1 : -1)
          }
        }
      }))
      toast.success(res.data.following ? 'Subscribed to Lead' : 'Unsubscribed')
    } catch(err) {
      toast.error('Network sync failed')
    }
  }

  if (loading) {
    return (
      <LearnerLayout noFooter>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Spinner size="xl" className="text-[#714B67]" />
        </div>
      </LearnerLayout>
    )
  }

  if (!data?.profile) return null

  const { profile, courses, isFollowing } = data

  return (
    <LearnerLayout noFooter>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-slate-50 font-inter pb-20"
      >
        {/* Cover / Visual Matrix Layer */}
        <div className="h-[320px] w-full bg-[#0F172A] relative overflow-hidden flex flex-col justify-end">
           {/* Animated Mesh Gradient */}
           <div className="absolute inset-0 z-0">
             <motion.div 
               animate={{ 
                 scale: [1, 1.2, 1],
                 rotate: [0, 45, 0],
                 opacity: [0.3, 0.5, 0.3]
               }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-gradient-to-br from-[#714B67] to-transparent rounded-full blur-[120px]" 
             />
             <motion.div 
               animate={{ 
                 scale: [1.2, 1, 1.2],
                 rotate: [0, -45, 0],
                 opacity: [0.2, 0.4, 0.2]
               }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-gradient-to-tr from-[#017E84] to-transparent rounded-full blur-[100px]" 
             />
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
           </div>

           <div className="max-w-5xl mx-auto px-6 w-full relative z-10 pb-12 flex items-end justify-between">
              <div className="flex items-end gap-8">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="relative group shrink-0 translate-y-20"
                >
                  <div className="absolute -inset-1 bg-gradient-to-tr from-[#714B67] to-[#017E84] rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                  <div className="w-36 h-36 rounded-[2.5rem] bg-white border-4 border-white flex items-center justify-center text-[#714B67] text-6xl font-black shadow-2xl relative z-10 overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-[#714B67]/5 to-transparent" />
                     {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : profile.name?.[0]}
                  </div>
                </motion.div>

                <div className="mb-4">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 mb-2"
                  >
                    <ShieldCheck size={14} className="text-[#017E84]" />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Verified Academy Architect</span>
                  </motion.div>
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                    className="text-4xl lg:text-5xl font-black text-white font-sora tracking-tight leading-none"
                  >
                    {profile.name}
                  </motion.h1>
                </div>
              </div>

              <motion.button 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center gap-3 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-xl group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Return to Network
              </motion.button>
           </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 pt-28">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                 <span className="px-4 py-1.5 bg-[#017E84] text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-[#017E84]/20">{profile.role}</span>
                 <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                   <Users size={12} /> Established {new Date(profile.createdAt).getFullYear()}
                 </div>
              </div>
              <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                {profile.bio || "Dedicated learning architect committed to bringing high-value technical courses and premium educational modules. Let's build immersive applications and master elite protocol architectures."}
              </p>
            </div>
            
            {/* Glass Stat Matrix */}
            <div className="flex items-center gap-4 shrink-0 translate-y-[-50%] md:translate-y-[-80%] relative z-20">
               {[
                 { label: 'Network', value: profile._count.followers, icon: <Users size={20} />, color: 'from-[#714B67] to-[#5a3b52]' },
                 { label: 'Modules', value: courses?.length || 0, icon: <BookOpen size={20} />, color: 'from-[#017E84] to-[#015f63]' }
               ].map((stat, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + (i * 0.1) }}
                   className="w-32 h-32 md:w-36 md:h-36 bg-white/80 backdrop-blur-2xl border border-white shadow-2xl rounded-[2.5rem] flex flex-col items-center justify-center text-center p-4 relative group hover:-translate-y-2 transition-transform duration-500"
                 >
                   <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                     {stat.icon}
                   </div>
                   <span className="text-2xl font-black text-slate-900 font-sora tracking-tighter">{stat.value}</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</span>
                 </motion.div>
               ))}
               
               <motion.div
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
               >
                 <Button 
                    onClick={handleFollow}
                    className={`h-32 w-32 md:h-36 md:w-36 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${isFollowing ? 'bg-slate-900 border-none shadow-xl' : 'bg-[#714B67] hover:bg-[#5a3b52] shadow-2xl shadow-[#714B67]/30'}`}
                 >
                   <div className="flex flex-col items-center gap-3">
                     <Users size={24} />
                     {isFollowing ? 'Following' : 'Join'}
                   </div>
                 </Button>
               </motion.div>
            </div>
          </div>

          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 py-4 border-b border-slate-200">Active Curriculum ({courses.length})</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
               <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white">
                 <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                 <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No active modules</p>
               </div>
            ) : (
              courses.map(c => (
                <div key={c.id} onClick={() => navigate(`/courses/${c.id}`)} className="group bg-white border border-slate-200 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200 flex flex-col h-full hover:-translate-y-2">
                   <div className="h-40 bg-slate-100 shrink-0 relative">
                     {c.coverImage ? (
                       <img src={c.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#714B67]/10 to-[#017E84]/10">
                         <BookOpen size={32} className="text-[#714B67]/30" />
                       </div>
                     )}
                     <div className="absolute top-4 left-4 flex gap-2">
                       <span className={`px-3 py-1 bg-white border border-slate-200 text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg ${!c.isPublished && 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                         {c.isPublished ? (c.accessRule === 'OPEN' ? 'Public' : 'Premium') : 'Development Draft'}
                       </span>
                     </div>
                   </div>
                   <div className="p-6 flex-1 flex flex-col">
                     <h3 className="text-lg font-black text-slate-900 font-sora leading-tight mb-2 line-clamp-2">{c.title}</h3>
                     
                     <div className="mt-auto pt-6 flex items-center justify-between text-xs font-bold text-slate-500">
                       <span className="flex items-center gap-1.5"><Users size={14} className="text-[#017E84]" /> {c._count?.enrollments || 0}</span>
                       <span className="flex items-center gap-1.5 hover:text-[#714B67] transition-colors uppercase tracking-[0.2em] text-[9px]">Launch <ArrowRight size={12}/></span>
                     </div>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </LearnerLayout>
  )
}

export default NetworkProfile
