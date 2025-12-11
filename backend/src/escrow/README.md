# Escrow Module

## Overview

The escrow module is the **core security feature** of Solven Shopper. It holds buyer payments securely until delivery is confirmed, protecting both buyers and sellers from fraud.

## How It Works

### Escrow Flow

```
1. PAYMENT RECEIVED → Escrow HELD
2. SELLER SHIPS → Order SHIPPED  
3. BUYER CONFIRMS → Escrow RELEASED → Seller receives funds (minus 5% commission)
4. DISPUTE → Escrow DISPUTED → Manual review
5. REFUND → Escrow REFUNDED → Buyer receives full refund
```

### Escrow States

- **PENDING**: Payment initiated but not yet confirmed
- **HELD**: Payment received and held securely
- **RELEASED**: Funds released to seller
- **REFUNDED**: Funds returned to buyer
- **DISPUTED**: Under review (manual intervention required)

## API Endpoints

### Create Escrow
```http
POST /api/v1/escrow/create
Authorization: Bearer {token}

{
  "orderId": "order-uuid",
  "amount": 5000,
  "paymentGateway": "paystack",
  "paymentReference": "ref_12345"
}
```

**When to call**: After payment is verified from Paystack/Monnify webhook.

### Release Escrow (Buyer Confirms Delivery)
```http
POST /api/v1/escrow/release
Authorization: Bearer {buyer-token}

{
  "escrowId": "escrow-uuid"
}
```

**What happens**:
- Calculates commission (5% default)
- Credits seller's wallet with (amount - commission)
- Records commission transaction
- Updates order status to COMPLETED
- Logs all transactions

### Refund Escrow
```http
POST /api/v1/escrow/refund
Authorization: Bearer {token}

{
  "escrowId": "escrow-uuid",
  "reason": "Item damaged on arrival"
}
```

**What happens**:
- Credits buyer's wallet with full amount
- Updates order status to CANCELLED
- Records refund transaction

### Dispute Escrow
```http
POST /api/v1/escrow/dispute
Authorization: Bearer {token}

{
  "escrowId": "escrow-uuid",
  "reason": "Item not as described"
}
```

**What happens**:
- Marks escrow as DISPUTED
- Freezes funds until admin review
- Updates order status to DISPUTED

### Get Escrow Details
```http
GET /api/v1/escrow/{escrow-id}
Authorization: Bearer {token}
```

### Get User's Escrows
```http
GET /api/v1/escrow
Authorization: Bearer {token}
```

Returns all escrow transactions where user is buyer or seller.

## Commission Calculation

```typescript
const commissionRate = 0.05; // 5%
const totalAmount = 5000;
const commissionAmount = totalAmount * commissionRate; // 250
const sellerAmount = totalAmount - commissionAmount; // 4750
```

**Example**:
- Buyer pays: ₦5,000
- Platform commission: ₦250 (5%)
- Seller receives: ₦4,750

## Security Features

1. **Authorization**: Only buyer can release funds, only involved parties can refund/dispute
2. **Atomic Transactions**: Uses Prisma transactions to ensure data consistency
3. **Audit Trail**: All escrow state changes are logged
4. **Balance Tracking**: Records balance before/after for every wallet operation
5. **Idempotency**: Prevents duplicate escrow creation for same order

## Integration with Other Modules

### Payment Module
- Webhook calls `createEscrow()` when payment is confirmed
- Payment reference is stored for reconciliation

### Wallet Module
- Escrow release credits seller wallet
- Refund credits buyer wallet
- All operations create transaction records

### Order Module
- Escrow status updates order status
- Order completion triggers escrow release

## Configuration

Environment variables:
```env
COMMISSION_RATE=0.05  # 5% platform commission
```

## Testing

### Test Escrow Flow

1. **Create Order** (via Order API - to be built)
2. **Make Payment** (via Payment API)
3. **Create Escrow** (automatically via webhook)
4. **Confirm Delivery** (buyer calls release endpoint)
5. **Check Seller Wallet** (should show credited amount)

### Test Refund Flow

1. Create escrow
2. Call refund endpoint
3. Check buyer wallet (should show refunded amount)

## Next Steps

- Integrate with payment webhooks
- Add automated escrow release (after X days)
- Build admin panel for dispute resolution
- Add email/SMS notifications for escrow events
