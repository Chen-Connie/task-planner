# Task Planner

A modern, full-stack task management application built with **React**, **Firebase**, and **TailwindCSS**. Features real-time data synchronization, user authentication, and beautiful task organization.

## Live Demo

**[View Live App](https://task-planner-topaz.vercel.app)**

## Features

### **Authentication & Security**
- **Email/Password Authentication** - Secure user registration and login
- **Anonymous Guest Login** - Try the website without creating an account
- **Password Reset** - Forgot password functionality

### **Task Management**
- **Create & Edit Tasks** - Add tasks with titles, descriptions, categories, and priorities
- **Smart Date Display** - Enhanced date formatting (Today, Tomorrow, This Week, etc.)
- **Task Categories** - Organize tasks by custom categories (Work, School, Personal, etc.)
- **Priority Levels** - Set High, Medium, or Low priority for tasks
- **Task Completion** - Mark tasks as complete with real-time updates
- **Task Filtering** - Filter by category and priority

### **Modern Interface**
- **Today View** - Focus on current tasks with smart date indicators
- **Upcoming View** - See future tasks organized by date
- **Search Functionality** - Find tasks by title, description, or category
- **Dashboard Analytics** - Visual charts and statistics about your tasks
- **Real-time Updates** - Changes sync instantly across all sessions

### **Enhanced User Experience**
- **Color-coded Dates** - Visual indicators for task timing
- **Smart Sorting** - Tasks organized by completion status and priority
- **Intuitive Icons** - Clear visual cues throughout the interface
- **Loading States** - Smooth user experience with proper loading indicators

## Tech Stack

### Frontend
- **React 18** - Modern React with Hooks
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **React Icons** - Beautiful icon library
- **Recharts** - Interactive charts for dashboard

### Backend & Database
- **Firebase Authentication** - Secure user management
- **Cloud Firestore** - Real-time NoSQL database
- **Firebase Security Rules** - Server-side data protection

### Deployment
- **Vercel** - Frontend hosting and deployment
- **GitHub** - Version control and CI/CD

## Project Structure

```
task-planner/
├── scheduler-frontend/         
│   ├── src/
│   │   ├── components/        
│   │   │   └── PrivateRoute.jsx
│   │   ├── contexts/         
│   │   │   └── AuthContext.jsx
│   │   ├── pages/           
│   │   │   ├── Today.jsx      
│   │   │   ├── Upcoming.jsx  
│   │   │   ├── Search.jsx    
│   │   │   ├── Dashboard.jsx  
│   │   │   ├── Login.jsx      
│   │   │   ├── Register.jsx   
│   │   │   └── ForgotPassword.jsx
│   │   ├── firebase.js        
│   │   ├── AppLayout.jsx     
│   │   └── main.jsx         
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Getting Started

### Installation

1. **Clone the repository**
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
4. **Open your browser**:

   ```bash
   [npm run dev](http://localhost:5173)
   ```

