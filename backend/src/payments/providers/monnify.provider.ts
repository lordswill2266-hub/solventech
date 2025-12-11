import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import {
    PaymentProvider,
    InitializePaymentParams,
    PaymentResponse,
    VerificationResponse,
    VirtualAccountParams,
    VirtualAccountResponse,
    WebhookResponse,
} from '../interfaces/payment-provider.interface';

@Injectable()
export class MonnifyProvider implements PaymentProvider {
    private readonly logger = new Logger(MonnifyProvider.name);
    private readonly baseUrl: string;
    private readonly apiKey: string;
    private readonly secretKey: string;
    private readonly contractCode: string;
    private accessToken: string;
    private tokenExpiry: Date;

    constructor(private configService: ConfigService) {
        this.baseUrl = this.configService.get<string>('MONNIFY_BASE_URL');
        this.apiKey = this.configService.get<string>('MONNIFY_API_KEY');
        this.secretKey = this.configService.get<string>('MONNIFY_SECRET_KEY');
        this.contractCode = this.configService.get<string>('MONNIFY_CONTRACT_CODE');
    }

    /**
     * Get or refresh access token
     */
    private async getAccessToken(): Promise<string> {
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const auth = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64');

            const response = await axios.post(
                `${this.baseUrl}/api/v1/auth/login`,
                {},
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                },
            );

            this.accessToken = response.data.responseBody.accessToken;
            this.tokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour

            return this.accessToken;
        } catch (error) {
            this.logger.error('Monnify authentication failed', error.response?.data || error.message);
            throw new Error('Monnify authentication failed');
        }
    }

    /**
     * Initialize a payment transaction
     */
    async initializePayment(params: InitializePaymentParams): Promise<PaymentResponse> {
        try {
            const token = await this.getAccessToken();

            const response = await axios.post(
                `${this.baseUrl}/api/v1/merchant/transactions/init-transaction`,
                {
                    amount: params.amount,
                    customerName: params.metadata?.customerName || 'Customer',
                    customerEmail: params.email,
                    paymentReference: params.reference,
                    paymentDescription: params.metadata?.description || 'Payment',
                    currencyCode: 'NGN',
                    contractCode: this.contractCode,
                    redirectUrl: params.callbackUrl,
                    paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const data = response.data.responseBody;

            return {
                success: true,
                reference: params.reference,
                authorizationUrl: data.checkoutUrl,
            };
        } catch (error) {
            this.logger.error('Monnify initialization failed', error.response?.data || error.message);
            throw new Error(`Monnify initialization failed: ${error.response?.data?.responseMessage || error.message}`);
        }
    }

    /**
     * Verify a payment transaction
     */
    async verifyPayment(reference: string): Promise<VerificationResponse> {
        try {
            const token = await this.getAccessToken();

            const response = await axios.get(
                `${this.baseUrl}/api/v2/transactions/${encodeURIComponent(reference)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const data = response.data.responseBody;

            return {
                success: data.paymentStatus === 'PAID',
                reference: data.paymentReference,
                amount: data.amountPaid,
                status: data.paymentStatus === 'PAID' ? 'success' : data.paymentStatus === 'FAILED' ? 'failed' : 'pending',
                paidAt: data.paidOn ? new Date(data.paidOn) : undefined,
                channel: data.paymentMethod,
            };
        } catch (error) {
            this.logger.error('Monnify verification failed', error.response?.data || error.message);
            throw new Error(`Monnify verification failed: ${error.response?.data?.responseMessage || error.message}`);
        }
    }

    /**
     * Create a reserved virtual account
     */
    async createVirtualAccount(params: VirtualAccountParams): Promise<VirtualAccountResponse> {
        try {
            const token = await this.getAccessToken();

            const response = await axios.post(
                `${this.baseUrl}/api/v1/bank-transfer/reserved-accounts`,
                {
                    accountReference: params.reference,
                    accountName: `${params.firstName} ${params.lastName}`,
                    currencyCode: 'NGN',
                    contractCode: this.contractCode,
                    customerEmail: params.email,
                    customerName: `${params.firstName} ${params.lastName}`,
                    getAllAvailableBanks: false,
                    preferredBanks: ['035'], // Wema Bank
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const data = response.data.responseBody;
            const account = data.accounts[0]; // Get first account

            return {
                success: true,
                accountNumber: account.accountNumber,
                bankName: account.bankName,
                accountName: data.accountName,
                reference: params.reference,
            };
        } catch (error) {
            this.logger.error('Monnify virtual account creation failed', error.response?.data || error.message);
            throw new Error(`Virtual account creation failed: ${error.response?.data?.responseMessage || error.message}`);
        }
    }

    /**
     * Handle Monnify webhook
     */
    async handleWebhook(payload: any, signature?: string): Promise<WebhookResponse> {
        // Verify webhook signature
        const hash = crypto
            .createHmac('sha512', this.secretKey)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (hash !== signature) {
            throw new Error('Invalid webhook signature');
        }

        const data = payload.eventData;

        return {
            success: true,
            event: payload.eventType,
            reference: data.paymentReference,
            amount: data.amountPaid,
            status: data.paymentStatus,
            data,
        };
    }
}
