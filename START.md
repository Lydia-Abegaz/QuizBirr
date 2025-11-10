# 🚀 QUICK START - Get Your App Running NOW

## What I've Already Done For You:

✅ **Configured `.env` file** - Set to use SQLite (no PostgreSQL needed!)
✅ **Updated Prisma schema** - Ready for SQLite database
✅ **Set SMS to mock mode** - OTP codes will print in console
✅ **Started installing dependencies** - Both frontend and backend

---

## ⚡ 3 SIMPLE STEPS TO GET RUNNING

### **Step 1: Wait for Dependencies (if still installing)**

Check if installations are complete:
```powershell
# Check frontend
dir c:\Users\DELL\Desktop\quizbirr\frontend\node_modules

# Check backend
dir c:\Users\DELL\Desktop\quizbirr\backend\node_modules
```

If either shows "Cannot find path", run:
```powershell
# Frontend
cd c:\Users\DELL\Desktop\quizbirr\frontend
npm install

# Backend
cd c:\Users\DELL\Desktop\quizbirr\backend
npm install
```

---

### **Step 2: Setup Database (One-Time)**

Run these commands in PowerShell:

```powershell
cd c:\Users\DELL\Desktop\quizbirr\backend
npx prisma generate
npx prisma migrate dev --name init
```

You should see: ✅ "Your database is now in sync with your schema."

---

### **Step 3: Start Both Servers**

You need **TWO terminal windows** open at the same time.

#### **Terminal 1 - Backend:**
```powershell
cd c:\Users\DELL\Desktop\quizbirr\backend
npm run dev
```

Wait until you see:
```
✓ Server is running on http://localhost:5000
```

#### **Terminal 2 - Frontend (open NEW window):**
```powershell
cd c:\Users\DELL\Desktop\quizbirr\frontend
npm run dev
```

Wait until you see:
```
➜  Local:   http://localhost:5173/
```

---

## 🎉 TEST IT!

1. **Open browser:** http://localhost:5173
2. **You should see:** Login page (NO "Unable to connect" error!)
3. **Test login:**
   - Enter any phone: `+251912345678`
   - Click "Send OTP"
   - **Look at Terminal 1 (backend)** - You'll see the OTP code!
   - Enter the OTP and complete registration

---

## 🚨 If Something Goes Wrong

### "Port 5000 already in use"
```powershell
netstat -ano | findstr :5000
taskkill /PID <NUMBER_YOU_SEE> /F
```

### "Cannot find module"
```powershell
cd backend
npm install
npx prisma generate
```

### "Still says Unable to Connect"
1. Make sure **BOTH** terminals are running
2. Check Terminal 1 for errors
3. Test backend: http://localhost:5000/api/health
4. Should return: `{"status":"ok",...}`

---

## 📝 What's Different Now?

- **Database:** Using SQLite (file-based, no PostgreSQL needed)
- **SMS:** Mock mode (OTP prints in console, no Twilio needed)
- **Ready to test:** Everything configured for immediate testing

---

## 🎯 Next Steps After It's Running

1. **Create admin user:**
   ```powershell
   cd backend
   npx prisma studio
   ```
   - Opens at http://localhost:5555
   - Click "users" → Find your user → Change role to "admin"

2. **Add quiz questions:**
   - Go to http://localhost:5173/admin
   - Create some True/False questions

3. **Test the quiz:**
   - Swipe left (False) or right (True)
   - Watch your points grow!

---

## 💡 Remember:

- Keep **BOTH terminals running** while testing
- Backend = Terminal 1 (port 5000)
- Frontend = Terminal 2 (port 3000)
- OTP codes appear in the **backend terminal**

---

**Need more help?** Check `TROUBLESHOOTING.md` for detailed solutions.
