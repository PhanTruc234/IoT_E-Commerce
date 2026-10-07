// Seed phí vận chuyển theo zone + ngưỡng freeship. Idempotent (không tạo trùng).
// Chạy: node prisma/seed-shipping.cjs
const fs = require('fs');
const path = require('path');

// nạp DATABASE_URL từ .env
try {
    const env = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
    for (const line of env.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
} catch { }

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MIEN_BAC = [
    'Hải Phòng', 'Quảng Ninh', 'Bắc Ninh', 'Hưng Yên', 'Ninh Bình', 'Phú Thọ',
    'Thái Nguyên', 'Lào Cai', 'Tuyên Quang', 'Cao Bằng', 'Lạng Sơn', 'Lai Châu',
    'Điện Biên', 'Sơn La', 'Thanh Hóa',
];
const MIEN_TRUNG_NAM = [
    'Huế', 'Đà Nẵng', 'Nghệ An', 'Hà Tĩnh', 'Quảng Trị', 'Quảng Ngãi', 'Gia Lai',
    'Khánh Hòa', 'Lâm Đồng', 'Đắk Lắk', 'Đồng Nai', 'Tây Ninh', 'TP. Hồ Chí Minh',
    'Đồng Tháp', 'Vĩnh Long', 'An Giang', 'Cà Mau', 'Cần Thơ',
];

async function main() {
    const count = await prisma.shippingZone.count();
    if (count === 0) {
        await prisma.shippingZone.createMany({
            data: [
                { name: 'Hà Nội', fee: 20000, provinces: ['Hà Nội'], isDefault: false, sortOrder: 1 },
                { name: 'Miền Bắc', fee: 30000, provinces: MIEN_BAC, isDefault: false, sortOrder: 2 },
                { name: 'Miền Trung & Nam', fee: 35000, provinces: MIEN_TRUNG_NAM, isDefault: true, sortOrder: 3 },
            ],
        });
        console.log('Đã tạo 3 shipping zone mặc định');
    } else {
        console.log(`Đã có ${count} shipping zone, bỏ qua tạo mới`);
    }

    const setting = await prisma.shippingSetting.findFirst();
    if (!setting) {
        await prisma.shippingSetting.create({ data: { freeShipFrom: 500000 } });
        console.log('Đã tạo ShippingSetting (freeShipFrom = 500.000đ)');
    } else {
        console.log('ShippingSetting đã tồn tại, bỏ qua');
    }
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
