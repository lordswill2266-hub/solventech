import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new order' })
    @ApiResponse({ status: 201, description: 'Order created successfully' })
    async createOrder(@Request() req, @Body() dto: CreateOrderDto) {
        return this.ordersService.createOrder(req.user.id, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get my orders' })
    @ApiQuery({ name: 'role', required: false, enum: ['buyer', 'seller'] })
    @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
    async getMyOrders(@Request() req, @Query('role') role?: 'buyer' | 'seller') {
        return this.ordersService.getUserOrders(req.user.id, role);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order details' })
    @ApiResponse({ status: 200, description: 'Order details retrieved' })
    async getOrder(@Request() req, @Param('id') id: string) {
        return this.ordersService.getOrder(id, req.user.id);
    }

    @Put('status')
    @ApiOperation({ summary: 'Update order status (sellers only)' })
    @ApiResponse({ status: 200, description: 'Order status updated' })
    async updateStatus(@Request() req, @Body() dto: UpdateOrderStatusDto) {
        return this.ordersService.updateOrderStatus(dto, req.user.id);
    }

    @Put(':id/cancel')
    @ApiOperation({ summary: 'Cancel order (buyers only, before payment)' })
    @ApiResponse({ status: 200, description: 'Order cancelled' })
    async cancelOrder(@Request() req, @Param('id') id: string) {
        return this.ordersService.cancelOrder(id, req.user.id);
    }

    @Put(':id/confirm-delivery')
    @ApiOperation({ summary: 'Confirm delivery (buyers only)' })
    @ApiResponse({ status: 200, description: 'Delivery confirmed' })
    async confirmDelivery(@Request() req, @Param('id') id: string) {
        return this.ordersService.confirmDelivery(id, req.user.id);
    }
}
