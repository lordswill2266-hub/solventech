export interface PaymentProvider {
    initializePayment(params: InitializePaymentParams): Promise<PaymentResponse>;
    verifyPayment(reference: string): Promise<VerificationResponse>;
    createVirtualAccount(params: VirtualAccountParams): Promise<VirtualAccountResponse>;
    handleWebhook(payload: any, signature?: string): Promise<WebhookResponse>;
}

export interface InitializePaymentParams {
    amount: number;
    email: string;
    reference: string;
    callbackUrl?: string;
    metadata?: Record<string, any>;
}

export interface PaymentResponse {
    success: boolean;
    reference: string;
    authorizationUrl?: string;
    accessCode?: string;
    accountNumber?: string;
    bankName?: string;
    accountName?: string;
    expiresAt?: Date;
}

export interface VerificationResponse {
    success: boolean;
    reference: string;
    amount: number;
    status: 'success' | 'failed' | 'pending';
    paidAt?: Date;
    channel?: string;
    metadata?: Record<string, any>;
}

export interface VirtualAccountParams {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    reference: string;
    amount?: number;
}

export interface VirtualAccountResponse {
    success: boolean;
    accountNumber: string;
    bankName: string;
    accountName: string;
    reference: string;
    expiresAt?: Date;
}

export interface WebhookResponse {
    success: boolean;
    event: string;
    reference: string;
    amount?: number;
    status?: string;
    data?: any;
}
