import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);
    private readonly commissionRate: number;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.commissionRate = parseFloat(this.configService.get('COMMISSION_RATE') || '0.05');
    }

    /**
     * Create a new order
     */
    async createOrder(buyerId: string, dto: CreateOrderDto) {
        // Get product details
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
            include: { seller: true },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (!product.isActive) {
            throw new BadRequestException('Product is not available');
        }

        if (product.sellerId === buyerId) {
            throw new BadRequestException('You cannot buy your own product');
        }

        const quantity = dto.quantity || 1;
        const productPrice = Number(product.price);
        const totalAmount = productPrice * quantity;
        const commissionAmount = totalAmount * this.commissionRate;

        // Create order
        const order = await this.prisma.order.create({
            data: {
                buyerId,
                sellerId: product.sellerId,
                productId: dto.productId,
                quantity,
                totalAmount,
                commissionAmount,
                status: 'PENDING_PAYMENT',
                deliveryAddress: dto.deliveryAddress,
                deliveryPhone: dto.deliveryPhone,
                deliveryNotes: dto.deliveryNotes,
            },
            include: {
                product: { select: { title: true, price: true, images: true } },
                seller: { select: { phoneNumber: true, firstName: true, lastName: true } },
            },
        });

        this.logger.log(`Order created: ${order.id} - Buyer: ${buyerId}, Amount: ₦${totalAmount}`);

        return {
            success: true,
            message: 'Order created successfully. Please proceed to payment.',
            order: {
                id: order.id,
                productId: order.productId,
                product: order.product,
                seller: order.seller,
                quantity: order.quantity,
                totalAmount: Number(order.totalAmount),
                commissionAmount: Number(order.commissionAmount),
                status: order.status,
                deliveryAddress: order.deliveryAddress,
                deliveryPhone: order.deliveryPhone,
                createdAt: order.createdAt,
            },
        };
    }

    /**
     * Get order details
     */
    async getOrder(orderId: string, userId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                product: true,
                buyer: { select: { id: true, phoneNumber: true, firstName: true, lastName: true } },
                seller: { select: { id: true, phoneNumber: true, firstName: true, lastName: true } },
                escrow: true,
                delivery: true,
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Check authorization
        if (order.buyerId !== userId && order.sellerId !== userId) {
            throw new ForbiddenException('Unauthorized to view this order');
        }

        return {
            success: true,
            order: {
                id: order.id,
                product: order.product,
                buyer: order.buyer,
                seller: order.seller,
                quantity: order.quantity,
                totalAmount: Number(order.totalAmount),
                commissionAmount: Number(order.commissionAmount),
                status: order.status,
                deliveryAddress: order.deliveryAddress,
                deliveryPhone: order.deliveryPhone,
                deliveryNotes: order.deliveryNotes,
                escrow: order.escrow,
                delivery: order.delivery,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                completedAt: order.completedAt,
            },
            userRole: order.buyerId === userId ? 'buyer' : 'seller',
        };
    }

    /**
     * Get user's orders (as buyer or seller)
     */
    async getUserOrders(userId: string, role?: 'buyer' | 'seller') {
        const where: any = {
            OR: [],
        };

        if (!role || role === 'buyer') {
            where.OR.push({ buyerId: userId });
        }

        if (!role || role === 'seller') {
            where.OR.push({ sellerId: userId });
        }

        const orders = await this.prisma.order.findMany({
            where,
            include: {
                product: { select: { title: true, price: true, images: true } },
                buyer: { select: { phoneNumber: true } },
                seller: { select: { phoneNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return {
            success: true,
            count: orders.length,
            orders: orders.map((order) => ({
                id: order.id,
                product: order.product,
                quantity: order.quantity,
                totalAmount: Number(order.totalAmount),
                status: order.status,
                deliveryAddress: order.deliveryAddress,
                role: order.buyerId === userId ? 'buyer' : 'seller',
                otherParty: order.buyerId === userId ? order.seller : order.buyer,
                createdAt: order.createdAt,
            })),
        };
    }

    /**
     * Update order status (for sellers)
     */
    async updateOrderStatus(dto: UpdateOrderStatusDto, userId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Only seller can update order status
        if (order.sellerId !== userId) {
            throw new ForbiddenException('Only the seller can update order status');
        }

        // Validate status transition
        const validStatuses = ['SHIPPED', 'IN_TRANSIT', 'DELIVERED'];
        if (!validStatuses.includes(dto.status)) {
            throw new BadRequestException('Invalid status');
        }

        const updated = await this.prisma.order.update({
            where: { id: dto.orderId },
            data: { status: dto.status as any },
        });

        this.logger.log(`Order status updated: ${dto.orderId} -> ${dto.status}`);

        return {
            success: true,
            message: 'Order status updated successfully',
            order: {
                id: updated.id,
                status: updated.status,
                updatedAt: updated.updatedAt,
            },
        };
    }

    /**
     * Cancel order (before payment)
     */
    async cancelOrder(orderId: string, userId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Only buyer can cancel
        if (order.buyerId !== userId) {
            throw new ForbiddenException('Only the buyer can cancel the order');
        }

        // Can only cancel if payment is pending
        if (order.status !== 'PENDING_PAYMENT') {
            throw new BadRequestException('Order cannot be cancelled at this stage');
        }

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
        });

        this.logger.log(`Order cancelled: ${orderId} by buyer ${userId}`);

        return {
            success: true,
            message: 'Order cancelled successfully',
            order: {
                id: updated.id,
                status: updated.status,
            },
        };
    }

    /**
     * Confirm delivery (by buyer)
     */
    async confirmDelivery(orderId: string, userId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { escrow: true },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.buyerId !== userId) {
            throw new ForbiddenException('Only the buyer can confirm delivery');
        }

        if (order.status !== 'DELIVERED') {
            throw new BadRequestException('Order must be delivered before confirmation');
        }

        // This will trigger escrow release in a real implementation
        // For now, we just update the order status
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
            },
        });

        this.logger.log(`Delivery confirmed: ${orderId} by buyer ${userId}`);

        return {
            success: true,
            message: 'Delivery confirmed. Funds will be released to seller.',
            order: {
                id: updated.id,
                status: updated.status,
                completedAt: updated.completedAt,
            },
        };
    }
}
