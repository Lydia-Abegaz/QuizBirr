# 📋 Quick Command Reference

## Installation Commands

### Install Frontend Dependencies
```powershell
cd c:\Users\DELL\Desktop\quizbirr\frontend
npm install
```

### Install Backend Dependencies
```powershell
cd c:\Users\DELL\Desktop\quizbirr\backend
npm install
```

---

## Database Setup Commands

### Generate Prisma Client
```powershell
npx prisma generate
npx prisma generate
```

### Run Database Migrations
```powershell
cd c:\Users\DELL\Desktop\quizbirr\backend
npx prisma migrate dev --name init
```

### Open Prisma Studio (Database GUI)
```powershell
cd c:\Users\DELL\Desktop\quizbirr\backend
npx prisma studio
```
Opens at: http://localhost:5555

### Reset Database (Delete all data)
```powershell
cd c:\Users\DELL\Desktop\quizbirr\backend
npx prisma migrate reset
```

---

## Start Servers

### Start Backend (Terminal 1)
```powershell
cd c:\Users\DELL\Desktop\quizbirr\backend
npm run dev
```
Runs at: http://localhost:5000

### Start Frontend (Terminal 2)
```powershell
cd c:\Users\DELL\Desktop\quizbirr\frontend
npm run dev
```
Runs at: http://localhost:5173

---

## Testing Commands

### Test Backend Health
```powershell
# In browser or PowerShell:
curl http://localhost:5000/api/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### Check if Ports are in Use
```powershell
# Check port 5000 (backend)
netstat -ano | findstr :5000

# Check port 3000 (frontend)
netstat -ano | findstr :3000
```

### Kill Process on Port
```powershell
# Find PID first (last column in netstat output)
netstat -ano | findstr :5000

# Kill it (replace 1234 with actual PID)
taskkill /PID 1234 /F
```

---

## Build Commands

### Build Frontend for Production
```powershell
cd c:\Users\DELL\Desktop\quizbirr\frontend
npm run build
```

### Build Backend for Production
```powershell
cd c:\Users\DELL\Desktop\quizbirr\backend
npm run build
```

### Start Production Backend
```powershell
cd c:\Users\DELL\Desktop\quizbirr\backend
npm start
```

---

## Troubleshooting Commands

### Clean Install (if modules corrupted)
```powershell
# Frontend
cd c:\Users\DELL\Desktop\quizbirr\frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Backend
cd c:\Users\DELL\Desktop\quizbirr\backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Check Node and npm Versions
```powershell
node --version
npm --version
```
Required: Node v16+ and npm v7+

### View Backend Logs
Backend logs appear in Terminal 1 where you ran `npm run dev`

### View Frontend Logs
Frontend logs appear in Terminal 2 and browser console (F12)

---

## Database Commands

### View All Tables
```powershell
cd c:\Users\DELL\Desktop\quizbirr\backend
npx prisma studio
```

### Create Database Backup (SQLite)
```powershell
# Copy the database file
Copy-Item c:\Users\DELL\Desktop\quizbirr\backend\dev.db c:\Users\DELL\Desktop\quizbirr\backend\dev.db.backup
```

### Restore Database Backup
```powershell
# Replace current database with backup
Copy-Item c:\Users\DELL\Desktop\quizbirr\backend\dev.db.backup c:\Users\DELL\Desktop\quizbirr\backend\dev.db -Force
```

---

## Quick Shortcuts

### Full Reset (Start Fresh)
```powershell
# 1. Stop both servers (Ctrl+C in both terminals)

# 2. Reset database
cd c:\Users\DELL\Desktop\quizbirr\backend
npx prisma migrate reset

# 3. Restart backend
npm run dev

# 4. Restart frontend (in new terminal)
cd c:\Users\DELL\Desktop\swipe-quiz-platform\frontend
npm run dev
```

### Quick Test Flow
```powershell
# 1. Start backend
cd c:\Users\DELL\Desktop\quizbirr\backend
npm run dev

# 2. In new terminal, start frontend
cd c:\Users\DELL\Desktop\quizbirr\frontend
npm run dev

# 3. Open browser
start http://localhost:3000
```

---

## Environment Variables

### View Current Environment
```powershell
# View .env file
Get-Content c:\Users\DELL\Desktop\swipe-quiz-platform\.env
```

### Edit Environment
```powershell
# Open in notepad
notepad c:\Users\DELL\Desktop\swipe-quiz-platform\.env
```

---

## Git Commands (if using version control)

### Save Your Changes
```powershell
cd c:\Users\DELL\Desktop\quizbirr
git add .
git commit -m "Your message here"
```

### View Changes
```powershell
git status
git diff
```

---

## Useful Keyboard Shortcuts

- **Ctrl+C** - Stop running server
- **Ctrl+Shift+C** - Copy in terminal
- **Ctrl+Shift+V** - Paste in terminal
- **F12** - Open browser developer console
- **Ctrl+Shift+R** - Hard refresh browser (clear cache)

---

## Need Help?

- Check `START.md` for quick start guide
- Check `TROUBLESHOOTING.md` for detailed solutions
- Check `QUICKSTART.md` for comprehensive setup
