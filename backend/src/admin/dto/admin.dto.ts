import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    BANNED = 'BANNED',
    SUSPENDED = 'SUSPENDED',
}

export class UpdateUserStatusDto {
    @ApiProperty({ example: 'user-uuid' })
    @IsString()
    userId: string;

    @ApiProperty({ enum: UserStatus, example: UserStatus.BANNED })
    @IsEnum(UserStatus)
    status: UserStatus;

    @ApiProperty({ required: false, example: 'Violated terms of service' })
    @IsOptional()
    @IsString()
    reason?: string;
}

export class AdminStatsDto {
    @ApiProperty()
    totalUsers: number;

    @ApiProperty()
    totalProducts: number;

    @ApiProperty()
    totalOrders: number;

    @ApiProperty()
    totalVolume: number;

    @ApiProperty()
    totalCommission: number;
}
