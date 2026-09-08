import {
    Controller,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    Query,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../core/decorators/roles.decorator';
import { StorageService } from '../../core/storage/storage.service';

const ALLOWED_FOLDERS = ['brands', 'products', 'categories', 'avatars', 'misc'];

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
    constructor(private readonly storage: StorageService) { }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Post('images')
    @ApiOperation({ summary: '[Admin] Upload ảnh lên R2 (1–10 file), trả về mảng URL' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['files'],
            properties: {
                files: { type: 'array', items: { type: 'string', format: 'binary' } },
            },
        },
    })
    @UseInterceptors(FilesInterceptor('files', 10))
    uploadMany(
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /^image\/(png|jpe?g|webp|gif)$/ }),
                ],
            }),
        )
        files: Express.Multer.File[],
        @Query('folder') folder?: string,
    ) {
        const safeFolder = ALLOWED_FOLDERS.includes(folder ?? '') ? folder! : 'misc';
        return Promise.all(files.map((f) => this.storage.uploadImage(f, safeFolder)));
    }
}
