import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({ example: 'product-uuid-here' })
    @IsNotEmpty()
    @IsString()
    productId: string;

    @ApiProperty({ example: 1, default: 1 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    quantity?: number;

    @ApiProperty({ example: '123 Main St, Jalingo, Taraba' })
    @IsNotEmpty()
    @IsString()
    deliveryAddress: string;

    @ApiProperty({ example: '08012345678' })
    @IsNotEmpty()
    @IsString()
    deliveryPhone: string;

    @ApiProperty({ example: 'Please call before delivery', required: false })
    @IsOptional()
    @IsString()
    deliveryNotes?: string;
}

export class UpdateOrderStatusDto {
    @ApiProperty({ example: 'order-uuid-here' })
    @IsNotEmpty()
    @IsString()
    orderId: string;

    @ApiProperty({ example: 'SHIPPED' })
    @IsNotEmpty()
    @IsString()
    status: string;

    @ApiProperty({ example: 'Package has been shipped', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
