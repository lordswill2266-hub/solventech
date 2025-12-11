# Chat System

Real-time messaging system for buyer-seller communication using WebSockets.

## Features

- ✅ Real-time messaging via WebSocket
- ✅ HTTP fallback for message sending
- ✅ Message persistence in database
- ✅ Read receipts
- ✅ Typing indicators
- ✅ Unread message count
- ✅ Conversation list
- ✅ Order-based chat rooms

## WebSocket Events

### Client → Server

**register** - Register user connection
```json
{
  "userId": "user-uuid"
}
```

**sendMessage** - Send a message
```json
{
  "orderId": "order-uuid",
  "senderId": "sender-uuid",
  "receiverId": "receiver-uuid",
  "content": "Hello, is the product available?"
}
```

**typing** - Typing indicator
```json
{
  "orderId": "order-uuid",
  "userId": "user-uuid",
  "receiverId": "receiver-uuid",
  "isTyping": true
}
```

**markAsRead** - Mark messages as read
```json
{
  "orderId": "order-uuid",
  "userId": "user-uuid"
}
```

### Server → Client

**newMessage** - Receive new message
```json
{
  "id": "message-uuid",
  "orderId": "order-uuid",
  "senderId": "sender-uuid",
  "receiverId": "receiver-uuid",
  "content": "Message content",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "isRead": false
}
```

**messageSent** - Confirmation of sent message
```json
{
  "id": "message-uuid",
  "orderId": "order-uuid",
  "content": "Message content",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**userTyping** - User is typing
```json
{
  "orderId": "order-uuid",
  "userId": "user-uuid",
  "isTyping": true
}
```

## HTTP Endpoints

### POST /api/v1/chat/send
Send a message (HTTP fallback)

**Request:**
```json
{
  "orderId": "order-uuid",
  "receiverId": "receiver-uuid",
  "content": "Hello!"
}
```

### GET /api/v1/chat/messages?orderId=xxx&limit=50
Get messages for an order

### POST /api/v1/chat/mark-read
Mark messages as read

**Request:**
```json
{
  "orderId": "order-uuid"
}
```

### GET /api/v1/chat/unread-count
Get unread message count

### GET /api/v1/chat/conversations
Get all chat conversations

## Usage Example (Flutter/JavaScript)

```javascript
import io from 'socket.io-client';

// Connect to WebSocket
const socket = io('http://localhost:3000');

// Register user
socket.emit('register', { userId: 'your-user-id' });

// Send message
socket.emit('sendMessage', {
  orderId: 'order-id',
  senderId: 'your-user-id',
  receiverId: 'other-user-id',
  content: 'Hello!'
});

// Listen for new messages
socket.on('newMessage', (message) => {
  console.log('New message:', message);
});

// Listen for typing indicator
socket.on('userTyping', (data) => {
  console.log('User typing:', data);
});
```

## Security

- All HTTP endpoints require JWT authentication
- WebSocket connections should implement authentication (to be added)
- Users can only send messages in orders they're part of
- Messages are validated before saving

## Database Schema

```prisma
model Message {
  id         String   @id @default(uuid())
  orderId    String
  senderId   String
  receiverId String
  content    String   @db.Text
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())
  
  order      Order    @relation(fields: [orderId], references: [id])
  sender     User     @relation("SentMessages", fields: [senderId], references: [id])
  receiver   User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
}
```

## Next Steps

- [ ] Add WebSocket authentication
- [ ] Add message attachments (images)
- [ ] Add message reactions
- [ ] Add message deletion
- [ ] Add push notifications for offline users
