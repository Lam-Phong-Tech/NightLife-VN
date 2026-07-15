# Original User Request

## Initial Request — 2026-07-15T23:58:38+07:00

Sửa đổi và tích hợp đồng bộ các luồng đặt bàn & ưu đãi (Giảm giá mặc định theo hạng, Chiến dịch riêng của quán, và Mã ưu đãi độc lập của Admin) trên hệ thống backend của NightLife-VN để đúng với đặc tả BA.

Working directory: d:/laragon/www/NightLife-VN
Integrity mode: development

## Requirements

### R1. Ưu đãi mặc định theo Hạng khách khi Đặt bàn thường
Khi người dùng đặt chỗ thông thường mà không chọn coupon cụ thể:
- Backend tự động tìm kiếm mã coupon mặc định của quán tương ứng với hạng của khách (Guest: 5% - `GUEST5`, Member: 8% - `MEMBER8`, VIP: 10% - `VIP10`).
- Hệ thống tự động sinh `CouponIssue` và liên kết với booking (không để `coupon_issue_id` bằng `NULL`).
- Ghi nhận snapshot ưu đãi cố định vào booking để áp dụng chính xác mức giảm này khi duyệt hóa đơn (Bill).

### R2. Ưu đãi theo Chiến dịch riêng của Quán (Không ghi đè)
Khi người dùng đặt chỗ thông qua một chiến dịch cụ thể (ví dụ giảm 15%, giảm 200K):
- Giữ nguyên cấu hình giảm giá gốc của chiến dịch (loại giảm giá và giá trị giảm giá).
- Không được phép lấy mức giảm theo hạng thành viên (5%/8%/10%) để ghi đè lên mức giảm của chiến dịch.

### R3. Mã ưu đãi do Admin phát hành độc lập (Admin Global Coupon)
Tích hợp đồng bộ luồng Admin Coupon từ trang quản trị `/admin/coupons`:
- Khách hàng quét mã QR chung của chiến dịch Admin hoặc click "Lấy mã" trong app để nhận mã QR cá nhân (`AdminCouponIssue`).
- Hỗ trợ kiểm tra tính hợp lệ của mã QR cá nhân này khi đặt chỗ / thanh toán dựa trên các ràng buộc:
  - Hạng khách hàng áp dụng (Guest, Member, VIP).
  - Phạm vi áp dụng (Toàn hệ thống: áp dụng mọi quán; Chọn quán: chỉ áp dụng quán chỉ định).
- Tính toán và áp dụng giảm giá gốc của coupon khi duyệt hóa đơn.
- *Lưu ý về UI:* Chỉ phát triển các APIs ở Backend và tích hợp vào logic nghiệp vụ và các trang quản trị admin/coupons có sẵn, không cần xây dựng UI ví coupon mới ở trang thành viên.

## Verification Plan & Resources
- **Xác minh thủ công (Database & Logs):** 
  - Tạo booking qua API hoặc giao diện và kiểm tra dữ liệu bản ghi trong bảng `bookings` (`coupon_issue_id`, `discount_rule_snapshot`).
  - Tạo bill cho booking và duyệt bill thông qua API/Admin UI, sau đó kiểm tra giá trị cột `discount_vnd` và `total_vnd` trong bảng `bills`.
  - Kiểm tra trạng thái coupon issue chuyển sang `USED` sau khi quét/duyệt.

## Acceptance Criteria

### Luồng 1 & Luồng 2 (Đặt bàn & Chiến dịch quán)
- [ ] Mọi booking tạo mới (thường hoặc qua campaign) đều có `coupon_issue_id` hợp lệ liên kết trong database (trừ trường hợp lỗi hệ thống).
- [ ] Các booking đặt chỗ thường nhận đúng mức giảm mặc định: Guest 5%, Member 8%, VIP 10%.
- [ ] Các booking đặt qua campaign quán nhận đúng mức giảm gốc của campaign (ví dụ 15% hoặc 200k), không bị ghi đè thành 5%/8%/10%.
- [ ] Các booking này hiển thị đầy đủ trên trang `/admin/coupons` ở tab tương ứng.
- [ ] Duyệt bill của booking áp dụng chính xác mức giảm giá đã snapshot.

### Luồng 3 (Admin Global Coupon)
- [ ] Khách hàng (bao gồm cả khách vãng lai nếu được cấu hình) có thể nhận mã `AdminCouponIssue` thành công.
- [ ] Khi đặt chỗ hoặc duyệt hóa đơn, mã `AdminCouponIssue` được kiểm tra tính hợp lệ (đúng quán, đúng hạng khách).
- [ ] Duyệt bill áp dụng chính xác mức giảm giá của Admin Coupon gốc (không ghi đè).
