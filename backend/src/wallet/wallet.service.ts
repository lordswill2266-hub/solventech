import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { WithdrawDto, TransferDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
    private readonly logger = new Logger(WalletService.name);
    private readonly withdrawalFee: number;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.withdrawalFee = parseFloat(this.configService.get('WITHDRAWAL_FEE') || '50');
    }

    async getBalance(userId: string) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }

        return {
            success: true,
            wallet: {
                id: wallet.id,
                balance: Number(wallet.balance),
                userId: wallet.userId,
                updatedAt: wallet.updatedAt,
            },
        };
    }

    async getTransactions(userId: string, limit = 50) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }

        const transactions = await this.prisma.transaction.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return {
            success: true,
            count: transactions.length,
            transactions: transactions.map((tx) => ({
                id: tx.id,
                type: tx.type,
                amount: Number(tx.amount),
                balanceBefore: Number(tx.balanceBefore),
                balanceAfter: Number(tx.balanceAfter),
                status: tx.status,
                reference: tx.reference,
                description: tx.description,
                metadata: tx.metadata,
                createdAt: tx.createdAt,
            })),
        };
    }

    async withdraw(userId: string, dto: WithdrawDto) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
            include: { user: true },
        });

        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }

        const currentBalance = Number(wallet.balance);
        const totalDeduction = dto.amount + this.withdrawalFee;

        if (currentBalance < totalDeduction) {
            throw new BadRequestException(
                `Insufficient balance. Required: ₦${totalDeduction}, Available: ₦${currentBalance}`,
            );
        }

        if (!wallet.user.accountNumber || !wallet.user.bankName) {
            throw new BadRequestException('Please add your bank details first');
        }

        const result = await this.prisma.$transaction(async (tx) => {
            const updatedWallet = await tx.wallet.update({
                where: { userId },
                data: { balance: { decrement: totalDeduction } },
            });

            const withdrawal = await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'WITHDRAWAL',
                    amount: dto.amount,
                    balanceBefore: currentBalance,
                    balanceAfter: Number(updatedWallet.balance),
                    status: 'PENDING',
                    reference: `WD_${Date.now()}_${userId.substring(0, 8)}`,
                    description: `Withdrawal to ${dto.accountNumber} (${dto.bankName})`,
                    metadata: {
                        accountNumber: dto.accountNumber,
                        bankName: dto.bankName,
                        accountName: dto.accountName,
                        withdrawalFee: this.withdrawalFee,
                    },
                },
            });

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'WITHDRAWAL',
                    amount: this.withdrawalFee,
                    balanceBefore: Number(updatedWallet.balance) + this.withdrawalFee,
                    balanceAfter: Number(updatedWallet.balance),
                    status: 'COMPLETED',
                    reference: `WD_FEE_${Date.now()}`,
                    description: 'Withdrawal processing fee',
                    metadata: { relatedTransaction: withdrawal.id },
                },
            });

            return { updatedWallet, withdrawal };
        });

        this.logger.log(`Withdrawal initiated: ${result.withdrawal.reference}`);

        return {
            success: true,
            message: 'Withdrawal request submitted successfully',
            withdrawal: {
                id: result.withdrawal.id,
                reference: result.withdrawal.reference,
                amount: dto.amount,
                fee: this.withdrawalFee,
                totalDeducted: totalDeduction,
                status: result.withdrawal.status,
                accountNumber: dto.accountNumber,
                bankName: dto.bankName,
            },
            newBalance: Number(result.updatedWallet.balance),
        };
    }

    async transfer(senderId: string, dto: TransferDto) {
        const senderWallet = await this.prisma.wallet.findUnique({
            where: { userId: senderId },
        });

        if (!senderWallet) {
            throw new NotFoundException('Sender wallet not found');
        }

        const recipientWallet = await this.prisma.wallet.findUnique({
            where: { userId: dto.recipientId },
        });

        if (!recipientWallet) {
            throw new NotFoundException('Recipient wallet not found');
        }

        if (senderId === dto.recipientId) {
            throw new BadRequestException('Cannot transfer to yourself');
        }

        const senderBalance = Number(senderWallet.balance);

        if (senderBalance < dto.amount) {
            throw new BadRequestException(
                `Insufficient balance. Required: ₦${dto.amount}, Available: ₦${senderBalance}`,
            );
        }

        const result = await this.prisma.$transaction(async (tx) => {
            const updatedSenderWallet = await tx.wallet.update({
                where: { userId: senderId },
                data: { balance: { decrement: dto.amount } },
            });

            const updatedRecipientWallet = await tx.wallet.update({
                where: { userId: dto.recipientId },
                data: { balance: { increment: dto.amount } },
            });

            const reference = `TRF_${Date.now()}_${senderId.substring(0, 4)}`;

            await tx.transaction.create({
                data: {
                    walletId: senderWallet.id,
                    type: 'DEBIT',
                    amount: dto.amount,
                    balanceBefore: senderBalance,
                    balanceAfter: Number(updatedSenderWallet.balance),
                    status: 'COMPLETED',
                    reference,
                    description: dto.description || `Transfer to user ${dto.recipientId.substring(0, 8)}`,
                    metadata: { recipientId: dto.recipientId, transferType: 'P2P' },
                },
            });

            await tx.transaction.create({
                data: {
                    walletId: recipientWallet.id,
                    type: 'CREDIT',
                    amount: dto.amount,
                    balanceBefore: Number(recipientWallet.balance),
                    balanceAfter: Number(updatedRecipientWallet.balance),
                    status: 'COMPLETED',
                    reference,
                    description: dto.description || `Transfer from user ${senderId.substring(0, 8)}`,
                    metadata: { senderId, transferType: 'P2P' },
                },
            });

            return { updatedSenderWallet, updatedRecipientWallet, reference };
        });

        this.logger.log(`P2P Transfer: ${result.reference}`);

        return {
            success: true,
            message: 'Transfer completed successfully',
            transfer: {
                reference: result.reference,
                amount: dto.amount,
                recipientId: dto.recipientId,
            },
            newBalance: Number(result.updatedSenderWallet.balance),
        };
    }

    async creditWallet(userId: string, amount: number, reference: string, description: string, metadata?: any) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }

        const currentBalance = Number(wallet.balance);

        const result = await this.prisma.$transaction(async (tx) => {
            const updatedWallet = await tx.wallet.update({
                where: { userId },
                data: { balance: { increment: amount } },
            });

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'CREDIT',
                    amount,
                    balanceBefore: currentBalance,
                    balanceAfter: Number(updatedWallet.balance),
                    status: 'COMPLETED',
                    reference,
                    description,
                    metadata,
                },
            });

            return updatedWallet;
        });

        this.logger.log(`Wallet credited: ${userId} - ₦${amount}`);

        return {
            success: true,
            newBalance: Number(result.balance),
        };
    }

    async debitWallet(userId: string, amount: number, reference: string, description: string, metadata?: any) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }

        const currentBalance = Number(wallet.balance);

        if (currentBalance < amount) {
            throw new BadRequestException('Insufficient balance');
        }

        const result = await this.prisma.$transaction(async (tx) => {
            const updatedWallet = await tx.wallet.update({
                where: { userId },
                data: { balance: { decrement: amount } },
            });

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'DEBIT',
                    amount,
                    balanceBefore: currentBalance,
                    balanceAfter: Number(updatedWallet.balance),
                    status: 'COMPLETED',
                    reference,
                    description,
                    metadata,
                },
            });

            return updatedWallet;
        });

        this.logger.log(`Wallet debited: ${userId} - ₦${amount}`);

        return {
            success: true,
            newBalance: Number(result.balance),
        };
    }
}
