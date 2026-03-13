# ✅ Task Manager App

[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)

A full-stack task management application with real-time updates, team collaboration, and an intuitive Kanban-style interface.

## ✨ Features

- 📋 **Kanban board** — drag and drop tasks across columns (Todo / In Progress / Done)
- 👥 **Team collaboration** — assign tasks, add comments, @mention teammates
- 🏷️ **Labels & priorities** — tag tasks with custom labels and urgency levels
- 📅 **Due dates & reminders** — keep projects on track
- 🔍 **Search & filter** — find tasks by assignee, label, or due date
- 📊 **Progress dashboard** — team velocity and completion metrics
- 🔔 **Real-time updates** — live changes via WebSockets

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React · TypeScript · Tailwind CSS · React DnD |
| Backend | Node.js · Express · REST API |
| Database | MongoDB · Mongoose |
| Real-time | Socket.IO |
| Auth | JWT Bearer Tokens |

## 🚀 Getting Started

```bash
git clone https://github.com/joshivignesh/task-manager-app.git
cd task-manager-app

# Backend
cd server && npm install && npm run dev

# Frontend (new terminal)
cd client && npm install && npm run dev
```

App runs at `http://localhost:3000`

## 📁 Project Structure

```
task-manager-app/
├── client/           # React TypeScript frontend
│   ├── components/   # Kanban board, task cards, modals
│   ├── hooks/        # Custom React hooks
│   └── store/        # State management
├── server/           # Express API
│   ├── routes/       # Task, project, user routes
│   ├── models/       # Mongoose schemas
│   └── middleware/   # Auth, validation
└── shared/           # Shared TypeScript types
```

## 👤 Author

**Vignesh Joshi** — [LinkedIn](https://linkedin.com/in/joshivignesh) · [GitHub](https://github.com/joshivignesh)
