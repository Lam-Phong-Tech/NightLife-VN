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

## Follow-up — 2026-07-16T09:31:29+07:00

Sửa lỗi logic duyệt/từ chối yêu cầu của đối tác (State Machine) ở Backend và bổ sung Tab điều hướng cùng giao diện so sánh thông tin song song (Diff View) tại trang quản trị đối tác (/admin/partners).

Working directory: d:/laragon/www/NightLife-VN
Integrity mode: development

## Requirements

### R1. Sửa lỗi logic duyệt/từ chối (State Machine) của PartnerRequest ở Backend
- Chỉnh sửa hàm duyệt trong nightlife-data.service.ts (d:/laragon/www/NightLife-VN/backend/src/nightlife-data/nightlife-data.service.ts):
  - Chỉ kích hoạt luồng Onboarding (ensurePartnerOnboarding) khi duyệt các yêu cầu đăng ký mới (ID bắt đầu bằng PARTNER-). Đối với yêu cầu chỉnh sửa thông tin (LISTING-), bỏ qua việc gọi onboarding và cập nhật thẳng thông tin mới của Store.
  - Khi từ chối yêu cầu (Reject), chỉ đặt trạng thái Store về DRAFT đối với yêu cầu PARTNER-. Đối với yêu cầu LISTING-, giữ nguyên trạng thái cũ của Store (ví dụ: ACTIVE).
- Bổ sung việc load các trường dữ liệu chi tiết của Store gốc ở API trả về (partnerRequestSelect và mapPartnerRequestRecord) để phục vụ việc so sánh ở Frontend.

### R2. Thiết kế giao diện Tab điều hướng & Modal so sánh song song (Diff View) ở Frontend
- Cải tiến giao diện tại AdminConsole.tsx (d:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/AdminConsole.tsx):
  - Thiết kế Tab điều hướng phân chia danh sách yêu cầu thành 2 nhóm:
    - Tab 1: Đăng ký mới (Chứa các yêu cầu có ID bắt đầu bằng PARTNER-).
    - Tab 2: Sửa thông tin (Chứa các yêu cầu có ID bắt đầu bằng LISTING-).
  - Thêm cột hành động hiển thị nút "Xem thay đổi" cho các yêu cầu cập nhật thông tin.
  - Khi click vào nút "Xem thay đổi", mở một Modal overlay có cấu trúc so sánh song song:
    - Cột bên trái: Hiển thị dữ liệu gốc hiện tại của Store.
    - Cột bên phải: Hiển thị dữ liệu đối tác vừa cập nhật/sửa đổi.
    - So sánh và bôi màu highlight trực quan các trường có sự thay đổi (tên quán, loại hình, địa chỉ, số điện thoại, mô tả, giờ mở cửa, menu, v.v.).
    - Tích hợp nút nhập lý do và bấm Duyệt/Từ chối trực tiếp ở cuối Modal.

## Acceptance Criteria

### Tính đúng đắn của Backend
- Phê duyệt thành công yêu cầu cập nhật thông tin (LISTING-) từ Admin mà không bị crash lỗi trùng email hoặc thiếu mật khẩu.
- Từ chối yêu cầu LISTING- không làm thay đổi trạng thái của Store (vẫn giữ nguyên trạng thái hoạt động cũ).

### Trải nghiệm giao diện Admin
- Trang quản lý đối tác /admin/partners có Tab phân chia riêng biệt cho hồ sơ đăng ký mới và hồ sơ sửa đổi.
- Modal so sánh (Diff View) mở ra hiển thị so sánh song song dữ liệu gốc và dữ liệu đề xuất đối với yêu cầu LISTING-.
- Các trường dữ liệu có sự thay đổi được làm nổi bật trực quan (highlight).
- Có thể thực hiện Duyệt hoặc Từ chối thành công ngay trong giao diện Modal so sánh.

## Follow-up — 2026-07-16T09:34:49+07:00

Bổ sung yêu cầu thiết kế giao diện Form phía đối tác (/partner) hỗ trợ nút gạt Toggle xem bản Go Live:

1. **Backend**: Cải tiến API `getPartnerListingDraft` (trong `nightlife-data.service.ts`) để trả về thêm một đối tượng `live` chứa toàn bộ thông tin gốc của Store hiện tại trong database (được định dạng theo cùng một cấu trúc/schema giống đối tượng `draft` để frontend đối tác dễ dàng sử dụng).
2. **Frontend Đối tác**:
   - Trong `page.tsx` (phía đối tác), bổ sung state `isViewingLive` (boolean, mặc định `false`).
   - Thiết kế công tắc chuyển đổi (Toggle Switch) hoặc Tab chuyển đổi nhỏ nằm cạnh Status Pill hiển thị trạng thái duyệt: `[Xem bản đang Go Live]` và `[Xem bản chỉnh sửa]`.
   - Khi bật `isViewingLive === true`: Điền toàn bộ thông tin từ đối tượng `live` vào form, đặt tất cả các ô nhập liệu thành `disabled={true}`, và ẩn/vô hiệu hóa các nút "Lưu bản nháp", "Gửi duyệt".
   - Khi `isViewingLive === false` (mặc định): Điền thông tin nháp (`listingDraft`) và cho phép nhập liệu, lưu nháp, gửi duyệt như bình thường.

