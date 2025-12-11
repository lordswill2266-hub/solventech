import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, SendEmailDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Create in-app notification
     */
    async createNotification(dto: CreateNotificationDto) {
        const notification = await this.prisma.notification.create({
            data: {
                userId: dto.userId,
                title: dto.title,
                message: dto.message,
                type: dto.type,
                metadata: dto.metadata || {},
                isRead: false,
            },
        });

        this.logger.log(`Notification created for ${dto.userId}: ${dto.title}`);
        return notification;
    }

    /**
     * Send email (Mock for now)
     */
    async sendEmail(dto: SendEmailDto) {
        // Integration with SendGrid/Mailgun would go here
        this.logger.log(`Sending email to ${dto.to}: ${dto.subject}`);

        return {
            success: true,
            message: 'Email sent successfully',
        };
    }

    /**
     * Get user notifications
     */
    async getUserNotifications(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);

        return {
            success: true,
            data: notifications,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Mark as read
     */
    async markAsRead(notificationId: string, userId: string) {
        await this.prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId,
            },
            data: { isRead: true },
        });

        return { success: true };
    }
}
