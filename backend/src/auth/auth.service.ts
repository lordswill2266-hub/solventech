import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, VerifyOtpDto } from './dto/auth.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    // In-memory OTP storage (use Redis in production)
    private otpStore = new Map<string, { otp: string; expiresAt: Date; attempts: number }>();

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    /**
     * Register a new user and send OTP
     */
    async register(dto: RegisterDto) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { phoneNumber: dto.phoneNumber },
        });

        if (existingUser) {
            throw new ConflictException('Phone number already registered');
        }

        // Generate OTP
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP
        this.otpStore.set(dto.phoneNumber, { otp, expiresAt, attempts: 0 });

        // Send OTP via SMS (implement later)
        await this.sendOTP(dto.phoneNumber, otp);

        // Create user (unverified)
        await this.prisma.user.create({
            data: {
                phoneNumber: dto.phoneNumber,
                role: dto.role,
                firstName: dto.firstName,
                lastName: dto.lastName,
                isPhoneVerified: false,
            },
        });

        return {
            message: 'OTP sent successfully',
            phoneNumber: dto.phoneNumber,
            expiresIn: '10 minutes',
        };
    }

    /**
     * Verify OTP and complete registration
     */
    async verifyOtp(dto: VerifyOtpDto) {
        const stored = this.otpStore.get(dto.phoneNumber);

        if (!stored) {
            throw new BadRequestException('No OTP found. Please request a new one.');
        }

        // Check expiration
        if (new Date() > stored.expiresAt) {
            this.otpStore.delete(dto.phoneNumber);
            throw new BadRequestException('OTP has expired. Please request a new one.');
        }

        // Check attempts
        if (stored.attempts >= 3) {
            this.otpStore.delete(dto.phoneNumber);
            throw new BadRequestException('Too many failed attempts. Please request a new OTP.');
        }

        // Verify OTP
        if (stored.otp !== dto.otp) {
            stored.attempts++;
            throw new UnauthorizedException('Invalid OTP');
        }

        // Mark user as verified
        const user = await this.prisma.user.update({
            where: { phoneNumber: dto.phoneNumber },
            data: {
                isPhoneVerified: true,
                lastLoginAt: new Date(),
            },
        });

        // Create wallet for user
        await this.prisma.wallet.create({
            data: {
                userId: user.id,
                balance: 0,
            },
        });

        // Clear OTP
        this.otpStore.delete(dto.phoneNumber);

        // Generate JWT
        const token = await this.generateToken(user.id, user.phoneNumber, user.role);

        return {
            message: 'Phone number verified successfully',
            user: {
                id: user.id,
                phoneNumber: user.phoneNumber,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            token,
        };
    }

    /**
     * Resend OTP
     */
    async resendOtp(phoneNumber: string) {
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (user.isPhoneVerified) {
            throw new BadRequestException('Phone number already verified');
        }

        // Generate new OTP
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        this.otpStore.set(phoneNumber, { otp, expiresAt, attempts: 0 });

        // Send OTP
        await this.sendOTP(phoneNumber, otp);

        return {
            message: 'OTP resent successfully',
            expiresIn: '10 minutes',
        };
    }

    /**
     * Login existing user
     */
    async login(phoneNumber: string) {
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber },
        });

        if (!user) {
            throw new BadRequestException('User not found. Please register first.');
        }

        if (!user.isPhoneVerified) {
            throw new BadRequestException('Phone number not verified. Please verify first.');
        }

        // Generate OTP for login
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        this.otpStore.set(phoneNumber, { otp, expiresAt, attempts: 0 });

        // Send OTP
        await this.sendOTP(phoneNumber, otp);

        return {
            message: 'OTP sent successfully',
            phoneNumber,
            expiresIn: '10 minutes',
        };
    }

    /**
     * Generate 6-digit OTP
     */
    private generateOTP(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    /**
     * Send OTP via SMS (placeholder - implement with Termii/Twilio)
     */
    private async sendOTP(phoneNumber: string, otp: string): Promise<void> {
        // TODO: Integrate with Termii or Twilio
        console.log(`📱 Sending OTP to ${phoneNumber}: ${otp}`);

        // For development, just log it
        // In production, call SMS API:
        // const apiKey = this.configService.get('TERMII_API_KEY');
        // await axios.post('https://api.ng.termii.com/api/sms/send', { ... });
    }

    /**
     * Generate JWT token
     */
    private async generateToken(userId: string, phoneNumber: string, role: string): Promise<string> {
        const payload = { sub: userId, phoneNumber, role };
        return this.jwtService.sign(payload);
    }

    /**
     * Validate user from JWT
     */
    async validateUser(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phoneNumber: true,
                role: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                isPhoneVerified: true,
                isBvnVerified: true,
            },
        });
    }

    /**
     * Get user profile
     */
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phoneNumber: true,
                role: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                isPhoneVerified: true,
                isBvnVerified: true,
                bankName: true,
                accountNumber: true,
                accountName: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        return {
            success: true,
            user,
        };
    }
}
