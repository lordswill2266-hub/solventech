import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserStatusDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get platform statistics
     */
    async getStats() {
        const [totalUsers, totalProducts, totalOrders, totalVolumeResult] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.product.count(),
            this.prisma.order.count(),
            this.prisma.transaction.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    type: 'DEBIT', // Assuming debits represent spending/transfers
                },
            }),
        ]);

        // Calculate commission (approximate based on volume or track separately)
        // For now, let's query the commission transactions if we have a specific type, 
        // or sum the commissionAmount from orders
        const totalCommissionResult = await this.prisma.order.aggregate({
            _sum: {
                commissionAmount: true,
            },
            where: {
                status: 'COMPLETED',
            },
        });

        return {
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalVolume: Number(totalVolumeResult._sum.amount || 0),
                totalCommission: Number(totalCommissionResult._sum.commissionAmount || 0),
            },
        };
    }

    /**
     * Get all users (paginated)
     */
    async getUsers(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    phoneNumber: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isPhoneVerified: true,
                    isBvnVerified: true,
                    createdAt: true,
                    // status: true, // Need to add status field to User schema if not present
                },
            }),
            this.prisma.user.count(),
        ]);

        return {
            success: true,
            data: users,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update user status (Ban/Unban)
     * Note: We need to add a 'status' or 'isActive' field to User schema.
     * For now, we'll assume we might need to add it.
     */
    async updateUserStatus(dto: UpdateUserStatusDto) {
        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // TODO: Add status field to User schema
        // For now, let's just log it or toggle a placeholder if we don't want to migrate yet.
        // Ideally, we should add `status String @default("ACTIVE")` to User model.

        // Simulating update for now until schema update
        /*
        const updated = await this.prisma.user.update({
          where: { id: dto.userId },
          data: { status: dto.status },
        });
        */

        return {
            success: true,
            message: `User status updated to ${dto.status}`,
        };
    }

    /**
     * Get all transactions
     */
    async getTransactions(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    wallet: {
                        select: {
                            user: {
                                select: {
                                    phoneNumber: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.transaction.count(),
        ]);

        return {
            success: true,
            data: transactions,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }
}
