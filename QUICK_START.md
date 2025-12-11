# Solven Shopper - Quick Start Guide

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Backend Dependencies

```powershell
cd backend
npm install
```

### 2. Configure Environment

```powershell
# Copy environment template
cp .env.example .env

# Edit .env and add your credentials:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (generate a random string)
# - Payment gateway keys (Paystack, Monnify)
# - SMS provider keys (Termii or Twilio)
# - BVN verification (Mono)
# - Cloudinary credentials
```

### 3. Setup Database

```powershell
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 4. Run Development Server

```powershell
npm run start:dev
```

The API will be available at:
- **API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs

### 5. Test Authentication

Use Postman or curl to test:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2348012345678",
    "role": "BUYER",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Verify OTP (check console for OTP code)
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+2348012345678",
    "otp": "123456"
  }'
```

## Troubleshooting

### PowerShell Execution Policy Error

If you get "scripts is disabled" error:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Database Connection Error

1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env
3. Verify database exists: `CREATE DATABASE solven_shopper;`

### Module Not Found Errors

Run `npm install` to install all dependencies.

## Next Steps

1. ✅ Backend is ready for development
2. 📝 Review API documentation at `/api/docs`
3. 🔨 Start building payment integration
4. 📱 Begin Flutter mobile app development

## Need Help?

- Check `PROJECT_OVERVIEW.md` for project status
- Review `implementation_plan.md` for technical details
- See `task.md` for development checklist
