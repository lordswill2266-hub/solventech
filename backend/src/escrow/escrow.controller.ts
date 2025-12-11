import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EscrowService } from './escrow.service';
import { CreateEscrowDto, ReleaseEscrowDto, RefundEscrowDto, DisputeEscrowDto } from './dto/escrow.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Escrow')
@Controller('escrow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EscrowController {
    constructor(private readonly escrowService: EscrowService) { }

    @Post('create')
    @ApiOperation({ summary: 'Create escrow transaction (after payment received)' })
    @ApiResponse({ status: 201, description: 'Escrow created successfully' })
    async createEscrow(@Body() dto: CreateEscrowDto) {
        return this.escrowService.createEscrow(dto);
    }

    @Post('release')
    @ApiOperation({ summary: 'Release funds to seller (buyer confirms delivery)' })
    @ApiResponse({ status: 200, description: 'Funds released to seller' })
    async releaseEscrow(@Request() req, @Body() dto: ReleaseEscrowDto) {
        return this.escrowService.releaseEscrow(dto, req.user.id);
    }

    @Post('refund')
    @ApiOperation({ summary: 'Refund payment to buyer' })
    @ApiResponse({ status: 200, description: 'Funds refunded to buyer' })
    async refundEscrow(@Request() req, @Body() dto: RefundEscrowDto) {
        return this.escrowService.refundEscrow(dto, req.user.id);
    }

    @Post('dispute')
    @ApiOperation({ summary: 'Mark escrow as disputed' })
    @ApiResponse({ status: 200, description: 'Escrow marked as disputed' })
    async disputeEscrow(@Request() req, @Body() dto: DisputeEscrowDto) {
        return this.escrowService.disputeEscrow(dto, req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get escrow transaction details' })
    @ApiResponse({ status: 200, description: 'Escrow details retrieved' })
    async getEscrow(@Request() req, @Param('id') id: string) {
        return this.escrowService.getEscrow(id, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: 'Get user escrow transactions' })
    @ApiResponse({ status: 200, description: 'List of user escrow transactions' })
    async getUserEscrows(@Request() req) {
        return this.escrowService.getUserEscrows(req.user.id);
    }
}
