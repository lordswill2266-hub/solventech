import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyBvnDto } from './dto/verification.dto';

@Injectable()
export class VerificationService {
    private readonly logger = new Logger(VerificationService.name);

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    /**
     * Verify BVN (Using Mono API - Mock for now)
     */
    async verifyBvn(userId: string, dto: VerifyBvnDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) throw new BadRequestException('User not found');
        if (user.isBvnVerified) {
            throw new BadRequestException('BVN already verified');
        }

        // This is where real Mono API call would happen
        // const monoResponse = await axios.post(...)

        // Simulating successful verification for local dev
        // In production, we would validate name match against BVN response

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                isBvnVerified: true,
                bvnHash: 'hashed_bvn_' + dto.bvn, // In real app, hash this properly
                verificationStatus: 'VERIFIED',
            },
        });

        return {
            success: true,
            message: 'BVN verified successfully',
            user: {
                id: updatedUser.id,
                isBvnVerified: updatedUser.isBvnVerified,
                status: updatedUser.verificationStatus,
            },
        };
    }
}
