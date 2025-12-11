import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
    @ApiProperty({ example: 5000, description: 'Amount to withdraw in Naira' })
    @IsNotEmpty()
    @IsNumber()
    @Min(100, { message: 'Minimum withdrawal amount is ₦100' })
    amount: number;

    @ApiProperty({ example: '0123456789', description: 'Bank account number' })
    @IsNotEmpty()
    @IsString()
    accountNumber: string;

    @ApiProperty({ example: 'GTBank', description: 'Bank name (e.g., GTBank, Access Bank, UBA, Zenith Bank)' })
    @IsNotEmpty()
    @IsString()
    bankName: string;

    @ApiProperty({ example: 'John Doe', required: false })
    @IsOptional()
    @IsString()
    accountName?: string;
}

export class TransferDto {
    @ApiProperty({ example: 'recipient-user-id' })
    @IsNotEmpty()
    @IsString()
    recipientId: string;

    @ApiProperty({ example: 1000 })
    @IsNotEmpty()
    @IsNumber()
    @Min(10, { message: 'Minimum transfer amount is ₦10' })
    amount: number;

    @ApiProperty({ example: 'Payment for item', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}
