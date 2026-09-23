export interface FaqItem { q: string; a: string }

export const SUPPORT_FAQ: FaqItem[] = [
    { q: 'Làm sao để theo dõi đơn hàng của tôi?', a: 'Vào mục "Đơn hàng của tôi" trong tài khoản, chọn đơn cần xem để thấy trạng thái và lịch sử xử lý theo thời gian thực.' },
    { q: 'Chính sách đổi trả như thế nào?', a: 'Bạn có thể yêu cầu đổi/trả trong vòng 7 ngày kể từ khi nhận hàng nếu sản phẩm còn nguyên vẹn. Gửi yêu cầu ngay trong trang chi tiết đơn hàng. Xem thêm tại /legal/return.' },
    { q: 'Sản phẩm được bảo hành bao lâu?', a: 'Mỗi sản phẩm có thời hạn bảo hành riêng (thường 12 tháng). Kích hoạt và tra cứu bảo hành theo số serial trong mục Bảo hành. Xem /legal/warranty.' },
    { q: 'Tôi có thể thanh toán bằng cách nào?', a: 'Hỗ trợ thanh toán khi nhận hàng (COD) và thanh toán trực tuyến qua VNPAY. Xem /legal/payment.' },
    { q: 'Phí vận chuyển được tính ra sao?', a: 'Miễn phí vận chuyển cho đơn hàng từ 500.000đ. Các đơn dưới mức này áp dụng phí cố định 30.000đ.' },
];