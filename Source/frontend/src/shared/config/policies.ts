export interface PolicyDoc {
    slug: string;
    title: string;
    version: string;
    updatedAt: string;
    summary: string;
    sections: { heading: string; body: string[] }[];
}


const SELLER = 'IoTech';

const SELLER_INFO = {
    company: 'IoTech',
    address: 'TP. Hà Nội',
    taxCode: '345',
    hotline: '0123456789',
    email: 'support@iotech.com',
    workingHours: '08:00 – 21:00 các ngày trong tuần',
};

export const POLICIES: PolicyDoc[] = [
    {
        slug: 'terms',
        title: 'Điều khoản sử dụng',
        version: '2.0',
        updatedAt: '2026-09-24',
        summary: `Các quy tắc và điều kiện áp dụng khi bạn truy cập, sử dụng website và dịch vụ của ${SELLER}.`,
        sections: [
            {
                heading: '1. Giới thiệu chung',
                body: [
                    `Website ${SELLER} là nền tảng thương mại điện tử bán lẻ trực tuyến chuyên cung cấp thiết bị IoT và linh kiện điện tử (board mạch, module, cảm biến, IC, phụ kiện…) cho người tiêu dùng tại Việt Nam.`,
                    `Website được sở hữu và vận hành bởi ${SELLER_INFO.company}, địa chỉ ${SELLER_INFO.address}, mã số ${SELLER_INFO.taxCode} (sau đây gọi là “${SELLER}”, “chúng tôi”).`,
                    'Bản Điều khoản sử dụng này (“Điều khoản”) điều chỉnh mối quan hệ giữa chúng tôi và người dùng (“bạn”, “khách hàng”) khi bạn truy cập, đăng ký tài khoản, đặt hàng hoặc sử dụng bất kỳ dịch vụ nào trên website.',
                ],
            },
            {
                heading: '2. Chấp nhận điều khoản',
                body: [
                    'Bằng việc truy cập và sử dụng website, bạn xác nhận đã đọc, hiểu và đồng ý bị ràng buộc bởi Điều khoản này cùng các chính sách liên quan (Chính sách bảo vệ dữ liệu cá nhân, Điều khoản mua hàng, Chính sách đổi trả, bảo hành, vận chuyển, thanh toán).',
                    'Nếu bạn không đồng ý với bất kỳ nội dung nào, vui lòng ngừng sử dụng website và dịch vụ của chúng tôi.',
                ],
            },
            {
                heading: '3. Định nghĩa',
                body: [
                    '• “Dịch vụ”: toàn bộ tính năng trên website gồm trưng bày sản phẩm, giỏ hàng, đặt hàng, thanh toán, tra cứu bảo hành, đánh giá và hỏi đáp.',
                    `• “Sản phẩm”: hàng hoá được ${SELLER} đăng bán trên website.`,
                    '• “Đơn hàng”: đề nghị mua hàng do bạn gửi thông qua chức năng đặt hàng.',
                    '• “Tài khoản”: hồ sơ người dùng được tạo khi bạn đăng ký bằng email và mật khẩu.',
                ],
            },
            {
                heading: '4. Điều kiện sử dụng và đối tượng',
                body: [
                    'Bạn cần đủ năng lực hành vi dân sự theo quy định pháp luật để giao kết hợp đồng mua bán. Người chưa đủ tuổi thành niên cần có sự đồng ý và giám sát của cha mẹ hoặc người giám hộ.',
                    'Bạn đồng ý cung cấp thông tin đầy đủ, chính xác và cập nhật khi đăng ký và đặt hàng, đồng thời chịu trách nhiệm về tính chính xác của các thông tin đó.',
                ],
            },
            {
                heading: '5. Tài khoản người dùng',
                body: [
                    'Mỗi khách hàng tự tạo và quản lý tài khoản của mình. Bạn có trách nhiệm bảo mật email, mật khẩu và mọi thông tin đăng nhập.',
                    'Bạn chịu trách nhiệm về mọi hoạt động phát sinh dưới tài khoản của mình. Nếu phát hiện tài khoản bị truy cập trái phép, vui lòng đổi mật khẩu và thông báo ngay cho chúng tôi.',
                    `${SELLER} có quyền tạm khoá hoặc chấm dứt tài khoản có dấu hiệu gian lận, vi phạm Điều khoản hoặc pháp luật.`,
                ],
            },
            {
                heading: '6. Quyền và nghĩa vụ của khách hàng',
                body: [
                    '• Được cung cấp thông tin đầy đủ, trung thực về sản phẩm, giá, phí và điều kiện giao dịch.',
                    '• Được hỗ trợ, bảo hành, đổi trả theo các chính sách công bố trên website.',
                    '• Có nghĩa vụ thanh toán đúng, đủ và nhận hàng theo đơn đã đặt; không thực hiện hành vi gian lận, đặt đơn ảo, hoặc lạm dụng chính sách.',
                ],
            },
            {
                heading: `7. Quyền và nghĩa vụ của ${SELLER}`,
                body: [
                    '• Cung cấp thông tin sản phẩm, giá và điều kiện giao dịch một cách rõ ràng; xử lý đơn hàng và hỗ trợ khách hàng.',
                    '• Có quyền từ chối hoặc huỷ đơn trong các trường hợp: hết hàng, sai sót về giá/thông tin, nghi ngờ gian lận, hoặc vì lý do bất khả kháng.',
                    '• Bảo vệ dữ liệu cá nhân của khách hàng theo Chính sách bảo vệ dữ liệu cá nhân và pháp luật hiện hành.',
                ],
            },
            {
                heading: '8. Hành vi bị cấm',
                body: [
                    'Khi sử dụng website, bạn không được thực hiện các hành vi sau:',
                    '• Sử dụng dịch vụ vào mục đích vi phạm pháp luật, lừa đảo hoặc gây hại cho người khác.',
                    '• Can thiệp, dò quét, tấn công, gây quá tải hoặc làm gián đoạn hệ thống; thu thập dữ liệu trái phép bằng công cụ tự động.',
                    '• Đăng tải nội dung sai sự thật, xúc phạm, vi phạm thuần phong mỹ tục hoặc quyền của bên thứ ba trong phần đánh giá, hỏi đáp.',
                    '• Sao chép, khai thác thương mại nội dung của website khi chưa được cho phép.',
                ],
            },
            {
                heading: '9. Nội dung do người dùng đăng tải',
                body: [
                    'Khi đăng đánh giá hoặc câu hỏi, bạn cam kết nội dung là của mình, trung thực và không vi phạm pháp luật hay quyền của bên thứ ba.',
                    `Đánh giá được ${SELLER} kiểm duyệt trước khi hiển thị công khai. Chúng tôi có quyền từ chối, ẩn hoặc gỡ bỏ nội dung không phù hợp mà không cần báo trước.`,
                    `Bạn cho phép ${SELLER} lưu trữ và hiển thị nội dung bạn đăng nhằm phục vụ mục đích tham khảo cho khách hàng khác.`,
                ],
            },
            {
                heading: '10. Quyền sở hữu trí tuệ',
                body: [
                    `Toàn bộ nội dung trên website (văn bản, hình ảnh, logo, thương hiệu, thiết kế giao diện, mã nguồn) thuộc quyền sở hữu của ${SELLER} hoặc các đối tác cấp phép, và được pháp luật về sở hữu trí tuệ bảo hộ.`,
                    'Bạn không được sao chép, phân phối, chỉnh sửa hoặc sử dụng cho mục đích thương mại nếu không có sự đồng ý bằng văn bản của chúng tôi.',
                ],
            },
            {
                heading: '11. Giới hạn trách nhiệm',
                body: [
                    `${SELLER} nỗ lực bảo đảm thông tin trên website chính xác, tuy nhiên không loại trừ hoàn toàn khả năng có sai sót về mô tả, hình ảnh hoặc giá. Khi phát hiện sai sót ở đơn hàng chưa xác nhận, chúng tôi sẽ liên hệ để điều chỉnh hoặc huỷ đơn.`,
                    'Trong phạm vi pháp luật cho phép, chúng tôi không chịu trách nhiệm đối với các thiệt hại gián tiếp phát sinh ngoài tầm kiểm soát hợp lý, bao gồm sự cố đường truyền, lỗi từ bên thứ ba (vận chuyển, cổng thanh toán) hoặc sự kiện bất khả kháng.',
                ],
            },
            {
                heading: '12. Liên kết và dịch vụ của bên thứ ba',
                body: [
                    'Website có thể sử dụng dịch vụ của bên thứ ba như cổng thanh toán VNPAY, đơn vị vận chuyển và dịch vụ lưu trữ đám mây. Việc bạn sử dụng các dịch vụ đó có thể chịu sự điều chỉnh bởi điều khoản riêng của các bên này.',
                ],
            },
            {
                heading: '13. Tiếp nhận và giải quyết khiếu nại',
                body: [
                    `Khi có khiếu nại về sản phẩm, đơn hàng hoặc dịch vụ, bạn gửi yêu cầu qua một trong các kênh: Trung tâm hỗ trợ trên website, email ${SELLER_INFO.email}, hoặc hotline ${SELLER_INFO.hotline}.`,
                    'Quy trình xử lý gồm 3 bước: (1) Tiếp nhận và ghi nhận khiếu nại; (2) Xác minh, làm rõ thông tin với các bên liên quan; (3) Phản hồi hướng giải quyết cho khách hàng.',
                    'Chúng tôi tiếp nhận khiếu nại trong mọi thời điểm và phản hồi trong vòng tối đa 3–5 ngày làm việc kể từ khi nhận đủ thông tin. Với vụ việc phức tạp, thời gian có thể kéo dài hơn và chúng tôi sẽ thông báo tiến độ cho bạn.',
                    'Nếu hai bên không đạt được thoả thuận, khách hàng có quyền khiếu nại đến cơ quan quản lý nhà nước có thẩm quyền hoặc khởi kiện theo quy định pháp luật.',
                ],
            },
            {
                heading: '14. Luật áp dụng và giải quyết tranh chấp',
                body: [
                    'Điều khoản này được điều chỉnh và giải thích theo pháp luật Việt Nam.',
                    'Mọi tranh chấp phát sinh sẽ ưu tiên giải quyết thông qua thương lượng, hoà giải trên tinh thần thiện chí. Trường hợp không đạt được thoả thuận, tranh chấp sẽ được đưa ra Toà án có thẩm quyền tại Việt Nam giải quyết theo quy định pháp luật.',
                ],
            },
            {
                heading: '15. Sửa đổi điều khoản',
                body: [
                    'Chúng tôi có thể cập nhật Điều khoản theo thời gian. Phiên bản và ngày cập nhật mới nhất luôn được hiển thị ở đầu trang. Việc bạn tiếp tục sử dụng website sau khi thay đổi có hiệu lực được xem là chấp nhận nội dung cập nhật.',
                ],
            },
            {
                heading: '16. Thông tin liên hệ',
                body: [
                    `Chủ sở hữu website: ${SELLER_INFO.company}.`,
                    `Địa chỉ: ${SELLER_INFO.address}.`,
                    `Hotline: ${SELLER_INFO.hotline} · Email: ${SELLER_INFO.email} · Thời gian hỗ trợ: ${SELLER_INFO.workingHours}.`,
                ],
            },
        ],
    },

    {
        slug: 'privacy',
        title: 'Chính sách bảo vệ dữ liệu cá nhân',
        version: '2.0',
        updatedAt: '2026-09-24',
        summary: 'Chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của bạn như thế nào, và các quyền của bạn đối với dữ liệu đó.',
        sections: [
            {
                heading: '1. Phạm vi áp dụng',
                body: [
                    `Chính sách này áp dụng cho dữ liệu cá nhân mà ${SELLER} thu thập khi bạn truy cập website, đăng ký tài khoản, đặt hàng hoặc tương tác với các dịch vụ của chúng tôi.`,
                    'Chúng tôi xử lý dữ liệu cá nhân theo quy định của pháp luật Việt Nam hiện hành về bảo vệ dữ liệu cá nhân. Bạn vui lòng đọc kỹ chính sách này trước khi cung cấp dữ liệu.',
                ],
            },
            {
                heading: '2. Dữ liệu chúng tôi thu thập',
                body: [
                    'Tuỳ theo cách bạn sử dụng website, chúng tôi có thể thu thập:',
                    '• Dữ liệu định danh và liên hệ: họ tên, email, số điện thoại, địa chỉ nhận hàng.',
                    '• Dữ liệu tài khoản: mật khẩu (được lưu ở dạng đã băm, chúng tôi không thấy mật khẩu gốc), vai trò, trạng thái tài khoản.',
                    '• Dữ liệu giao dịch: sản phẩm đã mua, giá trị đơn, phương thức thanh toán, lịch sử và trạng thái đơn hàng, thông tin bảo hành theo serial.',
                    '• Dữ liệu tương tác: nội dung đánh giá, câu hỏi bạn gửi.',
                    '• Dữ liệu kỹ thuật: địa chỉ IP, loại trình duyệt/thiết bị và dữ liệu hành vi ẩn danh (lượt xem, tìm kiếm) phục vụ thống kê và cải thiện dịch vụ.',
                    'Chúng tôi không thu thập thông tin thẻ ngân hàng của bạn; dữ liệu thanh toán trực tuyến do cổng thanh toán VNPAY xử lý.',
                ],
            },
            {
                heading: '3. Mục đích và căn cứ xử lý',
                body: [
                    'Dữ liệu cá nhân được sử dụng nhằm:',
                    '• Tạo và quản lý tài khoản, xác thực đăng nhập.',
                    '• Xử lý đơn hàng, giao hàng, thanh toán, xuất chứng từ và thực hiện bảo hành.',
                    '• Hỗ trợ, chăm sóc khách hàng và xử lý khiếu nại.',
                    '• Cải thiện sản phẩm, dịch vụ và trải nghiệm người dùng thông qua thống kê.',
                    '• Gửi thông tin khuyến mãi, sản phẩm mới khi bạn đồng ý nhận (bạn có thể huỷ nhận bất cứ lúc nào).',
                    'Căn cứ xử lý gồm: thực hiện hợp đồng mua bán theo yêu cầu của bạn, tuân thủ nghĩa vụ pháp luật, lợi ích hợp pháp trong vận hành, và sự đồng ý của bạn đối với các hoạt động cần sự đồng ý.',
                ],
            },
            {
                heading: '4. Cookie và công nghệ tương tự',
                body: [
                    'Website có thể sử dụng cookie và bộ nhớ trình duyệt để duy trì phiên đăng nhập, ghi nhớ giỏ hàng và tuỳ chọn hiển thị, cũng như phục vụ đo lường ẩn danh.',
                    'Bạn có thể quản lý hoặc xoá cookie trong cài đặt trình duyệt; tuy nhiên việc tắt một số cookie có thể ảnh hưởng đến trải nghiệm sử dụng.',
                ],
            },
            {
                heading: '5. Chia sẻ dữ liệu cho bên thứ ba',
                body: [
                    'Chúng tôi chỉ chia sẻ dữ liệu ở mức cần thiết và cho các đối tượng sau:',
                    '• Đơn vị vận chuyển: tên, số điện thoại, địa chỉ để giao hàng.',
                    '• Cổng thanh toán VNPAY: các thông tin cần thiết để xử lý giao dịch trực tuyến.',
                    '• Nhà cung cấp hạ tầng/lưu trữ đám mây: để lưu trữ hình ảnh và vận hành hệ thống.',
                    '• Cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp.',
                    'Chúng tôi không mua bán, trao đổi dữ liệu cá nhân của bạn cho bên thứ ba vì mục đích thương mại.',
                ],
            },
            {
                heading: '6. Lưu trữ và thời hạn lưu trữ',
                body: [
                    'Dữ liệu được lưu trên hệ thống cơ sở dữ liệu và dịch vụ lưu trữ mà chúng tôi sử dụng, đặt tại hạ tầng của nhà cung cấp uy tín.',
                    'Chúng tôi lưu dữ liệu trong thời gian cần thiết để thực hiện mục đích đã nêu, hoặc theo thời hạn luật định (ví dụ dữ liệu hoá đơn, giao dịch). Khi không còn cần thiết, dữ liệu sẽ được xoá hoặc ẩn danh.',
                ],
            },
            {
                heading: '7. Biện pháp bảo mật',
                body: [
                    'Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu:',
                    '• Mật khẩu được băm bằng thuật toán bcrypt; phiên đăng nhập sử dụng token có thời hạn, có cơ chế thu hồi khi nghi ngờ bị lộ.',
                    '• Dữ liệu truyền qua kết nối mã hoá HTTPS khi triển khai.',
                    '• Phân quyền truy cập theo vai trò và ghi nhật ký các thao tác thay đổi dữ liệu quan trọng.',
                    'Dù vậy, không hệ thống nào an toàn tuyệt đối; bạn cũng cần tự bảo vệ thông tin đăng nhập của mình.',
                ],
            },
            {
                heading: '8. Quyền của bạn đối với dữ liệu cá nhân',
                body: [
                    'Theo pháp luật hiện hành, bạn có các quyền: được biết, đồng ý hoặc rút lại sự đồng ý; truy cập, chỉnh sửa; yêu cầu xoá hoặc hạn chế xử lý; yêu cầu cung cấp/di chuyển dữ liệu; và khiếu nại về việc xử lý dữ liệu.',
                    'Bạn có thể tự xem và cập nhật phần lớn thông tin trong mục tài khoản, hoặc gửi yêu cầu tới bộ phận hỗ trợ để được thực hiện các quyền nêu trên.',
                ],
            },
            {
                heading: '9. Dữ liệu của trẻ em',
                body: [
                    'Website không hướng đến trẻ em. Trường hợp người chưa thành niên sử dụng dịch vụ, cần có sự đồng ý và giám sát của cha mẹ hoặc người giám hộ theo quy định pháp luật.',
                ],
            },
            {
                heading: '10. Thay đổi chính sách',
                body: [
                    'Chính sách này có thể được cập nhật để phù hợp với thay đổi của pháp luật hoặc hoạt động của chúng tôi. Phiên bản mới nhất luôn hiển thị trên trang này.',
                ],
            },
            {
                heading: '11. Đơn vị kiểm soát dữ liệu và liên hệ',
                body: [
                    `Đơn vị thu thập và quản lý dữ liệu cá nhân: ${SELLER_INFO.company}.`,
                    `Địa chỉ: ${SELLER_INFO.address}. Email: ${SELLER_INFO.email}. Hotline: ${SELLER_INFO.hotline}.`,
                    'Mọi yêu cầu thực hiện quyền đối với dữ liệu (truy cập, chỉnh sửa, xoá, rút lại đồng ý) hoặc khiếu nại về việc xử lý dữ liệu sẽ được chúng tôi tiếp nhận và phản hồi trong vòng tối đa 3–5 ngày làm việc. Trường hợp không được giải quyết thoả đáng, bạn có quyền khiếu nại tới cơ quan nhà nước có thẩm quyền theo quy định pháp luật về bảo vệ dữ liệu cá nhân.',
                ],
            },
        ],
    },

    {
        slug: 'purchase',
        title: 'Điều khoản mua hàng',
        version: '2.0',
        updatedAt: '2026-09-24',
        summary: 'Quy trình đặt hàng, thời điểm giao kết hợp đồng, giá, xác nhận và huỷ đơn.',
        sections: [
            {
                heading: '1. Đối tượng áp dụng',
                body: [
                    `Điều khoản mua hàng áp dụng cho mọi giao dịch mua bán giữa khách hàng và ${SELLER} thực hiện qua website.`,
                ],
            },
            {
                heading: '2. Quy trình đặt hàng',
                body: [
                    'Bạn chọn sản phẩm (và phân loại/biến thể nếu có), thêm vào giỏ hàng, sau đó vào trang thanh toán để nhập thông tin nhận hàng và chọn phương thức thanh toán.',
                    'Trước khi xác nhận, hệ thống hiển thị đầy đủ danh sách sản phẩm, đơn giá, tạm tính, phí vận chuyển và tổng số tiền phải thanh toán.',
                    'Sau khi bạn bấm “Đặt hàng”, hệ thống kiểm tra tồn kho, tạo đơn và gửi thông báo kết quả. Mỗi đơn được cấp một mã đơn hàng để tra cứu.',
                ],
            },
            {
                heading: '3. Thời điểm giao kết hợp đồng',
                body: [
                    'Việc bạn đặt hàng được xem là đề nghị giao kết hợp đồng. Đơn hàng ban đầu ở trạng thái “Chờ xác nhận”.',
                    `Hợp đồng mua bán được xem là giao kết khi ${SELLER} xác nhận đơn (chuyển sang trạng thái “Đã xác nhận”). Đối với đơn thanh toán trực tuyến, đơn cũng được xác nhận sau khi giao dịch thanh toán thành công.`,
                ],
            },
            {
                heading: '4. Giá và khuyến mãi',
                body: [
                    'Giá sản phẩm hiển thị bằng đồng Việt Nam (₫) và đã bao gồm các loại thuế theo quy định (nếu có), chưa bao gồm phí vận chuyển.',
                    'Giá và chương trình khuyến mãi có thể thay đổi theo thời gian; mức giá áp dụng cho đơn là mức hiển thị tại thời điểm bạn đặt hàng.',
                ],
            },
            {
                heading: '5. Xác nhận và từ chối đơn',
                body: [
                    `${SELLER} có quyền từ chối hoặc huỷ một phần/toàn bộ đơn trong các trường hợp: sản phẩm hết hàng, có sai sót rõ ràng về giá hoặc thông tin, không liên hệ được với khách, hoặc nghi ngờ gian lận.`,
                    'Trong trường hợp đó, nếu bạn đã thanh toán, chúng tôi sẽ hoàn tiền phần bị huỷ theo Chính sách thanh toán và đổi trả.',
                ],
            },
            {
                heading: '6. Huỷ đơn',
                body: [
                    'Bạn có thể tự huỷ đơn khi đơn còn ở trạng thái “Chờ xác nhận”. Khi đơn đã được xác nhận hoặc đang giao, vui lòng liên hệ bộ phận hỗ trợ để được xử lý.',
                    'Sau khi nhận hàng, việc trả hàng/hoàn tiền được áp dụng theo Chính sách đổi trả.',
                ],
            },
            {
                heading: '7. Bằng chứng giao dịch',
                body: [
                    'Thông tin đơn hàng, trạng thái và lịch sử giao dịch được lưu trữ điện tử và là bằng chứng cho giao dịch giữa hai bên.',
                ],
            },
            {
                heading: '8. Bất khả kháng',
                body: [
                    'Chúng tôi không chịu trách nhiệm về việc chậm trễ hoặc không thực hiện được nghĩa vụ do sự kiện bất khả kháng như thiên tai, dịch bệnh, sự cố hạ tầng, gián đoạn từ đối tác vận chuyển hoặc thanh toán.',
                ],
            },
        ],
    },

    {
        slug: 'return',
        title: 'Chính sách đổi trả & hoàn tiền',
        version: '2.0',
        updatedAt: '2026-09-24',
        summary: 'Điều kiện, thời hạn, quy trình đổi trả và hoàn tiền.',
        sections: [
            {
                heading: '1. Thời hạn đổi trả',
                body: [
                    'Bạn có thể yêu cầu đổi hoặc trả sản phẩm trong vòng 07 (bảy) ngày kể từ ngày nhận hàng đối với các sản phẩm đủ điều kiện.',
                    'Riêng với sản phẩm phát sinh lỗi kỹ thuật do nhà sản xuất trong thời hạn nêu trên, chúng tôi ưu tiên áp dụng chính sách “1 đổi 1” (đổi sản phẩm mới cùng loại) nếu còn hàng.',
                ],
            },
            {
                heading: '2. Hình thức xử lý',
                body: [
                    'Tuỳ tình trạng sản phẩm và nguyên nhân, một trong các hình thức sau sẽ được áp dụng:',
                    '• Đổi sản phẩm mới cùng loại (1 đổi 1) khi lỗi do nhà sản xuất và còn hàng.',
                    '• Đổi sang sản phẩm khác tương đương giá trị (bù trừ chênh lệch nếu có).',
                    '• Hoàn tiền cho khách hàng.',
                    '• Chuyển sang chế độ bảo hành nếu sản phẩm đã qua thời hạn đổi trả nhưng còn trong hạn bảo hành.',
                ],
            },
            {
                heading: '3. Điều kiện đổi trả',
                body: [
                    'Sản phẩm được chấp nhận đổi trả khi đáp ứng:',
                    '• Còn nguyên vẹn, đầy đủ linh kiện/phụ kiện, quà tặng kèm (nếu có) và bao bì, hộp đựng.',
                    '• Chưa bị hư hỏng do tác động của người dùng; các niêm phong, tem serial còn nguyên (nếu có).',
                    '• Có thông tin đơn hàng hoặc bằng chứng mua hàng hợp lệ.',
                ],
            },
            {
                heading: '4. Các trường hợp được đổi trả',
                body: [
                    '• Sản phẩm bị lỗi kỹ thuật do nhà sản xuất.',
                    '• Giao sai sản phẩm, sai phân loại, thiếu số lượng so với đơn.',
                    '• Sản phẩm hư hỏng phát sinh trong quá trình vận chuyển.',
                ],
            },
            {
                heading: '5. Trường hợp không áp dụng',
                body: [
                    '• Hết thời hạn đổi trả.',
                    '• Sản phẩm hư hỏng do sử dụng sai cách, đấu nối sai điện áp, rơi vỡ, ẩm ướt, cháy nổ do thao tác của người dùng.',
                    '• Sản phẩm đã bị can thiệp, sửa chữa bởi bên thứ ba, hoặc mất tem/serial.',
                    'Lưu ý: với đặc thù linh kiện điện tử, các sản phẩm bị hỏng do cấp nguồn sai, cắm ngược cực hoặc đoản mạch trong quá trình lắp ráp thường không thuộc phạm vi đổi trả/bảo hành.',
                ],
            },
            {
                heading: '6. Tình trạng sản phẩm và phí khấu hao',
                body: [
                    'Trường hợp đổi trả xuất phát từ nhu cầu cá nhân (sản phẩm không lỗi), nếu sản phẩm thiếu hộp, thiếu phụ kiện, mất quà tặng kèm hoặc có dấu hiệu đã qua sử dụng, chúng tôi có thể áp dụng một khoản phí khấu hao tương ứng, được thông báo rõ trước khi xử lý.',
                    'Sản phẩm còn đầy đủ, nguyên vẹn như mới sẽ không bị tính phí khấu hao.',
                ],
            },
            {
                heading: '7. Quy trình đổi trả',
                body: [
                    'Bước 1: Gửi yêu cầu qua Trung tâm hỗ trợ kèm mã đơn, mô tả tình trạng và hình ảnh/video minh chứng (nếu có).',
                    'Bước 2: Chúng tôi kiểm tra và phản hồi về việc đơn có đủ điều kiện hay không, đồng thời hướng dẫn cách gửi trả sản phẩm.',
                    'Bước 3: Sau khi nhận và kiểm tra sản phẩm, chúng tôi tiến hành đổi sản phẩm mới, đổi sản phẩm tương đương hoặc hoàn tiền theo hình thức đã thống nhất.',
                ],
            },
            {
                heading: '8. Thời gian xử lý',
                body: [
                    'Với sản phẩm đổi có sẵn tại kho: thường xử lý trong 1–3 ngày làm việc sau khi nhận lại sản phẩm.',
                    'Với trường hợp cần kiểm tra kỹ thuật hoặc gửi hãng xác minh lỗi: thời gian có thể kéo dài hơn và sẽ được thông báo cụ thể cho bạn.',
                ],
            },
            {
                heading: '9. Chi phí đổi trả',
                body: [
                    'Với lỗi thuộc về nhà sản xuất hoặc do chúng tôi (giao sai, thiếu, hỏng khi vận chuyển), chúng tôi chịu chi phí đổi trả liên quan.',
                    'Với các yêu cầu đổi trả xuất phát từ nhu cầu cá nhân (nếu được chấp nhận), chi phí vận chuyển đổi trả có thể do bạn chi trả.',
                ],
            },
            {
                heading: '10. Hoàn tiền',
                body: [
                    'Đối với đơn thanh toán khi nhận hàng (COD): hoàn tiền qua tài khoản ngân hàng bạn cung cấp.',
                    'Đối với đơn thanh toán qua VNPAY: hoàn tiền về phương thức đã thanh toán hoặc tài khoản ngân hàng theo hướng dẫn.',
                    'Thời gian hoàn tiền tuỳ thuộc quy trình của ngân hàng/cổng thanh toán, thường trong vòng 3–7 ngày làm việc sau khi yêu cầu được duyệt.',
                ],
            },
        ],
    },

    {
        slug: 'warranty',
        title: 'Chính sách bảo hành',
        version: '2.0',
        updatedAt: '2026-09-24',
        summary: 'Bảo hành theo số serial cho từng sản phẩm bán ra.',
        sections: [
            {
                heading: '1. Nguyên tắc bảo hành theo serial',
                body: [
                    `${SELLER} quản lý bảo hành theo số serial gắn với từng sản phẩm bán ra. Khi đơn hàng hoàn tất, sản phẩm được gán serial và thời hạn bảo hành bắt đầu được tính.`,
                ],
            },
            {
                heading: '2. Thời hạn bảo hành',
                body: [
                    'Thời hạn bảo hành được ghi rõ theo từng sản phẩm/nhóm sản phẩm và được tính từ thời điểm đơn hàng hoàn tất (kích hoạt bảo hành theo serial).',
                ],
            },
            {
                heading: '3. Phạm vi và điều kiện được bảo hành',
                body: [
                    'Bảo hành áp dụng cho lỗi kỹ thuật do nhà sản xuất trong điều kiện sử dụng bình thường, đúng hướng dẫn, khi:',
                    '• Sản phẩm còn trong thời hạn bảo hành.',
                    '• Số serial rõ ràng, còn nguyên và khớp với dữ liệu trên hệ thống.',
                    '• Tem bảo hành/niêm phong (nếu có) còn nguyên vẹn, không bị rách, tẩy xoá.',
                ],
            },
            {
                heading: '4. Hình thức bảo hành',
                body: [
                    'Tuỳ mức độ và thời điểm phát sinh lỗi, chúng tôi áp dụng một trong các hình thức:',
                    '• Đổi sản phẩm mới cùng loại (1 đổi 1) nếu sản phẩm lỗi do nhà sản xuất trong thời gian đầu theo chính sách và còn hàng.',
                    '• Sửa chữa, thay thế linh kiện lỗi.',
                    '• Đổi sang sản phẩm tương đương trong trường hợp không còn linh kiện/sản phẩm thay thế.',
                ],
            },
            {
                heading: '5. Tra cứu bảo hành',
                body: [
                    'Bạn có thể tra cứu tình trạng và thời hạn bảo hành còn lại bằng cách nhập số serial tại trang “Tra cứu bảo hành”. Hệ thống hiển thị trạng thái: chưa kích hoạt, đang còn hạn, hoặc đã hết hạn.',
                ],
            },
            {
                heading: '6. Các trường hợp không được bảo hành',
                body: [
                    '• Sản phẩm hết thời hạn bảo hành.',
                    '• Số serial bị tẩy xoá, không đọc được hoặc không khớp dữ liệu hệ thống; tem bảo hành bị rách/can thiệp.',
                    '• Hư hỏng do sử dụng sai, cấp sai nguồn/điện áp, đoản mạch, rơi vỡ, vào nước, cháy nổ, thiên tai.',
                    '• Sản phẩm bị tự ý tháo lắp, sửa chữa, thay đổi phần cứng bởi bên không được uỷ quyền.',
                ],
            },
            {
                heading: '7. Quy trình bảo hành',
                body: [
                    'Bước 1: Gửi yêu cầu qua Trung tâm hỗ trợ kèm số serial và mô tả lỗi.',
                    'Bước 2: Chúng tôi xác minh thông tin bảo hành theo serial và hướng dẫn gửi sản phẩm.',
                    'Bước 3: Kiểm tra, sửa chữa hoặc đổi mới tuỳ tình trạng và điều kiện bảo hành, sau đó bàn giao lại cho bạn.',
                ],
            },
            {
                heading: '8. Thời gian xử lý bảo hành',
                body: [
                    'Thời gian xử lý thông thường từ 3–15 ngày làm việc tuỳ loại lỗi và tình trạng linh kiện thay thế.',
                    'Với sản phẩm cần gửi về nhà sản xuất/nhà phân phối, thời gian có thể kéo dài hơn và sẽ được thông báo cụ thể cho bạn.',
                ],
            },
            {
                heading: '9. Sản phẩm combo',
                body: [
                    'Đối với sản phẩm dạng combo, việc bảo hành được xét theo từng linh kiện thành phần có serial tương ứng.',
                ],
            },
            {
                heading: '10. Dịch vụ bảo hành mở rộng',
                body: [
                    'Trong tương lai, chúng tôi có thể cung cấp gói bảo hành mở rộng (tuỳ chọn) cho một số sản phẩm; điều kiện và mức phí sẽ được công bố cụ thể khi áp dụng.',
                ],
            },
        ],
    },

    {
        slug: 'shipping',
        title: 'Chính sách vận chuyển',
        version: '2.0',
        updatedAt: '2026-09-24',
        summary: 'Phạm vi, phí và thời gian giao hàng.',
        sections: [
            {
                heading: '1. Phạm vi giao hàng',
                body: [
                    'Chúng tôi giao hàng trên toàn quốc thông qua các đối tác vận chuyển.',
                ],
            },
            {
                heading: '2. Phí vận chuyển',
                body: [
                    'Phí vận chuyển được hiển thị minh bạch tại bước thanh toán trước khi bạn xác nhận đơn.',
                    'Miễn phí vận chuyển cho đơn hàng có giá trị từ 500.000₫ trở lên; các đơn dưới mức này áp dụng mức phí cố định 30.000₫ (chính sách có thể thay đổi theo từng thời điểm).',
                ],
            },
            {
                heading: '3. Thời gian giao hàng',
                body: [
                    'Thời gian giao dự kiến (chưa bao gồm thời gian xác nhận và đóng gói đơn):',
                    '• Khu vực nội thành các thành phố lớn: khoảng 1–2 ngày làm việc.',
                    '• Các tỉnh, thành khác: khoảng 2–5 ngày làm việc tuỳ khoảng cách.',
                    'Thời gian có thể thay đổi trong các dịp cao điểm, lễ tết hoặc do yếu tố khách quan từ đơn vị vận chuyển.',
                ],
            },
            {
                heading: '4. Kiểm tra và đồng kiểm khi nhận hàng',
                body: [
                    'Bạn nên kiểm tra tình trạng bên ngoài kiện hàng khi nhận. Nếu phát hiện dấu hiệu móp méo, rách nát hoặc sai lệch, vui lòng ghi nhận và liên hệ chúng tôi.',
                    'Chúng tôi khuyến khích khách hàng đồng kiểm (mở kiểm tra sản phẩm cùng nhân viên giao hàng) để đối chiếu đúng model, số lượng và tình trạng bên ngoài trước khi nhận.',
                ],
            },
            {
                heading: '5. Giao hàng không thành công',
                body: [
                    'Trường hợp không liên hệ được với người nhận hoặc giao không thành công sau số lần quy định của đơn vị vận chuyển, đơn hàng có thể được hoàn về. Chúng tôi sẽ liên hệ để sắp xếp giao lại hoặc xử lý theo thoả thuận.',
                ],
            },
            {
                heading: '6. Rủi ro trong vận chuyển',
                body: [
                    'Trường hợp sản phẩm hư hỏng do quá trình vận chuyển, bạn được hỗ trợ đổi trả theo Chính sách đổi trả khi cung cấp đầy đủ bằng chứng (nên có video mở hàng/đồng kiểm).',
                ],
            },
        ],
    },

    {
        slug: 'payment',
        title: 'Chính sách thanh toán',
        version: '2.0',
        updatedAt: '2026-09-24',
        summary: 'Các phương thức thanh toán và bảo mật giao dịch.',
        sections: [
            {
                heading: '1. Phương thức thanh toán',
                body: [
                    'Hiện chúng tôi hỗ trợ hai phương thức:',
                    '• Thanh toán khi nhận hàng (COD): bạn thanh toán tiền mặt cho đơn vị giao hàng khi nhận sản phẩm.',
                    '• Thanh toán trực tuyến qua cổng VNPAY: hỗ trợ thẻ nội địa, thẻ quốc tế, QR và ví điện tử theo khả năng của cổng.',
                ],
            },
            {
                heading: '2. Quy trình thanh toán trực tuyến',
                body: [
                    'Với đơn chọn VNPAY, hệ thống chuyển bạn sang cổng thanh toán để hoàn tất giao dịch. Sau khi thanh toán, cổng trả kết quả về hệ thống và chúng tôi cập nhật trạng thái đơn tương ứng.',
                    'Nếu giao dịch không thành công, bạn có thể thực hiện thanh toán lại cho đơn hoặc huỷ đơn.',
                ],
            },
            {
                heading: '3. An toàn thanh toán',
                body: [
                    `${SELLER} không lưu trữ thông tin thẻ hoặc tài khoản ngân hàng của bạn. Thông tin thanh toán được xử lý trực tiếp bởi cổng VNPAY theo tiêu chuẩn bảo mật của cổng.`,
                    'Kết quả giao dịch trả về được xác thực bằng chữ ký số để bảo đảm tính toàn vẹn, chống giả mạo.',
                ],
            },
            {
                heading: '4. Đồng tiền và giá thanh toán',
                body: [
                    'Mọi giao dịch được thực hiện bằng đồng Việt Nam (₫). Số tiền thanh toán là tổng giá trị đơn hàng hiển thị tại bước xác nhận, bao gồm giá sản phẩm, giảm giá (nếu có) và phí vận chuyển.',
                ],
            },
            {
                heading: '5. Hoá đơn và chứng từ',
                body: [
                    'Thông tin đơn hàng được lưu làm chứng từ giao dịch điện tử.',
                    'Chúng tôi hỗ trợ xuất hoá đơn giá trị gia tăng (VAT) theo yêu cầu. Bạn vui lòng cung cấp thông tin xuất hoá đơn (tên đơn vị/cá nhân, mã số thuế, địa chỉ) tại thời điểm đặt hàng hoặc theo hướng dẫn của bộ phận hỗ trợ.',
                ],
            },
            {
                heading: '6. Hoàn tiền',
                body: [
                    'Việc hoàn tiền cho đơn bị huỷ hoặc đổi trả được thực hiện theo Chính sách đổi trả & hoàn tiền.',
                ],
            },
            {
                heading: '7. Hỗ trợ và khiếu nại thanh toán',
                body: [
                    `Nếu gặp sự cố về thanh toán (bị trừ tiền nhưng đơn chưa ghi nhận, thanh toán trùng…), vui lòng liên hệ ngay hotline ${SELLER_INFO.hotline} hoặc email ${SELLER_INFO.email} kèm mã đơn để được đối soát và xử lý.`,
                ],
            },
        ],
    },
];

export function getPolicy(slug: string) {
    return POLICIES.find((p) => p.slug === slug);
}
