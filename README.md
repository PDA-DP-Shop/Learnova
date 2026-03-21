<div align="center">

<img src="https://img.shields.io/badge/Learnova-eLearning%20Platform-6366F1?style=for-the-badge&logo=bookstack&logoColor=white" alt="Learnova" />

# 🎓 Learnova

### THE NEXT-GEN E-LEARNING ECOSYSTEM
Built with a premium, high-fidelity stack for the AntiGravity Hackathon.

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

## 📖 Essential Deep-Dive Documentation
For a full breakdown of how the system works, the high-fidelity tech stack, and architectural blueprints, please see:

👉 **[SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md)**

---

## ✨ Features

### 🧑‍🏫 Instructor / Admin Station
- 📋 **Courses Dashboard** — Kanji & List views with high-precision search and analytics
- ✏️ **Course Builder** — Full course editor with 4 tabs (Content, Description, Options, Quiz)
- 🎬 **Lesson Matrix** — Support for Video (YouTube/Drive), Document (PDF), and Visual Imagery
- 🗑️ **Asset Purge** — Full control over curriculum media with staged deletions
- 🧩 **Quiz Builder** — Multi-question quiz editor with automated scoring logic
- 🎁 **Reward System** — Precision XP distribution per attempt (decaying rewards)

### 🎓 Learner Website
- 🌐 **Public Course Listing** — Browse all published courses with glassmorphism UI
- 📚 **My Courses Page** — Personal dashboard with integrated profile achievements
- 🖥️ **Full-Screen Lesson Player** — Native PDF engine, 4K Video support, and Image viewer
- 🧠 **Quiz System** — Stateful assessment matrix with XP rewards
- 🏅 **Points & Badges** — Real-time progression based on knowledge mastery
- ⭐ **Ratings & Reviews** — High-fidelity community feedback system

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

## ⚡ Getting Started

### 1. Engine Room (Server)
```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```

### 2. Flight Deck (Client)
```bash
cd client
npm install
npm run dev
```

### Default Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@learnova.com | Admin@123 |
| Instructor | instructor@learnova.com | Instructor@123 |
| Learner | learner@learnova.com | Learner@123 |

---

## 👥 Team Learnova
Built with ❤️ by **Codinity** for the AntiGravity Hackathon.

| Name | Role |
|---|---|
| Devansh Patel | Full-Stack Architect |
| Mit Prajapati | Security & Frontend |
| Udit Rana | Full-Stack Engineer |
| Rudra Modi | Backend Infrastructure |

---

<div align="center">

⭐ Star this repo if you found it helpful!

</div>
