import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { WithdrawDto, TransferDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get('balance')
    @ApiOperation({ summary: 'Get wallet balance' })
    @ApiResponse({ status: 200, description: 'Wallet balance retrieved' })
    async getBalance(@Request() req) {
        return this.walletService.getBalance(req.user.id);
    }

    @Get('transactions')
    @ApiOperation({ summary: 'Get transaction history' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Transaction history retrieved' })
    async getTransactions(@Request() req, @Query('limit') limit?: number) {
        return this.walletService.getTransactions(req.user.id, limit ? parseInt(limit.toString()) : 50);
    }

    @Post('withdraw')
    @ApiOperation({ summary: 'Withdraw funds to bank account' })
    @ApiResponse({ status: 200, description: 'Withdrawal initiated' })
    async withdraw(@Request() req, @Body() dto: WithdrawDto) {
        return this.walletService.withdraw(req.user.id, dto);
    }

    @Post('transfer')
    @ApiOperation({ summary: 'Transfer funds to another user' })
    @ApiResponse({ status: 200, description: 'Transfer completed' })
    async transfer(@Request() req, @Body() dto: TransferDto) {
        return this.walletService.transfer(req.user.id, dto);
    }
}
