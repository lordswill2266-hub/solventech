import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
    ORDER_UPDATE = 'ORDER_UPDATE',
    PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
    NEW_MESSAGE = 'NEW_MESSAGE',
    SYSTEM_ALERT = 'SYSTEM_ALERT',
}

export class CreateNotificationDto {
    @IsString()
    userId: string;

    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsEnum(NotificationType)
    type: NotificationType;

    @IsOptional()
    metadata?: any;
}

export class SendEmailDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsString()
    to: string;

    @ApiProperty({ example: 'Welcome to Solven Shopper' })
    @IsString()
    subject: string;

    @ApiProperty({ example: 'Hello...' })
    @IsString()
    body: string;
}
