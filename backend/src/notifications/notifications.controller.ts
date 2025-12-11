import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendEmailDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get my notifications' })
    @ApiResponse({ status: 200, description: 'Notifications retrieved' })
    async getMyNotifications(@Request() req, @Query('page') page: number = 1) {
        return this.notificationsService.getUserNotifications(req.user.id, Number(page));
    }

    @Put(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiResponse({ status: 200, description: 'Marked as read' })
    async markAsRead(@Request() req, @Param('id') id: string) {
        return this.notificationsService.markAsRead(id, req.user.id);
    }

    @Post('email/test')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Test email sending (Admin only)' })
    @ApiResponse({ status: 200, description: 'Email sent' })
    async sendTestEmail(@Body() dto: SendEmailDto) {
        return this.notificationsService.sendEmail(dto);
    }
}
