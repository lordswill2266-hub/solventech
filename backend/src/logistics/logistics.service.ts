import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryDto, UpdateDeliveryStatusDto, DeliveryStatus } from './dto/delivery.dto';

@Injectable()
export class LogisticsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create delivery request (Usually called when order is placed/confirmed)
     */
    async createDelivery(dto: CreateDeliveryDto) {
        const delivery = await this.prisma.delivery.create({
            data: {
                orderId: dto.orderId,
                pickupLocation: dto.pickupLocation,
                deliveryLocation: dto.deliveryLocation,
                deliveryNotes: dto.deliveryNotes,
                status: DeliveryStatus.PENDING,
            },
        });

        return {
            success: true,
            message: 'Delivery request created',
            delivery,
        };
    }

    /**
     * Assign rider to delivery
     */
    async assignRider(deliveryId: string, riderId: string) {
        const delivery = await this.prisma.delivery.findUnique({
            where: { id: deliveryId },
        });

        if (!delivery) throw new NotFoundException('Delivery not found');
        if (delivery.status !== DeliveryStatus.PENDING) {
            throw new BadRequestException('Delivery already assigned or completed');
        }

        const updated = await this.prisma.delivery.update({
            where: { id: deliveryId },
            data: {
                riderId,
                status: DeliveryStatus.ASSIGNED,
                assignedAt: new Date(),
            },
        });

        // Notify user (placeholder)

        return {
            success: true,
            data: updated,
        };
    }

    /**
     * Update delivery status (Rider only)
     */
    async updateStatus(deliveryId: string, riderId: string, dto: UpdateDeliveryStatusDto) {
        const delivery = await this.prisma.delivery.findUnique({
            where: { id: deliveryId },
        });

        if (!delivery) throw new NotFoundException('Delivery not found');
        if (delivery.riderId !== riderId) {
            throw new BadRequestException('Not authorized for this delivery');
        }

        const data: any = { status: dto.status };

        if (dto.status === DeliveryStatus.PICKED_UP) {
            data.pickedUpAt = new Date();
            // Update order status to IN_TRANSIT
            await this.prisma.order.update({
                where: { id: delivery.orderId },
                data: { status: 'IN_TRANSIT' },
            });
        } else if (dto.status === DeliveryStatus.DELIVERED) {
            data.deliveredAt = new Date();
            data.proofOfDelivery = dto.proofOfDelivery;
            // Update order status to DELIVERED
            await this.prisma.order.update({
                where: { id: delivery.orderId },
                data: { status: 'DELIVERED' },
            });
        }

        const updated = await this.prisma.delivery.update({
            where: { id: deliveryId },
            data,
        });

        return {
            success: true,
            status: dto.status,
            delivery: updated,
        };
    }

    /**
     * Get available deliveries (for riders)
     */
    async getAvailableDeliveries(location?: string) {
        return this.prisma.delivery.findMany({
            where: {
                status: DeliveryStatus.PENDING,
                // In real app, filter by location radius
            },
            include: {
                order: {
                    select: {
                        deliveryAddress: true,
                        deliveryPhone: true,
                    },
                },
            },
        });
    }

    /**
     * Get rider specific deliveries
     */
    async getRiderDeliveries(riderId: string) {
        return this.prisma.delivery.findMany({
            where: { riderId },
            orderBy: { createdAt: 'desc' },
            include: {
                order: true,
            },
        });
    }
}
