import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const admin = await bcrypt.hash('Admin@123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@iotech.local' },
        update: {},
        create: {
            email: 'admin@iotech.local',
            passwordHash: admin,
            fullName: 'Quản trị viên',
            role: Role.ADMIN,
            isEmailVerified: true,
        },
    });

    const customer = await bcrypt.hash('Customer@123', 10);
    await prisma.user.upsert({
        where: { email: 'customer@iotech.local' },
        update: {},
        create: {
            email: 'customer@iotech.local',
            passwordHash: customer,
            fullName: 'Khách hàng demo',
            role: Role.CUSTOMER,
            isEmailVerified: true,
        },
    });

    console.log('✅ Seed xong: admin@iotech.local / customer@iotech.local');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());