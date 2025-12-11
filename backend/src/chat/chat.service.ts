import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SendMessageParams {
    orderId: string;
    senderId: string;
    receiverId: string;
    content: string;
}

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Send a message
     */
    async sendMessage(params: SendMessageParams) {
        const { orderId, senderId, receiverId, content } = params;

        // Verify order exists and user is part of it
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.buyerId !== senderId && order.sellerId !== senderId) {
            throw new ForbiddenException('You are not part of this order');
        }

        if (order.buyerId !== receiverId && order.sellerId !== receiverId) {
            throw new ForbiddenException('Invalid receiver');
        }

        // Create message
        const message = await this.prisma.message.create({
            data: {
                orderId,
                senderId,
                receiverId,
                content,
                isRead: false,
            },
        });

        this.logger.log(`Message created: ${message.id} in order ${orderId}`);

        return message;
    }

    /**
     * Get messages for an order
     */
    async getMessages(orderId: string, userId: string, limit = 50) {
        // Verify user is part of the order
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.buyerId !== userId && order.sellerId !== userId) {
            throw new ForbiddenException('You are not part of this order');
        }

        const messages = await this.prisma.message.findMany({
            where: { orderId },
            orderBy: { createdAt: 'asc' },
            take: limit,
            include: {
                sender: {
                    select: {
                        id: true,
                        phoneNumber: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return {
            success: true,
            count: messages.length,
            messages: messages.map((msg) => ({
                id: msg.id,
                orderId: msg.orderId,
                sender: msg.sender,
                content: msg.content,
                isRead: msg.isRead,
                createdAt: msg.createdAt,
                isMine: msg.senderId === userId,
            })),
        };
    }

    /**
     * Mark messages as read
     */
    async markMessagesAsRead(orderId: string, userId: string) {
        await this.prisma.message.updateMany({
            where: {
                orderId,
                receiverId: userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        this.logger.log(`Messages marked as read for user ${userId} in order ${orderId}`);

        return { success: true };
    }

    /**
     * Get unread message count
     */
    async getUnreadCount(userId: string) {
        const count = await this.prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false,
            },
        });

        return {
            success: true,
            unreadCount: count,
        };
    }

    /**
     * Get chat conversations (orders with messages)
     */
    async getConversations(userId: string) {
        const orders = await this.prisma.order.findMany({
            where: {
                OR: [{ buyerId: userId }, { sellerId: userId }],
                messages: {
                    some: {},
                },
            },
            include: {
                product: {
                    select: {
                        title: true,
                        images: true,
                    },
                },
                buyer: {
                    select: {
                        id: true,
                        phoneNumber: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                seller: {
                    select: {
                        id: true,
                        phoneNumber: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        const conversations = await Promise.all(
            orders.map(async (order) => {
                const unreadCount = await this.prisma.message.count({
                    where: {
                        orderId: order.id,
                        receiverId: userId,
                        isRead: false,
                    },
                });

                const otherUser = order.buyerId === userId ? order.seller : order.buyer;
                const lastMessage = order.messages[0];

                return {
                    orderId: order.id,
                    product: order.product,
                    otherUser,
                    lastMessage: lastMessage
                        ? {
                            content: lastMessage.content,
                            createdAt: lastMessage.createdAt,
                            isMine: lastMessage.senderId === userId,
                        }
                        : null,
                    unreadCount,
                };
            }),
        );

        return {
            success: true,
            count: conversations.length,
            conversations,
        };
    }
}
