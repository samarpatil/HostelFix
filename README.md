# HostelFix

A full-stack MERN hostel complaint and maintenance management system, replacing manual complaint registers with a centralized web app.

> This README will be expanded in Phase 14 with full feature docs, API reference, and demo credentials. For now, this covers project setup.

## Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React
- **Backend:** Node.js, Express, MongoDB + Mongoose, JWT auth, bcryptjs, Multer

## Project Structure

```
hostelfix/
├── backend/     # Express API
└── frontend/    # React + Vite app
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local install or a free MongoDB Atlas cluster)

### Backend setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev
```

The API starts on `http://localhost:5000` (health check at `/api/health`).

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:5000/api
npm run dev
```

The app starts on `http://localhost:5173`.

## Development Status

Currently in **Phase 1: Project setup and architecture**. See the project plan for the full 14-phase roadmap (models → auth → student features → complaints → admin dashboard → workers → notifications → feedback → analytics → security → testing → UI polish → docs/deployment).
