# Quick Start Guide - Swipe Quiz Platform

## 📊 Project Completion Status

### ✅ COMPLETED (95%)
- **Backend**: Fully implemented
  - Authentication system with OTP
  - Quiz management and attempts
  - Wallet and transaction system
  - Task submission system
  - Referral program
  - Admin endpoints
  - Database schema (Prisma)
  
- **Frontend**: Fully implemented
  - User authentication pages
  - Quiz swipe interface
  - Wallet management
  - Task completion UI
  - Referral system
  - Admin dashboard
  - PWA configuration

### ⚠️ MISSING (5%)
- Package.json files (✅ NOW CREATED)
- Environment configuration
- Database setup
- Dependencies installation

---

## 🚀 Step-by-Step Setup Instructions

### **Step 1: Install Prerequisites**

Before starting, ensure you have these installed:

1. **Node.js** (v16 or later)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **PostgreSQL** (v13 or later)
   - **Windows**: Download from https://www.postgresql.org/download/windows/
   - During installation, remember your postgres password
   - Verify: `psql --version`

3. **Git** (if not already installed)
   - Download from: https://git-scm.com/

---

### **Step 2: Set Up PostgreSQL Database**

1. Open PowerShell or Command Prompt as Administrator

2. Connect to PostgreSQL:
   ```powershell
   psql -U postgres
   ```

3. Create the database:
   ```sql
   CREATE DATABASE swipe-quiz;
   \q
   ```

---

### **Step 3: Configure Environment Variables**

Your `.env` file already exists in the root directory. Update it with your actual values:

```env
# Environment
NODE_ENV=development
PORT=5000

# JWT (IMPORTANT: Change this to a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random-and-secure-min-32-characters
JWT_EXPIRES_IN=7d

# Database (Update with your PostgreSQL password)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/swipe-quiz

# Redis (Optional for development - can skip initially)
REDIS_URL=redis://localhost:6379

# SMS Provider (Use 'mock' for development - no real SMS sent)
SMS_PROVIDER=mock
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Telebirr API (Can be dummy values for development)
TELEBIRR_API_KEY=your-telebirr-api-key
TELEBIRR_API_URL=https://api.telebirr.com

# App URLs
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000
```

**IMPORTANT**: Replace `YOUR_PASSWORD` with your PostgreSQL password!

---

### **Step 4: Install Backend Dependencies**

Open PowerShell in the project root:

```powershell
cd backend
npm install
```

This will install all required backend packages.

---

### **Step 5: Set Up Database with Prisma**

Still in the `backend` directory:

```powershell
# Generate Prisma Client
npx prisma generate

# Run database migrations (creates all tables)
npx prisma migrate dev --name init
```

You should see: "Your database is now in sync with your schema."

---

### **Step 6: Install Frontend Dependencies**

Open a **NEW** PowerShell window:

```powershell
cd c:\Users\DELL\Desktop\swipe-quiz-platform\frontend
npm install
```

This will install all required frontend packages.

---

### **Step 7: Start the Application**

You need **TWO** terminal windows running simultaneously:

**Terminal 1 - Backend:**
```powershell
cd c:\Users\DELL\Desktop\swipe-quiz-platform\backend
npm run dev
```

You should see:
```
Server is running on http://localhost:5000
Database connected successfully
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\DELL\Desktop\swipe-quiz-platform\frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

---

### **Step 8: Access the Application**

1. Open your browser and go to: **http://localhost:3000**

2. You should see the Swipe Quiz Platform login page

3. Test the backend health: **http://localhost:5000/api/health**
   - Should return: `{"status":"ok","timestamp":"..."}`

---

### **Step 9: Create Your First User**

1. On the login page, enter a phone number (e.g., `+251912345678`)

2. Click "Send OTP"

3. **IMPORTANT**: Since SMS_PROVIDER is set to 'mock', check your **backend terminal**
   - You'll see the OTP code printed in the console like: `OTP for +251912345678: 123456`

4. Enter the OTP code and complete registration

---

### **Step 10: Create Admin User (Optional)**

To access the admin dashboard:

1. First, register a user through the app (Step 9)

2. Open Prisma Studio:
   ```powershell
   cd backend
   npx prisma studio
   ```

3. Browser will open at http://localhost:5555

4. Click on "users" table

5. Find your user and change `role` from `user` to `admin`

6. Save changes

7. Now you can access `/admin` in the app

---

## 🔧 Common Issues & Solutions

### Issue 1: Port Already in Use
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Issue 2: Database Connection Failed
- Verify PostgreSQL is running
- Check your DATABASE_URL in `.env`
- Ensure database exists: `psql -U postgres -l`

### Issue 3: Prisma Client Not Found
```powershell
cd backend
npx prisma generate
```

### Issue 4: Module Not Found
```powershell
# Backend
cd backend
rm -r node_modules
npm install

# Frontend
cd frontend
rm -r node_modules
npm install
```

---

## 📱 Testing the Application

### Test Quiz Flow:
1. Login to the app
2. Navigate to Quiz page
3. Swipe left (False) or right (True)
4. Watch your points increase!

### Test Wallet:
1. Go to Wallet page
2. View your balance
3. Try deposit/withdrawal (in development mode)

### Test Admin Dashboard:
1. Make yourself admin (Step 10)
2. Go to `/admin`
3. Create quizzes, tasks, manage users

---

## 🎯 What's Next?

### For Development:
- Add sample quiz questions via admin dashboard
- Create tasks for users to complete
- Test the referral system

### For Production:
1. **Update `.env` for production:**
   - Change `NODE_ENV` to `production`
   - Use strong `JWT_SECRET`
   - Configure real Twilio credentials
   - Set up Telebirr API

2. **Deploy:**
   - See `DEPLOYMENT.md` for deployment instructions
   - Set up SSL certificates
   - Configure production database

---

## 📚 Additional Resources

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Detailed Setup**: See `SETUP.md`

---

## 🆘 Need Help?

1. Check backend terminal for error logs
2. Check browser console for frontend errors
3. Use Prisma Studio to inspect database: `npx prisma studio`
4. Review the API documentation

---

## ✅ Verification Checklist

Before considering setup complete, verify:

- [ ] PostgreSQL is installed and running
- [ ] Database `swipe-quiz` exists
- [ ] Backend dependencies installed (`backend/node_modules` exists)
- [ ] Frontend dependencies installed (`frontend/node_modules` exists)
- [ ] Prisma migrations completed (tables created)
- [ ] Backend server starts without errors (http://localhost:5000/api/health works)
- [ ] Frontend server starts without errors (http://localhost:3000 loads)
- [ ] Can register a user and receive OTP in backend console
- [ ] Can login with OTP

---

**🎉 Congratulations! Your Swipe Quiz Platform is now running!**
