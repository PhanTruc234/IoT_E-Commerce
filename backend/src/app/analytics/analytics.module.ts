import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({ controllers: [EventsController, AdminAnalyticsController], providers: [AnalyticsService] })
export class AnalyticsModule { }