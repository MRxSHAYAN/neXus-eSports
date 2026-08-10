# NEXUS ESPORTS — Full Stack Tournament Platform

A production-ready tournament management platform for PUBG Mobile (and any other game). Built with **Astro + Tailwind CSS v4** on the frontend and **Express + MongoDB** on the backend.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Astro 7, Tailwind CSS v4, TypeScript |
| Backend    | Node.js, Express 4, MongoDB Atlas |
| Database   | Mongoose 8 (MongoDB)              |
| File Uploads | Multer (local disk, `/uploads`) |
| Auth       | JWT (jsonwebtoken), 12h expiry    |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
neXus eSports/
├── backend/              # Express REST API
│   ├── config/db.js      # MongoDB connection with caching
│   ├── controllers/      # Business logic
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routers
│   ├── uploads/          # Payment screenshot storage
│   ├── .env              # Backend environment variables
│   └── index.js          # Server entry point
└── frontend/             # Astro static/SSG site
    ├── src/
    │   ├── components/   # Navbar, Footer, TournamentCard
    │   ├── layouts/      # Layout.astro, AdminLayout.astro
    │   ├── pages/        # All public + admin pages
    │   ├── styles/       # global.css (Tailwind + custom utilities)
    │   └── utils/api.js  # Centralized API fetch helper
    ├── public/           # Static assets (images, favicon)
    └── .env              # Frontend environment variables
```

---

## Local Development Setup

### Prerequisites
- Node.js >= 22
- MongoDB running locally (`mongod`) **or** a MongoDB Atlas URI

### 1. Backend

```bash
cd backend
npm install
```

Create / verify `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nexus-esports
JWT_SECRET=your_secure_secret_here
ADMIN_USERNAME=nexus
ADMIN_PASSWORD=nexus123098
CORS_ORIGIN=http://localhost:4321
```

Start the backend:
```bash
npm run dev      # nodemon (auto-reload)
# or
npm start        # production node
```

The API will be live at **http://localhost:5000**.

### 2. Frontend

```bash
cd frontend
npm install
```

Create / verify `frontend/.env`:

```env
PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

The site will be live at **http://localhost:4321**.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable         | Description                              | Default                              |
|------------------|------------------------------------------|--------------------------------------|
| `PORT`           | Server port                              | `5000`                               |
| `NODE_ENV`       | Environment (`development`/`production`) | `development`                        |
| `MONGODB_URI`    | MongoDB connection string                | `mongodb://localhost:27017/nexus-esports` |
| `JWT_SECRET`     | Secret for signing JWT tokens            | —                                    |
| `ADMIN_USERNAME` | Admin login username                     | `nexus`                              |
| `ADMIN_PASSWORD` | Admin login password                     | `nexus123098`                        |
| `CORS_ORIGIN`    | Allowed frontend origin                  | `http://localhost:4321`              |

### Frontend (`frontend/.env`)

| Variable         | Description                          | Default                          |
|------------------|--------------------------------------|----------------------------------|
| `PUBLIC_API_URL` | Full base URL to the backend API     | `http://localhost:5000/api`      |

---

## API Reference

| Method | Endpoint                        | Description                       |
|--------|---------------------------------|-----------------------------------|
| POST   | `/api/auth/login`               | Admin login (returns JWT)         |
| GET    | `/api/auth/verify`              | Verify JWT token                  |
| GET    | `/api/tournaments`              | List all tournaments              |
| POST   | `/api/tournaments`              | Create tournament                 |
| PUT    | `/api/tournaments/:id`          | Update tournament                 |
| DELETE | `/api/tournaments/:id`          | Delete tournament                 |
| GET    | `/api/teams`                    | List all registered teams         |
| POST   | `/api/teams/register`           | Submit a new registration         |
| PATCH  | `/api/teams/:id/status`         | Update team status (admin)        |
| DELETE | `/api/teams/:id`                | Delete a team registration        |
| GET    | `/api/bank`                     | Get 2 payment accounts            |
| PUT    | `/api/bank`                     | Update payment accounts (admin)   |
| GET    | `/api/admin/stats`              | Dashboard stats (admin)           |
| GET    | `/api/health`                   | Server health check               |

---

## Production Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Set **Root Directory** to `backend`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add **Environment Variables** in the Render dashboard:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a strong random string
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD`
   - `CORS_ORIGIN` — your live Vercel frontend URL (e.g. `https://nexus-e-sports.vercel.app`)

### Frontend → Vercel

1. Import the repo on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Astro**.
4. Add **Environment Variable**:
   - `PUBLIC_API_URL` = `https://your-render-app.onrender.com/api`
5. Deploy.

---

## Admin Panel

The admin panel is at `/admin` and is protected by a JWT auth guard.

**Default credentials:**
- Username: `nexus`
- Password: `nexus123098`

> Change these in `backend/.env` before deploying to production.

### Admin Features
- **Dashboard** — Live stats (total squads, approved, pending, revenue)
- **Tournaments** — Create, edit, toggle status, delete tournaments
- **Teams** — View all registrations, approve/reject payments, view screenshot proof, delete
- **Bank Accounts** — Configure exactly 2 payment accounts shown during registration
- **Settings** — Configuration overview and instructions

---

## Social Links

The platform uses:
- **Instagram** — `https://www.instagram.com/nexus.esports.pk`
- **WhatsApp Contact** — `https://wa.me/923XXXXXXXXX` *(update with real number)*
- **WhatsApp Channel** — `https://whatsapp.com/channel/nexus-esports` *(update with real link)*

> Update these placeholder URLs in `Footer.astro` and `contact.astro` before going live.

---

## Notes

- **No Discord** — The platform intentionally uses only Instagram and WhatsApp as community channels.
- **Payment flow** — Registrations with a non-zero entry fee start as `Pending`. Admin reviews the screenshot and approves/rejects. Free entry registrations are auto-approved.
- **MongoDB Atlas** — For production, use a MongoDB Atlas cluster. The connection string (`MONGODB_URI`) supports both `mongodb://` (local) and `mongodb+srv://` (Atlas) formats.
- **Uploads** — Payment screenshots are stored in `backend/uploads/`. For production, consider migrating to a cloud storage provider (Cloudinary, S3, etc.).
