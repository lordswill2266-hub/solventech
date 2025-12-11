import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackProvider } from './providers/paystack.provider';
import { MonnifyProvider } from './providers/monnify.provider';
import { InitializePaymentDto, VerifyPaymentDto, PaymentGateway } from './dto/payment.dto';
import { PaymentProvider } from './interfaces/payment-provider.interface';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly providers: Map<PaymentGateway, PaymentProvider>;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private paystackProvider: PaystackProvider,
        private monnifyProvider: MonnifyProvider,
    ) {
        // Register payment providers
        this.providers = new Map<PaymentGateway, PaymentProvider>([
            [PaymentGateway.PAYSTACK, this.paystackProvider],
            [PaymentGateway.MONNIFY, this.monnifyProvider],
        ]);
    }

    /**
     * Initialize a payment with selected gateway
     */
    async initializePayment(userId: string, dto: InitializePaymentDto) {
        const provider = this.providers.get(dto.gateway);

        if (!provider) {
            throw new BadRequestException('Invalid payment gateway');
        }

        // Get user details
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        try {
            const response = await provider.initializePayment({
                amount: dto.amount,
                email: user.email || `${user.phoneNumber}@solven.ng`,
                reference: dto.reference,
                metadata: {
                    userId,
                    description: dto.description,
                },
            });

            this.logger.log(`Payment initialized: ${dto.reference} via ${dto.gateway}`);

            return {
                success: true,
                gateway: dto.gateway,
                ...response,
            };
        } catch (error) {
            this.logger.error(`Payment initialization failed: ${error.message}`);
            throw new BadRequestException(error.message);
        }
    }

    /**
     * Verify a payment transaction
     */
    async verifyPayment(dto: VerifyPaymentDto) {
        const provider = this.providers.get(dto.gateway);

        if (!provider) {
            throw new BadRequestException('Invalid payment gateway');
        }

        try {
            const response = await provider.verifyPayment(dto.reference);

            this.logger.log(`Payment verified: ${dto.reference} - Status: ${response.status}`);

            return {
                success: true,
                gateway: dto.gateway,
                ...response,
            };
        } catch (error) {
            this.logger.error(`Payment verification failed: ${error.message}`);
            throw new BadRequestException(error.message);
        }
    }

    /**
     * Create a virtual account for a user
     */
    async createVirtualAccount(userId: string, gateway: PaymentGateway) {
        const provider = this.providers.get(gateway);

        if (!provider) {
            throw new BadRequestException('Invalid payment gateway');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        try {
            const response = await provider.createVirtualAccount({
                email: user.email || `${user.phoneNumber}@solven.ng`,
                firstName: user.firstName || 'User',
                lastName: user.lastName || user.phoneNumber,
                phoneNumber: user.phoneNumber,
                reference: `VA_${userId}_${Date.now()}`,
            });

            this.logger.log(`Virtual account created for user ${userId} via ${gateway}`);

            return {
                success: true,
                gateway,
                ...response,
            };
        } catch (error) {
            this.logger.error(`Virtual account creation failed: ${error.message}`);
            throw new BadRequestException(error.message);
        }
    }

    /**
     * Handle webhook from payment gateway
     */
    async handleWebhook(gateway: PaymentGateway, payload: any, signature?: string) {
        const provider = this.providers.get(gateway);

        if (!provider) {
            throw new BadRequestException('Invalid payment gateway');
        }

        try {
            const response = await provider.handleWebhook(payload, signature);

            this.logger.log(`Webhook received: ${response.event} - ${response.reference}`);

            // Process webhook based on event type
            // This will be integrated with escrow logic later

            return response;
        } catch (error) {
            this.logger.error(`Webhook processing failed: ${error.message}`);
            throw new BadRequestException(error.message);
        }
    }

    /**
     * Get available payment gateways
     */
    getAvailableGateways() {
        return {
            gateways: [
                {
                    name: 'Paystack',
                    code: PaymentGateway.PAYSTACK,
                    description: 'Primary payment gateway',
                    features: ['card', 'bank_transfer', 'ussd'],
                },
                {
                    name: 'Monnify',
                    code: PaymentGateway.MONNIFY,
                    description: 'Alternative payment gateway',
                    features: ['card', 'bank_transfer'],
                },
            ],
        };
    }
}
