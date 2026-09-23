import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';
import { ProductSpecificationsController } from './product-specifications.controller';
import { ProductSpecificationsService } from './product-specifications.service';
import { ProductAttributesController } from './product-attributes.controller';
import { ProductAttributesService } from './product-attributes.service';
import { ProductVariantsController } from './product-variants.controller';
import { ProductVariantsService } from './product-variants.service';
import { ComboItemsController } from './combo-items.controller';
import { ComboItemsService } from './combo-items.service';

@Module({
    controllers: [
        ProductsController,
        ProductImagesController,
        ProductSpecificationsController,
        ProductAttributesController,
        ProductVariantsController,
        ComboItemsController,
    ],
    providers: [
        ProductsService,
        ProductImagesService,
        ProductSpecificationsService,
        ProductAttributesService,
        ProductVariantsService,
        ComboItemsService,
    ],
    exports: [ProductsService],
})
export class ProductsModule { }