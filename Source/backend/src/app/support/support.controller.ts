import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'src/core/storage/storage.service';


@ApiTags('Support')
@ApiBearerAuth()
@Controller('support/tickets')
export class SupportController {
    constructor(
        private readonly service: SupportService,
        private readonly storage: StorageService,
    ) { }

    @Post('uploads')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 30, ttl: 60_000 } })
    @ApiOperation({ summary: 'Upload ảnh đính kèm cho yêu cầu (1–6 ảnh)' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('files', 6))
    upload(
        @UploadedFiles(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                new FileTypeValidator({ fileType: /^image\/(png|jpe?g|webp|gif)$/ }),
            ],
        }))
        files: Express.Multer.File[],
    ) {
        return Promise.all(files.map((f) => this.storage.uploadImage(f, 'support')));
    }

    @Post()
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 10, ttl: 60_000 } })
    @ApiOperation({ summary: 'Tạo yêu cầu hỗ trợ' })
    create(@CurrentUser('id') userId: string,
        @Body() dto: CreateTicketDto) {
        return this.service.create(userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Yêu cầu hỗ trợ của tôi' })
    list(@CurrentUser('id') userId: string) {
        return this.service.listMine(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết yêu cầu' })
    get(@CurrentUser('id') userId: string,
        @Param('id') id: string) {
        return this.service.findMine(userId, id);
    }

    @Post(':id/messages')
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 20, ttl: 60_000 } })
    @ApiOperation({ summary: 'Gửi tin nhắn vào yêu cầu' })
    addMessage(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
        @Body() dto: AddMessageDto) {
        return this.service.addMessageMine(userId, id, dto.message ?? '', dto.attachments ?? []);
    }

    @Patch(':id/close')
    @ApiOperation({ summary: 'Đóng yêu cầu của tôi' })
    close(@CurrentUser('id') userId: string,
        @Param('id') id: string) {
        return this.service.closeMine(userId, id);
    }
}