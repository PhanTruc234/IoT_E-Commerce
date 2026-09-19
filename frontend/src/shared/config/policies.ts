export interface PolicyDoc {
    slug: string;
    title: string;
    version: string;
    updatedAt: string;
    summary: string;
    sections: { heading: string; body: string[] }[];
}

const SELLER = 'IoTech';

export const POLICIES: PolicyDoc[] = [
    {
        slug: 'terms',
        title: 'Điều khoản sử dụng',
        version: '1.0',
        updatedAt: '2026-09-01',
        summary: `Quy tắc khi sử dụng website ${SELLER}.`,
        sections: [
            {
                heading: '1. Chấp nhận điều khoản',
                body: [`Khi truy cập và sử dụng website ${SELLER}, bạn đồng ý tuân thủ các điều khoản này. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.`]
            },
            {
                heading: '2. Tài khoản',
                body: ['Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động phát sinh từ tài khoản của mình.', 'Bạn cam kết cung cấp thông tin chính xác khi đăng ký và đặt hàng.']
            },
            {
                heading: '3. Sử dụng hợp pháp',
                body: ['Không sử dụng website vào mục đích vi phạm pháp luật, gian lận, phá hoại hệ thống hoặc xâm phạm quyền lợi người khác.']
            },
            {
                heading: '4. Quyền sở hữu nội dung',
                body: [`Nội dung, hình ảnh, thương hiệu trên website thuộc về ${SELLER} hoặc đối tác, không được sao chép khi chưa được phép.`]
            },
            {
                heading: '5. Thay đổi điều khoản',
                body: ['Chúng tôi có thể cập nhật điều khoản và sẽ hiển thị phiên bản, ngày cập nhật mới nhất trên trang này.']
            },
        ],
    },
    {
        slug: 'privacy',
        title: 'Chính sách bảo vệ dữ liệu cá nhân',
        version: '1.0',
        updatedAt: '2026-09-01',
        summary: 'Cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.',
        sections: [
            {
                heading: '1. Dữ liệu thu thập',
                body: ['Chúng tôi chỉ thu thập dữ liệu cần thiết để xử lý đơn hàng và cung cấp dịch vụ: họ tên, email, số điện thoại, địa chỉ giao hàng, lịch sử đơn hàng.']
            },
            {
                heading: '2. Mục đích sử dụng',
                body: ['Xử lý và giao đơn hàng, hỗ trợ khách hàng, bảo hành, và (nếu bạn đồng ý) gửi thông tin khuyến mãi.']
            },
            {
                heading: '3. Chia sẻ dữ liệu',
                body: ['Dữ liệu chỉ được chia sẻ với đơn vị vận chuyển và cổng thanh toán ở mức cần thiết để hoàn tất đơn hàng. Chúng tôi không bán dữ liệu cá nhân.']
            },
            {
                heading: '4. Quyền của bạn',
                body: ['Bạn có thể xem, chỉnh sửa, xuất dữ liệu và yêu cầu xóa/ẩn danh tài khoản trong mục “Quyền riêng tư” của tài khoản.']
            },
            {
                heading: '5. Bảo mật',
                body: ['Mật khẩu được băm, phiên đăng nhập dùng token bảo mật, dữ liệu truyền qua HTTPS. Chúng tôi không lưu thông tin thẻ thanh toán.']
            },
        ],
    },
    {
        slug: 'purchase',
        title: 'Điều khoản mua hàng',
        version: '1.0',
        updatedAt: '2026-09-01',
        summary: 'Quy trình đặt và xác nhận đơn hàng.',
        sections: [
            {
                heading: '1. Đặt hàng',
                body: ['Khi bạn bấm “Đặt hàng”, hệ thống ghi nhận đề nghị mua hàng của bạn với mức giá và số lượng hiển thị tại thời điểm đặt.']
            },
            {
                heading: '2. Xác nhận đơn',
                body: [`Đơn hàng ở trạng thái “Chờ xác nhận”. Đơn được xem là giao kết khi ${SELLER} xác nhận (chuyển sang “Đã xác nhận”). Chúng tôi có quyền từ chối đơn nếu hết hàng hoặc thông tin không hợp lệ.`]
            },
            {
                heading: '3. Giá và chi phí',
                body: ['Tổng thanh toán gồm giá sản phẩm, giảm giá (nếu có) và phí vận chuyển, được hiển thị đầy đủ trước khi bạn xác nhận.']
            },
            {
                heading: '4. Huỷ đơn',
                body: ['Bạn có thể huỷ đơn khi đơn đang “Chờ xác nhận”. Sau khi đã giao/hoàn thành, việc đổi trả áp dụng theo Chính sách đổi trả.']
            },
        ],
    },
    {
        slug: 'return',
        title: 'Chính sách đổi trả',
        version: '1.0',
        updatedAt: '2026-09-01',
        summary: 'Điều kiện và quy trình đổi trả sản phẩm.',
        sections: [
            {
                heading: '1. Thời hạn',
                body: ['Đổi trả trong vòng 7 ngày kể từ khi nhận hàng đối với sản phẩm đủ điều kiện.']
            },
            {
                heading: '2. Điều kiện',
                body: ['Sản phẩm còn nguyên vẹn, đầy đủ phụ kiện, chưa qua sử dụng gây hư hỏng; có bằng chứng đơn hàng.']
            },
            {
                heading: '3. Trường hợp được đổi trả',
                body: ['Sản phẩm lỗi do nhà sản xuất, giao sai/thiếu, hư hỏng do vận chuyển.']
            },
            {
                heading: '4. Quy trình',
                body: ['Gửi yêu cầu kèm mô tả và hình ảnh (nếu có) qua Trung tâm hỗ trợ. Chúng tôi phản hồi và hướng dẫn trong thời gian sớm nhất.']
            },
        ],
    },
    {
        slug: 'warranty',
        title: 'Chính sách bảo hành',
        version: '1.0',
        updatedAt: '2026-09-01',
        summary: 'Bảo hành theo số serial của sản phẩm.',
        sections: [
            {
                heading: '1. Phạm vi',
                body: ['Bảo hành áp dụng cho lỗi kỹ thuật do nhà sản xuất, theo thời hạn ghi trên từng sản phẩm/serial.']
            },
            {
                heading: '2. Tra cứu',
                body: ['Bạn có thể tra cứu tình trạng bảo hành bằng số serial tại trang “Tra cứu bảo hành”.']
            },
            {
                heading: '3. Không áp dụng',
                body: ['Hư hỏng do sử dụng sai, rơi vỡ, ẩm ướt, tự ý can thiệp phần cứng, hết thời hạn bảo hành.']
            },
            {
                heading: '4. Quy trình',
                body: ['Gửi yêu cầu bảo hành kèm số serial và mô tả lỗi qua Trung tâm hỗ trợ.']
            },
        ],
    },
    {
        slug: 'shipping',
        title: 'Chính sách vận chuyển',
        version: '1.0',
        updatedAt: '2026-09-01',
        summary: 'Thời gian và phí giao hàng.',
        sections: [
            {
                heading: '1. Phạm vi giao hàng',
                body: ['Giao hàng toàn quốc thông qua đối tác vận chuyển.']
            },
            {
                heading: '2. Phí vận chuyển',
                body: ['Phí hiển thị tại bước thanh toán. Miễn phí vận chuyển cho đơn hàng từ 500.000₫.']
            },
            {
                heading: '3. Thời gian',
                body: ['Thời gian giao dự kiến 2–5 ngày làm việc tùy khu vực, chưa tính thời gian xác nhận đơn.']
            },
        ],
    },
    {
        slug: 'payment',
        title: 'Chính sách thanh toán',
        version: '1.0',
        updatedAt: '2026-09-01',
        summary: 'Các phương thức thanh toán được hỗ trợ.',
        sections: [
            {
                heading: '1. Phương thức',
                body: ['Thanh toán khi nhận hàng (COD) hoặc thanh toán trực tuyến qua cổng VNPAY.']
            },
            {
                heading: '2. An toàn thanh toán',
                body: [`${SELLER} không lưu trữ thông tin thẻ. Giao dịch trực tuyến do cổng thanh toán xử lý theo tiêu chuẩn bảo mật của cổng.`]
            },
            {
                heading: '3. Hoá đơn',
                body: ['Thông tin đơn hàng được lưu lại làm bằng chứng giao dịch. Hóa đơn (nếu có) được cung cấp theo yêu cầu.']
            },
        ],
    },
];

export function getPolicy(slug: string) {
    return POLICIES.find((p) => p.slug === slug);
}