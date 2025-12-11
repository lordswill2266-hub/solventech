import { Controller, Post, Get, Body, Param, Headers, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto, VerifyPaymentDto, PaymentGateway } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get('gateways')
    @ApiOperation({ summary: 'Get available payment gateways' })
    @ApiResponse({ status: 200, description: 'List of available gateways' })
    getGateways() {
        return this.paymentsService.getAvailableGateways();
    }

    @Post('initialize')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Initialize a payment transaction' })
    @ApiResponse({ status: 201, description: 'Payment initialized successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    async initializePayment(@Request() req, @Body() dto: InitializePaymentDto) {
        return this.paymentsService.initializePayment(req.user.id, dto);
    }

    @Post('verify')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Verify a payment transaction' })
    @ApiResponse({ status: 200, description: 'Payment verification result' })
    async verifyPayment(@Body() dto: VerifyPaymentDto) {
        return this.paymentsService.verifyPayment(dto);
    }

    @Post('virtual-account/:gateway')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a virtual account' })
    @ApiResponse({ status: 201, description: 'Virtual account created' })
    async createVirtualAccount(@Request() req, @Param('gateway') gateway: PaymentGateway) {
        return this.paymentsService.createVirtualAccount(req.user.id, gateway);
    }

    @Post('webhook/paystack')
    @ApiOperation({ summary: 'Paystack webhook endpoint' })
    async paystackWebhook(@Body() payload: any, @Headers('x-paystack-signature') signature: string) {
        return this.paymentsService.handleWebhook(PaymentGateway.PAYSTACK, payload, signature);
    }

    @Post('webhook/monnify')
    @ApiOperation({ summary: 'Monnify webhook endpoint' })
    async monnifyWebhook(@Body() payload: any, @Headers('monnify-signature') signature: string) {
        return this.paymentsService.handleWebhook(PaymentGateway.MONNIFY, payload, signature);
    }
}
