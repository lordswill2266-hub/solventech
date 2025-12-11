# Quick API Reference - HTTP Methods

## ⚠️ Common Mistake: Using GET instead of POST

Most endpoints require **POST** requests with JSON body, not GET!

---

## 🔐 Authentication Endpoints

### Register User
```http
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "phoneNumber": "08012345678",
  "role": "BUYER"
}
```

### Verify OTP
```http
POST http://localhost:3000/api/v1/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "08012345678",
  "otp": "123456"
}
```

### Get Profile (This one is GET)
```http
GET http://localhost:3000/api/v1/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📦 Products Endpoints

### Create Product
```http
POST http://localhost:3000/api/v1/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "iPhone 13",
  "description": "Great condition",
  "price": 250000,
  "category": "ELECTRONICS",
  "condition": "USED_LIKE_NEW"
}
```

### Browse Products (GET)
```http
GET http://localhost:3000/api/v1/products
```

### Get Product Details (GET)
```http
GET http://localhost:3000/api/v1/products/PRODUCT_ID
```

---

## 🛒 Orders Endpoints

### Create Order
```http
POST http://localhost:3000/api/v1/orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "productId": "uuid",
  "deliveryAddress": "123 Main St",
  "deliveryPhone": "08012345678"
}
```

### Get My Orders (GET)
```http
GET http://localhost:3000/api/v1/orders
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 💰 Wallet Endpoints

### Get Balance (GET)
```http
GET http://localhost:3000/api/v1/wallet/balance
Authorization: Bearer YOUR_JWT_TOKEN
```

### Withdraw
```http
POST http://localhost:3000/api/v1/wallet/withdraw
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "amount": 10000,
  "accountNumber": "0123456789",
  "bankName": "GTBank"
}
```

---

## 💬 Chat Endpoints

### Send Message
```http
POST http://localhost:3000/api/v1/chat/send
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "orderId": "uuid",
  "receiverId": "uuid",
  "content": "Hello!"
}
```

### Get Messages (GET)
```http
GET http://localhost:3000/api/v1/chat/messages?orderId=UUID
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🧪 Testing with Swagger

**Best way to test:** Open `http://localhost:3000/api/docs`

Swagger UI will show you:
- ✅ Correct HTTP method for each endpoint
- ✅ Required request body format
- ✅ Try it out button to test directly
- ✅ Response examples

---

## 📝 HTTP Methods Summary

| Endpoint | Method | Auth Required |
|----------|--------|---------------|
| Register | POST | No |
| Verify OTP | POST | No |
| Get Profile | GET | Yes |
| Create Product | POST | Yes |
| Browse Products | GET | No |
| Create Order | POST | Yes |
| Get Orders | GET | Yes |
| Get Balance | GET | Yes |
| Withdraw | POST | Yes |
| Send Message | POST | Yes |

---

**Rule of Thumb:**
- **GET** = Retrieving data (no body needed)
- **POST** = Creating/sending data (requires JSON body)
- **PUT** = Updating data (requires JSON body)
- **DELETE** = Removing data

Use **Swagger UI** for the easiest testing experience! 🚀
