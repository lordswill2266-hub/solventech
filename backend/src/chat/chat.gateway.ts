import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({
    cors: {
        origin: '*', // Configure this properly in production
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);
    private userSockets = new Map<string, string>(); // userId -> socketId

    constructor(private chatService: ChatService) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        // Remove user from active users map
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                break;
            }
        }
    }

    @SubscribeMessage('register')
    handleRegister(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { userId: string },
    ) {
        this.userSockets.set(data.userId, client.id);
        this.logger.log(`User registered: ${data.userId} -> ${client.id}`);
        return { success: true, message: 'Registered successfully' };
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { orderId: string; senderId: string; receiverId: string; content: string },
    ) {
        try {
            // Save message to database
            const message = await this.chatService.sendMessage({
                orderId: data.orderId,
                senderId: data.senderId,
                receiverId: data.receiverId,
                content: data.content,
            });

            // Emit to receiver if online
            const receiverSocketId = this.userSockets.get(data.receiverId);
            if (receiverSocketId) {
                this.server.to(receiverSocketId).emit('newMessage', {
                    id: message.id,
                    orderId: message.orderId,
                    senderId: message.senderId,
                    receiverId: message.receiverId,
                    content: message.content,
                    createdAt: message.createdAt,
                    isRead: false,
                });
            }

            // Emit back to sender for confirmation
            client.emit('messageSent', {
                id: message.id,
                orderId: message.orderId,
                content: message.content,
                createdAt: message.createdAt,
            });

            this.logger.log(`Message sent: ${data.senderId} -> ${data.receiverId}`);

            return { success: true, messageId: message.id };
        } catch (error) {
            this.logger.error(`Error sending message: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { orderId: string; userId: string; receiverId: string; isTyping: boolean },
    ) {
        const receiverSocketId = this.userSockets.get(data.receiverId);
        if (receiverSocketId) {
            this.server.to(receiverSocketId).emit('userTyping', {
                orderId: data.orderId,
                userId: data.userId,
                isTyping: data.isTyping,
            });
        }
    }

    @SubscribeMessage('markAsRead')
    async handleMarkAsRead(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { orderId: string; userId: string },
    ) {
        try {
            await this.chatService.markMessagesAsRead(data.orderId, data.userId);
            return { success: true };
        } catch (error) {
            this.logger.error(`Error marking messages as read: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}
