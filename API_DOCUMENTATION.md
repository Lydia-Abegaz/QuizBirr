# API Documentation - Swipe Quiz Platform

Base URL: `http://localhost:5000/api` (Development)

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Authentication Endpoints

### Send OTP
```http
POST /auth/send-otp
```

**Request Body:**
```json
{
  "phoneNumber": "+251912345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### Verify OTP
```http
POST /auth/verify-otp
```

**Request Body:**
```json
{
  "phoneNumber": "+251912345678",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "phoneNumber": "+251912345678",
      "balance": 0,
      "points": 0,
      "referralCode": "ABC12345",
      "role": "user",
      "isVerified": true
    }
  }
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phoneNumber": "+251912345678",
    "balance": 100.50,
    "points": 250,
    "referralCode": "ABC12345",
    "isVerified": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## Quiz Endpoints

### Get Random Quiz
```http
GET /quiz/random
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "question": "The Earth is flat",
    "difficulty": "easy",
    "points": 1,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Submit Answer
```http
POST /quiz/submit
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "quizId": "uuid",
  "answer": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "pointsEarned": 1,
    "balanceChange": 0.1,
    "newBalance": 100.60,
    "newPoints": 251
  }
}
```

### Get User Stats
```http
GET /quiz/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAttempts": 50,
    "correctAttempts": 35,
    "incorrectAttempts": 15,
    "accuracy": 70.0,
    "totalPointsEarned": 25
  }
}
```

---

## Wallet Endpoints

### Get Balance
```http
GET /wallet/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 100.50,
    "points": 250
  }
}
```

### Get Transaction History
```http
GET /wallet/transactions?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "deposit",
        "amount": 50.00,
        "status": "completed",
        "reference": "DEP-ABC123",
        "description": "Deposit via telebirr",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
}
```

### Initiate Deposit
```http
POST /wallet/deposit
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 50.00,
  "method": "telebirr"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "reference": "DEP-ABC123",
    "amount": 50.00,
    "method": "telebirr",
    "status": "pending"
  }
}
```

### Initiate Withdrawal
```http
POST /wallet/withdraw
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 25.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "reference": "WD-XYZ789",
    "amount": 25.00,
    "status": "pending",
    "tasks": [
      {
        "id": "uuid",
        "title": "Watch Advertisement",
        "description": "Watch a 30-second ad",
        "type": "watch_ad",
        "reward": 0.50
      }
    ]
  }
}
```

---

## Task Endpoints

### Get Active Tasks
```http
GET /tasks
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Subscribe to YouTube Channel",
      "description": "Subscribe and provide screenshot",
      "type": "subscribe",
      "reward": 2.00,
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Submit Task
```http
POST /tasks/submit
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "taskId": "uuid",
  "proof": "https://imgur.com/screenshot.png"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "taskId": "uuid",
    "userId": "uuid",
    "status": "pending",
    "proof": "https://imgur.com/screenshot.png",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Get User Submissions
```http
GET /tasks/user/submissions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "approved",
      "proof": "https://imgur.com/screenshot.png",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "task": {
        "id": "uuid",
        "title": "Subscribe to YouTube Channel",
        "reward": 2.00
      }
    }
  ]
}
```

---

## Referral Endpoints

### Apply Referral Code
```http
POST /referral/apply
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "referralCode": "ABC12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Referral code applied successfully"
}
```

### Get Referral Stats
```http
GET /referral/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "referralCode": "ABC12345",
    "totalReferrals": 10,
    "activeReferrals": 7,
    "totalEarnings": 35.00
  }
}
```

### Claim Daily Bonus
```http
POST /referral/daily-bonus
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Daily bonus awarded",
  "data": {
    "streak": 5,
    "bonusPoints": 25
  }
}
```

---

## Admin Endpoints

All admin endpoints require `role: "admin"`.

### Create Quiz
```http
POST /quiz
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "question": "The sun rises in the east",
  "answer": true,
  "difficulty": "easy",
  "points": 1
}
```

### Get All Quizzes
```http
GET /quiz/all?page=1&limit=20
Authorization: Bearer <admin-token>
```

### Create Task
```http
POST /tasks
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "title": "Follow on Instagram",
  "description": "Follow our Instagram page",
  "type": "subscribe",
  "reward": 1.50,
  "metadata": {
    "link": "https://instagram.com/swipequiz"
  }
}
```

### Review Task Submission
```http
POST /tasks/submissions/:submissionId/review
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "approved": true,
  "rejectionReason": ""
}
```

### Get Pending Submissions
```http
GET /tasks/admin/pending?page=1&limit=20
Authorization: Bearer <admin-token>
```

### Confirm Deposit
```http
POST /wallet/deposit/:transactionId/confirm
Authorization: Bearer <admin-token>
```

### Process Withdrawal
```http
POST /wallet/withdraw/:transactionId/process
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "approved": true,
  "reason": ""
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

- OTP endpoints: 3 requests per minute
- Other endpoints: 100 requests per minute per IP

---

## Webhooks (Future)

### Payment Webhook
```http
POST /webhooks/payment
```

Receives payment confirmations from Telebirr.

---

## Testing

### cURL Examples

**Send OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+251912345678"}'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+251912345678", "otp": "123456"}'
```

**Get Quiz (with auth):**
```bash
curl -X GET http://localhost:5000/api/quiz/random \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
