import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EscrowStatus, OrderStatus } from '@prisma/client';
import { CreateEscrowDto, ReleaseEscrowDto, RefundEscrowDto, DisputeEscrowDto } from './dto/escrow.dto';

@Injectable()
export class EscrowService {
    private readonly logger = new Logger(EscrowService.name);
    private readonly commissionRate: number;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.commissionRate = parseFloat(this.configService.get('COMMISSION_RATE') || '0.05');
    }

    /**
     * Create an escrow transaction when payment is received
     */
    async createEscrow(dto: CreateEscrowDto) {
        // Verify order exists
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Check if escrow already exists
        const existingEscrow = await this.prisma.escrowTransaction.findUnique({
            where: { orderId: dto.orderId },
        });

        if (existingEscrow) {
            throw new BadRequestException('Escrow already exists for this order');
        }

        // Create escrow transaction
        const escrow = await this.prisma.escrowTransaction.create({
            data: {
                orderId: dto.orderId,
                amount: dto.amount,
                status: EscrowStatus.HELD,
                paymentGateway: dto.paymentGateway,
                paymentReference: dto.paymentReference,
                virtualAccountNumber: dto.virtualAccountNumber,
                heldAt: new Date(),
            },
        });

        // Update order status
        await this.prisma.order.update({
            where: { id: dto.orderId },
            data: { status: OrderStatus.PAYMENT_HELD },
        });

        this.logger.log(`Escrow created: ${escrow.id} for order ${dto.orderId}`);

        return {
            success: true,
            escrow: {
                id: escrow.id,
                orderId: escrow.orderId,
                amount: Number(escrow.amount),
                status: escrow.status,
                heldAt: escrow.heldAt,
            },
        };
    }

    /**
     * Release funds to seller (simplified version - to be enhanced with wallet integration)
     */
    async releaseEscrow(dto: ReleaseEscrowDto, userId: string) {
        const escrow = await this.prisma.escrowTransaction.findUnique({
            where: { id: dto.escrowId },
            include: { order: true },
        });

        if (!escrow) {
            throw new NotFoundException('Escrow transaction not found');
        }

        if (escrow.order.buyerId !== userId) {
            throw new BadRequestException('Only the buyer can release funds');
        }

        if (escrow.status !== EscrowStatus.HELD) {
            throw new BadRequestException(`Cannot release escrow with status: ${escrow.status}`);
        }

        // Update escrow status
        const updatedEscrow = await this.prisma.escrowTransaction.update({
            where: { id: dto.escrowId },
            data: {
                status: EscrowStatus.RELEASED,
                releasedAt: new Date(),
            },
        });

        // Update order status
        await this.prisma.order.update({
            where: { id: escrow.orderId },
            data: {
                status: OrderStatus.COMPLETED,
                completedAt: new Date(),
            },
        });

        const amount = Number(escrow.amount);
        const commission = amount * this.commissionRate;
        const sellerAmount = amount - commission;

        this.logger.log(`Escrow released: ${dto.escrowId} - Seller: ₦${sellerAmount}`);

        return {
            success: true,
            message: 'Funds released to seller',
            escrow: {
                id: updatedEscrow.id,
                status: updatedEscrow.status,
                releasedAt: updatedEscrow.releasedAt,
            },
            breakdown: {
                totalAmount: amount,
                sellerAmount,
                commissionAmount: commission,
                commissionRate: this.commissionRate,
            },
        };
    }

    /**
     * Refund payment to buyer
     */
    async refundEscrow(dto: RefundEscrowDto, userId: string) {
        const escrow = await this.prisma.escrowTransaction.findUnique({
            where: { id: dto.escrowId },
            include: { order: true },
        });

        if (!escrow) {
            throw new NotFoundException('Escrow transaction not found');
        }

        const isBuyer = escrow.order.buyerId === userId;
        const isSeller = escrow.order.sellerId === userId;

        if (!isBuyer && !isSeller) {
            throw new BadRequestException('Unauthorized to refund this escrow');
        }

        if (escrow.status !== EscrowStatus.HELD && escrow.status !== EscrowStatus.DISPUTED) {
            throw new BadRequestException(`Cannot refund escrow with status: ${escrow.status}`);
        }

        // Update escrow status
        const updatedEscrow = await this.prisma.escrowTransaction.update({
            where: { id: dto.escrowId },
            data: {
                status: EscrowStatus.REFUNDED,
                refundedAt: new Date(),
            },
        });

        // Update order status
        await this.prisma.order.update({
            where: { id: escrow.orderId },
            data: { status: OrderStatus.CANCELLED },
        });

        this.logger.log(`Escrow refunded: ${dto.escrowId} - Reason: ${dto.reason}`);

        return {
            success: true,
            message: 'Funds refunded to buyer',
            escrow: {
                id: updatedEscrow.id,
                status: updatedEscrow.status,
                refundedAt: updatedEscrow.refundedAt,
            },
            refundAmount: Number(escrow.amount),
        };
    }

    /**
     * Mark escrow as disputed
     */
    async disputeEscrow(dto: DisputeEscrowDto, userId: string) {
        const escrow = await this.prisma.escrowTransaction.findUnique({
            where: { id: dto.escrowId },
            include: { order: true },
        });

        if (!escrow) {
            throw new NotFoundException('Escrow transaction not found');
        }

        const isBuyer = escrow.order.buyerId === userId;
        const isSeller = escrow.order.sellerId === userId;

        if (!isBuyer && !isSeller) {
            throw new BadRequestException('Unauthorized to dispute this escrow');
        }

        if (escrow.status !== EscrowStatus.HELD) {
            throw new BadRequestException(`Cannot dispute escrow with status: ${escrow.status}`);
        }

        // Update escrow and order status
        const updatedEscrow = await this.prisma.escrowTransaction.update({
            where: { id: dto.escrowId },
            data: { status: EscrowStatus.DISPUTED },
        });

        await this.prisma.order.update({
            where: { id: escrow.orderId },
            data: { status: OrderStatus.DISPUTED },
        });

        this.logger.log(`Escrow disputed: ${dto.escrowId} - Reason: ${dto.reason}`);

        return {
            success: true,
            message: 'Escrow marked as disputed. Admin will review.',
            escrow: {
                id: updatedEscrow.id,
                status: updatedEscrow.status,
            },
            dispute: {
                reason: dto.reason,
                raisedBy: isBuyer ? 'buyer' : 'seller',
            },
        };
    }

    /**
     * Get escrow details
     */
    async getEscrow(escrowId: string, userId: string) {
        const escrow = await this.prisma.escrowTransaction.findUnique({
            where: { id: escrowId },
            include: {
                order: {
                    include: {
                        buyer: { select: { id: true, phoneNumber: true } },
                        seller: { select: { id: true, phoneNumber: true } },
                        product: { select: { id: true, title: true, price: true } },
                    },
                },
            },
        });

        if (!escrow) {
            throw new NotFoundException('Escrow transaction not found');
        }

        const isBuyer = escrow.order.buyerId === userId;
        const isSeller = escrow.order.sellerId === userId;

        if (!isBuyer && !isSeller) {
            throw new BadRequestException('Unauthorized to view this escrow');
        }

        return {
            success: true,
            escrow: {
                id: escrow.id,
                amount: Number(escrow.amount),
                status: escrow.status,
                paymentGateway: escrow.paymentGateway,
                paymentReference: escrow.paymentReference,
                heldAt: escrow.heldAt,
                releasedAt: escrow.releasedAt,
                refundedAt: escrow.refundedAt,
                order: escrow.order,
            },
        };
    }

    /**
     * Get user's escrow transactions
     */
    async getUserEscrows(userId: string) {
        const escrows = await this.prisma.escrowTransaction.findMany({
            where: {
                order: {
                    OR: [{ buyerId: userId }, { sellerId: userId }],
                },
            },
            include: {
                order: {
                    include: {
                        product: { select: { title: true, price: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return {
            success: true,
            count: escrows.length,
            escrows: escrows.map((escrow) => ({
                id: escrow.id,
                amount: Number(escrow.amount),
                status: escrow.status,
                heldAt: escrow.heldAt,
                releasedAt: escrow.releasedAt,
                refundedAt: escrow.refundedAt,
                order: {
                    id: escrow.order.id,
                    status: escrow.order.status,
                    product: escrow.order.product,
                },
                role: escrow.order.buyerId === userId ? 'buyer' : 'seller',
            })),
        };
    }
}
