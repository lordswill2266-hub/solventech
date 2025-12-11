import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, VerifyOtpDto, ResendOtpDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user and send OTP' })
    @ApiResponse({ status: 201, description: 'OTP sent successfully' })
    @ApiResponse({ status: 409, description: 'Phone number already registered' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify OTP and complete registration' })
    @ApiResponse({ status: 200, description: 'Phone verified, JWT token returned' })
    @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto);
    }

    @Post('resend-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Resend OTP' })
    @ApiResponse({ status: 200, description: 'OTP resent successfully' })
    async resendOtp(@Body() dto: ResendOtpDto) {
        return this.authService.resendOtp(dto.phoneNumber);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login existing user (sends OTP)' })
    @ApiResponse({ status: 200, description: 'OTP sent successfully' })
    @ApiResponse({ status: 400, description: 'User not found' })
    async login(@Body() dto: ResendOtpDto) {
        return this.authService.login(dto.phoneNumber);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.id);
    }
}
