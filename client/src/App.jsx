import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { LoadingScreen } from './components/ui/Spinner'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin Pages
import CoursesDashboard from './pages/admin/CoursesDashboard'
import CourseForm from './pages/admin/CourseForm'
import QuizBuilder from './pages/admin/QuizBuilder'
import Reporting from './pages/admin/Reporting'

// Learner Pages
import CoursesPage from './pages/learner/CoursesPage'
import MyCourses from './pages/learner/MyCourses'
import CourseDetail from './pages/learner/CourseDetail'
import LessonPlayer from './pages/learner/LessonPlayer'
import QuizPlayerPage from './pages/learner/QuizPlayer'

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/courses" replace />
  return <Outlet />
}

const App = () => {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/courses" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<CoursesPage />} />

        {/* Learner - auth required */}
        <Route element={<ProtectedRoute roles={['LEARNER', 'INSTRUCTOR', 'ADMIN']} />}>
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/courses/:id/learn/:lessonId" element={<LessonPlayer />} />
          <Route path="/courses/:id/quiz/:quizId" element={<QuizPlayerPage />} />
        </Route>

        {/* Admin / Instructor */}
        <Route element={<ProtectedRoute roles={['ADMIN', 'INSTRUCTOR']} />}>
          <Route path="/admin/courses" element={<CoursesDashboard />} />
          <Route path="/admin/courses/:id/edit" element={<CourseForm />} />
          <Route path="/admin/courses/:id/quiz/:quizId" element={<QuizBuilder />} />
          <Route path="/admin/reporting" element={<Reporting />} />
        </Route>

        <Route path="*" element={<Navigate to="/courses" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
