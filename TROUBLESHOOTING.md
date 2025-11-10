# 🔧 Troubleshooting Guide - "Unable to Connect" Error

## Your Current Issue: Frontend Can't Connect to Backend

### Root Causes:
1. ❌ **Dependencies not installed** (node_modules missing)
2. ❌ **Backend server not running** (no API at localhost:5000)
3. ⚠️ **Database not configured properly**

---

## ✅ COMPLETE FIX - Follow These Steps in Order

### **Step 1: Install All Dependencies**

I've already started installing dependencies for you. Wait for them to complete, then verify:

```powershell
# Check if frontend node_modules exists
dir c:\Users\DELL\Desktop\swipe-quiz-platform\frontend\node_modules

# Check if backend node_modules exists
dir c:\Users\DELL\Desktop\swipe-quiz-platform\backend\node_modules
```

If either is missing, run:
```powershell
# Frontend
cd c:\Users\DELL\Desktop\swipe-quiz-platform\frontend
npm install
dir c:\Users\DELL\Desktop\swipe-quiz\frontend\node_modules
# Backend
cd c:\Users\DELL\Desktop\swipe-quiz-platform\backend
dir c:\Users\DELL\Desktop\swipe-quiz\backend\node_modules
```

---

### **Step 2: Configure Database (CRITICAL)**
cd c:\Users\DELL\Desktop\swipe-quiz\frontend
Your current `.env` file has placeholder values. You need to:

#### Option A: Use PostgreSQL (Recommended for Production)
cd c:\Users\DELL\Desktop\swipe-quiz\backend
1. **Install PostgreSQL** if not installed:
   - Download: https://www.postgresql.org/download/windows/

2. **Create the database:**
   ```powershell
   psql -U postgres
   CREATE DATABASE swipe-quiz;
   \q
cd c:\Users\DELL\Desktop\quizbirr\backend

3. **Update your `.env` file** (in the root directory):
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/swipe-quiz
   ```
   Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

4. **Run Prisma migrations:**
   ```powershell
   cd c:\Users\DELL\Desktop\swipe-quiz-platform\backend


1. **Update `.env` file** (in the root directory):
   ```env
   DATABASE_URL=file:./dev.db
   ```

cd c:\Users\DELL\Desktop\quizbirr\frontend
   ```prisma
   provider = "sqlite"
   ```

3. **Run Prisma migrations:**
   ```powershell
   cd c:\Users\DELL\Desktop\swipe-quiz-platform\backend
   npx prisma generate
   npx prisma migrate dev --name init

---

### **Step 3: Configure SMS Provider (For OTP)**

Update your `.env` file:

```env
# For TESTING - Use mock SMS (no real SMS sent)
SMS_PROVIDER=mock

# For PRODUCTION - Use Twilio
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-actual-sid
TWILIO_AUTH_TOKEN=your-actual-token
TWILIO_PHONE_NUMBER=+1234567890
```
**Important:** With `SMS_PROVIDER=mock`, OTP codes will print in the backend console!

---

### **Step 4: Start Backend Server**

Open a **NEW** terminal window:

```powershell
cd c:\Users\DELL\Desktop\swipe-quiz-platform\backend
npm run dev
```

**You should see:**
```
Server is running on http://localhost:5000
Database connected successfully
```

**If you see errors:**
- Database connection error → Check Step 2
- Port already in use → Kill the process or change PORT in .env
- Module not found → Run `npm install` again

---

### **Step 5: Start Frontend Server**

Open **ANOTHER** terminal window (keep backend running):

```powershell
cd c:\Users\DELL\Desktop\swipe-quiz-platform\frontend
npm run dev
```

**You should see:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

---

### **Step 6: Test the Connection**

   - Open browser: http://localhost:5000/api/health
   - Should show: `{"status":"ok","timestamp":"..."}`

2. **Test frontend:**
   - Open browser: http://localhost:3000
---
## 🚨 Common Errors & Solutions

### Error: "Unable to connect"
**Cause:** Backend is not running
**Fix:** Start backend server (Step 4)

### Error: "Port 5000 is already in use"
**Fix:**
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Error: "Database connection failed"
**Cause:** Wrong DATABASE_URL or database doesn't exist
**Fix:** Follow Step 2 carefully

### Error: "Cannot find module '@prisma/client'"
**Fix:**
```powershell
cd backend
npx prisma generate
npm install

### Error: "ECONNREFUSED localhost:5000"
**Cause:** Backend server crashed or not started
**Fix:** 
1. Check backend terminal for errors
2. Restart backend: `npm run dev`

### Error: Frontend shows blank page
**Fix:**
2. Check for errors
3. Verify backend is running
4. Check `.env` file in frontend folder

---

## 📋 Quick Checklist

Before testing, verify:

- [ ] Frontend dependencies installed (`frontend/node_modules` exists)
- [ ] Database configured in `.env` file
- [ ] Prisma migrations completed (`npx prisma migrate dev`)
- [ ] Backend health check works (http://localhost:5000/api/health)
- [ ] Frontend loads without errors (http://localhost:3000)

---

## 🎯 Minimal Setup for Quick Testing

If you just want to test ASAP:

```powershell
# 1. Update .env (root directory)
DATABASE_URL=file:./dev.db
SMS_PROVIDER=mock

# 2. Update backend/prisma/schema.prisma line 3
provider = "sqlite"

# 3. Setup database
cd backend
npx prisma generate
npx prisma migrate dev --name init

# 4. Start backend (Terminal 1)
npm run dev

# 5. Start frontend (Terminal 2 - new window)
cd ..\frontend
npm run dev

# 6. Open browser
http://localhost:3000
```

---

## 🆘 Still Having Issues?

1. **Check backend terminal** - Look for error messages
2. **Check browser console** (F12) - Look for network errors
3. **Verify both servers are running** - You need 2 terminal windows
4. **Check firewall** - Make sure ports 3000 and 5000 aren't blocked
5. **Restart everything** - Close all terminals and start fresh

---

## 📞 Next Steps After Setup

Once connected successfully:

1. **Register a user** - Use any phone number format
2. **Check backend console** - You'll see the OTP code
3. **Complete registration** - Enter the OTP
4. **Create admin user** - Use Prisma Studio: `npx prisma studio`
5. **Add quiz questions** - Via admin dashboard at `/admin`

---

**Remember:** You need **TWO terminal windows** running simultaneously:
- Terminal 1: Backend (`npm run dev` in backend folder)
- Terminal 2: Frontend (`npm run dev` in frontend folder)
