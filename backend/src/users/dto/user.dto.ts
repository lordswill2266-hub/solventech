import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    profileImage?: string;
}

export class UpdateBankDetailsDto {
    @ApiProperty({ example: 'GTBank' })
    @IsString()
    bankName: string;

    @ApiProperty({ example: '0123456789' })
    @IsString()
    accountNumber: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    accountName: string;
}
