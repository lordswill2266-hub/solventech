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
export class PaystackProvider implements PaymentProvider {
    private readonly logger = new Logger(PaystackProvider.name);
    private readonly baseUrl = 'https://api.paystack.co';
    private readonly secretKey: string;

    constructor(private configService: ConfigService) {
        this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    }

    /**
     * Initialize a payment transaction
     */
    async initializePayment(params: InitializePaymentParams): Promise<PaymentResponse> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/transaction/initialize`,
                {
                    email: params.email,
                    amount: params.amount * 100, // Convert to kobo
                    reference: params.reference,
                    callback_url: params.callbackUrl,
                    metadata: params.metadata,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const data = response.data.data;

            return {
                success: true,
                reference: params.reference,
                authorizationUrl: data.authorization_url,
                accessCode: data.access_code,
            };
        } catch (error) {
            this.logger.error('Paystack initialization failed', error.response?.data || error.message);
            throw new Error(`Paystack initialization failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Verify a payment transaction
     */
    async verifyPayment(reference: string): Promise<VerificationResponse> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                    },
                },
            );

            const data = response.data.data;

            return {
                success: data.status === 'success',
                reference: data.reference,
                amount: data.amount / 100, // Convert from kobo
                status: data.status === 'success' ? 'success' : data.status === 'failed' ? 'failed' : 'pending',
                paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
                channel: data.channel,
                metadata: data.metadata,
            };
        } catch (error) {
            this.logger.error('Paystack verification failed', error.response?.data || error.message);
            throw new Error(`Paystack verification failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Create a dedicated virtual account
     */
    async createVirtualAccount(params: VirtualAccountParams): Promise<VirtualAccountResponse> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/dedicated_account`,
                {
                    email: params.email,
                    first_name: params.firstName,
                    last_name: params.lastName,
                    phone: params.phoneNumber,
                    preferred_bank: 'wema-bank', // Default bank
                    country: 'NG',
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const data = response.data.data;

            return {
                success: true,
                accountNumber: data.account_number,
                bankName: data.bank.name,
                accountName: data.account_name,
                reference: params.reference,
            };
        } catch (error) {
            this.logger.error('Paystack virtual account creation failed', error.response?.data || error.message);
            throw new Error(`Virtual account creation failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Handle Paystack webhook
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

        const event = payload.event;
        const data = payload.data;

        return {
            success: true,
            event,
            reference: data.reference,
            amount: data.amount ? data.amount / 100 : undefined,
            status: data.status,
            data,
        };
    }
}