## Follow-up — 2026-07-16T09:49:37+07:00

Thiết kế và triển khai trang Cài đặt (Settings) cho Đối tác (Partner Portal) trên Web Frontend (Next.js) và REST APIs Backend (NestJS, Prisma, PostgreSQL), cho phép đối tác đổi mật khẩu và quản lý (thêm/xóa/phân quyền) tài khoản nhân viên (Staff).

Working directory: d:\laragon\www\NightLife-VN
Integrity mode: development

## Requirements

### R1. API Đổi mật khẩu & Giao diện đổi mật khẩu
- Triển khai API đổi mật khẩu dành cho người dùng đã xác thực (bao gồm cả Partner và Staff). API kiểm tra mật khẩu hiện tại và mã hóa lưu mật khẩu mới.
- Thiết kế giao diện thay đổi mật khẩu trực quan trên trang Cài đặt của đối tác.

### R2. API & Giao diện quản lý Nhân viên (Staff) dành cho Đối tác
- Triển khai API lấy danh sách, thêm mới và xóa quyền nhân viên (Staff) của đối tác.
- Triển khai giao diện quản lý nhân viên trên trang Cài đặt (chỉ hiển thị đối với tài khoản vai trò `PARTNER`).
- Đối tác có thể tạo nhân viên mới bằng cách nhập Họ tên, Email, Mật khẩu và bắt buộc chọn 1 cơ sở (Store) trực thuộc sở hữu của đối tác đó.
- Giao diện chọn quán phải sử dụng component chọn lựa tùy chỉnh của dự án (`ThemedListingSelect`), tuyệt đối không dùng thẻ `<select>` mặc định của trình duyệt.
- Chức năng xóa nhân viên phải hiển thị popup xác nhận tùy chỉnh của dự án (sử dụng hook `useSystemFeedback`), tuyệt đối không dùng hàm `confirm()` hoặc `alert()` mặc định của trình duyệt.

### R3. Phân quyền và Bảo mật
- Nhân viên (Staff) sau khi được tạo tự động được cấp quyền quét mã giảm giá (`coupon.scan`) và xác nhận check-in (`checkin.confirm`) duy nhất cho quán được chọn.
- Kiểm tra chặt chẽ ở backend để đảm bảo đối tác chỉ được quản lý nhân viên thuộc các quán do mình sở hữu, không được xem hoặc thao tác trên nhân viên của đối tác khác.

## Acceptance Criteria

### Giao diện người dùng (Frontend)
- [ ] Sidebar của Partner Portal có thêm tab "Cài đặt" với icon bánh răng (Settings). Khi click vào hiển thị tiêu đề "Cấu hình và cài đặt" và phụ đề "PARTNER SETTINGS".
- [ ] Giao diện đổi mật khẩu hoạt động tốt: Kiểm tra hợp lệ dữ liệu nhập (như xác nhận mật khẩu trùng khớp, độ dài mật khẩu tối thiểu 8 ký tự), hiển thị toast thông báo thành công hoặc thất bại thông qua `useSystemFeedback`.
- [ ] Giao diện quản lý nhân viên hiển thị danh sách dạng bảng (Họ tên, Email, Quán quản lý, Trạng thái, Hành động) và có form thêm nhân viên.
- [ ] Dropdown chọn quán của nhân viên hoạt động mượt mà, sử dụng đúng component `ThemedListingSelect`.
- [ ] Popup xác nhận xóa nhân viên hiển thị đúng thiết kế của dự án thông qua `useSystemFeedback` và hoạt động chính xác (xóa xong cập nhật lại danh sách và hiện toast thông báo).

### Nghiệp vụ & APIs (Backend)
- [ ] API `POST /users/change-password` hoạt động chính xác: trả về 200/201 khi đổi mật khẩu đúng, trả về 401/400 khi mật khẩu cũ sai hoặc mật khẩu mới không hợp lệ.
- [ ] API `GET /partner/staff` trả về danh sách nhân viên thuộc các quán của đối tác hiện tại đăng nhập.
- [ ] API `POST /partner/staff` tạo thành công tài khoản Staff trong database, tạo bản ghi `StorePermission` kết nối Staff với Store tương ứng.
- [ ] API `DELETE /partner/staff/:id` xóa bản ghi `StorePermission` của staff và cập nhật trạng thái User thành `INACTIVE`.
- [ ] Mọi endpoint quản lý nhân viên của đối tác đều trả về 403 Forbidden nếu đối tác cố gắng truy cập hoặc thay đổi dữ liệu của quán không thuộc sở hữu của họ.

### Kiểm thử tự động (Testing)
- [ ] Viết test suite `partner-staff.controller.spec.ts` kiểm thử đầy đủ các kịch bản lấy danh sách, tạo mới thành công, tạo mới lỗi quyền sở hữu, và xóa nhân viên.
- [ ] Viết test suite đổi mật khẩu `users.controller.spec.ts` cho các kịch bản thành công và thất bại.
- [ ] Chạy lệnh test và đảm bảo toàn bộ unit test/integration test liên quan đều pass.



