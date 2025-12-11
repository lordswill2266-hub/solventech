# Payment Integration Module

## Overview

The payment module provides a unified interface for handling payments through multiple gateways (Paystack and Monnify). It supports:

- Payment initialization
- Payment verification
- Virtual account creation
- Webhook handling
- Automatic failover between gateways

## Architecture

```
payments/
├── dto/
│   └── payment.dto.ts          # Request/response DTOs
├── interfaces/
│   └── payment-provider.interface.ts  # Provider contract
├── providers/
│   ├── paystack.provider.ts    # Paystack implementation
│   └── monnify.provider.ts     # Monnify implementation
├── payments.controller.ts      # API endpoints
├── payments.service.ts         # Business logic
└── payments.module.ts          # Module definition
```

## API Endpoints

### Get Available Gateways
```http
GET /api/v1/payments/gateways
```

### Initialize Payment
```http
POST /api/v1/payments/initialize
Authorization: Bearer {token}

{
  "amount": 5000,
  "reference": "order_12345",
  "gateway": "paystack",
  "description": "Payment for order #12345"
}
```

### Verify Payment
```http
POST /api/v1/payments/verify
Authorization: Bearer {token}

{
  "reference": "order_12345",
  "gateway": "paystack"
}
```

### Create Virtual Account
```http
POST /api/v1/payments/virtual-account/paystack
Authorization: Bearer {token}
```

### Webhooks
```http
POST /api/v1/payments/webhook/paystack
POST /api/v1/payments/webhook/monnify
```

## Usage Examples

### Initialize Payment (Paystack)

```typescript
const response = await fetch('/api/v1/payments/initialize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 5000,
    reference: 'order_12345',
    gateway: 'paystack',
    description: 'Payment for order'
  })
});

const data = await response.json();
// Redirect user to: data.authorizationUrl
```

### Verify Payment

```typescript
const response = await fetch('/api/v1/payments/verify', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reference: 'order_12345',
    gateway: 'paystack'
  })
});

const data = await response.json();
if (data.status === 'success') {
  // Payment successful
}
```

## Provider Features

### Paystack
- Card payments
- Bank transfers
- USSD
- Virtual accounts (Wema Bank)
- Webhook signature verification

### Monnify
- Card payments
- Bank transfers
- Reserved virtual accounts
- Automatic token refresh
- Webhook signature verification

## Configuration

Required environment variables:

```env
# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx

# Monnify
MONNIFY_API_KEY=xxx
MONNIFY_SECRET_KEY=xxx
MONNIFY_CONTRACT_CODE=xxx
MONNIFY_BASE_URL=https://sandbox.monnify.com
```

## Webhook Setup

### Paystack
1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/v1/payments/webhook/paystack`
3. Copy webhook secret to `.env`

### Monnify
1. Go to Monnify Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/v1/payments/webhook/monnify`
3. Configure webhook signature

## Error Handling

All payment operations include comprehensive error handling:

```typescript
try {
  const result = await paymentsService.initializePayment(userId, dto);
} catch (error) {
  // Error is logged and thrown as BadRequestException
  // Client receives: { statusCode: 400, message: "..." }
}
```

## Testing

Use sandbox/test credentials for development:

**Paystack Test Cards:**
- Success: 4084084084084081
- Insufficient Funds: 5060666666666666666

**Monnify:**
- Use sandbox environment
- Test with provided test credentials

## Next Steps

- Integrate with escrow module
- Add transaction logging
- Implement retry logic
- Add payment analytics
