import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../core/decorators/public.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { TaxService } from './tax.service';
import { InvoicesService } from './invoices.service';
import { UpdateTaxSettingDto } from './dto/update-tax-setting.dto';
import { CreateInvoiceRequestDto, InvoiceListQueryDto, ProcessInvoiceRequestDto } from './dto/invoice-request.dto';

@ApiTags('Tax & Invoices')
@Controller()
export class TaxController {
    constructor(
        private readonly tax: TaxService,
        private readonly invoices: InvoicesService,
    ) { }

    @Public()
    @Get('tax/setting')
    @ApiOperation({ summary: 'Cài đặt VAT đang áp dụng (để checkout hiển thị)' })
    setting() {
        return this.tax.publicSetting();
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Patch('admin/tax/setting')
    @ApiOperation({ summary: '[Admin] Bật/tắt VAT, thuế suất, giá đã gồm VAT' })
    updateSetting(@Body() dto: UpdateTaxSettingDto) {
        return this.tax.update(dto);
    }

    @ApiBearerAuth()
    @Post('invoice-requests')
    @ApiOperation({ summary: 'Khách yêu cầu xuất hoá đơn VAT cho đơn của mình' })
    request(@CurrentUser('id') userId: string, @Body() dto: CreateInvoiceRequestDto) {
        return this.invoices.request(userId, dto);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Get('admin/invoice-requests')
    @ApiOperation({ summary: '[Admin] Danh sách yêu cầu xuất hoá đơn' })
    list(@Query() query: InvoiceListQueryDto) {
        return this.invoices.listAdmin(query);
    }

    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    @Patch('admin/invoice-requests/:id')
    @ApiOperation({ summary: '[Admin] Đánh dấu đã xuất (kèm số hoá đơn) hoặc từ chối' })
    process(@Param('id') id: string, @Body() dto: ProcessInvoiceRequestDto, @CurrentUser('email') actor: string) {
        return this.invoices.process(id, dto, actor);
    }
}
