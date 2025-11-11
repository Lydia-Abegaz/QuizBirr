# QuizBirr Deployment Instructions

## Frontend Deployment (Netlify)

### Method 1: Drag & Drop (Easiest)
1. Build the frontend: `cd frontend && npm run build`
2. Go to [netlify.com](https://netlify.com) → "Sites" → "Add new site" → "Deploy manually"
3. Drag the `frontend/dist` folder to Netlify
4. Set environment variable: `VITE_API_URL` = your backend URL + `/api`

### Method 2: GitHub (Recommended)
1. Create repository at https://github.com/new
2. Name: `QuizBirr`, Public, no initialization
3. Push code:
   ```bash
   git remote add origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/QuizBirr.git
   git push -u origin main
   ```
4. Connect Netlify to GitHub repo
5. Build settings:
   - Base directory: `frontend`
   - Build command: `npm ci && npm run build`
   - Publish directory: `frontend/dist`

## Backend Deployment (Render)

1. Go to [render.com](https://render.com)
2. Create PostgreSQL database (free)
3. Create Web Service from GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm run start`
5. Environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=[from Render PostgreSQL]
   JWT_SECRET=[32+ char random string]
   FRONTEND_URL=[your Netlify URL]
   TELEBIRR_WEBHOOK_SECRET=[random string]
   SMS_PROVIDER=mock
   ```
6. Deploy and run: `npx prisma migrate deploy`

## App Features
- ✅ OTP Authentication (mock SMS)
- ✅ Quiz System with earnings
- ✅ Task submissions with admin approval
- ✅ Telebirr payment integration (mock)
- ✅ Bank receipt uploads
- ✅ Referral system with bonuses
- ✅ Admin dashboard
- ✅ Withdrawal system

Your app is ready for production! 🚀
