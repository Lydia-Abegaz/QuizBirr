# QuizBirr

## 🟢 Dummy-Level Quick Start Guide

Welcome! This guide will help you set up and run the Swipe Quiz Platform from scratch, even if you’re new to web development. Follow each step and you’ll have the app running locally.

---

### 1. What is this app?

This is a web platform where users answer quiz questions by swiping left or right. You can earn rewards, invite friends, and manage your wallet. There’s a backend (server) and a frontend (website).

---

### 2. What do you need before starting?

- **Node.js** (v16 or newer): [Download here](https://nodejs.org/)
- **PostgreSQL** (database): [Download here](https://www.postgresql.org/download/)
- **Redis** (cache): [Download here](https://redis.io/download)
- **PNPM** (recommended package manager): Run `npm install -g pnpm` in your terminal
- **Git** (for cloning): [Download here](https://git-scm.com/downloads)

---

### 3. How to set up the project?

#### a) Clone the code
Open your terminal (PowerShell on Windows) and run:
```pwsh
git clone https://github.com/yourusername/quizbirr.git
cd quizbirr
```

#### b) Install dependencies
```pwsh
pnpm install
# Or use npm install if you prefer
```

#### c) Set up environment variables
- Copy `.env.example` to `.env` in the root folder
- Open `.env` and fill in your database and secret values. Example:
   ```env
   JWT_SECRET=your-very-long-random-string
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/swipe-quiz?schema=public
   FRONTEND_URL=http://localhost:5173
   ```

#### d) Set up the database
```pwsh
cd backend
npx prisma migrate dev --name init
```

---

### 4. How to run the app locally?

#### a) Start the backend (API server)
```pwsh
cd backend
pnpm run dev
# Or npm run dev
# The server runs at http://localhost:5000
```

#### b) Start the frontend (website)
```pwsh
cd frontend
pnpm run dev
# Or npm run dev
# The site runs at http://localhost:5173
```

---

### 5. How does the folder structure look?

```
quizbirr/
├── backend/      # Server code (API, database)
│   ├── prisma/   # Database schema & migrations
│   └── src/      # Main backend code
├── frontend/     # Website code (React)
│   └── src/      # Main frontend code
├── .env          # Your secrets and config
├── package.json  # Project dependencies
└── README.md     # This guide
```

---

### 6. Common issues and troubleshooting

- **Error: Not Found** — Make sure you use `/api` in backend URLs (e.g., `http://localhost:5000/api/health`).
- **Database errors** — Check your `DATABASE_URL` in `.env` and make sure PostgreSQL is running.
- **Frontend not connecting** — Confirm `VITE_API_URL` in `frontend/.env` matches your backend URL.
- **Port conflicts** — If something else is using port 5000 or 5173, change the port in `.env` and restart.
- **JWT_SECRET warning** — Always use a long, random string for JWT_SECRET in production.

---

### 7. How to test basic features?

#### a) Health check
Open your browser and go to: `http://localhost:5000/api/health` — you should see `{ status: "ok" }`

#### b) Try sending an OTP
Use a tool like [Postman](https://www.postman.com/) or run:
```pwsh
curl -X POST http://localhost:5000/api/auth/send-otp -H "Content-Type: application/json" -d '{"phoneNumber":"+251912345678"}'
```

---

### 8. How to stop everything?

Press `Ctrl+C` in your terminal to stop the servers.

---

### 9. Where to get help?

- Check this README and the other markdown docs in the repo.
- If you’re stuck, search for your error message in Google or Stack Overflow.
- Ask a developer friend or open an issue on GitHub.

---

### 10. Next steps

- Explore the code in `backend/src` and `frontend/src`.
- Try creating quizzes, swiping, and checking your wallet.
- Read the comments in the code for more tips.

---

Happy swiping!

A mobile-first Progressive Web App (PWA) where users can participate in swipe-based quizzes to earn real money rewards. Swipe, Answer, Win Real Money!

## Features

- **User Authentication**: Phone number-based authentication with OTP
- **Swipe Quizzes**: Play quizzes by swiping left (True) or right (False)
- **Wallet System**: Track earnings and manage transactions
- **Withdrawals with Tasks**: Complete tasks to withdraw earnings
- **Referral Program**: Earn points by inviting friends
- **Admin Dashboard**: Manage quizzes, tasks, and user accounts

## Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Query for state management
- PWA support

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- Redis for caching and rate limiting
- JWT for authentication

### Payment Integration
- Telebirr for local payments
- Bank transfer support

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- PostgreSQL
- Redis
- PNPM (recommended) or NPM/Yarn

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/swipe-quiz.git
   cd swipe-quiz
   ```

2. Install dependencies:
   ```bash
   # Using PNPM (recommended)
   pnpm install
   
   # Or using NPM
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the root directory
   - Update the values in `.env` with your configuration

4. Set up the database:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

### Development

#### Quick Start (Works on Windows/macOS/Linux)

1) Backend

```bash
# 1. Install deps
npm --prefix backend i

# 2. Configure env
# Create backend/.env with at least:
#
# PORT=5000
# JWT_SECRET=replace-with-a-long-random-string
# DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/swipe-quiz?schema=public
# FRONTEND_URL=http://localhost:5173

# 3. Prisma generate + migrate
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:migrate

# 4. Run the API server
npm --prefix backend run dev
# The API listens on http://localhost:5000
# Health check:       GET http://localhost:5000/api/health
# Send OTP:           POST http://localhost:5000/api/auth/send-otp
# Verify OTP:         POST http://localhost:5000/api/auth/verify-otp
```

2) Frontend

```bash
# 1. Install deps
npm --prefix frontend i

# 2. Configure env
# Create frontend/.env with:
# VITE_API_URL=http://localhost:5000/api

# 3. Run the app (Vite default port 5173)
npm --prefix frontend run dev
# Open http://localhost:5173
```

#### Important: API base path

All backend routes are mounted under `/api`. Access endpoints like:

- Health: `GET http://localhost:5000/api/health`
- Send OTP: `POST http://localhost:5000/api/auth/send-otp`
- Verify OTP: `POST http://localhost:5000/api/auth/verify-otp`

If you open `http://localhost:5000` directly you will see `{ message: "Not Found" }` — this is expected.

#### CORS and ports

- Backend CORS allows `FRONTEND_URL` (defaults to `http://localhost:3000`).
- If your frontend runs on Vite’s default `http://localhost:5173`, set `FRONTEND_URL=http://localhost:5173` in `backend/.env` before starting the server.

#### Smoke test with curl

```bash
# Health
curl http://localhost:5000/api/health

# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"+251912345678\"}"

# Verify OTP (replace 123456 with the real code your SMS provider logs/sends)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"+251912345678\",\"otp\":\"123456\"}"
```

#### Troubleshooting “Not Found”

- Hitting `http://localhost:5000` → shows `{ message: "Not Found" }` by design. Use `http://localhost:5000/api/...`.
- Health endpoint should return `{ status: "ok" }` at `http://localhost:5000/api/health`.
- Ensure the backend actually started (look for `Server is running on http://localhost:5000` in the console).
- Confirm `frontend/.env` has `VITE_API_URL=http://localhost:5000/api`.
- If frontend is on `5173`, set `FRONTEND_URL=http://localhost:5173` in `backend/.env`.
- After Prisma schema changes, always run `npm --prefix backend run prisma:generate` and `npm --prefix backend run prisma:migrate`.

## Project Structure

```
quizbirr/
├── backend/               # Backend server
│   ├── prisma/           # Database schema and migrations
│   ├── src/              # Source code
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   ├── app.ts        # Express app setup
│   │   └── index.ts      # Entry point
│   └── package.json
├── frontend/             # Frontend React app
│   ├── public/          # Static files
│   └── src/             # Source code
├── packages/            # Shared code between frontend and backend
└── package.json         # Root package.json
```

## Deployment

### Prerequisites

- Docker and Docker Compose
- Domain name with SSL certificate (recommended)

### Production Deployment

1. Build the application:
   ```bash
   pnpm build
   ```

2. Start the services using Docker Compose:
   ```bash
   docker-compose up -d
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
