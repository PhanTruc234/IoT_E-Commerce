import { Module } from '@nestjs/common';
import { TaxController } from './tax.controller';
import { TaxService } from './tax.service';
import { InvoicesService } from './invoices.service';

@Module({
    controllers: [TaxController],
    providers: [TaxService, InvoicesService],
    exports: [TaxService],
})
export class TaxModule { }
