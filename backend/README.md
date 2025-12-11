# Solven Shopper Backend

Escrow-based marketplace API for North East Nigeria.

## Features

- 🔐 Phone + OTP Authentication
- 💰 Dual Payment Gateway (Paystack + Monnify)
- 🏦 Escrow System
- 💳 Wallet Management
- 📦 Product Listings
- 🚚 Logistics Integration
- 💬 In-app Messaging
- ✅ BVN Verification (Mono)

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT
- **Documentation**: Swagger

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Setup database**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Run development server**:
   ```bash
   npm run start:dev
   ```

5. **Access API**:
   - API: http://localhost:3000/api/v1
   - Docs: http://localhost:3000/api/docs

## Scripts

- `npm run start:dev` - Development mode
- `npm run build` - Build for production
- `npm run start:prod` - Production mode
- `npm run test` - Run tests
- `npm run prisma:studio` - Open Prisma Studio

## Project Structure

```
src/
├── auth/          # Authentication & OTP
├── users/         # User management
├── products/      # Product listings
├── orders/        # Order management
├── escrow/        # Escrow logic
├── wallets/       # Wallet system
├── payments/      # Payment gateways
├── logistics/     # Delivery management
├── chat/          # Messaging
└── prisma/        # Database service
```

## License

Proprietary - Solven Tech International Limited
