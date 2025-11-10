# QuizBirr - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or later)
- PostgreSQL (v13 or later)
- Redis (optional, for production)
- Git

## Quick Start

### 1. Clone and Install Dependencies

```bash
cd swipe-quiz

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up Environment Variables

**Backend (.env in root directory):**
```bash
# Copy the example and update values
cp .env .env.local

# Update these values:
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
DATABASE_URL=postgresql://username:password@localhost:5432/swipe-quiz
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173

# SMS Configuration (for OTP)
SMS_PROVIDER=mock
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Payment Configuration
TELEBIRR_API_KEY=your-telebirr-api-key
TELEBIRR_API_URL=https://api.telebirr.com
```

**Frontend (.env in frontend directory):**
```bash
VITE_API_URL=http://localhost:5000/api
```

### 3. Set Up Database

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## Database Setup

### PostgreSQL Installation

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer and follow prompts
3. Remember your password for the postgres user

**Create Database:**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE swipe-quiz;

-- Create user (optional)
CREATE USER swipe_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE swipe-quiz TO swipe_admin;
```

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Creating Admin User

After setting up the database, you'll need to create an admin user manually:

```sql
-- Connect to your database
psql -U postgres -d swipe-quiz

-- Update a user to admin (after they register via the app)
UPDATE users SET role = 'admin' WHERE phone_number = '+251912345678';
```

Or use Prisma Studio:
```bash
cd backend
npx prisma studio
```
Then navigate to the `users` table and change the `role` field to `admin`.

## Testing the Application

### 1. Register a User
- Open http://localhost:3000
- Enter a phone number
- In development mode, the OTP will be logged to the backend console
- Enter the OTP to complete registration

### 2. Test Quiz Flow
- Navigate to the Quiz page
- Swipe left (TRUE) or right (FALSE) to answer
- Check your balance updates

### 3. Test Wallet
- Go to Wallet page
- Try initiating a deposit
- Try initiating a withdrawal (requires completing tasks)

### 4. Admin Dashboard
- Make your user an admin (see above)
- Navigate to /admin
- Manage quizzes, tasks, and review submissions

## Common Issues

### Port Already in Use
```bash
# Windows - Kill process on port
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `psql -U postgres -l`

### Prisma Client Not Generated
```bash
cd backend
npx prisma generate
```

### Frontend Build Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Backend: Uses `ts-node-dev`
- Frontend: Uses Vite HMR

### Database Inspection
```bash
# Open Prisma Studio
cd backend
npx prisma studio
```

### API Testing
Use tools like:
- Postman
- Thunder Client (VS Code extension)
- curl

Example:
```bash
# Health check
curl http://localhost:5000/api/health

# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+251912345678"}'
```

## Next Steps

1. **Configure SMS Provider**: Update SMS settings in `.env` for production
2. **Set Up Payment Gateway**: Configure Telebirr API credentials
3. **Add Sample Data**: Create quizzes and tasks via admin dashboard
4. **Security**: Change JWT_SECRET to a strong random string
5. **Deploy**: See DEPLOYMENT.md for production deployment guide

## Support

For issues or questions:
- Check the logs in the terminal
- Review the API documentation
- Check Prisma schema for database structure

## Project Structure

```
swipe-quiz-platform/
├── backend/
│   ├── prisma/          # Database schema and migrations
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth, validation, etc.
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helper functions
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # API client
│   │   ├── store/       # State management
│   │   └── types/       # TypeScript types
│   └── package.json
└── README.md
```
