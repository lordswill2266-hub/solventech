import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UpdateUserStatusDto, AdminStatsDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get platform statistics' })
    @ApiResponse({ status: 200, description: 'Statistics retrieved', type: AdminStatsDto })
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('users')
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Users retrieved' })
    async getUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
        return this.adminService.getUsers(Number(page), Number(limit));
    }

    @Put('users/status')
    @ApiOperation({ summary: 'Update user status (Ban/Unban)' })
    @ApiResponse({ status: 200, description: 'User status updated' })
    async updateUserStatus(@Body() dto: UpdateUserStatusDto) {
        return this.adminService.updateUserStatus(dto);
    }

    @Get('transactions')
    @ApiOperation({ summary: 'Get all transactions' })
    @ApiResponse({ status: 200, description: 'Transactions retrieved' })
    async getTransactions(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
        return this.adminService.getTransactions(Number(page), Number(limit));
    }
}
