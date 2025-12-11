import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
    @ApiProperty({ example: 'order-uuid-here' })
    @IsNotEmpty()
    @IsString()
    orderId: string;

    @ApiProperty({ example: 'receiver-user-id' })
    @IsNotEmpty()
    @IsString()
    receiverId: string;

    @ApiProperty({ example: 'Hello, is the product still available?' })
    @IsNotEmpty()
    @IsString()
    content: string;
}

export class GetMessagesDto {
    @ApiProperty({ example: 'order-uuid-here' })
    @IsNotEmpty()
    @IsString()
    orderId: string;

    @ApiProperty({ example: 50, required: false })
    @IsOptional()
    limit?: number;
}

export class MarkAsReadDto {
    @ApiProperty({ example: 'order-uuid-here' })
    @IsNotEmpty()
    @IsString()
    orderId: string;
}
