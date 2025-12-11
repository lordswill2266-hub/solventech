# Backend API Testing Guide

## 🚀 Quick Start

### 1. Start the Server
```bash
cd backend
npm run start:dev
```

Server will start at: `http://localhost:3000`

### 2. Access Swagger Documentation
Open in browser: `http://localhost:3000/api/docs`

---

## 📋 Testing Checklist

### ✅ Authentication Module

**1. Register User**
```http
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "phoneNumber": "08012345678",
  "role": "BUYER"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "userId": "uuid-here"
}
```

**2. Verify OTP**
```http
POST http://localhost:3000/api/v1/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "08012345678",
  "otp": "123456"
}
```

**Expected Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": { ... }
}
```

**3. Get Profile**
```http
GET http://localhost:3000/api/v1/auth/profile
Authorization: Bearer <your-jwt-token>
```

---

### ✅ Products Module

**1. Create Product (Seller)**
```http
POST http://localhost:3000/api/v1/products
Authorization: Bearer <seller-token>
Content-Type: application/json

{
  "title": "iPhone 13 Pro Max",
  "description": "Excellent condition, barely used",
  "price": 250000,
  "category": "ELECTRONICS",
  "condition": "USED_LIKE_NEW",
  "location": "Jalingo, Taraba",
  "images": ["https://example.com/image1.jpg"]
}
```

**2. Browse Products**
```http
GET http://localhost:3000/api/v1/products?page=1&limit=20
```

**3. Search Products**
```http
GET http://localhost:3000/api/v1/products?search=iPhone&category=ELECTRONICS&minPrice=100000&maxPrice=500000
```

**4. Get Product Details**
```http
GET http://localhost:3000/api/v1/products/{productId}
```

---

### ✅ Orders Module

**1. Create Order**
```http
POST http://localhost:3000/api/v1/orders
Authorization: Bearer <buyer-token>
Content-Type: application/json

{
  "productId": "product-uuid",
  "quantity": 1,
  "deliveryAddress": "123 Main St, Jalingo",
  "deliveryPhone": "08012345678"
}
```

**2. Get My Orders**
```http
GET http://localhost:3000/api/v1/orders
Authorization: Bearer <token>
```

**3. Update Order Status (Seller)**
```http
PUT http://localhost:3000/api/v1/orders/status
Authorization: Bearer <seller-token>
Content-Type: application/json

{
  "orderId": "order-uuid",
  "status": "SHIPPED"
}
```

**4. Confirm Delivery (Buyer)**
```http
PUT http://localhost:3000/api/v1/orders/{orderId}/confirm-delivery
Authorization: Bearer <buyer-token>
```

---

### ✅ Wallet Module

**1. Get Balance**
```http
GET http://localhost:3000/api/v1/wallet/balance
Authorization: Bearer <token>
```

**2. Get Transactions**
```http
GET http://localhost:3000/api/v1/wallet/transactions
Authorization: Bearer <token>
```

**3. Withdraw to Bank**
```http
POST http://localhost:3000/api/v1/wallet/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10000,
  "accountNumber": "0123456789",
  "bankName": "GTBank",
  "accountName": "John Doe"
}
```

**4. P2P Transfer**
```http
POST http://localhost:3000/api/v1/wallet/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "recipient-user-uuid",
  "amount": 5000,
  "description": "Payment for product"
}
```

---

### ✅ Payments Module

**1. Initialize Payment**
```http
POST http://localhost:3000/api/v1/payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50000,
  "email": "user@example.com",
  "gateway": "PAYSTACK",
  "metadata": {
    "orderId": "order-uuid"
  }
}
```

**2. Verify Payment**
```http
POST http://localhost:3000/api/v1/payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "reference": "payment-reference",
  "gateway": "PAYSTACK"
}
```

---

### ✅ Escrow Module

**1. Create Escrow**
```http
POST http://localhost:3000/api/v1/escrow
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order-uuid",
  "amount": 50000,
  "paymentGateway": "PAYSTACK",
  "paymentReference": "payment-ref"
}
```

**2. Release Escrow**
```http
POST http://localhost:3000/api/v1/escrow/release
Authorization: Bearer <buyer-token>
Content-Type: application/json

{
  "escrowId": "escrow-uuid"
}
```

**3. Request Refund**
```http
POST http://localhost:3000/api/v1/escrow/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "escrowId": "escrow-uuid",
  "reason": "Product not as described"
}
```

---

### ✅ Chat Module

**1. Send Message (HTTP)**
```http
POST http://localhost:3000/api/v1/chat/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order-uuid",
  "receiverId": "receiver-uuid",
  "content": "Hello, is the product available?"
}
```

**2. Get Messages**
```http
GET http://localhost:3000/api/v1/chat/messages?orderId=order-uuid&limit=50
Authorization: Bearer <token>
```

**3. Get Conversations**
```http
GET http://localhost:3000/api/v1/chat/conversations
Authorization: Bearer <token>
```

**4. Get Unread Count**
```http
GET http://localhost:3000/api/v1/chat/unread-count
Authorization: Bearer <token>
```

---

## 🧪 Testing Workflow

### Complete User Journey

1. **Register as Seller**
   - Register with phone: 08011111111
   - Verify OTP
   - Save JWT token

2. **Create Product**
   - Use seller token
   - Create a product listing

3. **Register as Buyer**
   - Register with phone: 08022222222
   - Verify OTP
   - Save JWT token

4. **Browse & Order**
   - Browse products
   - Create order for seller's product

5. **Payment Flow**
   - Initialize payment
   - (In production: complete payment)
   - Verify payment

6. **Escrow Creation**
   - Create escrow for the order
   - Funds held securely

7. **Chat**
   - Buyer sends message to seller
   - Seller responds

8. **Order Completion**
   - Seller updates status to SHIPPED
   - Seller updates to DELIVERED
   - Buyer confirms delivery
   - Escrow releases funds to seller

9. **Wallet Operations**
   - Check seller's wallet balance
   - Seller withdraws to bank
   - Check transaction history

---

## 🔧 Tools for Testing

### 1. Swagger UI (Recommended)
- URL: `http://localhost:3000/api/docs`
- Interactive API documentation
- Built-in request/response testing
- No additional setup needed

### 2. Postman
- Import API collection
- Save environment variables
- Automated testing

### 3. cURL
```bash
# Example
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"08012345678","role":"BUYER"}'
```

### 4. VS Code REST Client
Create a `.http` file with requests

---

## ⚠️ Important Notes

1. **OTP in Development**
   - Default OTP: `123456` (check your auth service)
   - In production, real OTPs will be sent via SMS

2. **Payment Testing**
   - Use Paystack/Monnify test keys
   - Use test card numbers
   - No real money charged

3. **Database**
   - Make sure PostgreSQL is running
   - Run migrations: `npx prisma migrate dev`
   - Seed data if needed

4. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in all required values
   - Restart server after changes

---

## 🐛 Common Issues

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <process-id> /F
```

### Database connection error
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running
- Run migrations

### JWT token expired
- Re-authenticate to get new token
- Tokens expire after 24 hours (configurable)

---

## ✅ Success Criteria

- [ ] All authentication endpoints working
- [ ] Products can be created and retrieved
- [ ] Orders can be placed
- [ ] Payments can be initialized
- [ ] Escrow transactions work
- [ ] Wallet operations successful
- [ ] Chat messages sent/received
- [ ] No server errors in console

---

**Ready to test?** Start the server and open Swagger! 🚀
