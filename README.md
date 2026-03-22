<div align="center">

<br/>

# 🎓 Learnova

### Full-Stack eLearning Platform
**Built for the 24-Hour Odoo X Gujarat Vidhyapith Hackathon · 2026**

<br/>

[![React](https://img.shields.io/badge/React_18-Vite-61DAFB?style=flat-square&logo=react&logoColor=white&labelColor=20232A)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white&labelColor=1a1a1a)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma_ORM-4169E1?style=flat-square&logo=postgresql&logoColor=white&labelColor=1a1a1a)](https://postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white&labelColor=1a1a1a)](https://tailwindcss.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?style=flat-square&logo=jsonwebtokens&logoColor=white&labelColor=1a1a1a)](https://jwt.io)
[![Gmail](https://img.shields.io/badge/Email-Nodemailer_+_Gmail-EA4335?style=flat-square&logo=gmail&logoColor=white&labelColor=1a1a1a)](https://nodemailer.com)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=flat-square&labelColor=1a1a1a)](LICENSE)

<br/>

> **Learnova** is a production-grade eLearning platform where instructors build and publish courses,
> learners join and study through a full-screen player, attempt quizzes, earn points and unlock badges —
> complete with a realistic payment flow and automated Gmail email notifications.

<br/>

[📸 Screenshots](#-screenshots) • [🚀 Quick Start](#-quick-start) • [📡 API Docs](#-api-reference) • [🏆 Gamification](#-gamification-system) • [👥 Team](#-team)

<br/>

</div>

---

## 📌 Table of Contents

- [✨ Features](#-features)
- [📸 Screenshots](#-screenshots)
- [🏗️ Architecture](#-architecture)
- [🛠️ Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [🔑 Environment Variables](#-environment-variables)
- [📡 API Reference](#-api-reference)
- [🗄️ Database Schema](#-database-schema)
- [🎮 Roles & Permissions](#-roles--permissions)
- [🏆 Gamification System](#-gamification-system)
- [💳 Payment Flow](#-payment-flow)
- [📧 Email Notifications](#-email-notifications)
- [🚀 Deployment](#-deployment)
- [👥 Team](#-team)

---

## ✨ Features

### 🧑‍🏫 Instructor / Admin Backoffice

| Feature | Details |
|---|---|
| 📋 Courses Dashboard | Kanban & List views, search, tags, views count, lesson count, duration |
| ✏️ Course Builder | 4-tab editor — Content, Description, Options, Quiz |
| 🎬 Lesson Editor | Video (YouTube/Drive), Document, Image lessons with file attachments |
| 🧩 Quiz Builder | Multi-question editor, correct answer marking, attempt-based rewards |
| 👥 Add Attendees | Manually enroll learners by email — bypasses all access rules |
| 📊 Reporting Dashboard | Course-wise learner progress, filterable table, customizable columns |
| 🔒 Access Control | Open / On Invitation / On Payment + Visibility (Everyone / Signed In) |
| 🌐 Publish Toggle | One-click publish / unpublish course to learner website |

### 🎓 Learner Website

| Feature | Details |
|---|---|
| 🌐 Course Listing | Browse all published courses with search by name |
| 📚 My Courses | Personal dashboard — enrolled courses + profile + badge panel |
| 🖥️ Full-Screen Player | Collapsible sidebar, video / document / image / quiz viewer |
| 🧠 Quiz System | One question per page, multiple attempts, attempt-based scoring |
| 🏅 Points & Badges | Earn points from quizzes, unlock 6 achievement badge levels |
| 💳 Payment Flow | Real-looking checkout — Card / UPI / Net Banking + processing animation |
| 📧 Email Notifications | Auto-confirmation emails to learner + instructor after purchase |
| ⭐ Ratings & Reviews | Star rating + written review per course |
| ✅ Progress Tracking | Per-lesson status + course completion percentage bar |

---

## 📸 Screenshots

> Add screenshots after UI is complete — drop images inside `docs/screenshots/`

| Courses Dashboard | Course Form | Quiz Builder |
|---|---|---|
| ![dashboard](docs/screenshots/dashboard.png) | ![course-form](docs/screenshots/course-form.png) | ![quiz-builder](docs/screenshots/quiz-builder.png) |

| Lesson Player | Payment Checkout | Reporting Dashboard |
|---|---|---|
| ![player](docs/screenshots/player.png) | ![payment](docs/screenshots/payment.png) | ![reporting](docs/screenshots/reporting.png) |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    CLIENT  (React 18 + Vite)                   │
│                                                                │
│   ┌───────────────────────────┐  ┌──────────────────────────┐  │
│   │   Admin / Instructor      │  │    Learner Website       │  │
│   │   Backoffice  /admin/*    │  │  /courses  /my-courses   │  │
│   └───────────────────────────┘  └──────────────────────────┘  │
└────────────────────────┬───────────────────────────────────────┘
                         │  Axios  REST API
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SERVER  (Node.js + Express)                    │
│                                                                 │
│  Auth · Courses · Lessons · Quizzes · Enrollments · Progress    │
│  Reviews · Payments · Reporting · Email (Nodemailer + Gmail)    │
│                                                                 │
│  JWT Middleware  ·  Role Guards  ·  Cloudinary File Upload      │
└────────────────────────┬────────────────────────────────────────┘
                         │  Prisma ORM
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE  (PostgreSQL)                       │
│                                                                 │
│  User · Course · Lesson · Quiz · Question · Option              │
│  QuizReward · QuizAttempt · Enrollment · LessonProgress         │
│  Review · Attachment · Payment                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
                📧  Gmail SMTP (Nodemailer)
        Learner purchase confirmation
        Instructor new enrollment alert
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 (Vite) | UI framework — JSX only |
| **Styling** | TailwindCSS 3 | Utility-first CSS |
| **Routing** | React Router v6 | Client-side routing |
| **HTTP Client** | Axios | API calls |
| **Icons** | Lucide React | Icon library |
| **Animations** | Framer Motion | Page & modal transitions |
| **Video Player** | React Player | YouTube / Drive embeds |
| **PDF Viewer** | React PDF | Document lesson viewer |
| **Confetti** | canvas-confetti | Payment success celebration 🎉 |
| **Backend** | Node.js + Express | REST API server |
| **ORM** | Prisma | Database access layer |
| **Database** | PostgreSQL | Primary data store |
| **Auth** | JWT | Secure authentication |
| **File Storage** | Cloudinary | Images & document uploads |
| **Email** | Nodemailer + Gmail | Purchase confirmation emails |
| **Validation** | express-validator | Server-side input validation |

---

## 📁 Project Structure

```
Learnova/
├── client/                               # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                       # Button, Modal, Badge, Card, Toggle, ProgressBar
│   │   │   ├── layout/                   # AdminSidebar, LearnerNavbar, AdminLayout, LearnerLayout
│   │   │   └── admin/                    # CourseOptionsTab, LessonEditor, QuizBuilder
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── CoursesDashboard.jsx  # Kanban + List view
│   │   │   │   ├── CourseForm.jsx        # 4-tab course editor
│   │   │   │   ├── QuizBuilder.jsx       # Quiz + rewards builder
│   │   │   │   └── Reporting.jsx         # Learner progress table
│   │   │   ├── learner/
│   │   │   │   ├── MyCourses.jsx         # Learner dashboard
│   │   │   │   ├── CourseDetail.jsx      # Overview + Reviews tabs
│   │   │   │   ├── LessonPlayer.jsx      # Full-screen player
│   │   │   │   └── QuizPlayer.jsx        # Step-by-step quiz
│   │   │   ├── checkout/
│   │   │   │   ├── CheckoutPage.jsx      # Card / UPI / Net Banking
│   │   │   │   └── PaymentSuccess.jsx    # Confetti + order summary
│   │   │   └── auth/
│   │   │       ├── Login.jsx
│   │   │       └── Register.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── services/api.js               # Axios instance + all API calls
│   │   └── utils/
│   │       ├── badge.js                  # Points → badge level logic
│   │       └── progress.js              # Completion % helpers
│   └── tailwind.config.js
│
├── server/                               # Node.js + Express backend
│   ├── prisma/
│   │   ├── schema.prisma                 # 13 models
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
│   │   │   ├── payments.js               # Fake payment + auto-enroll
│   │   │   └── reporting.js
│   │   ├── middleware/
│   │   │   ├── auth.js                   # JWT verify
│   │   │   └── role.js                   # Role guard
│   │   ├── utils/
│   │   │   ├── email.js                  # Nodemailer send functions
│   │   │   └── cloudinary.js
│   │   └── templates/
│   │       ├── learnerPurchase.js        # Learner HTML email template
│   │       └── instructorEnrollment.js  # Instructor HTML email template
│   ├── app.js
│   └── .env
│
├── docs/screenshots/
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+
- [Git](https://git-scm.com/)
- Gmail with [App Password](https://myaccount.google.com/apppasswords) generated
- [Cloudinary](https://cloudinary.com/) free account

---

### 1️⃣ Clone

```bash
git clone https://github.com/PDA-DP-Shop/Learnova.git
cd Learnova
```

### 2️⃣ Server Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in your values — see Environment Variables section

npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed        # optional — loads sample data

npm run dev
# ✅ Server running at http://localhost:5000
```

### 3️⃣ Client Setup

```bash
cd ../client
npm install
cp .env.example .env
# Set: VITE_API_URL=http://localhost:5000/api

npm run dev
# ✅ Client running at http://localhost:5173
```

### 4️⃣ Default Accounts (after seed)

| Role | Email | Password |
|---|---|---|
| Admin | learnova@gmail.com | learnova |

---

## 🔑 Environment Variables

### `server/.env`

```env
# ── Database ────────────────────────────────────────────
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/learnova

# ── JWT ─────────────────────────────────────────────────
JWT_SECRET=your_super_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=7d

# ── Cloudinary ──────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Gmail (Nodemailer) ──────────────────────────────────
GMAIL_USER=devanshpatel12022005@gmail.com
GMAIL_APP_PASSWORD=your16charapppassword
EMAIL_FROM=Learnova <devanshpatel12022005@gmail.com>

# ── Server ──────────────────────────────────────────────
PORT=5000
NODE_ENV=development
```

> ⚠️ **Gmail App Password:**
> [myaccount.google.com](https://myaccount.google.com) → Security → 2-Step Verification (must be ON) → App Passwords → Generate → select "Mail" + "Other (Learnova)".
> Remove all spaces from the 16-character key before pasting.

### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Reference

### 🔐 Auth
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/logout` | Private |
| `GET` | `/api/auth/me` | Private |

### 📚 Courses
| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/courses` | Instructor+ |
| `POST` | `/api/courses` | Instructor+ |
| `GET` | `/api/courses/public` | Public |
| `GET` | `/api/courses/:id` | Instructor+ |
| `PUT` | `/api/courses/:id` | Instructor+ |
| `DELETE` | `/api/courses/:id` | Admin |
| `PUT` | `/api/courses/:id/publish` | Instructor+ |

### 📖 Lessons
| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/courses/:courseId/lessons` | Instructor+ |
| `POST` | `/api/courses/:courseId/lessons` | Instructor+ |
| `PUT` | `/api/lessons/:id` | Instructor+ |
| `DELETE` | `/api/lessons/:id` | Instructor+ |
| `POST` | `/api/lessons/:id/attachments` | Instructor+ |

### 🧩 Quizzes
| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/courses/:courseId/quizzes` | Instructor+ |
| `POST` | `/api/courses/:courseId/quizzes` | Instructor+ |
| `PUT` | `/api/quizzes/:id` | Instructor+ |
| `DELETE` | `/api/quizzes/:id` | Instructor+ |
| `POST` | `/api/quizzes/:id/questions` | Instructor+ |
| `PUT` | `/api/quizzes/:id/rewards` | Instructor+ |

### 🎓 Learner
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/enrollments` | Learner |
| `GET` | `/api/enrollments/my` | Learner |
| `POST` | `/api/progress/lesson` | Learner |
| `POST` | `/api/quizzes/:id/attempt` | Learner |
| `GET` | `/api/courses/:id/detail` | Learner |

### 💳 Payments
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/payments/fake-process` | Learner |

> Creates `Payment` + `Enrollment` records, then fires confirmation emails to both learner and instructor.

### ⭐ Reviews
| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/courses/:id/reviews` | Public |
| `POST` | `/api/courses/:id/reviews` | Learner |

### 📊 Reporting
| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/reporting` | Instructor+ |
| `GET` | `/api/reporting?status=IN_PROGRESS` | Instructor+ |

---

## 🗄️ Database Schema

```
User
 ├── Enrollment ──────────────── Course
 │                                  │
 ├── LessonProgress ── Lesson ───── │ ── Attachment
 │                                  │
 ├── QuizAttempt ─────── Quiz ───── │
 │                        ├── Question ── Option
 │                        └── QuizReward
 │
 ├── Review ──────────────────── Course
 │
 └── Payment ─────────────────── Course
```

**13 Prisma models:** `User` `Course` `Lesson` `Attachment` `Quiz` `Question` `Option` `QuizReward` `QuizAttempt` `Enrollment` `LessonProgress` `Review` `Payment`

---

## 🎮 Roles & Permissions

| Feature | 👤 Guest | 🎓 Learner | 🧑‍🏫 Instructor | 🔴 Admin |
|---|:---:|:---:|:---:|:---:|
| View public courses | ✅ | ✅ | ✅ | ✅ |
| Start / continue course | ❌ | ✅ | ✅ | ✅ |
| Attempt quizzes | ❌ | ✅ | ✅ | ✅ |
| Add reviews | ❌ | ✅ | ✅ | ✅ |
| Purchase paid course | ❌ | ✅ | ✅ | ✅ |
| Create / edit courses | ❌ | ❌ | ✅ | ✅ |
| Add attendees manually | ❌ | ❌ | ✅ | ✅ |
| View reporting | ❌ | ❌ | ✅ | ✅ |
| Delete any course | ❌ | ❌ | ❌ | ✅ |
| Manage all users | ❌ | ❌ | ❌ | ✅ |

### Course Access Rules

| Rule | Behaviour |
|---|---|
| **Open** | Any logged-in learner can start |
| **On Invitation** | Only learners added manually via Add Attendees |
| **On Payment** | Only learners who completed checkout |

---

## 🏆 Gamification System

### Quiz Points — Attempt-Based Scoring

Instructors configure point values in the Quiz Builder Rewards panel:

```
1st attempt  →  Maximum points   (e.g. 20 pts)
2nd attempt  →  Reduced          (e.g. 15 pts)
3rd attempt  →  Further reduced  (e.g. 10 pts)
4th attempt+ →  Minimum          (e.g.  5 pts)
```

### Badge Levels

Points accumulate across all courses. Badge level updates automatically after every quiz.

| Badge | Points Required | Emoji |
|---|---|---|
| Newbie | 20 pts | 🌱 |
| Explorer | 40 pts | 🧭 |
| Achiever | 60 pts | 🏆 |
| Specialist | 80 pts | ⚡ |
| Expert | 100 pts | 🎯 |
| Master | 120 pts | 👑 |

---

## 💳 Payment Flow

> Simulated checkout — looks and feels like a real payment gateway, no actual charges.

```
[Buy Course Button]
        ↓
[Order Summary Page]
  Course + Subtotal + 18% GST = Total
        ↓
[Select Payment Method]
  💳 Card  |  🏦 Net Banking  |  📱 UPI
        ↓
[Fill Details]
  Card → auto-formats XXXX XXXX XXXX XXXX
       → detects Visa / Mastercard / RuPay logo
  UPI  → ID validation + QR code option
  Net Banking → bank dropdown (SBI, HDFC, ICICI...)
        ↓
[Processing... 2.5 seconds]
  "Do not close this page"
        ↓
[Payment Success 🎉]
  Confetti + Order ID (LRN-XXXX) + auto-enrolled
        ↓
[Emails fired]
  Learner confirmation + Instructor revenue alert
```

---

## 📧 Email Notifications

Powered by **Nodemailer + Gmail SMTP**. Both emails fire automatically after payment — fire-and-forget so response stays fast.

| Recipient | Subject | Key Content |
|---|---|---|
| 🎓 Learner | `You're enrolled in "[Course]"` | Order ID, GST breakdown, Start Learning CTA |
| 🧑‍🏫 Instructor | `New Enrollment in "[Course]"` | Learner details, ₹ revenue card, Reporting link |

---

## 🚀 Deployment

### Frontend → Vercel

```bash
cd client
npm run build
# Deploy /dist to Vercel
# Environment variable: VITE_API_URL=https://your-api.railway.app/api
```

### Backend → Railway / Render

```bash
# Add all .env variables in hosting dashboard
npx prisma migrate deploy
npm start
```

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
# Open a Pull Request on GitHub
```

---

## 👥 Team

Built with ❤️ by **Team Codinity** — 24-Hour Odoo X Gujarat Vidhyapith Hackathon 2026

| Name | Role |
|---|---|
| Devansh Patel | Frontend / Backend |
| Udit Rana | Frontend / Backend |
| Rudra Modi | Backend |
| Mit Prajapati | Frontend / Security |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

<br/>

**Made with ❤️ by Team Codinity**

<br/>

⭐ **Star this repo if Learnova helped you!** ⭐

<br/>

[![GitHub stars](https://img.shields.io/github/stars/PDA-DP-Shop/Learnova?style=social)](https://github.com/PDA-DP-Shop/Learnova)&nbsp;&nbsp;
[![GitHub forks](https://img.shields.io/github/forks/PDA-DP-Shop/Learnova?style=social)](https://github.com/PDA-DP-Shop/Learnova/fork)

<br/>

</div>
