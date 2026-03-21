# 🚀 Learnova — System Architecture & Technology Stack

Learnova is a premium, high-fidelity E-Learning platform designed for high-velocity knowledge transfer and seamless curriculum management. This document outlines the structural blueprints and the advanced technology matrix powering the ecosystem.

---

## 🛠 Technology Stack

### **Frontend Core**
- **React 18**: The engine for our reactive and dynamic User Interface.
- **Tailwind CSS**: A utility-first CSS framework used for rapid, high-performance styling and maintaining design consistency.
- **Framer Motion**: Powering the platform's fluid animations, glassmorphism transitions, and interactive 3D elements.
- **Lucide React**: A suite of beautiful, consistent iconography for professional-grade visual language.
- **Axios**: Handling asynchronous telemetry and stateful communication with the backend infrastructure.
- **React Hot Toast**: Providing real-time, non-intrusive feedback for system operations and task success.

### **Backend Core**
- **Node.js & Express.js**: A high-concurrency server architecture designed for rapid RESTful API delivery.
- **Prisma ORM**: A type-safe database abstraction layer used for robust modeling and high-integrity data operations.
- **PostgreSQL**: The relational database engine providing persistent storage for courses, users, and curriculum metadata.
- **JSON Web Tokens (JWT)**: Powering our secure, stateless authentication and Role-Based Access Control (RBAC) system.

### **Cloud & Storage**
- **Cloudinary**: An automated media management platform used for secure hosting, optimization, and delivery of curriculum assets (Images, Videos, PDFs).

---

## 🏗 How the System Works

### **1. Identity & Role-Based Access (RBAC)**
Learnova operates on a strict three-tier role system:
- **Learners**: Can browse courses, enroll, track progress, attempt quizzes, and earn XP rewards.
- **Instructors**: Have access to the "Instructor Station" to build courses, manage curriculum lessons, and design assessments.
- **Admins**: Overarching system control, user management, and platform-wide monitoring.

### **2. Curriculum Lifecycle**
- **Creation**: Instructors use the `CourseForm` matrix to build lessons (Video, Document, Image) and Quizzes.
- **Media Ingestion**: When an instructor uploads a PDF or Image, the system stages the file via `express-fileupload`, transmits it securely to Cloudinary, and registers the returned `secure_url` in our PostgreSQL database.
- **Delivery**: The `LessonPlayer` dynamically identifies the asset type and chooses a high-performance renderer (built-in Video Player, Native PDF Engine, or High-Fidelity Image Viewer).

### **3. Progression & Gamification**
- **Progress Tracking**: Every second spent learning is tracked via the `enrollmentAPI`. When a lesson is marked complete, the state is synchronized atomically in the database.
- **The XP Economy**: Learners earn XP exclusively through mastered Quiz attempts. The system uses a strict role-guard to ensure rewards are only distributed to verified Learner accounts.

### **4. Interactive Components**
- **Network Profiles**: High-fidelity, animated profile cards that visualize instructor influence, learner achievements, and social connectivity.
- **Quiz Engine**: A stateful assessment matrix that handles real-time scoring, multi-attempt logic, and automated reward distribution.

---

## 📂 System Directory Structure

```text
Learnova/
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── components/     # UI Design System & Layouts
│   │   ├── pages/          # Course, Admin, & Profile Screens
│   │   ├── services/       # API abstraction (Axios)
│   │   └── context/        # Global Authentication State
├── server/                 # Express.js Backend API
│   ├── prisma/             # DB Schema & Migrations
│   ├── src/
│   │   ├── controllers/    # Business Logic & DB Operations
│   │   ├── routes/         # Endpoint Definitions
│   │   └── utils/          # Cloudinary & Token Utilities
```

---

## ⚡ Deployment & Execution Specs
- **Frontend Development Server**: `npm run dev` (Port 5173)
- **Backend API Server**: `npm run dev` (Port 5000)
- **Environment Management**: `.env` files control all external connections to the Database and Cloudinary.

> [!NOTE]
> **Pro Tip**: For real-time database visualization, run `npx prisma studio` in the server directory to access the high-fidelity data explorer.
