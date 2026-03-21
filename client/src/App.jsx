import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import { LoadingScreen } from './components/ui/Spinner'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import CoursesDashboard from './pages/admin/CoursesDashboard'
import CourseForm from './pages/admin/CourseForm'
import QuizBuilder from './pages/admin/QuizBuilder'
import Reporting from './pages/admin/Reporting'
import UsersDashboard from './pages/admin/UsersDashboard'

// Learner Pages
import CoursesPage from './pages/learner/CoursesPage'
import MyCourses from './pages/learner/MyCourses'
import CourseDetail from './pages/learner/CourseDetail'
import LessonPlayer from './pages/learner/LessonPlayer'
import QuizPlayerPage from './pages/learner/QuizPlayer'
import NetworkProfile from './pages/learner/NetworkProfile'

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/courses" replace />
  return <Outlet />
}

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.99, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 1.01, y: -10 }}
    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
)

const AnimatedRoutes = () => {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<Navigate to="/courses" replace />} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/courses" element={<PageWrapper><CoursesPage /></PageWrapper>} />

        {/* Learner - auth required */}
        <Route element={<ProtectedRoute roles={['LEARNER', 'INSTRUCTOR', 'ADMIN']} />}>
          <Route path="/my-courses" element={<PageWrapper><MyCourses /></PageWrapper>} />
          <Route path="/courses/:id" element={<PageWrapper><CourseDetail /></PageWrapper>} />
          <Route path="/courses/:id/learn/:lessonId" element={<LessonPlayer />} />
          <Route path="/courses/:id/quiz/:quizId" element={<PageWrapper><QuizPlayerPage /></PageWrapper>} />
          <Route path="/network/:id" element={<PageWrapper><NetworkProfile /></PageWrapper>} />
        </Route>

        {/* Admin / Instructor */}
        <Route element={<ProtectedRoute roles={['ADMIN', 'INSTRUCTOR']} />}>
          <Route path="/admin" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/admin/courses" element={<PageWrapper><CoursesDashboard /></PageWrapper>} />
          <Route path="/admin/courses/:id/edit" element={<PageWrapper><CourseForm /></PageWrapper>} />
          <Route path="/admin/courses/:id/quiz/:quizId" element={<PageWrapper><QuizBuilder /></PageWrapper>} />
          <Route path="/admin/reporting" element={<PageWrapper><Reporting /></PageWrapper>} />
        </Route>
        
        {/* Super Admin */}
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route path="/admin/users" element={<PageWrapper><UsersDashboard /></PageWrapper>} />
        </Route>

        <Route path="*" element={<Navigate to="/courses" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

const App = () => {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
