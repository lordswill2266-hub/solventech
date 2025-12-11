import { Controller, Get, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, UpdateBankDetailsDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved' })
    async getMe(@Request() req) {
        return this.usersService.getUser(req.user.id);
    }

    @Put('profile')
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated' })
    async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
        return this.usersService.updateProfile(req.user.id, dto);
    }

    @Put('bank-details')
    @ApiOperation({ summary: 'Update bank details (sellers only)' })
    @ApiResponse({ status: 200, description: 'Bank details updated' })
    async updateBankDetails(@Request() req, @Body() dto: UpdateBankDetailsDto) {
        return this.usersService.updateBankDetails(req.user.id, dto);
    }
}
