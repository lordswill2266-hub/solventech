import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DeliveryStatus {
    PENDING = 'PENDING',
    ASSIGNED = 'ASSIGNED',
    PICKED_UP = 'PICKED_UP',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    FAILED = 'FAILED',
}

export class CreateDeliveryDto {
    @ApiProperty({ example: 'order-uuid' })
    @IsString()
    orderId: string;

    @ApiProperty({ example: '123 Main St' })
    @IsString()
    pickupLocation: string;

    @ApiProperty({ example: '456 Side St' })
    @IsString()
    deliveryLocation: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    deliveryNotes?: string;
}

export class UpdateDeliveryStatusDto {
    @ApiProperty({ enum: DeliveryStatus })
    @IsEnum(DeliveryStatus)
    status: DeliveryStatus;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    proofOfDelivery?: string;
}
