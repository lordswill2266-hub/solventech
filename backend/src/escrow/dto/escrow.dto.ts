import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EscrowStatus } from '@prisma/client';

export class CreateEscrowDto {
    @ApiProperty({ example: 'order-uuid-here' })
    @IsNotEmpty()
    @IsUUID()
    orderId: string;

    @ApiProperty({ example: 5000 })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ example: 'paystack', enum: ['paystack', 'monnify'] })
    @IsNotEmpty()
    @IsString()
    paymentGateway: string;

    @ApiProperty({ example: 'ref_12345' })
    @IsNotEmpty()
    @IsString()
    paymentReference: string;

    @ApiProperty({ example: '1234567890', required: false })
    @IsOptional()
    @IsString()
    virtualAccountNumber?: string;
}

export class ReleaseEscrowDto {
    @ApiProperty({ example: 'escrow-uuid-here' })
    @IsNotEmpty()
    @IsUUID()
    escrowId: string;
}

export class RefundEscrowDto {
    @ApiProperty({ example: 'escrow-uuid-here' })
    @IsNotEmpty()
    @IsUUID()
    escrowId: string;

    @ApiProperty({ example: 'Item damaged on arrival' })
    @IsNotEmpty()
    @IsString()
    reason: string;
}

export class DisputeEscrowDto {
    @ApiProperty({ example: 'escrow-uuid-here' })
    @IsNotEmpty()
    @IsUUID()
    escrowId: string;

    @ApiProperty({ example: 'Item not as described' })
    @IsNotEmpty()
    @IsString()
    reason: string;
}
