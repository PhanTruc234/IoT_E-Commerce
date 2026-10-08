import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { NotificationAudience, NotificationType } from '@prisma/client';

export class CreateNotificationDto {
    @ApiProperty()
    @IsString()
    @MaxLength(150)
    title: string;

    @ApiProperty()
    @IsString()
    @MaxLength(1000)
    body: string;

    @ApiProperty({ enum: NotificationType })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty({ enum: NotificationAudience })
    @IsEnum(NotificationAudience)
    audience: NotificationAudience;

    @ApiPropertyOptional({ description: 'Bắt buộc khi audience = USER' })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    linkUrl?: string;
}