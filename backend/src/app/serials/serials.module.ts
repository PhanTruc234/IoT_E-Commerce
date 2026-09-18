import { Module } from '@nestjs/common';
import { AdminSerialsController } from './admin-serials.controller';
import { WarrantyController } from './warranty.controller';
import { SerialsService } from './serials.service';

@Module({
    controllers: [AdminSerialsController, WarrantyController],
    providers: [SerialsService],
})
export class SerialsModule { }