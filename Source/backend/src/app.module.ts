import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './app/users/users.module';
import { AuthModule } from './app/auth/auth.module';
import { CategoriesModule } from './app/categories/categories.module';
import { BrandsModule } from './app/brands/brands.module';
import { UploadsModule } from './app/uploads/uploads.module';
import { StorageModule } from './core/storage/storage.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductsModule } from './app/products/products.module';
import { SpecificationsModule } from './app/specifications/specifications.module';
import { CartModule } from './app/cart/cart.module';
import { OrdersModule } from './app/orders/orders.module';
import { SerialsModule } from './app/serials/serials.module';
import { QuestionsModule } from './app/questions/questions.module';
import { ReviewsModule } from './app/reviews/reviews.module';
import { AnalyticsModule } from './app/analytics/analytics.module';
import { AuditModule } from './app/audit/audit.module';
import { OverviewModule } from './app/overview/overview.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { SupportModule } from './app/support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    StorageModule,
    AuthModule,
    CategoriesModule,
    BrandsModule,
    UploadsModule,
    ProductsModule,
    SpecificationsModule,
    CartModule,
    OrdersModule,
    SerialsModule,
    QuestionsModule,
    ReviewsModule,
    AnalyticsModule,
    AuditModule,
    OverviewModule,
    SupportModule,
  ],
})
export class AppModule { }