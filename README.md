# Task Planner

A full-stack task management app built with **React**, **Vite**, **TailwindCSS**, **Firebase Authentication**, and **Node.js Express backend**.

> **Live Demo**: [Task Planner on Vercel](https://task-planner-topaz.vercel.app)

---

## Features

- **User Authentication**  
  - Sign up, login, logout, reset password  
  - Built with Firebase Authentication

- **Protected Routes**  
  - Private pages accessible only to authenticated users

- **Task Management**  
  - View tasks for today and upcoming days
  - Search tasks
  - Dashboard overview

- **Modern Frontend**  
  - Vite 5 + React 18
  - TailwindCSS for responsive design
  - React Router v6 for page navigation

- **Backend API (scheduler-backend)**  
  - Express server setup (basic structure)
  - Connected to frontend (planned extension)

---

## Project Structure

```
CCPP/
 ├── scheduler-frontend/  (React + Tailwind + Vite App)
 └── scheduler-backend/   (Node.js Express Server)
```

---

## Tech Stack

- Frontend: React, Vite, TailwindCSS, Firebase Authentication
- Backend: Node.js, Express.js (basic setup)
- Deployment: Vercel

---

## Getting Started Locally

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Chen-Connie/task-planner.git
   cd task-planner/scheduler-frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

4. Visit:  
   ```
   http://localhost:5173/
