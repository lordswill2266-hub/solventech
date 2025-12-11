import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaystackProvider } from './providers/paystack.provider';
import { MonnifyProvider } from './providers/monnify.provider';

@Module({
    controllers: [PaymentsController],
    providers: [PaymentsService, PaystackProvider, MonnifyProvider],
    exports: [PaymentsService],
})
export class PaymentsModule { }
