import { IsNotEmpty, IsPhoneNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
    @ApiProperty({ example: '+2348012345678' })
    @IsNotEmpty()
    @IsPhoneNumber('NG')
    phoneNumber: string;

    @ApiProperty({ enum: UserRole, example: 'BUYER' })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({ example: 'John', required: false })
    @IsOptional()
    firstName?: string;

    @ApiProperty({ example: 'Doe', required: false })
    @IsOptional()
    lastName?: string;
}

export class VerifyOtpDto {
    @ApiProperty({ example: '+2348012345678' })
    @IsNotEmpty()
    @IsPhoneNumber('NG')
    phoneNumber: string;

    @ApiProperty({ example: '123456' })
    @IsNotEmpty()
    otp: string;
}

export class ResendOtpDto {
    @ApiProperty({ example: '+2348012345678' })
    @IsNotEmpty()
    @IsPhoneNumber('NG')
    phoneNumber: string;
}
