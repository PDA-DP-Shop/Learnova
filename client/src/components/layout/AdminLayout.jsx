import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import { motion } from 'framer-motion'

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <main className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="min-h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}

export default AdminLayout
