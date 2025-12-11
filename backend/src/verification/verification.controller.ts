import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { VerifyBvnDto } from './dto/verification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Verification')
@Controller('verification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) { }

    @Post('bvn')
    @ApiOperation({ summary: 'Verify BVN (Mono Integration)' })
    @ApiResponse({ status: 200, description: 'BVN verified' })
    async verifyBvn(@Request() req, @Body() dto: VerifyBvnDto) {
        return this.verificationService.verifyBvn(req.user.id, dto);
    }
}
