import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LogisticsService } from './logistics.service';
import { CreateDeliveryDto, UpdateDeliveryStatusDto } from './dto/delivery.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Logistics')
@Controller('logistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LogisticsController {
    constructor(private readonly logisticsService: LogisticsService) { }

    @Post('create')
    @Roles('ADMIN', 'SELLER') // Sellers or Admin create delivery requests
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Create delivery request' })
    async createDelivery(@Body() dto: CreateDeliveryDto) {
        return this.logisticsService.createDelivery(dto);
    }

    @Get('available')
    @Roles('RIDER')
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Get available deliveries' })
    async getAvailableDeliveries() {
        return this.logisticsService.getAvailableDeliveries();
    }

    @Get('my-deliveries')
    @Roles('RIDER')
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Get rider deliveries' })
    async getMyDeliveries(@Request() req) {
        return this.logisticsService.getRiderDeliveries(req.user.id);
    }

    @Put(':id/assign')
    @Roles('RIDER')
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Accept/Assign delivery to self' })
    async assignRider(@Request() req, @Param('id') id: string) {
        return this.logisticsService.assignRider(id, req.user.id);
    }

    @Put(':id/status')
    @Roles('RIDER')
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Update delivery status' })
    async updateStatus(@Request() req, @Param('id') id: string, @Body() dto: UpdateDeliveryStatusDto) {
        return this.logisticsService.updateStatus(id, req.user.id, dto);
    }
}
