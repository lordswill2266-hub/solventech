# ✅ Fixed! Test These Endpoints

The issue was you were using **GET** for POST endpoints. Here's the correct way:

---

## 🧪 Test 1: Register User (POST)

**Open Swagger:** `http://localhost:3000/api/docs`

Or use this cURL command:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"08012345678\",\"role\":\"BUYER\"}"
```

**Expected Response:**
```json
{
  "message": "OTP sent successfully",
  "phoneNumber": "08012345678",
  "expiresIn": "10 minutes"
}
```

**Check your terminal** - you'll see the OTP printed (for development):
```
📱 Sending OTP to 08012345678: 123456
```

---

## 🧪 Test 2: Verify OTP (POST)

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"08012345678\",\"otp\":\"THE_OTP_FROM_CONSOLE\"}"
```

**Expected Response:**
```json
{
  "message": "Phone number verified successfully",
  "user": {
    "id": "uuid-here",
    "phoneNumber": "08012345678",
    "role": "BUYER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save this token!** You'll need it for authenticated requests.

---

## 🧪 Test 3: Get Profile (GET) ✅

Now this one IS a GET request, but needs the token:

```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "phoneNumber": "08012345678",
    "role": "BUYER",
    "firstName": null,
    "lastName": null,
    ...
  }
}
```

---

## 🎯 Quick Testing with Swagger (Easiest!)

1. Open `http://localhost:3000/api/docs`
2. Find "Authentication" section
3. Click on `POST /auth/register`
4. Click "Try it out"
5. Fill in the JSON:
   ```json
   {
     "phoneNumber": "08012345678",
     "role": "BUYER"
   }
   ```
6. Click "Execute"
7. See the OTP in your terminal
8. Test `POST /auth/verify-otp` with the OTP
9. Copy the token from response
10. Click "Authorize" button at top of Swagger
11. Paste token and click "Authorize"
12. Now test `GET /auth/profile`

---

## ⚠️ Remember

- **POST** endpoints need JSON body
- **GET** endpoints just need the URL (and auth token if protected)
- Always check the HTTP method in Swagger!

The server should be running now. Try it! 🚀
