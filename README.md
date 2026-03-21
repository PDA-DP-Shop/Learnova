<div align="center">

<img src="https://img.shields.io/badge/Learnova-eLearning%20Platform-6366F1?style=for-the-badge&logo=bookstack&logoColor=white" alt="Learnova" />

# 🎓 Learnova

### A Full-Stack eLearning Platform built for the AntiGravity Hackathon

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=flat-square)](LICENSE)

<br/>

> **Learnova** is a production-grade eLearning platform where instructors create and publish courses, and learners can join, study, attempt quizzes, earn points, and unlock achievement badges — all in one seamless experience.

<br/>

[🚀 Live Demo](#) · [📸 Screenshots](#-screenshots) · [🛠️ Setup Guide](#-getting-started) · [📡 API Docs](#-api-reference)

</div>

---

## 📌 Table of Contents

- [✨ Features](#-features)
- [🖼️ Screenshots](#-screenshots)
- [🏗️ Architecture](#-architecture)
- [🛠️ Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚡ Getting Started](#-getting-started)
- [🔑 Environment Variables](#-environment-variables)
- [📡 API Reference](#-api-reference)
- [🗄️ Database Schema](#-database-schema)
- [🎮 Roles & Permissions](#-roles--permissions)
- [🏆 Gamification System](#-gamification-system)
- [👥 Team](#-team)

---

## ✨ Features

### 🧑‍🏫 Instructor / Admin Backoffice
- 📋 **Courses Dashboard** — Kanban & List views with search, tags, stats
- ✏️ **Course Builder** — Full course editor with 4 tabs (Content, Description, Options, Quiz)
- 🎬 **Lesson Editor** — Support for Video (YouTube/Drive), Document, and Image lessons
- 📎 **Attachments** — Add downloadable files or external links per lesson
- 🧩 **Quiz Builder** — Multi-question quiz editor with correct answer marking
- 🎁 **Reward System** — Set points per attempt (1st, 2nd, 3rd, 4th+)
- 👥 **Attendees Management** — Invite learners via email, contact attendees
- 📊 **Reporting Dashboard** — Course-wise learner progress with filterable table and column customizer
- 🔒 **Access Rules** — Open / On Invitation / On Payment with visibility controls

### 🎓 Learner Website
- 🌐 **Public Course Listing** — Browse all published courses with search
- 📚 **My Courses Page** — Personal dashboard with enrolled courses + profile panel
- 🖥️ **Full-Screen Lesson Player** — Collapsible sidebar, video/doc/image/quiz viewer
- 🧠 **Quiz System** — One question per page, multiple attempts, attempt-based scoring
- 🏅 **Points & Badges** — Earn points from quizzes, unlock badge levels
- ⭐ **Ratings & Reviews** — Add and view course reviews with star ratings
- ✅ **Progress Tracking** — Per-lesson and per-course completion tracking

---

## 🖼️ Screenshots

> *(Add screenshots after UI is built — recommended: Courses Dashboard, Lesson Player, Quiz, Reporting)*

| Courses Dashboard | Lesson Player | Quiz Player |
|---|---|---|
| ![dashboard](./docs/screenshots/dashboard.png) | ![player](./docs/screenshots/player.png) | ![quiz](./docs/screenshots/quiz.png) |

| My Courses | Reporting | Quiz Builder |
|---|---|---|
| ![mycourses](./docs/screenshots/mycourses.png) | ![reporting](./docs/screenshots/reporting.png) | ![quizbuilder](./docs/screenshots/quizbuilder.png) |

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                         │
│   ┌───────────────────┐        ┌───────────────────────────┐  │
│   │  Admin Backoffice │        │     Learner Website       │  │
│   │  /admin/*         │        │     /courses, /my-courses │  │
│   └───────────────────┘        └───────────────────────────┘  │
└──────────────────────────┬────────────────────────────────────┘
                           │ REST API (Axios)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVER (Node.js + Express)                 │
│   Auth · Courses · Lessons · Quizzes · Progress · Reports   │
│   JWT Middleware · Role Guards · File Upload (Cloudinary)   │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma ORM
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                     │
│   Users · Courses · Lessons · Quizzes · Enrollments ·       │
│   Progress · Reviews · Attachments · Quiz Attempts          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 (Vite) | UI framework |
| **Styling** | TailwindCSS | Utility-first CSS |
| **Routing** | React Router v6 | Client-side routing |
| **HTTP Client** | Axios | API calls |
| **Icons** | Lucide React | Icon library |
| **Animations** | Framer Motion | Page/modal transitions |
| **Video** | React Player | YouTube/Drive embeds |
| **PDF Viewer** | React PDF | Document lessons |
| **Backend** | Node.js + Express | REST API server |
| **ORM** | Prisma | Database access |
| **Database** | PostgreSQL | Primary data store |
| **Auth** | JWT (httpOnly) | Secure authentication |
| **File Storage** | Cloudinary | Images, documents |
| **Validation** | express-validator | Input validation |

---

## 📁 Project Structure

```
learnova/
├── client/                          # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/                  # Images, fonts
│   │   ├── components/
│   │   │   ├── ui/                  # Button, Modal, Badge, Card, Toggle...
│   │   │   ├── layout/              # AdminSidebar, LearnerNavbar, Layouts
│   │   │   └── shared/              # CourseCard, ProgressBar, StarRating...
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── CoursesDashboard.jsx
│   │   │   │   ├── CourseForm.jsx
│   │   │   │   ├── LessonEditor.jsx
│   │   │   │   ├── QuizBuilder.jsx
│   │   │   │   └── Reporting.jsx
│   │   │   ├── learner/
│   │   │   │   ├── MyCourses.jsx
│   │   │   │   ├── CourseDetail.jsx
│   │   │   │   ├── LessonPlayer.jsx
│   │   │   │   └── QuizPlayer.jsx
│   │   │   └── auth/
│   │   │       ├── Login.jsx
│   │   │       └── Register.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useCourse.js
│   │   ├── services/
│   │   │   └── api.js               # Axios instance + all API calls
│   │   ├── utils/
│   │   │   ├── badge.js             # Points → badge level logic
│   │   │   └── progress.js          # Completion % helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Node.js + Express backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── courses.js
│   │   │   ├── lessons.js
│   │   │   ├── quizzes.js
│   │   │   ├── enrollments.js
│   │   │   ├── progress.js
│   │   │   ├── reviews.js
│   │   │   └── reporting.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification
│   │   │   └── role.js              # Role-based guard
│   │   └── utils/
│   │       ├── cloudinary.js
│   │       └── jwt.js
│   ├── app.js
│   ├── .env
│   └── package.json
│
├── docs/
│   └── screenshots/
├── .gitignore
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+
- [Git](https://git-scm.com/)
- A [Cloudinary](https://cloudinary.com/) account (free tier works)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/learnova.git
cd learnova
```

---

### 2. Setup the Server

```bash
cd server
npm install
```

Create your `.env` file (see [Environment Variables](#-environment-variables) section below):

```bash
cp .env.example .env
# Fill in your values
```

Run Prisma migrations to set up the database:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Seed the database with sample data (optional):

```bash
npx prisma db seed
```

Start the server:

```bash
npm run dev
# Server runs at http://localhost:5000
```

---

### 3. Setup the Client

```bash
cd ../client
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
# Client runs at http://localhost:5173
```

---

### 4. Default Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@learnova.com | Admin@123 |
| Instructor | instructor@learnova.com | Instructor@123 |
| Learner | learner@learnova.com | Learner@123 |

---

## 🔑 Environment Variables

### Server (`server/.env`)

```env
# Database
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/learnova

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
NODE_ENV=development
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Reference

### 🔐 Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login, receive JWT | Public |
| POST | `/api/auth/logout` | Logout | Private |
| GET | `/api/auth/me` | Get current user | Private |

### 📚 Courses
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/courses` | List all courses (backoffice) | Instructor+ |
| POST | `/api/courses` | Create new course | Instructor+ |
| GET | `/api/courses/public` | Public course list (respects visibility) | Public |
| GET | `/api/courses/:id` | Get course details | Instructor+ |
| PUT | `/api/courses/:id` | Update course | Instructor+ |
| DELETE | `/api/courses/:id` | Delete course | Admin |
| PUT | `/api/courses/:id/publish` | Toggle publish on/off | Instructor+ |

### 📖 Lessons
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/courses/:courseId/lessons` | List lessons | Instructor+ |
| POST | `/api/courses/:courseId/lessons` | Add lesson | Instructor+ |
| PUT | `/api/lessons/:id` | Update lesson | Instructor+ |
| DELETE | `/api/lessons/:id` | Delete lesson | Instructor+ |
| POST | `/api/lessons/:id/attachments` | Add attachment | Instructor+ |

### 🧩 Quizzes
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/courses/:courseId/quizzes` | List quizzes | Instructor+ |
| POST | `/api/courses/:courseId/quizzes` | Create quiz | Instructor+ |
| PUT | `/api/quizzes/:id` | Update quiz | Instructor+ |
| DELETE | `/api/quizzes/:id` | Delete quiz | Instructor+ |
| POST | `/api/quizzes/:id/questions` | Add question | Instructor+ |
| PUT | `/api/quizzes/:id/rewards` | Set attempt rewards | Instructor+ |

### 🎓 Learner
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/enrollments` | Enroll in a course | Learner |
| GET | `/api/enrollments/my` | Get my enrollments | Learner |
| POST | `/api/progress/lesson` | Mark lesson complete | Learner |
| POST | `/api/quizzes/:id/attempt` | Submit quiz attempt → returns points | Learner |
| GET | `/api/courses/:id/detail` | Course detail with progress | Learner |

### ⭐ Reviews
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/courses/:id/reviews` | Get course reviews | Public |
| POST | `/api/courses/:id/reviews` | Add review + rating | Learner |

### 📊 Reporting
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/reporting` | All learner progress | Instructor+ |
| GET | `/api/reporting?status=IN_PROGRESS` | Filter by status | Instructor+ |

---

## 🗄️ Database Schema

```
User ──────────── Enrollment ──────── Course
  │                                     │
  ├── QuizAttempt ──── Quiz ────────────┤
  │                     │               │
  │                  Question           ├── Lesson
  │                     │               │      │
  └── Review            └── Option      │   Attachment
                                        │
                              QuizReward (per quiz)
                              LessonProgress (per user+lesson)
```

**Key models:** `User`, `Course`, `Lesson`, `Quiz`, `Question`, `Option`, `QuizReward`, `QuizAttempt`, `Enrollment`, `LessonProgress`, `Review`, `Attachment`

---

## 🎮 Roles & Permissions

| Feature | Guest | Learner | Instructor | Admin |
|---|---|---|---|---|
| View public courses | ✅ | ✅ | ✅ | ✅ |
| Start/continue course | ❌ | ✅ | ✅ | ✅ |
| Attempt quizzes | ❌ | ✅ | ✅ | ✅ |
| Add reviews | ❌ | ✅ | ✅ | ✅ |
| Create courses | ❌ | ❌ | ✅ | ✅ |
| Manage lessons/quizzes | ❌ | ❌ | ✅ | ✅ |
| View reporting | ❌ | ❌ | ✅ | ✅ |
| Delete any course | ❌ | ❌ | ❌ | ✅ |
| Manage all users | ❌ | ❌ | ❌ | ✅ |

### Access Rules
| Rule | Behaviour |
|---|---|
| **Open** | Any enrolled learner can start learning |
| **On Invitation** | Only invited/enrolled learners can access lessons |
| **On Payment** | Learner must pay before starting; shows price on card |

---

## 🏆 Gamification System

### Points
Quizzes award points based on how many attempts the learner takes:

```
1st Attempt → Maximum points (set by instructor)
2nd Attempt → Reduced points
3rd Attempt → Further reduced
4th+ Attempt → Minimum points
```

### Badge Levels

| Badge | Points Required | Emoji |
|---|---|---|
| Newbie | 20 pts | 🌱 |
| Explorer | 40 pts | 🧭 |
| Achiever | 60 pts | 🏆 |
| Specialist | 80 pts | ⚡ |
| Expert | 100 pts | 🎯 |
| Master | 120 pts | 👑 |

Points accumulate across all courses. Badge level updates automatically after each quiz completion.

---

## 🚀 Deployment

### Client (Vercel)
```bash
cd client
npm run build
# Deploy /dist folder to Vercel
```

### Server (Railway / Render)
```bash
# Set all environment variables in your hosting dashboard
# Run migrations on deploy:
npx prisma migrate deploy
npm start
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 👥 Team

Built with ❤️ by **Codinity** for the 24-Hour eLearning Hackathon.

| Name | Role |
|---|---|
| Devansh Patel | Frontent & Backend |
| Mit Prajapati | Security & Frontent |
| Udit Rana | Frontent & Backend |
| Rudra Modi | Backend |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">


⭐ Star this repo if you found it helpful!

</div>
