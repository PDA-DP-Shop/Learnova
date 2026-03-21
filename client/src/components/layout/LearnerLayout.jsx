import LearnerNavbar from './LearnerNavbar'
import { motion } from 'framer-motion'

const LearnerLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <LearnerNavbar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.main>
    </div>
  )
}

export default LearnerLayout
