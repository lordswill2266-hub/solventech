import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentGateway {
    PAYSTACK = 'paystack',
    MONNIFY = 'monnify',
}

export class InitializePaymentDto {
    @ApiProperty({ example: 5000 })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ example: 'order_12345' })
    @IsNotEmpty()
    @IsString()
    reference: string;

    @ApiProperty({ enum: PaymentGateway, example: 'paystack' })
    @IsEnum(PaymentGateway)
    gateway: PaymentGateway;

    @ApiProperty({ example: 'user@example.com', required: false })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty({ example: 'Payment for order #12345', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}

export class VerifyPaymentDto {
    @ApiProperty({ example: 'ref_12345' })
    @IsNotEmpty()
    @IsString()
    reference: string;

    @ApiProperty({ enum: PaymentGateway, example: 'paystack' })
    @IsEnum(PaymentGateway)
    gateway: PaymentGateway;
}

export class WebhookDto {
    @ApiProperty()
    event: string;

    @ApiProperty()
    data: any;
}
