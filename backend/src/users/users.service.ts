import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, UpdateBankDetailsDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: dto,
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

        return {
            success: true,
            message: 'Profile updated successfully',
            user,
        };
    }

    async updateBankDetails(userId: string, dto: UpdateBankDetailsDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role !== 'SELLER') {
            throw new BadRequestException('Only sellers can add bank details');
        }

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                bankName: dto.bankName,
                accountNumber: dto.accountNumber,
                accountName: dto.accountName,
            },
        });

        return {
            success: true,
            message: 'Bank details updated successfully',
            bankDetails: {
                bankName: updated.bankName,
                accountNumber: updated.accountNumber,
                accountName: updated.accountName,
            },
        };
    }

    async getUser(userId: string) {
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
            throw new NotFoundException('User not found');
        }

        return {
            success: true,
            user,
        };
    }
}
