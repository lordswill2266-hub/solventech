import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyBvnDto {
    @ApiProperty({ example: '12345678901' })
    @IsString()
    @IsNotEmpty()
    bvn: string;
}
