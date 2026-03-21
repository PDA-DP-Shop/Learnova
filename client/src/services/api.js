import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// ─── Courses ──────────────────────────────────────────────────────────────────
export const courseAPI = {
  list: () => api.get('/courses'),
  listPublic: () => api.get('/courses/public'),
  create: (data) => api.post('/courses', data),
  get: (id) => api.get(`/courses/${id}`),
  getDetail: (id) => api.get(`/courses/${id}/detail`),
  update: (id, data) => api.put(`/courses/${id}`, data),
  updateForm: (id, formData) => api.put(`/courses/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/courses/${id}`),
  togglePublish: (id) => api.put(`/courses/${id}/publish`),
}

// ─── Lessons ──────────────────────────────────────────────────────────────────
export const lessonAPI = {
  list: (courseId) => api.get(`/courses/${courseId}/lessons`),
  create: (courseId, formData) => api.post(`/courses/${courseId}/lessons`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/lessons/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/lessons/${id}`),
  addAttachment: (id, data) => api.post(`/lessons/${id}/attachments`, data),
  deleteAttachment: (id, attachmentId) => api.delete(`/lessons/${id}/attachments/${attachmentId}`),
}

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export const quizAPI = {
  list: (courseId) => api.get(`/courses/${courseId}/quizzes`),
  create: (courseId, data) => api.post(`/quizzes`, { ...data, courseId }),
  get: (id) => api.get(`/quizzes/${id}`),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  addQuestion: (id, data) => api.post(`/quizzes/${id}/questions`, data),
  updateQuestion: (id, questionId, data) => api.put(`/quizzes/${id}/questions/${questionId}`, data),
  deleteQuestion: (id, questionId) => api.delete(`/quizzes/${id}/questions/${questionId}`),
  updateRewards: (id, data) => api.put(`/quizzes/${id}/rewards`, data),
  submitAttempt: (id, data) => api.post(`/quizzes/${id}/attempt`, data),
}

// ─── Enrollments ──────────────────────────────────────────────────────────────
export const enrollmentAPI = {
  enroll: (courseId) => api.post('/enrollments', { courseId }),
  myEnrollments: () => api.get('/enrollments/my'),
  complete: (courseId) => api.put(`/enrollments/${courseId}/complete`),
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progressAPI = {
  markComplete: (lessonId) => api.post('/progress/lesson', { lessonId }),
  getProgress: (courseId) => api.get(`/progress?courseId=${courseId}`),
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewAPI = {
  list: (courseId) => api.get(`/reviews/${courseId}`),
  create: (courseId, data) => api.post(`/reviews/${courseId}`, data),
}

// ─── Reporting ────────────────────────────────────────────────────────────────
export const reportingAPI = {
  get: (params) => api.get('/reporting', { params }),
}

export default api
