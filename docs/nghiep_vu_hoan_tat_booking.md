# Nghiệp vụ: Đánh dấu hoàn tất & Trạng thái Booking

> [!NOTE]
> Tài liệu này mô tả chi tiết quy trình ghi nhận trạng thái **Hoàn tất** của một Booking trong hệ thống NightLife Vietnam, dựa trên các tài liệu đặc tả nghiệp vụ hiện hành (v3.3).

## 1. Các trạng thái của Booking
Một Booking trên hệ thống NightLife Vietnam có 3 trạng thái chính:
* **Mới (New)**: Booking vừa được tạo thành công, kèm theo đó là một mã QR ưu đãi tương ứng.
* **Hoàn tất (Completed)**: Booking đã được xử lý xong (Khách đã đến quán và được xác nhận sử dụng dịch vụ).
* **Đã hủy (Cancelled)**: Booking bị khách hủy (hoặc hệ thống/Admin hủy).

## 2. Các luồng xử lý để Booking chuyển sang "Hoàn tất"

Có hai luồng (flow) chính để một Booking đang ở trạng thái **Mới** chuyển sang trạng thái **Hoàn tất**:

### Luồng 1: Tự động qua thao tác của Đối tác (Khuyên dùng)
Đây là luồng chuẩn và diễn ra tự động, dựa vào thao tác của phía quán (Partner):

1. Khách hàng đến quán và xuất trình mã QR ưu đãi.
2. Nhân viên của quán sử dụng tài khoản hệ thống (Partner) để **quét (scan)** hoặc **xác nhận** mã QR này.
3. Nếu mã hợp lệ (đúng mã quán, chưa từng sử dụng, còn hiệu lực), hệ thống sẽ ghi nhận và **tự động thực hiện 2 việc**:
   - Chuyển trạng thái mã QR thành **Đã sử dụng** (Redeemed).
   - Chuyển trạng thái của Booking tương ứng từ **Mới** sang **Hoàn tất**.

> [!TIP]
> Việc quán chủ động quét QR giúp hệ thống đồng bộ ngay lập tức, tiết kiệm thời gian cho Admin vận hành và đảm bảo tính chính xác khi chốt bill, tính hoa hồng sau này.

### Luồng 2: Thủ công qua Admin (Phương án dự phòng)
Đây là quy trình dự phòng (Fallback) dành cho Admin vận hành. Nút **"Đánh dấu hoàn tất"** hiển thị ở trang quản trị (CMS) được sử dụng chính cho luồng này:

1. Trong một số trường hợp thực tế, quán không tự quét được mã QR (do nhân viên không quen dùng hệ thống, lỗi thiết bị...) nhưng quán vẫn xác nhận lại với Admin qua kênh liên lạc ngoài (ví dụ: Telegram, Zalo) rằng khách đã tới và sử dụng dịch vụ.
2. Admin sẽ truy cập vào CMS, tìm kiếm giao dịch Booking của khách và bấm chọn nút **Đánh dấu hoàn tất**.
3. Hệ thống sẽ ghi nhận:
   - Chuyển trạng thái Booking từ **Mới** sang **Hoàn tất** (đồng thời cập nhật lại trạng thái nếu có liên kết QR).
   - Ghi lại hành động này vào hệ thống **Audit Log** (theo mã `BOOKING_MANUAL_COMPLETE`). Hành động này sẽ lưu giữ chi tiết thông tin *Tài khoản Admin đã duyệt*, *Thời điểm duyệt* và *Thay đổi trạng thái*, để phục vụ cho mục đích đối soát và rà soát lịch sử (Audit) về sau.
