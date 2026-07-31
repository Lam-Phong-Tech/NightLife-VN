# Đối chiếu ngược: Code NightLife-VN có gì mà tài liệu BA v3.3 chưa có

> Ngày lập: 26/07/2026 · Đối chiếu với: “[BA] Tổng hợp đặc tả nghiệp vụ NightLife v3.3” (bản có Audit Log, 13/07/2026)
> Phương pháp: 8 nhóm agent quét song song toàn bộ backend (NestJS + Prisma) và frontend (Next.js), mỗi phát hiện được một agent kiểm chứng độc lập 2 chiều (tài liệu thật sự thiếu & code thật sự có, không phải mock).

**Tổng: 181 phát hiện** — 36 mâu thuẫn · 72 thiếu hoàn toàn · 73 cần chi tiết hóa.

Chiều so sánh là **code → tài liệu** (tìm cái tài liệu cần bổ sung), không phải kiểm tra code có làm đúng tài liệu hay không.

## PHẦN 1 — CODE MÂU THUẪN VỚI ĐIỀU TÀI LIỆU ĐÃ CHỐT (36 mục)

_Đây là các điểm tài liệu ghi một đằng, code làm một nẻo — cần quyết định sửa tài liệu theo code hay coi là bug của code._

### Quán, Cast, Tìm kiếm & Ranking

**1. Hệ thống khu vực hỗ trợ 34 tỉnh/thành toàn quốc, không chỉ HN/HCM/Tổng hợp** _(so với 1.1, SEA-02, RAN-01)_

Code định nghĩa bảng chuẩn hóa 34 tỉnh/thành (theo bộ máy hành chính sau sáp nhập) với cityCode riêng cho từng tỉnh (hn, hcm, dn, hp, hue, khanhhoa, lamdong...), kèm alias tiếng Việt có dấu/không dấu (Sài Gòn/Saigon/TP.HCM, Đà Lạt, Nha Trang, Phú Quốc...) và các tỉnh được gộp làm alias của tỉnh mới (vd Bình Dương, Bà Rịa Vũng Tàu → hcm). Bộ lọc city ở API public (stores/casts/rankings) chấp nhận 'all' + toàn bộ 34 mã tỉnh; dashboard admin còn có thêm nhóm 'other' (tỉnh khác ngoài HN/HCM). Tài liệu (mục 1.1, SEA-02, RAN-01) chốt MVP chỉ HN/HCM/Tổng hợp và loại trừ Đà Nẵng/Hải Phòng, nhưng code đã hỗ trợ đầy đủ dn, hp và 30 tỉnh khác.

- Bổ sung vào: **3.B Search, Filter & Discovery (phạm vi khu vực) + mục 1.1 Phạm vi dịch vụ**
- Bằng chứng: `backend/src/nightlife-data/vietnam-admin-units.ts:19-171` · `backend/src/nightlife-data/dto/public-discovery-query.dto.ts:77-102` · `backend/src/nightlife-data/nightlife-data.service.ts:19434-19450`

**2. Gợi ý liên quan ở trang chi tiết chạy TỰ ĐỘNG, không phải Admin chọn thủ công như doc chốt cho P0** _(so với SEA-05, STO-10)_

Trang chi tiết quán tự động lấy 4 quán liên quan theo thứ tự ưu tiên: cùng khu vực > cùng loại hình + cùng thành phố > cùng thành phố, kèm nhãn lý do (same-area/same-category/same-city). Trang chi tiết cast tự động lấy 6 cast liên quan: cùng quán trước > cast có cấu hình ranking CAST phù hợp city/category > cùng khu vực hoặc trùng tag, kèm relatedReason (same-store/ranking/same-area/same-tag). Không tồn tại cơ chế Admin chọn thủ công danh sách liên quan. Tài liệu SEA-05/STO-10 chốt 'P0 chọn thủ công bởi Admin; P1 tự động' — code đi thẳng vào tự động.

- Bổ sung vào: **3.B (SEA-05) + 3.D (STO-10)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:2280-2326` · `backend/src/nightlife-data/nightlife-data.service.ts:2408-2424` · `backend/src/nightlife-data/nightlife-data.service.ts:15312-15448`

**3. Mục 'Hot Videos' theo thành phố trên trang chủ với view/like công khai — doc xếp video trang chủ vào P2** _(so với WEB-04)_

Đã có đầy đủ tính năng video trang chủ: Admin biên tập danh sách video nổi bật THEO TỪNG THÀNH PHỐ (lưu dạng content slug 'hot-videos-{cityCode}', có thứ tự rank); public GET /content/hot-videos/{cityCode} trả video kèm quán, link sang trang quán và SỐ LƯỢT XEM/LƯỢT THÍCH; khách bấm xem/thích được ghi nhận ẩn danh (anonymousId, source, surface) qua POST /content/hot-videos/{id}/view|like; Admin có thư viện video quán để chọn (lọc theo city gồm cả nhóm 'other' - tỉnh khác, tìm theo tên video/tên quán). Tài liệu WEB-04 chốt 'Video/SNS section trên trang chủ = P2 Phase sau' — code đã triển khai và nối vào HomePage.

- Bổ sung vào: **3.A Public Website (WEB-04) + 3.J Admin CMS**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:24287-24400` · `backend/src/nightlife-data/nightlife-data.service.ts:24067-24198` · `backend/src/nightlife-data/nightlife-data.service.ts:24200-24285` · `backend/src/nightlife-data/nightlife-data.controller.ts:188-245`

**4. Tour đêm đã có thật trong code (gợi ý trang chủ + entity Tour đặt được chỗ) — doc xếp tour vào P2** _(so với CON-03)_

Hai phần: (1) GET /content/tours sinh 3 gói tour đêm gợi ý trên trang chủ (Dinner & Club Night 4h từ 1.2tr; Bar Hopping VIP 5h từ 1.8tr; Spa & Late Supper 3h từ 0.9tr) — các điểm dừng được ghép ĐỘNG từ quán ACTIVE theo loại hình và thành phố, có cá nhân hóa theo sở thích khách; (2) hệ thống có entity Tour thật (điểm dừng có thứ tự, lịch khởi hành departureSchedule/departureTimes, chặn đặt ngoài khung giờ khởi hành) với API đặt tour cho Guest và Member, kèm luồng Partner quét QR tour và xác nhận check-in tour. Tài liệu CON-03 chốt 'Trang tour chi tiết = P2, không thuộc nightlife core' và không có dòng nào về tour booking/QR tour.

- Bổ sung vào: **3.K (CON-03) + 3.F Booking (tour booking) — cần mục riêng cho Tour**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:23912-24065` · `backend/src/nightlife-data/nightlife-data.service.ts:12160-12215` · `backend/src/nightlife-data/nightlife-data.controller.ts:420-432,712-739,941-957`

**5. Xuất báo cáo dashboard ra Excel đã có ngay MVP — doc xếp export vào P2** _(so với BIL-06B, ADM-09B)_

GET /admin/dashboard/export xuất file Excel 4 sheet theo đúng bộ lọc dashboard (timeframe/city/category): 'Tổng quan' (8 thẻ KPI, xu hướng theo ngày, cơ cấu trạng thái booking, top 10 quán theo doanh thu), 'Booking' (14 cột chi tiết), 'Hóa đơn' (14 cột gồm phí dịch vụ, thuế, đã thanh toán, hoa hồng, coupon), 'Theo quán' (booking, số khách, tỷ lệ hoàn tất, hủy/no-show, doanh thu, giảm giá, hoa hồng, hóa đơn trung bình). Quy tắc nghiệp vụ trong báo cáo: doanh thu/hoa hồng CHỈ tính hóa đơn 'Đã xác minh' hoặc 'Đã thanh toán'; giới hạn xuất 20.000 dòng mỗi loại kèm cảnh báo khi bị cắt. Tài liệu BIL-06B chốt 'Xuất báo cáo ra Excel/PDF = P2 Sau MVP'.

- Bổ sung vào: **3.H Bill/Revenue (BIL-06B) + 3.J (ADM-09B)**
- Bằng chứng: `backend/src/nightlife-data/admin-dashboard-report.ts:372-1001` · `backend/src/nightlife-data/nightlife-data.service.ts:21788-21907` · `backend/src/nightlife-data/nightlife-data.controller.ts:1956-1958`

**6. Bộ trạng thái booking (6) và bill (7) trong báo cáo/dashboard khác hẳn 3 trạng thái booking của doc** _(so với BOO-06, BIL-03)_

Nhãn trạng thái dùng xuyên suốt dashboard/báo cáo: Booking có 6 trạng thái — REQUESTED (Chờ xác nhận), CONFIRMED (Đã xác nhận), CHECKED_IN (Đã check-in), COMPLETED (Hoàn tất), CANCELLED (Đã hủy), NO_SHOW (Không đến); Bill có 7 trạng thái — DRAFT (Nháp), SUBMITTED/PENDING_PM_BA (Chờ duyệt), VERIFIED (Đã xác minh), REJECTED (Từ chối), PAID (Đã thanh toán), VOIDED (Đã hủy). Tài liệu BOO-06 chốt chỉ 3 trạng thái booking (Mới/Đã hủy/Hoàn tất) và 3.H chỉ mô tả Pending → duyệt/từ chối. Cần cập nhật mô hình trạng thái trong doc cho khớp (ảnh hưởng cả báo cáo 'Cơ cấu trạng thái').

- Bổ sung vào: **3.F Booking (BOO-06) + 3.H Bill + mục 6.1**
- Bằng chứng: `backend/src/nightlife-data/admin-dashboard-report.ts:98-115` · `backend/src/nightlife-data/nightlife-data.service.ts:22000-22013`

### Booking, QR, Bill, Điểm & Hoa hồng

**1. Booking có 6 trạng thái thực tế (REQUESTED/CONFIRMED/CHECKED_IN/COMPLETED/CANCELLED/NO_SHOW)** _(so với BOO-06)_

Tài liệu chốt 3 trạng thái (Mới/Đã hủy/Hoàn tất) nhưng code vận hành 6 trạng thái: REQUESTED (mới), CONFIRMED (admin xác nhận), CHECKED_IN (đã đến quán - sau khi Partner quét QR), COMPLETED (hoàn tất), CANCELLED (đã hủy), NO_SHOW (khách không đến). Admin có thể chuyển trạng thái tùy ý qua API cập nhật trạng thái booking; mỗi trạng thái có template thông báo khách riêng (confirmed/checked_in/completed/cancelled). BA cần chốt lại state machine chính thức.

- Bổ sung vào: **3.F Booking & Notification (BOO-06) + mục 6.1**
- Bằng chứng: `backend/prisma/schema.prisma:100-107` · `backend/src/nightlife-data/nightlife-data.service.ts:21377-21435` · `backend/src/nightlife-data/nightlife-data.service.ts:14664-14682` · `backend/src/nightlife-data/nightlife-data.controller.ts:1607`

**2. Partner quét/xác nhận QR chỉ đưa booking sang CHECKED_IN, không phải Hoàn tất** _(so với BOO-06, MEM-04)_

Doc (BOO-06, MEM-04) và ghi chú dev nói quét QR thành công thì booking chuyển Hoàn tất. Code thực tế: xác nhận check-in đặt BookingQr/coupon issue = USED và booking = CHECKED_IN (không phải COMPLETED). COMPLETED chỉ được đặt thủ công bởi Admin qua API đổi trạng thái. Luồng quét gồm 2 bước: quét (scan - chỉ tra cứu/ghi nhận người quét) và xác nhận check-in (confirm) mới đổi trạng thái.

- Bổ sung vào: **3.F/3.G + mục 5 FLOW A**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:5274-5291` · `backend/src/nightlife-data/nightlife-data.service.ts:6094-6103` · `backend/src/nightlife-data/nightlife-data.service.ts:5472-5566`

**3. Số người tối đa là 50, không phải 20** _(so với BOO-03)_

Doc chốt số người min 1 max 20 (BOO-03, mục 6.1, bước 1 triển khai). Code API tạo booking chấp nhận partySize từ 1 đến 50 (@Min(1) @Max(50)). Áp dụng cho cả booking thường và tour booking.

- Bổ sung vào: **3.F Booking & Notification (BOO-03) + mục 6.1**
- Bằng chứng: `backend/src/nightlife-data/dto/create-booking.dto.ts:165-170` · `backend/src/nightlife-data/dto/tour-booking.dto.ts:77`

**4. Khách được tự đổi giờ booking (reschedule self-service) - trái quy tắc 'không sửa booking cũ'** _(so với BOO-08B)_

Doc BOO-08B chốt không sửa booking, muốn đổi phải hủy và đặt lại. Code có API đổi lịch tự phục vụ cho cả Guest (xác thực bằng SĐT) và Member: cập nhật trực tiếp scheduledAt của booking cũ nếu (1) còn cách giờ hẹn >= cutoff của quán, (2) giờ mới trong tương lai + trong cửa sổ 14 ngày + trong khung giờ mở cửa, (3) khác giờ cũ. Có audit BOOKING_RESCHEDULED_SELF_SERVICE và thông báo khách. Ngoài ra tồn tại luồng 'yêu cầu đổi lịch chờ Admin/Operator duyệt' (BookingChangeRequest APPROVED/REJECTED, có API review cho admin/operator) nhưng hiện không có API nào tạo yêu cầu, nên luồng duyệt đang ở trạng thái chờ kích hoạt.

- Bổ sung vào: **3.F Booking & Notification (BOO-08B) + mục 5**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:12820-12906` · `backend/src/nightlife-data/nightlife-data.service.ts:4461-4519` · `backend/src/nightlife-data/nightlife-data.service.ts:4546-4665` · `backend/src/nightlife-data/nightlife-data.controller.ts:442-451`

**5. Hủy booking không tự chuyển QR sang trạng thái Vô hiệu trong hệ thống** _(so với BOO-08A, MEM-04B)_

Doc chốt 'khi hủy, QR đi kèm bị vô hiệu và không dùng lại' (BOO-08A) và 'Vô hiệu = booking bị hủy' (MEM-04B). Code khi hủy booking chỉ đổi trạng thái booking + gửi thông báo, KHÔNG revoke coupon issue/QR. Đường quét theo mã booking (payload NLBOOKING) có chặn booking CANCELLED/NO_SHOW, nhưng đường quét/xác nhận theo coupon issue chỉ kiểm tra trạng thái + hạn của chính issue, không kiểm tra booking đã hủy - nên QR của booking đã hủy về lý thuyết vẫn xác nhận được. Trạng thái REVOKED chỉ xảy ra khi Admin chủ động thu hồi hoặc khi hủy tour (tour QR bị revoke). BA cần chốt lại hành vi mong muốn.

- Bổ sung vào: **3.F/3.G + mục 5 FLOW A**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:4956-4991` · `backend/src/nightlife-data/nightlife-data.service.ts:5365-5386` · `backend/src/nightlife-data/nightlife-data.service.ts:21247-21270` · `backend/src/nightlife-data/nightlife-data.service.ts:5040-5046`

**6. Cron duy nhất: hết hạn QR mỗi 5 phút; KHÔNG tự hủy booking quá hạn, KHÔNG email nhắc trước 6h, KHÔNG email hủy** _(so với MEM-04D, NOT-03, NOT-04)_

Code chỉ có 1 cron chạy mỗi 5 phút chuyển coupon issue ISSUED quá expiresAt sang EXPIRED (kèm event thống kê); ngoài ra hết hạn còn được đồng bộ khi liệt kê ví coupon. Không tồn tại job tự chuyển booking quá hạn sang Đã hủy, không có email nhắc trước hết hạn 6 giờ (NOT-03) và không có email báo hủy do quá hạn (NOT-04) - toàn bộ MEM-04D chưa có trong code. Đây là điểm doc mô tả nhưng hành vi thực tế khác hẳn, BA nên cập nhật trạng thái tính năng.

- Bổ sung vào: **3.G (MEM-04D) + 3.L + mục 8 bước 6**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:6821-6830` · `backend/src/nightlife-data/nightlife-data.service.ts:21034-21051`

**7. Mã ưu đãi toàn hệ thống do Admin phát hành (Admin Global Coupon) đã hoạt động ngoài luồng booking** _(so với FLOW B, mục 7)_

Doc FLOW B chốt 'không có flow lấy coupon/QR riêng ngoài booking trong MVP', nhưng code đã triển khai đầy đủ Admin Coupon: Admin tạo campaign (percent hoặc giảm cố định), chọn phạm vi quán (targetStores) và đối tượng (targetAudiences), giới hạn tổng lượt dùng (usageLimit); Member bấm 'Lấy mã' nhận QR cá nhân hạn 7 ngày (1 lần/campaign/người); Guest nhận theo SĐT hạn 24h (1 lần/SĐT); hạn bị cap theo ngày kết thúc campaign. QR chung của campaign khi được Partner quét sẽ tự tạo issue vô danh cho khách walk-in. Mã có thể gắn vào booking (kiểm tra đúng quán, đúng chủ sở hữu, còn hạn) và khi Admin duyệt bill thì issue chuyển USED + tăng usedCount. Riêng luồng lấy coupon campaign CỦA QUÁN độc lập đã bị gỡ (API trả 410 'Independent coupon claim is not part of MVP v3.2').

- Bổ sung vào: **3.G + mục 5 (thêm flow Admin Coupon) + ADM-06**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:2887-3097` · `backend/src/nightlife-data/nightlife-data.service.ts:12009-12080` · `backend/src/nightlife-data/nightlife-data.service.ts:8922-8945` · `backend/src/nightlife-data/nightlife-data.service.ts:5658-5662`

**8. Hoa hồng (commission) đã bị TẮT hoàn toàn theo quyết định sản phẩm - luôn bằng 0** _(so với BIL-09, BIL-05, ADM-09B)_

Doc chốt BIL-09 P0 'commission cấu hình theo từng quán' và BIL-05 'sau duyệt ghi nhận hoa hồng'. Code thực tế: hàm tính hoa hồng khi duyệt bill luôn trả 0 với snapshot source='COMMISSION_DISABLED' và ghi chú 'CommissionConfig logic was removed by product decision'; toàn bộ API commission-override của Admin trả 410 Gone 'Commission override is no longer used'; bảng CommissionConfig còn trong DB nhưng không được dùng. Đây là mâu thuẫn lớn nhất giữa doc và code ở phân hệ doanh thu.

- Bổ sung vào: **3.H Bill, Revenue & Commission (BIL-09)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:10393-10467` · `backend/src/nightlife-data/nightlife-data.service.ts:8657-8706` · `backend/prisma/schema.prisma:899-920`

**9. Void/đảo bill và đảo điểm tự động đã có trong code (doc xếp P2)** _(so với BIL-11, MEM-07C)_

Doc BIL-11/MEM-07C nói hủy/hoàn bill xử lý thủ công ở MVP, tự động là P1/P2. Code đã có: (1) void bill ('bill.review.void') và reverse bill ('bill.reversal') - tự tạo point ledger REVERSE trừ đúng số điểm đã cộng, lưu lý do + mã tham chiếu hoàn tiền, không xóa bill gốc; (2) auto-reverse hàng loạt: quét bill VERIFIED/PAID có tín hiệu rủi ro HIGH (trùng/chứng từ đáng ngờ), chạy chế độ DRY_RUN hoặc EXECUTED, tối đa 25 bill/lần; (3) fraud-reversal từng bill: chỉ tự đảo khi risk HIGH, có audit 'bill.fraud.auto_reversal'.

- Bổ sung vào: **3.H (BIL-11) + 3.G (MEM-07C) + mục 7**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:9062-9286` · `backend/src/nightlife-data/nightlife-data.service.ts:9419-9424` · `backend/src/nightlife-data/nightlife-data.service.ts:14977-15014` · `backend/src/nightlife-data/nightlife-data.controller.ts:1459-1585`

### Campaign, Tour, Media & Cấu hình hệ thống

**1. Tour đã được triển khai đầy đủ (public + admin CMS) dù tài liệu xếp là P2** _(so với CON-03)_

Tài liệu chỉ có CON-03 'Trang tour chi tiết - P2 - Phase sau', nhưng code đã có đầy đủ tính năng tour và được nối vào luồng thật (frontend có trang public /tour, /tour/[id] và trang quản trị admin/tours; trang chủ có khối tour qua GET content/tours). Cụ thể: (1) Public API GET /tours và GET /tours/:id chỉ trả tour ACTIVE, chưa xóa, và PHẢI có ít nhất 1 điểm dừng (quán) đang hoạt động - tour không còn điểm dừng hợp lệ sẽ bị ẩn khỏi public; sắp xếp theo homeRank (thứ hạng hiển thị trang chủ) rồi đến ngày tạo. (2) Admin CRUD tour với các trường nghiệp vụ: tiêu đề, phụ đề, thành phố, thời lượng (mặc định 4 giờ), mức giá priceTier hiển thị bằng ký hiệu $ (mặc định 3; màn admin cho chọn 3 mức $$/$$$/$$$$ tức 2-4, public hiển thị tối đa 4 ký hiệu $, backend không ràng buộc min/max), ảnh bìa, homeRank, danh sách điểm dừng có thứ tự (mỗi quán chỉ xuất hiện 1 lần trong tour - ràng buộc unique ở DB). (3) Lịch khởi hành theo từng thứ trong tuần (thứ 2 - chủ nhật): mỗi ngày có cờ nghỉ (isOff) và các khung giờ dạng 'HH:MM - HH:MM'; quy tắc bắt buộc: tour phải có ít nhất 1 ngày khởi hành, khung giờ phải hợp lệ và không được chồng lấn nhau trong cùng ngày. (4) Ảnh bìa tour có quy tắc riêng: chỉ nhận ảnh JPG/PNG/WebP/GIF, cấm link video/YouTube/Vimeo; nếu chọn file trong kho media thì file đó phải là ảnh hợp lệ. (5) Xóa tour là xóa mềm (status DELETED, giữ dữ liệu). Tour detail public còn hiển thị kèm mỗi quán tối đa 3 ảnh, 2 coupon đang hiệu lực và 4 cast active/public.

> Ghi chú kiểm chứng: Kiểm chứng đúng gần như toàn bộ: tài liệu chỉ có CON-03 'Trang tour chi tiết - P2 - Phase sau - Không thuộc nightlife core' (dòng 1441-1449) và 1 dòng P2 tổng quát (dòng 193), không đặc tả gì thêm; code có đầy đủ và được nối luồng thật (public-tour.controller.ts, tour.controller.ts /admin/tours không guard, tour.service.ts lọc ACTIVE + >=1 điểm dừng active, sort homeRank rồi createdAt, xóa mềm DELETED, lịch khởi hành theo thứ với isOff + khung 'HH:MM - HH:MM' không chồng lấn, ảnh bìa cấm video/YouTube/Vimeo, detail kèm 3 ảnh/2 coupon/4 cast mỗi quán, @@unique(tourId, storeId), frontend /tour, /tour/[id], admin/tours, trang chủ gọi GET content/tours). CHỈ SAI 1 chi tiết: priceTier KHÔNG phải 'thang 1-5' — DTO không giới hạn min/max, DB mặc định 3, UI admin chỉ cho chọn 2/3/4 ($$/$$$/$$$$), còn public hiển thị kẹp 1-4 ký hiệu $.

- Bổ sung vào: **3.K Blog, Tour, SEO & Legal - nâng CON-03 khỏi P2 và bổ sung đặc tả chi tiết tour (lịch khởi hành, điểm dừng, quy tắc hiển thị public)**
- Bằng chứng: `backend/src/tour/public-tour.controller.ts:8-24` · `backend/src/tour/tour.controller.ts:16-68` · `backend/src/tour/tour.service.ts:167-214` · `backend/src/tour/tour.service.ts:318-368`

**2. API quản trị campaign, danh mục, tour không có xác thực/phân quyền** _(so với ADM-12)_

Các endpoint quản trị /admin/campaigns (CRUD), /admin/categories (CRUD) và /admin/tours (CRUD) hiện KHÔNG gắn bất kỳ guard xác thực hay phân quyền nào (trong code còn ghi chú TODO 'Add AdminGuard if applicable'), và hệ thống cũng không có guard toàn cục. Nghĩa là bất kỳ ai gọi thẳng API đều tạo/sửa/xóa được campaign, danh mục, tour. Điều này mâu thuẫn với nguyên tắc phân quyền Admin CMS (ADM-12: Admin full, Partner chỉ login + quét QR) mà tài liệu đã chốt. BA cần đặc tả rõ yêu cầu vai trò cho từng nhóm API quản trị này (và dev cần bổ sung guard) - các module quản trị khác như system-config đã có phân quyền đầy đủ theo vai trò.

- Bổ sung vào: **3.J ADM-12 - bổ sung ma trận phân quyền chi tiết cho từng nhóm API quản trị (campaign/danh mục/tour) và ghi nhận rủi ro hiện trạng**
- Bằng chứng: `backend/src/campaigns/campaigns.controller.ts:52-53` · `backend/src/categories/categories.controller.ts:13-41` · `backend/src/tour/tour.controller.ts:16-68` · `backend/src/main.ts:45`

### Thông báo & Liên lạc (Telegram/Email/LINE/Chat)

**1. Nội dung email QR cho Guest khác đặc tả NOT-02** _(so với NOT-02, BOO-04)_

Email gửi Guest sau khi đặt bàn thành công trong code: tiêu đề 'NightLife - {mã booking} đơn đặt bàn thành công', thương hiệu hiển thị trong email là 'Vietyoru - Vietnam Nightlife Guide'; nội dung gồm mã đặt bàn, quán, cast (nếu có), thời gian, số người, dòng 'Chi phí: Miễn phí - không thu cọc', trạng thái booking, ghi chú; ảnh QR PNG đính kèm trực tiếp trong email + link 'QR dự phòng' sinh qua dịch vụ ngoài api.qrserver.com; chân email ghi 'Không thanh toán online, không thu cọc. Admin sẽ liên hệ xác nhận chỗ nếu cần.'. Lưu ý đối chiếu: NOT-02 yêu cầu email phải có mức giảm và rule hết hạn QR nhưng template hiện tại KHÔNG có 2 thông tin này; ngược lại code có thêm các nội dung 'miễn phí/không thu cọc' và cách gửi QR (đính kèm + dự phòng) mà tài liệu chưa mô tả. Mỗi email được ghi Notification Log (template 'customer.booking.qr_email.v1').

- Bổ sung vào: **3.L bảng Notification (NOT-02) - chốt lại nội dung email QR và tên thương hiệu gửi email**
- Bằng chứng: `backend/src/notifications/email-notification.service.ts:44-75,139-211` · `backend/src/notifications/email-notification.service.ts:291-304` · `backend/src/nightlife-data/nightlife-data.service.ts:13523-13562`

### Audit Log

**1. Danh sách action code audit thực tế trong code khác hoàn toàn bảng 18** _(so với Bảng 18 (mục 4.2))_

Code đã ghi audit log với bộ action code thực tế như sau (cần thay thế/bổ sung vào bảng 18):
- Ranking: ranking.config.create, ranking.config.update, ranking.config.delete (không tồn tại RANKING_REORDER / RANKING_ADD_ITEM / RANKING_REMOVE_ITEM / RANKING_UPDATE_ITEM như doc).
- Booking: BOOKING_CANCELLED; BOOKING_STATUS_CHANGED (dùng chung cho: xác nhận check-in QR booking, check-in qua coupon, admin đổi trạng thái booking — metadata ghi actorType MEMBER/GUEST/ADMIN/OPERATOR/PARTNER/SYSTEM, beforeStatus/afterStatus, reason); BOOKING_QR_SCANNED (partner quét QR booking — chỉ ghi khi thành công, quét lỗi ném exception trước khi ghi log); BOOKING_POLICY_UPDATED; BOOKING_RESCHEDULE_REQUESTED / BOOKING_RESCHEDULE_APPROVED / BOOKING_RESCHEDULE_REJECTED / BOOKING_RESCHEDULED_SELF_SERVICE.
- Coupon/QR: COUPON_ISSUE_SCANNED, COUPON_ISSUE_USED, COUPON_ISSUE_BOOKING_QR_ISSUED, COUPON_QR_TOKEN_REVOKED, COUPON_QR_TOKEN_ROTATED.
- Bill: bill.submit, bill.coupon.link, bill.review.approve, bill.review.reject, bill.review.pending_pm_ba, bill.review.void, bill.reversal, bill.fraud.auto_reversal (không có BILL_AMOUNT_UPDATE riêng; duyệt hàng loạt/batch không tồn tại).
- Partner: PARTNER_REQUEST_APPROVED, PARTNER_REQUEST_REJECTED.
- Tour: TOUR_BOOKING_CREATED, TOUR_BOOKING_CANCELLED, TOUR_BOOKING_QR_SCANNED (có ghi cả result=FAILED kèm reason, vd WRONG_STORE), TOUR_BOOKING_STOP_CHECKED_IN.
- Analytics công khai (không actor): PROFILE_VIEW_RECORDED, content.hot_video.view, content.hot_video.like.
Các action doc có nhưng code CHƯA có (để BA đánh dấu): QR_EXPIRE_CRON, BOOKING_EXPIRE_CRON_RUN/BOOKING_AUTO_CANCEL_EXPIRED, COMMISSION_UPDATE, POINT_ADJUST, STORE_UPDATE/CAST_UPDATE, ADMIN_ROLE_UPDATE/ACCOUNT_LOCK, EMAIL_RESEND/TELEGRAM_MANUAL_SEND, và mọi *_BATCH.

- Bổ sung vào: **4.2 Phạm vi action cần audit (Bảng 18) — thay bằng danh sách action code thực tế**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:1713` · `backend/src/nightlife-data/nightlife-data.service.ts:1865` · `backend/src/nightlife-data/nightlife-data.service.ts:1948` · `backend/src/nightlife-data/nightlife-data.service.ts:4980`

**2. Audit Ranking theo mô hình RankingConfig (pin rank/manual score/sponsored), không phải reorder danh sách** _(so với RAN-09, Bảng 20 (mục 4.4), Bảng 21 (mục 4.5))_

Ranking trong code không phải danh sách kéo-thả có before_order/after_order như bảng 20. Admin tạo/sửa/xóa từng 'thiết lập xếp hạng' (RankingConfig) cho một Cast hoặc Quán, gồm các trường nghiệp vụ: targetType (CAST/STORE), targetId, cityCode, category, scope, pinRank (vị trí ghim), manualScore (điểm thủ công), sponsored (cờ tài trợ), status, startsAt/endsAt (thời gian hiệu lực). Mỗi thao tác create/update/delete ghi 1 audit log có beforeJson/afterJson snapshot đầy đủ các trường trên + updatedAt, change_summary, entityDisplayCode dạng RC-xxxxxxxx, actorType/actorRole ghi cứng 'ADMIN', actorName = email. Xóa ranking là soft-delete (status DELETED + deletedAt) và cũng được audit. Không có event con theo từng item, không có batch_id, không lưu before_order/after_order.

- Bổ sung vào: **4.4 Audit Log cho Ranking — mô tả lại theo mô hình RankingConfig snapshot before/after**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:1684-1757` · `backend/src/nightlife-data/nightlife-data.service.ts:1856-1893` · `backend/src/nightlife-data/nightlife-data.service.ts:1929-1970` · `backend/src/nightlife-data/nightlife-data.service.ts:15929-15946`

**3. Luồng đổi lịch booking (reschedule) tồn tại và được audit đầy đủ** _(so với BOO-08B, Bảng 18)_

Code cho phép đổi lịch booking thay vì bắt buộc hủy-đặt-lại: (1) khách tự đổi lịch self-service (BOOKING_RESCHEDULED_SELF_SERVICE) với ràng buộc: giờ mới phải trong tương lai, khác giờ cũ, nằm trong khung giờ mở cửa của quán, kèm lý do tùy chọn, gửi thông báo customer.booking.rescheduled.v1 và realtime socket; (2) luồng yêu cầu đổi lịch qua BookingChangeRequest: khách gửi yêu cầu (BOOKING_RESCHEDULE_REQUESTED), admin duyệt (BOOKING_RESCHEDULE_APPROVED) hoặc từ chối kèm ghi chú (BOOKING_RESCHEDULE_REJECTED); mỗi bước đều ghi audit có before/after snapshot và beforeStatus/afterStatus. Điều này mâu thuẫn với BOO-08B ("Không sửa trực tiếp booking cũ — đổi giờ thì hủy và đặt lại").

- Bổ sung vào: **3.F Booking & Notification (BOO-08B) + 4.2 bổ sung nhóm action BOOKING_RESCHEDULE_***
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:12820-12906` · `backend/src/nightlife-data/nightlife-data.service.ts:4587-4592` · `backend/src/nightlife-data/nightlife-data.service.ts:4635-4640` · `backend/src/nightlife-data/nightlife-data.service.ts:12801-12806`

**4. Chính sách hạn hủy booking cấu hình theo từng quán (bookingCancelCutoffMinutes) và được audit** _(so với BOO-08A, Bảng 18)_

Mỗi quán có tham số bookingCancelCutoffMinutes (số phút tối thiểu trước giờ hẹn được phép hủy) do ADMIN hoặc OPERATOR chỉnh qua 2 route PATCH admin|operator/stores/:storeId/booking-policy (role PARTNER không có route này), kiểm quyền theo quán bằng ensureStoreAccess với permission key 'booking.policy.update'; mỗi lần sửa ghi audit BOOKING_POLICY_UPDATED với before/after giá trị cutoff và actorType. Doc BOO-08A chốt cứng 1 giờ toàn hệ thống, không có khái niệm cấu hình theo quán và bảng 18 không có action này.

> Ghi chú kiểm chứng: Sai chi tiết actor: routes là @Roles('OPERATOR','ADMIN') (controller:899-902) và @Roles('ADMIN') (1437-1440) — không phải 'admin/partner'; role PARTNER không qua được RolesGuard. Phần code còn lại (service.ts:4697-4733) và mâu thuẫn với BOO-08A (doc dòng 793-801) đều đúng.

- Bổ sung vào: **3.F Booking (BOO-08A) + 4.2 bổ sung BOOKING_POLICY_UPDATED**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:4697-4733`

**5. Nhóm audit Bill mở rộng: PENDING_PM_BA, void kèm đảo điểm tự động, reversal** _(so với Bảng 18 (BILL_APPROVE/BILL_REJECT), BIL-11, MEM-07C)_

Luồng duyệt bill trong code chi tiết hơn doc và đều có audit: (1) bill.submit — ghi audit ngay khi Member/Partner gửi bill (snapshot submitterType, storeId, bookingId, coupon, tổng tiền, thời gian dùng); (2) bill.coupon.link — audit việc gắn coupon/coupon issue vào bill (nguồn booking hoặc direct); (3) bill.review.pending_pm_ba — khi duyệt bill có hoa hồng ÂM, bill chuyển sang trạng thái chờ PM/BA xác nhận, muốn duyệt tiếp phải confirmNegativeCommission kèm lý do PM/BA bắt buộc; (4) bill.review.approve/reject — audit metadata rất giàu: previousStatus/nextStatus, điểm loyalty, snapshot doanh thu gộp/giảm/thuần/hoa hồng, lý do từ chối; từ chối không lý do bị chặn (khớp TC-AUD-BIL-002); (5) bill.review.void và bill.reversal — admin void/hoàn bill VERIFIED/PAID/PENDING_PM_BA: bill về VOIDED, hoa hồng & điểm về 0, point ledger EARN bị đảo (REVERSED) tự động kèm bản ghi đảo điểm, lưu refundReference — nghĩa là Bill Reversal + đảo điểm TỰ ĐỘNG đã có ở MVP chứ không phải P2 như BIL-11/MEM-07C.

- Bổ sung vào: **3.H Bill, Revenue & Commission + 4.2 nhóm Bill (thêm trạng thái PENDING_PM_BA, rule hoa hồng âm, void/reversal)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:11400-11476` · `backend/src/nightlife-data/nightlife-data.service.ts:8786-8816` · `backend/src/nightlife-data/nightlife-data.service.ts:8947-8995` · `backend/src/nightlife-data/nightlife-data.service.ts:9419-9571`

**6. Phân quyền xem audit thực tế: ADMIN và SUPER_ADMIN ngang quyền, không có phân tầng security log** _(so với Bảng 22 (mục 4.7), TC-AUD-SEC-001)_

API audit (/admin/audit-logs, /admin/audit-logs/:id) chỉ cho role ADMIN và SUPER_ADMIN; RolesGuard cho SUPER_ADMIN vượt qua mọi kiểm tra role nên hai role này xem được toàn bộ log như nhau — không có khái niệm 'security log chỉ Super Admin', không giới hạn phạm vi cho Admin. OPERATOR và PARTNER hoàn toàn không truy cập được API audit (khớp doc phần Partner). Endpoint export audit (GET /admin/qa/audit-trail) cũng mở cho ADMIN, trong khi bảng 22 đề xuất export chỉ dành cho Super Admin.

- Bổ sung vào: **4.7 Phân quyền xem Audit Log — chốt lại theo hiện trạng hoặc yêu cầu dev bổ sung phân tầng**
- Bằng chứng: `backend/src/audit-logs/audit-logs.controller.ts:8-10` · `backend/src/auth/roles.guard.ts:23-28` · `backend/src/nightlife-data/nightlife-data.controller.ts:1924-1935`

### Mô hình dữ liệu (Prisma schema)

**1. Coupon theo quán + phát hành QR coupon độc lập ngoài booking (Coupon, CouponIssue)** _(so với FLOW B, mục 7 (Lấy coupon/QR độc lập ngoài booking))_

Code có hệ thống coupon riêng của từng quán: model Coupon (mã, loại giảm PERCENT/FIXED_AMOUNT, giá trị giảm, mức giảm tối đa max_discount_vnd, chi tiêu tối thiểu min_spend_vnd, giới hạn lượt dùng usage_limit/used_count, thời gian hiệu lực, trạng thái DRAFT/ACTIVE/PAUSED/EXPIRED/ARCHIVED/DELETED) và CouponIssue - từng lượt phát hành coupon dạng QR cho Guest hoặc Member (code + qr_payload_hash, trạng thái ISSUED/USED/EXPIRED/REVOKED, hạn dùng, người phát, người scan). Có luồng thật: khách guest/member "claim" coupon, Partner scan coupon-issue, Admin thu hồi/xoay QR coupon. Điều này mâu thuẫn với FLOW B và mục 7 của tài liệu (đã chốt "không còn coupon/QR độc lập ngoài booking trong MVP"). Ngoài ra Booking/Bill có thể gắn coupon_issue_id (booking dùng coupon).

- Bổ sung vào: **3.G Membership, Point, Booking QR + mục 5 FLOW B + mục 6 Bảng 23 (thêm entity Coupon/CouponIssue)**
- Bằng chứng: `backend/prisma/schema.prisma:774-834` · `backend/prisma/schema.prisma:158-185` · `backend/prisma/schema.prisma:634-635` · `backend/src/nightlife-data/nightlife-data.controller.ts:403`

**2. Hệ Tour đêm hoàn chỉnh: Tour, TourStop, TourBooking, TourBookingQr, TourBookingCheckIn** _(so với CON-03 (P2), Bảng 23)_

Code triển khai đầy đủ nghiệp vụ tour: Tour (tiêu đề, thành phố mặc định Hà Nội, thời lượng giờ, price_tier, lịch khởi hành departure_times/departure_schedule, thứ hạng trang chủ home_rank), TourStop (các quán trong tour theo thứ tự), TourBooking (mã booking riêng 15 ký tự, snapshot hành trình/itinerary, trạng thái REQUESTED/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED/NO_SHOW), một QR tour dùng nhiều điểm (TourBookingQr: ACTIVE/COMPLETED/EXPIRED/REVOKED, valid_from/expires_at) và TourBookingCheckIn ghi nhận check-in tại từng quán (idempotency_key chống trùng, source mặc định ONLINE). Mỗi TourBooking sinh các Booking con theo từng quán (Booking có tour_booking_id, tour_stop_id, tour_stop_order). Có API thật cho guest/member đặt tour và Partner scan QR tour. Tài liệu xếp Tour ở CON-03 là P2 "Phase sau" và Bảng 23 không có entity tour nào.

- Bổ sung vào: **Mục mới 3.K hoặc nhóm riêng "Tour & Tour Booking" + mục 5 (flow tour) + mục 6 Bảng 23**
- Bằng chứng: `backend/prisma/schema.prisma:116-130` · `backend/prisma/schema.prisma:1395-1510` · `backend/prisma/schema.prisma:636-638` · `backend/src/nightlife-data/nightlife-data.controller.ts:420`

**3. Yêu cầu đổi lịch booking trong hệ thống (BookingChangeRequest)** _(so với BOO-08B, BOO-08C)_

Tài liệu chốt BOO-08B "không sửa trực tiếp booking cũ - đổi thì hủy và đặt lại hoặc liên hệ hỗ trợ", nhưng code có luồng đổi lịch (reschedule) trong hệ thống: BookingChangeRequest loại RESCHEDULE với trạng thái REQUESTED/APPROVED/REJECTED/CANCELLED/EXPIRED, lưu giờ hẹn hiện tại/giờ đề nghị, lý do của khách, ghi chú admin (admin_note), người duyệt và thời điểm duyệt. Guest và Member đều gửi được yêu cầu; Admin và Operator có màn duyệt riêng. Đây là tính năng nghiệp vụ lớn chưa có trong tài liệu.

- Bổ sung vào: **3.F Booking & Notification (thêm BOO mới về reschedule) + mục 6 Bảng 23**
- Bằng chứng: `backend/prisma/schema.prisma:132-142` · `backend/prisma/schema.prisma:710-745` · `backend/src/nightlife-data/nightlife-data.controller.ts:442` · `backend/src/nightlife-data/nightlife-data.controller.ts:974`

**4. Booking có 6 trạng thái thay vì 3** _(so với BOO-06, Bảng 24 (field status))_

Tài liệu BOO-06 chốt 3 trạng thái booking (Mới/Đã hủy/Hoàn tất), nhưng enum BookingStatus trong code có 6: REQUESTED, CONFIRMED (đã xác nhận), CHECKED_IN (khách đã đến quán), COMPLETED, CANCELLED, NO_SHOW (khách không đến). Admin có API đổi trạng thái booking bất kỳ. Tài liệu cần cập nhật vòng đời booking đầy đủ, đặc biệt hai trạng thái trung gian CONFIRMED/CHECKED_IN và trạng thái NO_SHOW.

- Bổ sung vào: **3.F Booking & Notification (BOO-06) + mục 6.1**
- Bằng chứng: `backend/prisma/schema.prisma:100-107` · `backend/src/nightlife-data/nightlife-data.controller.ts:1607`

**5. Bill có 7 trạng thái và quy trình duyệt nhiều bước (review → verify → paid/void)** _(so với BIL-03, BIL-04, BIL-11)_

Tài liệu chỉ mô tả bill Pending → Admin duyệt/từ chối (BIL-03/BIL-04), nhưng enum BillStatus có 7 trạng thái: DRAFT, SUBMITTED, PENDING_PM_BA (chờ duyệt cấp PM/BA - bước duyệt thứ hai), VERIFIED, REJECTED, PAID (đã chi trả), VOIDED (vô hiệu hóa bill). Bill lưu 3 vai trò duyệt tách biệt (reviewed_by, verified_by, rejected_by) kèm mốc thời gian từng bước và paid_at/paid_vnd. Ngoài ra có các luồng admin thật: duyệt bill nhạy cảm (sensitive-bills), xác nhận hoa hồng âm, void bill, đảo bill tự động (auto-reverse) và đảo bill do gian lận (fraud-reversal) - trong khi tài liệu xếp Bill Reversal tự động ở P2.

- Bổ sung vào: **3.H Bill, Revenue & Commission + mục 6 Bảng 23 (entity Bill)**
- Bằng chứng: `backend/prisma/schema.prisma:187-195` · `backend/prisma/schema.prisma:836-897` · `backend/src/nightlife-data/nightlife-data.controller.ts:1459-1585` · `backend/src/nightlife-data/nightlife-data.controller.ts:1885-1915`

**6. Hạn hủy booking cấu hình được theo từng quán (booking_cancel_cutoff_minutes)** _(so với BOO-08A)_

Tài liệu BOO-08A chốt cứng "hủy trước giờ hẹn tối thiểu 01 giờ", nhưng code cho phép mỗi quán có hạn hủy riêng: Store.booking_cancel_cutoff_minutes mặc định 60 phút, Admin và Operator có API chỉnh "booking-policy" của từng quán. Tài liệu cần chuyển rule 1 giờ thành giá trị mặc định có thể cấu hình theo quán, và bổ sung quyền chỉnh policy này.

- Bổ sung vào: **3.F Booking & Notification (BOO-08A)**
- Bằng chứng: `backend/prisma/schema.prisma:525` · `backend/src/nightlife-data/nightlife-data.controller.ts:902-917` · `backend/src/nightlife-data/nightlife-data.controller.ts:1440-1457`

**7. Hạng khách có thêm bậc PREMIUM (FREE/MEMBER/PREMIUM/VIP)** _(so với MEM-02, Bảng 3)_

Tài liệu MEM-02 chốt hạng khách v1 chỉ gồm Guest/Member/VIP, nhưng enum UserTier trong code có 4 bậc: FREE, MEMBER, PREMIUM, VIP. Trong logic nghiệp vụ, PREMIUM được đối xử như VIP (ví dụ khi xét quyền lợi/mức giảm: điều kiện tier === 'VIP' || tier === 'PREMIUM'). BA cần chốt PREMIUM là hạng chính thức (điều kiện lên hạng, mức giảm, thời hạn QR) hay gộp về VIP.

- Bổ sung vào: **1.2 Hạng khách và mức giảm + 3.G MEM-02**
- Bằng chứng: `backend/prisma/schema.prisma:18-23` · `backend/src/nightlife-data/nightlife-data.service.ts:10838` · `backend/src/nightlife-data/nightlife-data.service.ts:19917` · `backend/src/users/users.service.ts:339-340`

### Frontend (các trang & trải nghiệm thực tế)

**1. Coupon/ưu đãi độc lập ngoài booking (trang Ưu đãi + Ví ưu đãi)** _(so với FLOW B, MEM-03)_

Code có hệ coupon đứng độc lập với booking, mâu thuẫn với FLOW B ('không còn coupon/QR độc lập trong MVP'): trang /uu-dai liệt kê coupon public theo quán, Guest 'Lấy mã' bằng SĐT (tên/email tùy chọn), Member claim 1 chạm; mã đã lấy nằm trong Ví ưu đãi /vi-uu-dai (trang /chi-tiet-ma redirect về đây) với QR riêng từng mã. Coupon có loại giảm PERCENT hoặc FIXED_AMOUNT, trần giảm (maxDiscountVnd), chi tiêu tối thiểu (minSpendVnd), giới hạn lượt dùng (usageLimit/usedCount), thời gian hiệu lực; trạng thái phát hành: ISSUED/USED/EXPIRED/REVOKED. Coupon đã claim có thể gắn vào booking (couponId/couponIssueId trong payload đặt chỗ) và vào bill khi gửi hóa đơn.

- Bổ sung vào: **3.G Membership, Point, Booking QR + mục 5 FLOW B**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/coupons.ts:70-95` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/coupons.ts:24-31` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/vi-uu-dai/page.tsx:158` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:212-225`

**2. Booking có 6 trạng thái hệ thống, gộp hiển thị thành 3 nhóm** _(so với BOO-06)_

Trạng thái booking thực tế: REQUESTED, CONFIRMED (Admin đã xác nhận), CHECKED_IN (đã đến quán), COMPLETED, CANCELLED, NO_SHOW (khách không đến). UI gộp thành 3 nhóm 'Mới / Hoàn tất / Đã hủy' cho khách, kèm nhãn 'Đã qua giờ' khi booking mở đã quá giờ hẹn. Tài liệu BOO-06 chốt chỉ 3 trạng thái (Mới/Đã hủy/Hoàn tất) — cần cập nhật mô hình trạng thái đầy đủ (đặc biệt CONFIRMED, CHECKED_IN, NO_SHOW).

- Bổ sung vào: **3.F Booking & Notification (BOO-06) + mục 6.1**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:3-5` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:387-415`

**3. Tính năng đổi lịch booking (reschedule) qua Admin duyệt** _(so với BOO-08B)_

Khách (Member lẫn Guest) gửi yêu cầu đổi lịch thay vì hủy-đặt-lại: chọn ngày giờ mới (phải khác lịch hiện tại, trong khung giờ mở cửa quán), lý do bắt buộc 5-300 ký tự; Guest xác thực bằng SĐT. Tạo BookingChangeRequest (type RESCHEDULE; status REQUESTED/APPROVED/REJECTED/CANCELLED/EXPIRED) để Admin duyệt/từ chối kèm ghi chú qua /admin/booking-change-requests. Điều kiện thời gian dùng chung với hủy nhưng KHÔNG cố định 1 giờ: theo bookingCancelCutoffMinutes cấu hình từng quán (30/60/120 phút, mặc định 60) — lich-su-dat-cho/page.tsx:1259 canReschedule = cancelAllowed (dựa trên canCancelBooking). Mâu thuẫn trực tiếp với BOO-08B 'Không sửa trực tiếp booking cũ; đổi giờ thì hủy và đặt lại'.

> Ghi chú kiểm chứng: Hiệu chỉnh chi tiết: mốc 'tối thiểu 1 giờ' chỉ là mặc định; điều kiện đổi lịch dùng đúng cutoff cấu hình theo quán như hủy (xem phát hiện 11). Phần còn lại xác nhận đúng.

- Bổ sung vào: **3.F Booking & Notification (thay thế/điều chỉnh BOO-08B)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:245-287` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:618-648` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/lich-su-dat-cho/page.tsx:66-72` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/lich-su-dat-cho/page.tsx:250-305`

**4. Giới hạn form booking khác tài liệu: tối đa 50 khách, cửa sổ đặt 14 ngày** _(so với BOO-03)_

Giới hạn thực tế của form booking: số người 1-50 (tài liệu BOO-03 chốt max 20 — mâu thuẫn); ngày đến chỉ chọn từ hôm nay đến 14 ngày tới (tài liệu không có cửa sổ ngày); họ tên 2-80 ký tự chỉ chữ và khoảng trắng; ghi chú tối đa 300 ký tự; SĐT (tùy chọn) 8-15 chữ số; khung giờ đến sinh tự động từ giờ mở cửa của quán. Form hiển thị cam kết 'Không thanh toán online, không thu cọc' và 'Miễn phí · mã QR gửi qua email sau khi đặt'.

- Bổ sung vào: **3.F Booking & Notification (BOO-03) + mục 6.1**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/booking-validation.ts:3-13` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/booking-validation.ts:104-135` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/dat-cho/page.tsx:1027` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/dat-cho/page.tsx:1059`

**5. Tour nightlife hoạt động đầy đủ như tính năng chính thức (doc xếp P2)** _(so với CON-03)_

Tour đã chạy end-to-end trên web: trang /tour liệt kê tour theo thành phố (tiêu đề, thời lượng giờ, hạng giá, giờ khởi hành/lịch khởi hành, nhiều điểm dừng là các quán kèm coupon và cast từng điểm); trang chi tiết /tour/[id] cho đặt tour (guest + member) với chọn cast theo từng điểm dừng; booking tour sinh QR tour riêng; Partner quét '/partner/tour-booking-qrs/scan' và xác nhận check-in từng chặng (có tiến độ checkedIn/total); Admin có màn quản trị Tour riêng; trang chủ có khối tour; /su-kien (sự kiện) hiện redirect về /tour. Tài liệu CON-03 xếp tour ở P2 'Phase sau' và không có nghiệp vụ tour booking/QR tour.

- Bổ sung vào: **Mục mới 3.x Tour & Sự kiện (nâng từ CON-03 P2 lên hiện trạng P0)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/tours.ts:64-90` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:596-601` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:113-137` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/partner/page.tsx:2345`

## PHẦN 2 — TÍNH NĂNG/QUY TẮC CODE CÓ NHƯNG TÀI LIỆU HOÀN TOÀN KHÔNG NHẮC (72 mục)

_Các tính năng đã chạy thật trong code mà tài liệu không có dòng nào._

### Xác thực, tài khoản & phân quyền

**1. Quy tắc mật khẩu: 8-72 ký tự, bắt buộc chữ hoa + chữ thường + số**

Mật khẩu khi đăng ký và khi đặt lại mật khẩu phải dài 8-72 ký tự và chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số. Tên hiển thị (displayName) 2-80 ký tự, chỉ gồm chữ và khoảng trắng. Số điện thoại 8-20 ký tự theo định dạng số/+/-/(). Tài liệu không có bất kỳ quy tắc mật khẩu hay ràng buộc trường hồ sơ nào.

- Bổ sung vào: **3.G Membership (quy tắc tài khoản/mật khẩu)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/src/auth/dto/register.dto.ts (password @MinLength(8) @MaxLength(72) @Matches)` · `D:/laragon/www/NightLife-VN/backend/src/auth/dto/password-reset.dto.ts (ResetPasswordDto.password)` · `D:/laragon/www/NightLife-VN/backend/src/auth/dto/update-profile.dto.ts`

**2. Luồng quên mật khẩu 3 bước, chỉ dành cho tài khoản Member, thu hồi toàn bộ phiên sau khi đổi**

Quên mật khẩu gồm 3 bước: (1) yêu cầu mã - hệ thống gửi email mã xác nhận 6 số, hiệu lực 15 phút, mã mới sinh ra sẽ vô hiệu mọi mã cũ; (2) xác thực mã - nhận về resetToken dùng một lần; (3) đặt mật khẩu mới kèm xác nhận trùng khớp. Quy tắc nghiệp vụ quan trọng: chức năng quên mật khẩu CHỈ áp dụng cho tài khoản khách (role USER/Member); tài khoản Admin/Operator/Partner/Staff bị từ chối ('Password reset is only available for user accounts'). Sau khi đổi mật khẩu thành công, TẤT CẢ phiên đăng nhập đang hoạt động của tài khoản bị thu hồi (phải đăng nhập lại). Tài liệu hoàn toàn không nhắc luồng quên mật khẩu.

- Bổ sung vào: **3.G Membership (thêm mục Quên mật khẩu) + 3.L Notification (email mã đặt lại mật khẩu)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:476-618` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:1009-1015` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:1059-1061` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.controller.ts:100-137`

**3. Đăng nhập Google cho Member (tự tạo tài khoản)**

Hệ thống hỗ trợ đăng nhập Google cho khách: xác minh credential/access token với Google, yêu cầu email đã được Google xác minh; nếu email chưa có tài khoản thì tự động tạo tài khoản Member mới (tier MEMBER); nếu email đã có tài khoản nhưng không phải role Member (ví dụ là Partner/Admin) thì từ chối ('This Google account is not a member account'); tài khoản không ACTIVE cũng bị từ chối. Tài liệu không nhắc đăng nhập mạng xã hội nào.

- Bổ sung vào: **3.G Membership (MEM-01: bổ sung kênh đăng nhập Google)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:290-325` · `D:/laragon/www/NightLife-VN/backend/src/users/users.service.ts:296-313` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.controller.ts:152-172`

**4. Đăng nhập LINE (LINE Login OAuth) cho Member, có email fallback khi LINE không cấp email**

Hệ thống có luồng đăng nhập LINE hoàn chỉnh (khác với kênh hỗ trợ LINE OA ở BOO-08C): chuyển hướng sang LINE với scope 'profile openid email', xác thực state/nonce chống giả mạo, sau đó tự tạo tài khoản Member nếu email chưa tồn tại. Quy tắc: nếu LINE không trả về email (người dùng không cấp quyền), hệ thống sinh email nội bộ dạng 'line-<id>@line.vietyoru.local' để vẫn tạo được tài khoản; chỉ tài khoản role Member mới được đăng nhập bằng LINE; tài khoản không ACTIVE bị từ chối; đăng nhập LINE thành công sẽ set cookie phiên 24 giờ và điều hướng về trang trước đó (mặc định /tai-khoan). Có tài liệu kỹ thuật riêng docs/line-login-setup.md (callback URL, trang xin quyền email /line-email-consent).

- Bổ sung vào: **3.G Membership (MEM-01: bổ sung kênh đăng nhập LINE) + 3.K (trang xin quyền email LINE /line-email-consent)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:327-458` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:899-991` · `D:/laragon/www/NightLife-VN/backend/src/users/users.service.ts:315-332` · `D:/laragon/www/NightLife-VN/docs/line-login-setup.md`

**5. Quản lý nhân viên quán (Partner Staff) - tính năng hoàn chỉnh chưa có trong tài liệu**

Partner (hoặc Admin) quản lý được danh sách nhân viên của quán mình: tạo tài khoản nhân viên (role STAFF) gắn với quán (email, mật khẩu tối thiểu 8 ký tự, tên, SĐT), hoặc liên kết nhân viên STAFF sẵn có vào quán; quyền của nhân viên chỉ được chọn trong 2 quyền: quét QR (coupon.scan) và xác nhận check-in (checkin.confirm) - mặc định cấp cả hai; cập nhật quyền từng nhân viên; gỡ nhân viên khỏi quán thì quyền chuyển INACTIVE và TÀI KHOẢN nhân viên cũng bị chuyển INACTIVE (không đăng nhập được nữa). Không thể gán một người có role khác STAFF làm nhân viên. Tài liệu 3.I chỉ nói 'tài khoản đối tác' chung, không có khái niệm tài khoản nhân viên quán.

- Bổ sung vào: **3.I Partner Registration & Approval (thêm PAR-xx: Quản lý tài khoản nhân viên quán)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/src/partner-staff/partner-staff.service.ts:11-12` · `D:/laragon/www/NightLife-VN/backend/src/partner-staff/partner-staff.service.ts:73-168` · `D:/laragon/www/NightLife-VN/backend/src/partner-staff/partner-staff.service.ts:222-261` · `D:/laragon/www/NightLife-VN/backend/src/partner-staff/partner-staff.controller.ts:29-91`

**6. Đăng nhập tách theo cổng (portal): member / partner / admin / operator với ràng buộc role**

Ngoài endpoint đăng nhập chung, hệ thống có 4 cổng đăng nhập riêng với quy tắc: cổng Member chỉ chấp nhận role USER; cổng Partner chấp nhận PARTNER và STAFF (nhân viên quán dùng chung cổng partner); cổng Admin chấp nhận OPERATOR, ADMIN, SUPER_ADMIN; cổng Operator chỉ OPERATOR. Tài khoản sai loại bị từ chối với thông báo rõ: cổng partner/admin trả 'This account cannot access the ... portal', cổng member/operator trả 'This account is not a USER/OPERATOR account'. Tài liệu chưa mô tả việc mỗi loại người dùng có cổng đăng nhập riêng và role nào được vào cổng nào.

> Ghi chú kiểm chứng: Cấu trúc 4 cổng và ràng buộc role đúng hoàn toàn (auth.controller.ts: /auth/login/member chỉ USER, /auth/login/partner PARTNER+STAFF, /auth/login/admin OPERATOR+ADMIN+SUPER_ADMIN, /auth/login/operator chỉ OPERATOR; ngoài ra còn /auth/login chung). Doc không có nội dung này. Chi tiết cần sửa: thông báo 'This account cannot access the ... portal' chỉ dùng cho cổng partner và admin (loginForPortal, auth.service.ts:286-289); cổng member và operator dùng loginAs nên thông báo là 'This account is not a USER/OPERATOR account' (auth.service.ts:269-271).

- Bổ sung vào: **3.J Admin CMS / 3.I Partner / 3.G Membership (thêm mục Luồng đăng nhập theo portal)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/src/auth/auth.controller.ts:139-150` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.controller.ts:223-272` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:252-288`

**7. Cô lập phiên theo 4 tên miền/portal với bộ cookie riêng cho từng portal**

Frontend chạy 4 host riêng: web public, partner.<domain>, admin.<domain> và auth.<domain> (trang đăng nhập tập trung). Phiên của từng portal được lưu bằng bộ cookie có tiền tố riêng: admin_ (cho Operator/Admin/Super Admin), partner_ (cho Partner/Staff), không tiền tố (cho Member) - nên đăng nhập admin không ảnh hưởng phiên member và ngược lại. Middleware chặn truy cập chéo: vào trang /admin trên host public sẽ bị chuyển sang host admin; host admin/partner yêu cầu đúng role, không đúng thì chuyển về trang đăng nhập tập trung; đăng xuất chỉ xóa bộ cookie của portal tương ứng. Tài liệu không có nội dung về kiến trúc portal và cô lập phiên này.

- Bổ sung vào: **3.J Admin CMS (mục mới: Kiến trúc portal & cô lập phiên đăng nhập)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/middleware.ts:20-38` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/middleware.ts:184-217` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/auth/hosts.ts:1-52` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:670-687`

**8. Chính sách một phiên duy nhất cho tài khoản đặc quyền (Admin/Operator/Partner/Staff)**

Các role SUPER_ADMIN, ADMIN, OPERATOR, PARTNER, STAFF chỉ được phép có MỘT phiên đăng nhập hoạt động tại một thời điểm: khi đăng nhập từ trình duyệt/thiết bị khác, toàn bộ phiên cũ bị thu hồi ngay (lý do lưu 'LOGIN_FROM_ANOTHER_BROWSER'); phiên cũ khi gọi API sẽ nhận lỗi mã SESSION_REPLACED với thông báo 'Tài khoản đã được đăng nhập trên trình duyệt hoặc thiết bị khác.'; kết nối socket (chat hỗ trợ) của phiên cũ cũng bị tự động ngắt trong vòng ~15 giây nhờ cơ chế quét định kỳ. Tài khoản Member (USER) được phép nhiều phiên song song. Nếu role của tài khoản bị thay đổi giữa phiên, mọi token cũ bị từ chối với mã SESSION_ROLE_CHANGED ('Quyền tài khoản đã thay đổi. Vui lòng đăng nhập lại.'). Tài liệu không có quy định nào về số phiên đồng thời.

- Bổ sung vào: **3.J Admin CMS (mục mới: Chính sách phiên đăng nhập tài khoản đặc quyền) + 3.M Audit (liên quan truy vết phiên)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/src/auth/session-policy.ts:1-20` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:712-735` · `D:/laragon/www/NightLife-VN/backend/src/auth/jwt.strategy.ts:56-69` · `D:/laragon/www/NightLife-VN/backend/src/support-chat/support-chat.gateway.ts:118-127`

**9. Vòng đời phiên đăng nhập: token 24 giờ, không có refresh token, logout thu hồi token, phiên lưu IP/user-agent**

Mỗi lần đăng nhập tạo một bản ghi phiên server-side (UserSession) lưu jti, user-agent, địa chỉ IP, thời điểm hoạt động cuối (lastSeenAt) và hạn phiên. Access token JWT có hạn mặc định 24 giờ (cấu hình JWT_EXPIRES_IN); KHÔNG có cơ chế refresh token - hết hạn phải đăng nhập lại. Mọi request đều kiểm tra: tài khoản còn ACTIVE, phiên còn ACTIVE và chưa hết hạn, token không nằm trong danh sách thu hồi (blacklist). Logout đưa token vào blacklist và thu hồi phiên (đăng xuất thật sự phía server, không chỉ xóa cookie). Dữ liệu phiên (IP, user-agent, lastSeenAt, lý do thu hồi) là nguồn phục vụ điều tra/audit. Tài liệu không đặc tả thời hạn phiên, logout hay dữ liệu phiên.

- Bổ sung vào: **Mục 6 Dữ liệu chính (thêm entity User Session / Token Blacklist) + 3.G (thời hạn đăng nhập)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:620-668` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:689-749` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:1258-1261` · `D:/laragon/www/NightLife-VN/backend/src/auth/jwt.strategy.ts:45-111`

**10. Rate limit chống dò mật khẩu/spam OTP trên toàn bộ API xác thực**

Toàn bộ API auth chịu giới hạn 60 request/phút/IP. Giới hạn riêng theo cửa sổ 15 phút: đăng nhập (mọi cổng member/partner/admin/operator) 20 lần/IP và 5 lần/email; xin OTP đăng ký 5 lần/IP và 3 lần/email; đăng ký (xác thực OTP) 10 lần/IP và 5 lần/email; yêu cầu mã quên mật khẩu 5/IP + 3/email; xác thực mã 10/IP + 5/email; hoàn tất đổi mật khẩu 10/IP + 5/email; đăng nhập Google 20/IP; đăng nhập LINE 30/IP. Vượt giới hạn trả về lỗi 429 với thông báo 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' kèm thời gian chờ (Retry-After). Đây là chính sách bảo mật ảnh hưởng trực tiếp trải nghiệm người dùng nhưng tài liệu không nhắc.

- Bổ sung vào: **Mục mới về chính sách bảo mật (hoặc phụ lục Security Policy trong 3.J/9 Acceptance Criteria)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/src/auth/auth.controller.ts:48-56` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.controller.ts:63-133` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.controller.ts:141-263` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth-rate-limit.guard.ts:38-174`

**11. Quản trị tài khoản người dùng trong Admin CMS: tạo/sửa/đổi mật khẩu hộ/vô hiệu hóa/khôi phục/xóa vĩnh viễn**

[partial vs 4.2 (ADMIN_ROLE_UPDATE/ACCOUNT_LOCK, PARTNER_APPROVE)] Admin CMS có màn quản lý tài khoản đầy đủ mà tài liệu mới chỉ nhắc gián tiếp dưới dạng action cần audit ('Tạo admin, đổi role, khóa tài khoản', 'tạo/deactivate partner account') chứ chưa đặc tả thành tính năng: liệt kê + tìm kiếm + lọc theo role/trạng thái; tạo tài khoản với role bất kỳ (USER/PARTNER/OPERATOR/STAFF/ADMIN) - không nhập mật khẩu thì dùng mật khẩu mặc định '12345678aA@'; khi tạo Partner/Staff có thể gán ngay vào quán; đổi mật khẩu hộ; vô hiệu hóa (xóa mềm); khôi phục; xóa vĩnh viễn (hard delete). Kéo theo quy tắc: người dùng KHÔNG tự đăng ký được tài khoản Partner/Admin/Operator/Staff - đăng ký công khai luôn ra Member.

> Ghi chú kiểm chứng: Không hoàn toàn 'missing': mục 4.2 của tài liệu đã nhắc các thao tác này dưới dạng action cần audit - 'Tạo admin, đổi role, khóa tài khoản' (ADMIN_ROLE_UPDATE/ACCOUNT_LOCK, dòng 1747-1751) và 'tạo/deactivate partner account' (PARTNER_APPROVE/REJECT, dòng 1741). Tức doc có dấu vết tính năng nhưng chỉ ở góc độ audit, không đặc tả màn hình/luồng/quy tắc. Code chi tiết hơn nhiều và đều được xác nhận: admin-users.controller.ts:65-131 (list/search/filter, tạo với role bất kỳ, mật khẩu mặc định '12345678aA@' ở dòng 91, đổi mật khẩu hộ, DELETE mềm, restore, DELETE /:id/hard); users.service.ts:221-294 (gán quán ngay khi tạo Partner/Staff), 439-459 (soft delete/restore/hard delete); đăng ký công khai luôn ra role USER (register không truyền role, default 'USER'). UI admin gọi đủ endpoint (lib/api/admin-users.ts). Nên chuyển nhãn thành [partial vs mục 4.2].

- Bổ sung vào: **3.J Admin CMS (thêm ADM-xx: Quản lý tài khoản người dùng)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/src/users/admin-users.controller.ts:19-131` · `D:/laragon/www/NightLife-VN/backend/src/users/users.service.ts:221-294` · `D:/laragon/www/NightLife-VN/backend/src/users/users.service.ts:439-459` · `D:/laragon/www/NightLife-VN/backend/src/users/users.service.ts:461-535`

**12. Mỗi tài khoản Partner chỉ gắn với một quán chính; đổi quán sẽ tự gỡ liên kết và quyền ở quán cũ**

Khi Admin gán quán cho tài khoản Partner (lúc tạo hoặc cập nhật hồ sơ), hệ thống tự động: tạo PartnerAccount nếu chưa có; gỡ liên kết chủ sở hữu và vô hiệu quyền ở mọi quán cũ; gắn quán mới kèm 4 quyền chuẩn của partner (xem thông tin quán, xem booking, xem bill, quét QR). Logic phạm vi truy cập chỉ trả về MỘT quán chính cho mỗi partner - tức mô hình hiện tại là 1 partner : 1 quán. Với tài khoản Staff tương tự: đổi quán sẽ tắt quyền ở quán cũ. Tài liệu 3.I không mô tả quan hệ tài khoản đối tác - quán và quy tắc chuyển quán.

- Bổ sung vào: **3.I Partner Registration & Approval (quan hệ tài khoản đối tác - quán)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/src/users/users.service.ts:82-192` · `D:/laragon/www/NightLife-VN/backend/src/users/users.service.ts:252-289` · `D:/laragon/www/NightLife-VN/backend/src/access/access.service.ts:321-354 (getPartnerStoreIds trả về 1 quán chính)`

**13. Tự quản lý tài khoản: đổi mật khẩu (yêu cầu mật khẩu cũ) và cập nhật hồ sơ/đổi email**

Người dùng đã đăng nhập có thể: (1) đổi mật khẩu - bắt buộc nhập đúng mật khẩu cũ, sai báo 'Mật khẩu cũ không chính xác', mật khẩu mới 8-72 ký tự; (2) cập nhật hồ sơ gồm tên hiển thị, email, số điện thoại - đổi email phải là email chưa có tài khoản khác sử dụng và đúng định dạng. Tài liệu chỉ nói chung 'hồ sơ' trong mục 6 mà không đặc tả các thao tác tự phục vụ này.

- Bổ sung vào: **3.G Membership (thêm mục Quản lý hồ sơ & đổi mật khẩu)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/src/users/users.controller.ts:39-49` · `D:/laragon/www/NightLife-VN/backend/src/users/users.service.ts:48-79` · `D:/laragon/www/NightLife-VN/backend/src/users/users.service.ts:207-219` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.controller.ts:283-293`

### Quán, Cast, Tìm kiếm & Ranking

**1. Entity Khu vực (Area) chi tiết đến quận/phường và tự suy ra khu vực từ địa chỉ quán**

Hệ thống có danh mục Khu vực (Area) với mã code dạng {cityCode}-{khu}, tên, thành phố, quận, phường; API public GET /areas trả danh sách khu vực đang ACTIVE theo thành phố. Khi Admin tạo/sửa quán, hệ thống TỰ ĐỘNG suy ra khu vực từ địa chỉ: khớp tên phường trước, rồi tên quận, rồi khu vực 'tổng hợp' của tỉnh, cuối cùng fallback khu vực đầu tiên của thành phố. Trường 'ward' (phường) nhập riêng sẽ được gộp vào chuỗi địa chỉ. Tài liệu chưa có khái niệm khu vực con trong thành phố hay quy tắc tự gán khu vực.

- Bổ sung vào: **3.B Search, Filter & Discovery + mục 6 (Partner/Store data model)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:1319-1344` · `backend/src/nightlife-data/nightlife-data.service.ts:22830-22883` · `backend/src/nightlife-data/nightlife-data.service.ts:22894-22900`

**2. Kết quả tìm kiếm/danh sách có chế độ sắp xếp theo ranking (sort=priority)**

Ngoài trang Ranking, danh sách quán/cast public có chế độ sort=priority (alias 'ranking'): item được ghim (pinRank) đứng trước theo thứ hạng, tiếp theo là điểm manualScore giảm dần, rồi theo ngày tạo. Nghĩa là cấu hình ranking của Admin ảnh hưởng trực tiếp thứ tự hiển thị ở trang tìm kiếm/danh sách chứ không chỉ ở trang xếp hạng. Tài liệu chưa đề cập việc ranking chi phối thứ tự tìm kiếm.

- Bổ sung vào: **3.B Search, Filter & Discovery + 3.C Ranking**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:15846-15916` · `backend/src/nightlife-data/nightlife-data.service.ts:2570-2582` · `backend/src/nightlife-data/nightlife-data.service.ts:2140-2152`

**3. Vòng đời trạng thái Quán và Cast chưa được đặc tả**

Store có 6 trạng thái: DRAFT, PENDING_REVIEW, ACTIVE, SUSPENDED, CLOSED, DELETED. Cast có 6 trạng thái: DRAFT, PENDING_REVIEW, ACTIVE, OFF_DUTY, SUSPENDED, DELETED, cộng thêm cờ isPublic riêng. Chỉ quán ACTIVE mới hiển thị public; cast phải đồng thời ACTIVE + isPublic + thuộc quán ACTIVE mới hiển thị/được chọn vào ranking. Cast tạo mới mặc định DRAFT (isPublic mặc định true). Tài liệu chỉ nói chung 'Admin kiểm duyệt trước khi public' (CAS-11) và 'trạng thái hợp tác' (mục 6), không liệt kê máy trạng thái này.

- Bổ sung vào: **3.D Store Detail, 3.E Cast Profile + mục 6 (data model Store/Cast)**
- Bằng chứng: `backend/prisma/schema.prisma:82-98` · `backend/src/nightlife-data/nightlife-data.service.ts:2445-2448` · `backend/src/nightlife-data/nightlife-data.service.ts:2593-2603` · `backend/src/nightlife-data/nightlife-data.service.ts:22513-22514`

**4. Chính sách xóa mềm / khôi phục / xóa cứng quán & cast; quyền Super Admin**

Xóa quán/cast mặc định là xóa mềm (DELETED + deletedAt); quán có API khôi phục (restore về ACTIVE, đồng bộ lại quyền truy cập của tài khoản đối tác); danh sách admin có includeDeleted. Xóa CỨNG chỉ dành cho SUPER_ADMIN và với quán sẽ cascade xóa vĩnh viễn toàn bộ dữ liệu liên quan (quyền store, cấu hình hoa hồng, chat booking, yêu cầu đổi lịch, Booking QR, bill, booking, coupon + lượt phát hành, cast + favorite của member). Chính sách xóa mềm/khôi phục/xóa cứng này hoàn toàn chưa có trong tài liệu. Lưu ý: vai trò Super Admin không hoàn toàn vắng mặt trong doc - mục 4.4/4.7 và AC audit log có nhắc Super Admin trong phân quyền XEM audit - nhưng doc chưa hề gán cho Super Admin quyền xóa cứng dữ liệu, và bảng phân quyền chức năng ADM-12 chỉ có Admin/Operator/Partner.

> Ghi chú kiểm chứng: Code đúng hoàn toàn: deleteAdminStore soft mặc định + hard chỉ SUPER_ADMIN với cascade thủ công đủ các bảng như mô tả (23080-23163), restoreAdminStore về ACTIVE + syncStorePartnerAccess (23165-23190), deleteAdminCast hard chỉ SUPER_ADMIN (22803-22818), includeDeleted trong AdminStoreQueryDto (116-118), route DELETE /admin/stores/:id?hard=true và PATCH /admin/stores/:id/restore có thật. NHƯNG vế 'Vai trò Super Admin chưa có trong tài liệu' không chính xác: doc CÓ nhắc Super Admin ở mục 4.4 (actor_role 'Super Admin / Admin / Operator'), bảng 4.7 phân quyền xem Audit Log và AC 'log security chỉ Super Admin xem' - chỉ là trong ngữ cảnh audit log, còn ADM-12 không liệt kê.

- Bổ sung vào: **3.J Admin CMS & Dashboard (ADM-02/ADM-03/ADM-12)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:23080-23190` · `backend/src/nightlife-data/nightlife-data.service.ts:22803-22818` · `backend/src/nightlife-data/dto/admin-store.dto.ts:116-118`

**5. Quy tắc slug/URL của quán và cast: tự sinh, chống trùng, khóa sau khi publish**

Slug (/stores/{slug}, /casts/{slug}) tự sinh từ tên (bỏ dấu tiếng Việt, chữ thường, gạch nối), trùng thì tự thêm hậu tố -1, -2...; có API check-slug cho Admin (cả store và cast). Khi đổi tên quán/cast, slug CHỈ được sinh lại nếu bản ghi còn DRAFT - sau khi publish slug bị khóa để không gãy URL/SEO. Ngoài ra có danh sách alias slug cũ (STORE_SLUG_ALIASES/CAST_SLUG_ALIASES) để link cũ vẫn truy cập được - lưu ý đây là map hằng số hard-code trong code, không phải bảng DB tự động ghi alias. Tài liệu chưa đặc tả quy tắc URL nào.

> Ghi chú kiểm chứng: Grep doc không có 'slug'/'URL'/'đường dẫn' → doc thiếu thật. Code: generateSlug bỏ dấu/thường hóa/gạch nối (22819-22828), chống trùng bằng hậu tố -1/-2 (22888-22892, 22491-22496), GET /admin/stores/check-slug và /admin/casts/check-slug (controller 1756, 1844), đổi tên chỉ sinh lại slug khi status DRAFT cho cả store (22953) lẫn cast (22650-22654). Chi tiết cần sửa: STORE_SLUG_ALIASES/CAST_SLUG_ALIASES là MAP HẰNG SỐ hard-code trong nightlife-data.service.ts (dòng 712, 730), không phải bảng dữ liệu DB - chỉ redirect các slug cũ liệt kê sẵn, không tự lưu alias khi slug thay đổi.

- Bổ sung vào: **3.D Store Detail / 3.K SEO (CON-06)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:22819-22828` · `backend/src/nightlife-data/nightlife-data.service.ts:22885-22892` · `backend/src/nightlife-data/nightlife-data.service.ts:22953-22959` · `backend/src/nightlife-data/nightlife-data.service.ts:19578-19586`

**6. Khối 'Gợi ý cho bạn' trên trang chủ: Admin ghim qua ranking scope recommend-home + máy tự chấm điểm hành vi**

Trang chủ có API gợi ý quán (GET /content/recommendations) hoạt động 2 tầng: (1) nếu Admin có cấu hình ranking STORE với scope 'recommend-home' cho thành phố đó thì danh sách ghim này được ưu tiên tuyệt đối (sắp theo pinRank/manualScore); (2) nếu không, hệ thống TỰ chấm điểm gợi ý: +36 điểm nếu quán trùng loại hình khách hay xem, +24 nếu cùng khu vực khách quan tâm, +18 nếu quán đang có ưu đãi hiệu lực, +tối đa 20 điểm theo lượt xem hồ sơ 30 ngày, +2 điểm/booking 30 ngày (tối đa 24). Tín hiệu cá nhân hóa (categories, storeSlugs đã xem) do frontend gửi lên; kết quả kèm lý do hiển thị cho khách ('Theo loại hình bạn hay xem', 'Đang có ưu đãi'...) và signals (viewCount/bookingCount/hasActiveCoupon). Limit mặc định 8, tối đa 16. Tài liệu không có mục nào về khối gợi ý trang chủ và thuật toán này.

- Bổ sung vào: **3.A Public Website (mục mới về homepage recommendations) hoặc 3.B SEA-05 mở rộng**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:23553-23910` · `backend/src/nightlife-data/nightlife-data.controller.ts:198-201` · `frontend/apps/web/src/app/HomePageClient.tsx`

### Booking, QR, Bill, Điểm & Hoa hồng

**1. Email booking bắt buộc phải là địa chỉ @gmail.com** _(so với BOO-02)_

Form booking (guest) chỉ chấp nhận email có domain đúng bằng gmail.com; email khác domain bị từ chối với thông báo 'email must be a gmail.com address'. Đây là giới hạn nghiệp vụ lớn ảnh hưởng khách Nhật (thường dùng docomo/yahoo.co.jp...) mà tài liệu hoàn toàn không nhắc.

- Bổ sung vào: **3.F Booking & Notification (BOO-02/BOO-03)**
- Bằng chứng: `backend/src/nightlife-data/dto/create-booking.dto.ts:37-60` · `backend/src/nightlife-data/dto/create-booking.dto.ts:132-144`

**2. Quy tắc validate form booking: tên 2-80 ký tự chỉ chữ, ghi chú ≤300, SĐT 8-15 chữ số** _(so với BOO-03)_

Tên khách phải 2-80 ký tự và chỉ gồm chữ cái + khoảng trắng (chặn số/ký tự đặc biệt); ghi chú tối đa 300 ký tự; SĐT (tùy chọn) 8-20 ký tự, 8-15 chữ số, chặn dãy số lặp toàn bộ (vd 000000000). Guest phải có ít nhất email hoặc SĐT.

- Bổ sung vào: **3.F Booking & Notification (BOO-03)**
- Bằng chứng: `backend/src/nightlife-data/dto/create-booking.dto.ts:121-158` · `backend/src/nightlife-data/nightlife-data.service.ts:10711-10755`

**3. Chỉ được đặt trong cửa sổ 14 ngày tới, không đặt ngày quá khứ**

scheduledAt của booking phải nằm từ hôm nay đến tối đa 14 ngày sau (BOOKING_DATE_WINDOW_DAYS=14); quá khứ hoặc xa hơn 14 ngày đều bị từ chối. Áp dụng cả khi tạo mới và khi đổi lịch.

- Bổ sung vào: **3.F Booking & Notification**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:160` · `backend/src/nightlife-data/nightlife-data.service.ts:13504-13521` · `backend/src/nightlife-data/nightlife-data.service.ts:12831`

**4. Giờ đến phải nằm trong khung giờ mở cửa của quán; slot muộn nhất = giờ đóng cửa trừ 60 phút**

Hệ thống kiểm tra scheduledAt so với openingHours của quán (theo ngày, hỗ trợ ngày nghỉ, khung giờ qua đêm sau 0h): slot hợp lệ từ giờ mở cửa đến giờ đóng cửa − 60 phút, nếu ngoài khung thì từ chối 'scheduledAt is outside store booking time slots'. Áp dụng cả khi tạo và khi đổi lịch.

- Bổ sung vào: **3.F Booking & Notification + STO-02**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:11986-11989` · `backend/src/nightlife-data/nightlife-data.service.ts:12946-13029`

**5. Chống trùng booking: cùng quán + cùng giờ + cùng danh tính bị từ chối**

Một khách (nhận diện theo userId, tài khoản đã convert từ guest, email guest hoặc SĐT guest) không thể tạo 2 booking cùng quán cùng thời điểm khi booking cũ còn hoạt động (REQUESTED/CONFIRMED/CHECKED_IN). Áp dụng cho cả từng điểm dừng của tour.

- Bổ sung vào: **3.F Booking & Notification**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:167-173` · `backend/src/nightlife-data/nightlife-data.service.ts:10765-10803` · `backend/src/nightlife-data/nightlife-data.service.ts:12302-12309`

**6. Rate limit chống spam booking: tối đa 5 lần tạo/phút và 5 lần hủy/phút**

Tạo booking bị giới hạn 5 request/60 giây theo email/SĐT (guest) hoặc theo tài khoản (member); hủy booking cũng giới hạn 5 lần/phút theo cùng khóa; tour booking có rate limit riêng cùng ngưỡng. Vượt ngưỡng trả lỗi 'Too many booking/cancellation requests'.

- Bổ sung vào: **3.F Booking & Notification (quy tắc chống lạm dụng)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:161-163` · `backend/src/nightlife-data/nightlife-data.service.ts:3772-3776` · `backend/src/nightlife-data/nightlife-data.service.ts:4301-4305` · `backend/src/nightlife-data/nightlife-data.service.ts:19384`

**7. Format mã hiển thị: booking BK-XXXXXX, tour TR-XXXXXXXX, bill BILL-YYYYMMDD-XXXXXXXX**

Mã booking = 'BK-' + 6 ký tự ngẫu nhiên từ bảng 32 ký tự loại trừ ký tự dễ nhầm (không có 0,O,1,I); mã tour booking = 'TR-' + 8 ký tự cùng bảng; số bill = 'BILL-' + ngày (YYYYMMDD) + 8 ký tự hex. Booking còn có bookingNumber tự tăng nội bộ. Doc mục 4.3 chỉ ví dụ BK-000123/BILL-00099 khác format thực tế.

- Bổ sung vào: **Mục 6.1 Field tối thiểu cho Booking / 6.x Bill**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:13626-13634` · `backend/src/nightlife-data/nightlife-data.service.ts:20008-20016` · `backend/src/nightlife-data/nightlife-data.service.ts:11809-11814` · `backend/prisma/schema.prisma:628-629`

**8. Chat hỗ trợ theo từng booking (in-app) cho Guest/Member/Admin/Operator** _(so với BOO-08C)_

Code có hệ thống tin nhắn theo booking: Guest (xác thực bằng SĐT), Member, Admin, Operator nhắn trong thread của booking; chủ đề GENERAL/RESCHEDULE/CANCEL, gắn được vào yêu cầu đổi lịch; đẩy realtime qua websocket và ghi notification log 2 chiều (khách↔admin). Doc chỉ có kênh hỗ trợ LINE OA/Mail (BOO-08C) và xếp chat realtime vào P1.

- Bổ sung vào: **3.F Booking & Notification + 3.L Notification**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:13757-13842` · `backend/src/nightlife-data/nightlife-data.controller.ts:453-468` · `backend/src/nightlife-data/nightlife-data.controller.ts:989-1017` · `backend/prisma/schema.prisma:144-156`

**9. Guest tra cứu booking bằng mã booking + email hoặc SĐT**

API công khai cho Guest tra cứu chi tiết booking (kể cả tour booking) bằng bookingCode kết hợp email hoặc SĐT đã dùng khi đặt; đồng thời mọi thao tác tự phục vụ của Guest (hủy, đổi lịch, chat) đều xác thực danh tính bằng SĐT. Doc không mô tả cơ chế tự tra cứu/xác thực này.

- Bổ sung vào: **3.F Booking & Notification**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.controller.ts:470-482` · `backend/src/nightlife-data/nightlife-data.service.ts:4385-4459` · `backend/src/nightlife-data/nightlife-data.service.ts:4338-4347`

**10. Quán loại Massage/Spa và Nhà hàng không tự sinh QR ưu đãi khi booking**

Booking tại quán thuộc nhóm 'service-only' (MASSAGE_SPA, RESTAURANT) không được tự gán coupon mặc định theo hạng và không sinh QR ưu đãi, trừ khi khách chủ động chọn coupon/campaign. Doc chỉ nói chung nhóm phễu 'nghiệp vụ nhẹ hơn' nhưng không chốt quy tắc không-QR này.

- Bổ sung vào: **1.1 Phạm vi dịch vụ + 3.F/3.G**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:700-710` · `backend/src/nightlife-data/nightlife-data.service.ts:10819-10827`

**11. Coupon campaign của quán giữ nguyên giá trị gốc; hỗ trợ giảm cố định (FIXED_AMOUNT), trần giảm và chi tiêu tối thiểu** _(so với ADM-06, MEM-02)_

Doc chỉ mô tả giảm % theo hạng 5/8/10. Code: chỉ coupon mặc định (mã chứa GUEST5/MEMBER8/VIP10) mới áp % theo hạng; coupon campaign riêng của quán giữ nguyên cấu hình gốc gồm loại giảm PERCENT hoặc FIXED_AMOUNT, giá trị gốc, trần giảm tối đa (maxDiscountVnd) và mức chi tiêu tối thiểu (minSpendVnd - bill dưới ngưỡng thì không được giảm, lý do BELOW_MIN_SPEND). Số tiền giảm khi duyệt bill = round(gross × %) rồi min với maxDiscountVnd và không vượt quá gross.

- Bổ sung vào: **3.G/3.H + ADM-06 (campaign/discount)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:19926-19968` · `backend/src/nightlife-data/nightlife-data.service.ts:10307-10337` · `backend/prisma/schema.prisma:774-800` · `backend/prisma/schema.prisma:182-185`

**12. Điều kiện nộp bill gắn booking: phải có xác nhận đã sử dụng dịch vụ; thời điểm sử dụng do hệ thống xác định; mỗi booking chỉ 1 bill** _(so với BIL-01, BIL-02, BIL-02C)_

Khi bill gắn booking: chỉ nộp được nếu QR đã được quét (usedAt) hoặc booking đã được xác nhận CONFIRMED/CHECKED_IN/COMPLETED; usedAt của bill lấy từ thời điểm quét QR/xác nhận chứ không cho tự khai (chỉ bill không gắn booking mới tự khai usedAt). Booking CANCELLED không được nộp bill. Mỗi booking/coupon issue chỉ có tối đa 1 bill ('Booking already has a submitted bill'). Bill gắn coupon issue độc lập thì issue phải đã check-in (USED). usedAt không được ở tương lai và không quá 10 ngày (khớp BIL-02C).

- Bổ sung vào: **3.H Bill, Revenue & Commission + mục 5 FLOW C**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:11109-11169` · `backend/src/nightlife-data/nightlife-data.service.ts:7224-7249` · `backend/src/nightlife-data/nightlife-data.service.ts:11286-11297`

**13. Chống spam/trùng bill: 5 bill/phút và chặn bill trùng trong cửa sổ ±10 phút**

Mỗi người gửi (member hoặc partner account) bị giới hạn 5 bill/60 giây trên cùng quán. Bill bị coi là trùng và từ chối ('Possible duplicate bill submission') nếu cùng quán + cùng tổng tiền + cùng người gửi + usedAt lệch trong ±10 phút với một bill chưa VOIDED.

- Bổ sung vào: **3.H Bill, Revenue & Commission**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:141-144` · `backend/src/nightlife-data/nightlife-data.service.ts:11342-11398`

**14. Hệ thống cảnh báo gian lận bill với 6 tín hiệu và 3 mức rủi ro**

Code chấm rủi ro bill theo 6 tín hiệu: NO_EVIDENCE_MEDIA (HIGH nếu bill không gắn booking/QR, ngược lại MEDIUM); EVIDENCE_NOT_PROTECTED (MEDIUM); SUSPICIOUS_EVIDENCE_FILE - tên file chứa fake/sample/demo/test/template/mau/gia... hoặc sai định dạng ảnh/PDF (HIGH); TOTAL_BELOW_MIN_SPEND (HIGH); USED_AT_BOOKING_DRIFT - lệch lịch booking quá 12h (MEDIUM); POSSIBLE_DUPLICATE_BILL - cùng quán, cùng tiền, usedAt ±10 phút (HIGH). Thang rủi ro khai báo LOW/MEDIUM/HIGH nhưng thực tế chỉ phát MEDIUM/HIGH. Tín hiệu dùng cho màn duyệt và cho đảo bill tự động.

> Ghi chú kiểm chứng: 6 tín hiệu đúng y mô tả với đúng ngưỡng (buildBillFraudWarnings 8253-8400); được dùng cho duyệt (8249) và auto-reverse (9133). Hiệu chỉnh nhỏ: thang severity khai báo 3 mức LOW/MEDIUM/HIGH nhưng 6 tín hiệu thực tế chỉ phát MEDIUM hoặc HIGH (không tín hiệu nào phát LOW).

- Bổ sung vào: **3.H Bill, Revenue & Commission (mục mới: kiểm soát gian lận bill)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:8253-8400`

**15. Công cụ OCR đọc bill (heuristic) hỗ trợ nhập liệu**

API bills/ocr-preview (Member/Partner/Staff/Admin) đọc text OCR để gợi ý tổng tiền và ngày giờ sử dụng: nhận diện theo từ khóa tổng/total/thanh toán; cảnh báo khi tổng < 50.000đ hoặc > 500 triệu đ, khi ngày ở tương lai hoặc quá hạn nộp 10 ngày; trả điểm tin cậy (confidence) và đề xuất 'MANUAL_REVIEW' hay 'CAN_PREFILL_FORM'. Không tự đọc ảnh - chỉ xử lý text đã trích xuất.

- Bổ sung vào: **3.H Bill, Revenue & Commission**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:6933-7005` · `backend/src/nightlife-data/nightlife-data.controller.ts:786-797`

**16. Tự động thăng/hạ hạng VIP theo điểm: ngưỡng 300 điểm khả dụng** _(so với MEM-02)_

Doc không có quy tắc xác định VIP ('tài khoản VIP' chung chung). Code: sau mỗi lần duyệt bill và mỗi lần xem trang điểm, hệ thống tính lại điểm khả dụng; >= 300 điểm → tier VIP, dưới 300 → MEMBER (tự hạ nếu điểm hết hạn). Trang điểm của member hiển thị tiến độ lên hạng: điểm còn thiếu, % tiến độ tới ngưỡng 300.

- Bổ sung vào: **3.G Membership, Point, Booking QR (MEM-02/MEM-07)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:149` · `backend/src/nightlife-data/nightlife-data.service.ts:14929-14975` · `backend/src/nightlife-data/nightlife-data.service.ts:6445-6459`

**17. Che thông tin cá nhân khách (mask email/SĐT) khi người xem bill không phải Admin**

Khi xem danh sách bill nhạy cảm, role không phải ADMIN chỉ thấy email dạng 'ab***@domain' và SĐT dạng '090****123'. Chính sách riêng tư này chưa có trong doc.

- Bổ sung vào: **3.H / 3.J (phân quyền dữ liệu)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:21053-21066` · `backend/src/nightlife-data/nightlife-data.service.ts:21204-21237`

**18. Tour booking nhiều điểm dừng đã triển khai đầy đủ (doc xếp tour vào P2)** _(so với CON-03, mục 7)_

Code có luồng đặt tour hoàn chỉnh cho cả Guest và Member: tour gồm nhiều điểm dừng theo thứ tự, mỗi điểm dừng sinh 1 booking con + QR ưu đãi riêng, cả tour có 1 QR tour chung (mã TQR-xxx); kiểm tra khung giờ khởi hành cho phép; chọn cast mong muốn theo từng quán trong tour; QR tour hiệu lực từ 2 giờ trước giờ hẹn đến (giờ hẹn + thời lượng tour + 6 giờ ân hạn); Partner quét tạo phiên scan 5 phút, check-in từng điểm dừng có idempotency key và hỗ trợ quét offline; check-in đủ điểm dừng thì tour COMPLETED, đang dở là IN_PROGRESS; admin xác nhận đủ các booking con thì tour tự CONFIRMED; hủy tour hủy toàn bộ booking con + thu hồi QR, không hủy được khi đã bắt đầu một điểm dừng. Tour booking có bộ trạng thái riêng (REQUESTED/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED/NO_SHOW).

- Bổ sung vào: **Mục mới 3.x Tour Booking (hoặc cập nhật CON-03 + mục 7)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:12159-12444` · `backend/src/nightlife-data/nightlife-data.service.ts:164-166` · `backend/src/nightlife-data/nightlife-data.service.ts:4100-4294` · `backend/src/nightlife-data/nightlife-data.service.ts:4993-5087`

**19. Chống lạm dụng nhận coupon: rate limit 5 lần/5 phút và phát hiện gian lận nhận mã**

Code có cơ chế phát hiện gian lận nhận mã: quá 5 lần nhận trong 60 phút theo danh tính (user/SĐT) hoặc theo dấu vân tay ip/device/session (ghi bằng template coupon.fraud.claim_signal.v1) sẽ tạo cảnh báo gian lận cho admin (coupon.fraud.claim_burst.v1); mỗi lần phát QR booking đều ghi audit COUPON_ISSUE_BOOKING_QR_ISSUED kèm claim context. Riêng rate limit 'chặn 5 lần nhận/5 phút' chỉ tồn tại dưới dạng hằng số + hàm helper chưa được gọi ở bất kỳ luồng nào (dead code) - hiện KHÔNG có chặn cứng, chỉ có cảnh báo.

> Ghi chú kiểm chứng: Phần phát hiện gian lận là thật: detectCouponClaimFraud đếm claim theo danh tính trong 60 phút, ≥5 lần hoặc signal fingerprint (ip/device/session - template coupon.fraud.claim_signal.v1) vượt ngưỡng thì tạo cảnh báo admin 'coupon.fraud.claim_burst.v1' (20606-20686), được gọi từ luồng phát QR booking (11963); audit COUPON_ISSUE_BOOKING_QR_ISSUED kèm claimContext (11929-11947). NHƯNG rate limit 5 lần/5 phút KHÔNG được thi hành: hằng số COUPON_CLAIM_RATE_LIMIT (174-175) và hàm assertCouponClaimRateLimit (20472) tồn tại nhưng không có bất kỳ chỗ nào gọi hàm này (grep toàn src chỉ ra định nghĩa) - là dead code.

- Bổ sung vào: **3.G Membership, Point, Booking QR (quy tắc chống lạm dụng)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:174-177` · `backend/src/nightlife-data/nightlife-data.service.ts:11949-11969` · `backend/src/nightlife-data/nightlife-data.service.ts:620` · `backend/src/nightlife-data/nightlife-data.service.ts:20681`

### Campaign, Tour, Media & Cấu hình hệ thống

**1. Luồng Tour Booking kèm QR tour và check-in từng điểm dừng (hoàn toàn chưa có trong tài liệu)** _(so với CON-03)_

Code đã có luồng đặt tour trọn gói cho cả Guest và Member: POST /tours/:tourId/bookings (không cần đăng nhập) và POST /member/tours/:tourId/bookings (role USER). Quy tắc nghiệp vụ: form gồm tên (2-80 ký tự, chỉ chữ và khoảng trắng), email bắt buộc, SĐT tùy chọn, ngày giờ khởi hành, số người 1-50 (KHÁC giới hạn 1-20 của booking quán trong BOO-03), ghi chú tối đa 300 ký tự; được chọn cast mong muốn theo từng quán trong tour (tối đa 10 cast/quán, cast phải active/public và thuộc đúng quán, quán phải nằm trong hành trình). Giờ khởi hành phải khớp lịch khởi hành đã cấu hình của tour, sai giờ bị từ chối. Rate limit 5 lần tạo tour booking theo email/SĐT (guest) hoặc theo tài khoản (member). Khi tạo thành công: sinh 1 TourBooking trạng thái REQUESTED kèm snapshot hành trình + tự động sinh 1 booking con cho MỖI điểm dừng (kèm coupon ưu đãi của quán nếu đủ điều kiện, kiểm tra chống trùng booking đang hoạt động); sinh 1 QR tour duy nhất cho cả hành trình với hạn dùng: hiệu lực từ 2 giờ TRƯỚC giờ khởi hành, hết hạn = giờ khởi hành + thời lượng tour + 6 giờ gia hạn. Trạng thái TourBooking: REQUESTED/CONFIRMED/IN_PROGRESS/COMPLETED/CANCELLED/NO_SHOW; trạng thái QR tour: ACTIVE/COMPLETED/EXPIRED/REVOKED. Phía đối tác: scan QR tour theo quy trình 2 bước - (1) scan xem trước (POST partner/tour-booking-qrs/scan) kiểm tra quán đang chọn có thuộc hành trình, scan sai quán bị chặn và ghi audit FAILED/WRONG_STORE; (2) xác nhận check-in (POST partner/tour-booking-qrs/confirm-check-in) bằng session token hiệu lực 5 phút, hỗ trợ idempotency key và chế độ offline replay. Mỗi lần check-in 1 điểm dừng: booking con chuyển CHECKED_IN, coupon điểm dừng chuyển USED (từ chối nếu ưu đãi hết hạn); khi đủ tất cả điểm dừng thì TourBooking = COMPLETED và QR tour = COMPLETED. Vai trò được scan/xác nhận: PARTNER, STAFF, ADMIN, OPERATOR. Hệ thống ghi audit log (TOUR_BOOKING_CREATED, TOUR_BOOKING_STOP_CHECKED_IN, log scan), gửi Telegram Admin cho từng booking con, và member nhận thông báo in-app khi đặt tour thành công.

- Bổ sung vào: **Nhóm mới trong 3.K hoặc mục riêng 'Tour Booking & QR' + bổ sung Flow (mục 5) và data model TourBooking/TourBookingQr/TourBookingCheckIn (mục 6)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.controller.ts:420-431` · `backend/src/nightlife-data/nightlife-data.controller.ts:712-737` · `backend/src/nightlife-data/nightlife-data.controller.ts:941-953` · `backend/src/nightlife-data/dto/tour-booking.dto.ts:40-145`

**2. Thực thể Danh mục (Category) dùng chung cho danh mục Blog và nhãn Banner**

Code có hệ thống danh mục quản trị được mà tài liệu không đặc tả: Category gồm tên, slug (duy nhất), mô tả, và trường type phân loại - hiện dùng thực tế 2 loại: 'BLOG' (danh mục bài viết blog, là type mặc định) và 'BANNER_TAG' (nhãn/tag gắn cho banner trang chủ, admin tạo/xóa nhãn ngay trong màn quản lý nội dung). Có API public GET /categories?type=... cho website và API admin CRUD /admin/categories. Xóa danh mục là xóa cứng (mất hẳn dữ liệu). Tài liệu cần bổ sung khái niệm danh mục nội dung, các loại type và quy tắc slug duy nhất - đặc biệt vì nó ảnh hưởng trực tiếp banner hero (WEB-02) và blog (CON-01/CON-02).

- Bổ sung vào: **3.J Admin CMS (mục quản lý danh mục nội dung/nhãn banner) và tham chiếu tại 3.A WEB-02, 3.K CON-01**
- Bằng chứng: `backend/src/categories/categories.controller.ts:13-51` · `backend/src/categories/categories.service.ts:8-39` · `backend/prisma/schema.prisma:1235-1245` · `frontend/apps/web/src/app/admin/content/page.tsx:1155-1259`

**3. Cấu hình hệ thống động: giao diện trang chủ (Appearance) do Admin tùy biến** _(so với WEB-01, WEB-03)_

Tài liệu mô tả quick access grid (WEB-03) và header/nav (WEB-01) như nội dung cố định, nhưng code có hệ cấu hình 'appearance' lưu trong SystemConfig cho phép Admin/Operator tùy biến động toàn bộ: 8 ô quick-access (nhãn, icon, màu sắc), 5 mục thanh điều hướng dưới của mobile, tiêu đề từng khối trang chủ (khối đề xuất, coupon hot, bảng xếp hạng, dịch vụ nổi bật kèm tab Nhà hàng/Spa, video hot, khối Tour·Blog·Guide), và thương hiệu (tên - mặc định 'Vietyoru', tagline 'VIETNAM NIGHTLIFE GUIDE', logo). API public GET /system-config/appearance cho website đọc; PUT admin/system-config/appearance yêu cầu vai trò ADMIN hoặc OPERATOR; có màn quản trị riêng admin/appearance. Icon/logo thương hiệu có hạn mức upload riêng (icon 30KB, logo 200KB, chỉ PNG/SVG). Đây là chức năng CMS ảnh hưởng trực tiếp trải nghiệm trang chủ mà tài liệu chưa nhắc.

- Bổ sung vào: **3.J Admin CMS - mục mới 'Cấu hình giao diện trang chủ (Appearance)' và cập nhật ghi chú WEB-01/WEB-03**
- Bằng chứng: `backend/src/system-config/system-config.controller.ts:20-40` · `backend/src/system-config/system-config.service.ts:8-28` · `backend/prisma/schema.prisma:1247-1253` · `frontend/apps/web/src/lib/api/appearance.ts:1-70`

**4. Hạn mức dung lượng lưu trữ hệ thống (VPS storage quota) và chặn upload khi vượt hạn mức**

Code có cơ chế quản trị hạn mức lưu trữ mà tài liệu không nhắc: khóa cấu hình VPS_MAX_STORAGE_GB (mặc định 50GB). Phân quyền: chỉ SUPER_ADMIN được thay đổi hạn mức; SUPER_ADMIN/ADMIN xem cấu hình; SUPER_ADMIN/ADMIN/OPERATOR xem mức sử dụng (API trả về hạn mức, dung lượng đã dùng, phần trăm, cờ vượt hạn mức - tính từ tổng dung lượng bảng Media). Quy tắc nghiệp vụ: khi tổng dung lượng đã dùng + file mới vượt hạn mức, hệ thống từ chối upload với thông báo 'Dung lượng lưu trữ của hệ thống đã đạt giới hạn (XGB). Vui lòng nâng cấp gói để tiếp tục.' - áp dụng cho cả upload file và lưu link ngoài. Lưu ý thêm cho BA: system-config hiện KHÔNG có chế độ bảo trì (maintenance mode) hay cấu hình nghiệp vụ động nào khác (mức giảm giá 5/8/10%, hạn QR... đều đang hard-code ở nơi khác).

- Bổ sung vào: **3.J Admin CMS - mục 'Cấu hình hệ thống & hạn mức lưu trữ' (kèm vai trò SUPER_ADMIN chưa được tài liệu định nghĩa trong ADM-12)**
- Bằng chứng: `backend/src/system-config/system-config.controller.ts:42-77` · `backend/src/system-config/system-config.service.ts:30-54` · `backend/src/storage/storage.service.ts:215-223` · `backend/src/storage/storage.service.ts:270-276`

### Thông báo & Liên lạc (Telegram/Email/LINE/Chat)

**1. Chat theo từng booking (Booking Chat) giữa khách và Admin/Operator**

Ngoài support chat chung, code còn có kênh chat riêng gắn với từng booking, tài liệu hoàn toàn chưa đặc tả (BOO-08C chỉ nói hỗ trợ đổi/hủy qua LINE OA/Mail, nội bộ Telegram). Quy tắc trong code: (1) Guest truy cập chat bằng mã booking + số điện thoại đã dùng khi đặt (không cần đăng nhập); Member dùng tài khoản; phía quản trị cần quyền 'canManageBookingChat', tin của STAFF/OPERATOR ghi nhận senderType OPERATOR, còn lại ADMIN. (2) Tin nhắn tối đa 800 ký tự, có chủ đề (topic) GENERAL / RESCHEDULE / CANCEL; có thể gắn tin nhắn vào một yêu cầu đổi lịch cụ thể (changeRequestId, có kiểm tra thuộc đúng booking). (3) Hiển thị tối đa 200 tin gần nhất theo thứ tự thời gian. (4) Realtime qua socket room booking_{id}, event 'booking_chat_message_created'. (5) Mỗi tin nhắn đồng thời ghi một bản ghi Notification Log kênh IN_APP: tin của khách -> template 'admin.booking.chat_message.v1' (người nhận ADMIN), tin của Admin/Operator -> 'customer.booking.chat_message.v1' (người nhận là khách).

- Bổ sung vào: **3.F Booking & Notification (sau BOO-08C) + bổ sung sự kiện vào bảng 3.L**
- Bằng chứng: `backend/src/nightlife-data/dto/booking-p2.dto.ts:59-94` · `backend/src/nightlife-data/nightlife-data.service.ts:4738-4794,13748-13795,13813-13848` · `backend/src/nightlife-data/nightlife-data.controller.ts:453-467,855-880,1393-1416` · `backend/src/notifications/socket.gateway.ts:95-111,141-148`

**2. Kênh thông báo in-app (IN_APP) và Trung tâm thông báo cho Member**

Tài liệu 3.L chỉ có 3 kênh: Telegram nội bộ, Email khách, LINE OA/Mail. Code có thêm kênh IN_APP hoàn chỉnh cho Member: (1) API lấy danh sách thông báo (mặc định 20, tối đa 50/lần), đếm số chưa đọc, đánh dấu đã đọc từng thông báo hoặc tất cả. (2) Đẩy realtime qua socket event 'member_notification_created' vào room user_{id}. (3) Danh sách sự kiện tạo thông báo in-app cho member vượt xa bảng NOT: đặt bàn thành công (customer.booking.created.v1), đặt bàn theo cast (cast_created), đặt tour (tour_created), booking được xác nhận (confirmed), đổi lịch thành công (rescheduled), yêu cầu đổi lịch bị từ chối (reschedule_rejected), booking bị hủy (cancelled - phân biệt người hủy là khách hay admin), đã check-in (checked_in), hoàn tất (completed); hóa đơn: đã gửi chờ duyệt (bill.submitted), được duyệt kèm số điểm cộng (bill.verified), bị từ chối kèm lý do (bill.rejected). (4) Mỗi thông báo có tiêu đề/nội dung tiếng Việt định nghĩa sẵn, phân loại (booking/bill/system), tông màu hiển thị, nút hành động dẫn tới trang liên quan và nhãn thời gian tương đối ('Vừa xong', 'x phút', 'x giờ', 'Hôm qua'). Các sự kiện confirmed/rescheduled/reschedule_rejected/checked_in/completed hoàn toàn không có trong bảng NOT-01..08.

- Bổ sung vào: **3.L Notification & Communication (bổ sung kênh In-app và các sự kiện NOT mới) + 3.G Membership**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.controller.ts:1138-1177` · `backend/src/nightlife-data/nightlife-data.service.ts:6203-6277,13452-13502,14380-14510,14544-14561,14610-14669` · `backend/src/notifications/socket.gateway.ts:132-139` · `frontend/apps/web/src/lib/api/notifications.ts`

**3. Realtime cập nhật trạng thái booking cho Member đang online**

Khi Admin đổi trạng thái booking hoặc duyệt yêu cầu đổi lịch, backend đẩy socket event 'booking_status_updated' tới room user_{userId} (socket.gateway.ts:125-130; gọi tại nightlife-data.service.ts:4657-4662, 12901-12903, 21427-21432) để trang lịch sử đặt chỗ của member cập nhật ngay không cần refresh. Phía frontend, trang lich-su-dat-cho (page.tsx:558) và SocketProvider toàn cục (SocketProvider.tsx:82) lắng nghe 'booking_status_updated'; riêng AdminConsole lắng nghe event booking chat 'booking_chat_message_created' (AdminConsole.tsx:1876) chứ không nghe booking_status_updated. Tài liệu không đề cập cơ chế realtime nào cho khách (chỉ Telegram/email).

> Ghi chú kiểm chứng: Phần backend + trang member đúng như mô tả và doc không có nội dung này (grep 'realtime/socket' chỉ ra 2 dòng chat P1). Sửa 1 chi tiết: AdminConsole KHÔNG lắng nghe 'booking_status_updated' — nó chỉ nghe 'booking_chat_message_created'; các listener của booking_status_updated là SocketProvider và trang lich-su-dat-cho.

- Bổ sung vào: **3.L Notification & Communication (kênh realtime socket)**
- Bằng chứng: `backend/src/notifications/socket.gateway.ts:125-130` · `backend/src/nightlife-data/nightlife-data.service.ts:4658,12902,21427-21432` · `frontend/apps/web/src/app/(member)/lich-su-dat-cho/page.tsx`

**4. Email OTP xác thực đăng ký và email mã đặt lại mật khẩu**

Code có 2 loại email nghiệp vụ tài khoản không nằm trong bảng NOT: (1) Email 'Vietyoru - Mã OTP xác thực email đăng ký' gửi mã OTP khi đăng ký hội viên, hiển thị hạn hiệu lực của mã và hướng dẫn bỏ qua nếu không yêu cầu. (2) Email 'Vietyoru - Mã đặt lại mật khẩu' gửi mã xác nhận đặt lại mật khẩu kèm hạn hiệu lực. Cả hai đều là kênh email khách, ảnh hưởng trực tiếp trải nghiệm đăng ký/khôi phục tài khoản (MEM-01) nhưng tài liệu 3.L và 3.G không nhắc tới luồng xác thực email nào.

- Bổ sung vào: **3.L Notification & Communication (thêm NOT mới cho email xác thực tài khoản) + 3.G MEM-01**
- Bằng chứng: `backend/src/notifications/email-notification.service.ts:77-137` · `backend/src/notifications/email-notification.service.ts:213-289`

**5. Cảnh báo gian lận nhận coupon (claim burst) và log phân tích lượt nhận coupon**

Code có cơ chế phát hiện bất thường khi nhận coupon mà tài liệu không đề cập: mỗi lượt claim coupon được ghi bản ghi phân tích ('coupon.analytics.claimed.v1') kèm ngữ cảnh thiết bị/IP/phiên; hệ thống đồng thời lưu các 'tín hiệu' fingerprint (IP, device, session - đã hash). Nếu cùng một định danh nhận từ 5 lượt trở lên trong cửa sổ 60 phút (theo claim key hoặc theo bất kỳ tín hiệu fingerprint nào), hệ thống tạo bản ghi cảnh báo gửi admin template 'coupon.fraud.claim_burst.v1' (kênh IN_APP, người nhận 'admin') chứa số lượt claim gần đây, các tín hiệu khả nghi và cửa sổ thời gian. Đây là quy tắc chống lạm dụng ưu đãi có ngưỡng số liệu cụ thể (5 lượt/60 phút) cần được BA đặc tả.

- Bổ sung vào: **3.L Notification & Communication + ADM-11 Internal alerts (hoặc mục mới về chống gian lận ưu đãi)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:176-177,620` · `backend/src/nightlife-data/nightlife-data.service.ts:20566-20604` · `backend/src/nightlife-data/nightlife-data.service.ts:20606-20686`

**6. Thông báo realtime 'phiên đăng nhập bị thay thế' và cưỡng bức ngắt kết nối socket quản trị**

Chính sách một phiên đăng nhập đặc quyền duy nhất được truyền đạt tới người dùng qua kênh realtime: khi tài khoản quản trị/đặc quyền đăng nhập từ trình duyệt khác, mọi phiên cũ bị thu hồi và server đẩy socket event 'session_replaced' tới đúng các phiên bị thay thế, kèm lý do 'LOGIN_FROM_ANOTHER_BROWSER', role và thông tin thiết bị mới (user agent, IP đã che bớt, thời điểm) để UI hiển thị cảnh báo/đăng xuất. Riêng gateway chat hỗ trợ còn có vòng quét mỗi 15 giây tự ngắt kết nối các socket admin mà phiên không còn hợp lệ (token bị blacklist, session hết hạn/revoked, không còn là phiên đặc quyền đang hoạt động); mọi hành động admin trên chat (claim/close/gửi tin) đều kiểm tra lại phiên và trả thông báo 'Phiên đăng nhập quản trị không hợp lệ. Vui lòng đăng nhập lại.' nếu không đạt. Tài liệu chưa có mục nào về chính sách phiên/đăng xuất từ xa này.

- Bổ sung vào: **3.J ADM-12 (phân quyền/phiên đăng nhập) + 3.L (kênh realtime socket)**
- Bằng chứng: `backend/src/notifications/socket.gateway.ts:25-33,83-89,113-123` · `backend/src/auth/auth.service.ts:743-796` · `backend/src/support-chat/support-chat.gateway.ts:118-128,332-413,470-479`

### Audit Log

**1. Thao tác nhạy cảm tự sinh thông báo nội bộ IN_APP song song với audit log**

Ngoài audit log, các thao tác nhạy cảm sau còn ghi thêm một NotificationLog kênh IN_APP trạng thái QUEUED qua helper recordSensitiveActionNotification: tạo/sửa/xóa ranking config (templateKey audit.ranking.config.create/update/delete.v1), duyệt/từ chối partner request (audit.partner_request.review.v1), và duyệt/từ chối/chờ PM-BA bill (audit.bill.review.v1 — chỉ luồng reviewSensitiveBill với action bill.review.approve/reject/pending_pm_ba). Lưu ý: luồng void bill (bill.review.void) và reversal (bill.reversal, bill.fraud.auto_reversal) KHÔNG sinh notification này. Payload chứa actorId, action, refType/refId, occurredAt. Kênh IN_APP hoàn toàn chưa có trong bảng 16 (chỉ có Telegram/Email/LINE) và chưa được nhắc trong 3.M.

> Ghi chú kiểm chứng: Sai 1 chi tiết: 'void bill' không sinh notification IN_APP — recordSensitiveActionNotification chỉ được gọi ở 5 chỗ (service.ts:1741, 1895, 1979 ranking; 8067 partner request; 8997 bill review approve/reject/pending_pm_ba); applySensitiveBillReversal (void/reversal, dòng 9426-9571) không gọi. Phần còn lại đúng; doc không có IN_APP ở bất kỳ đâu.

- Bổ sung vào: **3.L Notification & Communication (Bảng 16) + 3.M Audit Log**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:19772-19813` · `backend/src/nightlife-data/nightlife-data.service.ts:1741-1754` · `backend/src/nightlife-data/nightlife-data.service.ts:8067-8082` · `backend/src/nightlife-data/nightlife-data.service.ts:8997-9015`

**2. Tự động phát hiện và hoàn trả bill nghi gian lận (bill.fraud.auto_reversal)**

Code có bộ cảnh báo gian lận bill với các mã: NO_EVIDENCE_MEDIA (không có ảnh chứng từ), EVIDENCE_NOT_PROTECTED, SUSPICIOUS_EVIDENCE_FILE, TOTAL_BELOW_MIN_SPEND (tổng tiền dưới mức chi tối thiểu của coupon), USED_AT_BOOKING_DRIFT (lệch thời gian dùng so với booking), POSSIBLE_DUPLICATE_BILL (nghi trùng bill); phân mức rủi ro HIGH/MEDIUM/LOW. Endpoint admin cho phép chạy chế độ dryRun (chỉ phân tích) hoặc thực thi: nếu rủi ro HIGH thì tự động reversal bill (qua luồng bill.reversal) và ghi audit riêng bill.fraud.auto_reversal kèm danh sách mã cảnh báo và lý do. Cảnh báo gian lận cũng hiển thị cho admin khi xem bill. Doc hoàn toàn không có tính năng chống gian lận bill (mục 7 còn ghi 'Tự động duyệt bill dưới ngưỡng tiền — P2 — chưa có rule gian lận').

- Bổ sung vào: **3.H Bill, Revenue & Commission (mục mới về kiểm soát gian lận bill) + Bảng 18**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:8253-8390` · `backend/src/nightlife-data/nightlife-data.service.ts:9224-9285` · `backend/src/nightlife-data/nightlife-data.service.ts:13947-13956`

**3. Xử lý QR ưu đãi bị lộ: thu hồi (revoke) và xoay vòng (rotate) token QR, có audit** _(so với Bảng 18 (QR_INVALIDATE))_

Admin có 2 thao tác an ninh trên QR ưu đãi (coupon issue) ở trạng thái ISSUED: (1) COUPON_QR_TOKEN_REVOKED — thu hồi QR (issue chuyển REVOKED, lưu thời điểm/người thu hồi, lưu danh sách hash token cũ đã vô hiệu); (2) COUPON_QR_TOKEN_ROTATED — cấp lại token QR mới (dạng signed deep link), tăng bộ đếm qrRotationCount, token cũ đưa vào danh sách vô hiệu. Cả hai audit đều gắn nguồn 'ADMIN_QR_COMPROMISE_RESPONSE' và sinh thông báo vòng đời coupon.issue.qr_revoked/qr_rotated.v1. Doc chỉ có QR_INVALIDATE, không có khái niệm rotate/đổi token.

- Bổ sung vào: **3.G Membership, Point, Booking QR + 4.2 nhóm QR**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:7042-7100` · `backend/src/nightlife-data/nightlife-data.service.ts:7103-7180`

**4. Audit Log cho Tour Booking (module TOUR_BOOKING) đã hoạt động** _(so với CON-03)_

Code có hẳn phân hệ tour booking nhiều điểm dừng với audit log module='TOUR_BOOKING': TOUR_BOOKING_CREATED (kèm danh sách booking con, số điểm dừng, QR tour có validFrom/expiresAt); TOUR_BOOKING_QR_SCANNED — ghi cả result=SUCCESS lẫn FAILED kèm reason (vd WRONG_STORE khi quán quét không thuộc hành trình, PREVIEW khi xem trước) và cờ offline; TOUR_BOOKING_STOP_CHECKED_IN (check-in từng điểm dừng, ghi changedFields, số điểm đã hoàn thành/tổng); TOUR_BOOKING_CANCELLED (hủy tour: hủy toàn bộ booking con, thu hồi QR, ghi before/after). Doc xếp tour ở P2 (CON-03) và không có bất kỳ đặc tả audit nào cho tour.

- Bổ sung vào: **4.2 Bảng 18 (thêm module Tour) + mục 3.K/tour nếu tour được kéo về MVP**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:12405-12424` · `backend/src/nightlife-data/nightlife-data.service.ts:20166-20194` · `backend/src/nightlife-data/nightlife-data.service.ts:3999-4029` · `backend/src/nightlife-data/nightlife-data.service.ts:4180-4204`

**5. Bảng audit_logs kiêm event store đếm lượt xem hồ sơ và tương tác video công khai** _(so với 4.1 (Bảng 17), RAN-04)_

Hệ thống dùng chính bảng audit_logs để đếm chỉ số công khai (không có actor): (1) PROFILE_VIEW_RECORDED — endpoint public POST /analytics/profile-view ghi 1 dòng audit mỗi lượt xem trang Store/Cast đang ACTIVE/public; số liệu này được dùng để hiển thị viewCount trên ranking public và profileViewCount trong dashboard đối tác (theo quán/cast, theo khoảng thời gian); (2) content.hot_video.view / content.hot_video.like — endpoint public ghi lượt xem/thích video hot ở trang chủ, metrics tính bằng groupBy trên audit_logs. Điều này khác định nghĩa 4.1 (Audit Log = truy vết thao tác actor lên hệ thống) và liên quan RAN-04 (chỉ số views/hearts P1): thực tế code đã đếm view tự động qua audit_logs.

- Bổ sung vào: **4.1 Phân biệt Business/Audit Log (bổ sung loại 'analytics event') + 3.C RAN-04**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:2795-2806` · `backend/src/nightlife-data/nightlife-data.controller.ts:384-385` · `backend/src/nightlife-data/nightlife-data.service.ts:21159-21173` · `backend/src/nightlife-data/nightlife-data.service.ts:23664-23695`

**6. Đã có API export audit trail (CSV) và UAT dashboard suy ra 'bug events' từ audit** _(so với 2.1 (P1: export audit), ADM-14)_

Hai tính năng doc xếp P1/chưa có đã tồn tại ở backend (chưa có UI gọi): (1) GET /admin/qa/audit-trail — xuất audit trail, lọc module (booking/coupon/bill/admin/partner/all — phân loại bằng khớp chuỗi action/targetType), cửa sổ mặc định 14 ngày, tối đa 500 dòng mới nhất, hỗ trợ format=csv (cột: id, createdAt, module, action, actorId, targetType, targetId, metadata); (2) GET /admin/qa/uat-dashboard — biến audit log thành 'bug event': action chứa fraud/auto_reversal → độ ưu tiên P1 (OPEN), action chứa reject/void/reversal → P2 (CLOSED); thống kê theo module, độ ưu tiên, xu hướng theo ngày và SLA (số item quá hạn xử lý). Cả hai đều yêu cầu role ADMIN trở lên.

- Bổ sung vào: **3.J ADM-14 + mục mới 'Export & QA/UAT dashboard' trong 4**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.controller.ts:1924-1945` · `backend/src/nightlife-data/nightlife-data.service.ts:9288-9331` · `backend/src/nightlife-data/nightlife-data.service.ts:13859-13935` · `backend/src/nightlife-data/nightlife-data.service.ts:13937-13974`

### Mô hình dữ liệu (Prisma schema)

**1. Coupon toàn hệ thống do Admin phát hành (AdminCoupon, AdminCouponIssue, AdminCouponScan)**

Ngoài coupon theo quán, code có global coupon cấp Admin: AdminCoupon nhắm tới danh sách quán (target_stores) và nhóm đối tượng (target_audiences), có giới hạn lượt dùng, thời gian hiệu lực; AdminCouponIssue là lượt phát QR cho từng user/guest (ISSUED/USED/EXPIRED/REVOKED) với API thật: admin tạo/sửa/xóa/xem global coupon và danh sách issues, member/guest claim. Riêng bảng AdminCouponScan (log từng lần quán scan) mới chỉ có trong schema, chưa có code nào ghi vào. Tài liệu hoàn toàn không có khái niệm coupon toàn hệ thống.

> Ghi chú kiểm chứng: AdminCoupon + AdminCouponIssue đúng là có thật và nối luồng thật: admin CRUD /admin/coupons + alias /admin/global-coupons + list issues (controller:1625-1720), member/guest claim (522-547), adminCouponIssue được tạo/tra cứu trong service (2920-3059, 5110+), và admin-coupon-issue được chấp nhận khi tạo booking. Doc hoàn toàn không có khái niệm này. NHƯNG AdminCouponScan chỉ tồn tại trong schema (1282-1293) và seed/verify.ts — không có dòng code runtime nào ghi/đọc bảng admin_coupon_scans. Cần sửa mô tả: bỏ hoặc ghi chú AdminCouponScan là bảng mới ở mức data model, chưa có luồng ghi log scan.

- Bổ sung vào: **3.G Membership, Point, Booking QR (hoặc mục mới về Coupon) + mục 6 Bảng 23**
- Bằng chứng: `backend/prisma/schema.prisma:1256-1324` · `backend/src/nightlife-data/nightlife-data.controller.ts:522-551` · `backend/src/nightlife-data/nightlife-data.controller.ts:1690-1725`

**2. Chat trong từng booking (BookingChatMessage)** _(so với BOO-08C, ADM-13)_

Code có kênh chat gắn với từng booking: BookingChatMessage với loại người gửi GUEST/MEMBER/ADMIN/OPERATOR/SYSTEM và chủ đề GENERAL/RESCHEDULE/CANCEL, có thể gắn vào một yêu cầu đổi lịch cụ thể. Guest, Member, Operator và Admin đều có API đọc/gửi tin nhắn theo booking. Tài liệu chỉ nói kênh hỗ trợ hủy/đổi là LINE OA/Mail (BOO-08C) và chat 1-1 với đối tác là P1 (ADM-13); chat theo booking giữa khách và admin/operator hoàn toàn chưa được đặc tả.

- Bổ sung vào: **3.F Booking & Notification + 3.L Notification & Communication**
- Bằng chứng: `backend/prisma/schema.prisma:144-156` · `backend/prisma/schema.prisma:747-772` · `backend/src/nightlife-data/nightlife-data.controller.ts:453-468` · `backend/src/nightlife-data/nightlife-data.controller.ts:989-1017`

**3. Mô hình phân quyền động: Role/Permission và quyền theo từng quán (StorePermission)** _(so với ADM-12)_

Ngoài role tĩnh, code có RBAC động: bảng Role (key, level, trạng thái), Permission (key), RolePermission và UserRoleAssignment cho phép gán nhiều role/quyền cho một tài khoản; và StorePermission gán danh sách quyền của một user trên từng quán cụ thể (unique user+store), bao gồm quyền wildcard store.staff.all. Đây là nền tảng phân quyền chi tiết hơn hẳn mô tả "Admin full; Partner login+scan" của tài liệu và cần được đặc tả (danh mục quyền, ai được gán).

- Bổ sung vào: **3.J Admin CMS & Dashboard (phân quyền) + mục 6 Bảng 23**
- Bằng chứng: `backend/prisma/schema.prisma:400-453` · `backend/prisma/schema.prisma:1187-1203` · `backend/src/access/access.service.ts:24` · `backend/src/access/access.service.ts:368`

**4. Quản lý phiên đăng nhập và chính sách 1 phiên đặc quyền duy nhất**

Code có hệ quản lý phiên: UserSession lưu từng phiên đăng nhập (jti, trạng thái ACTIVE/REVOKED/EXPIRED, thiết bị/IP, hạn phiên, lần hoạt động cuối, lý do thu hồi) và TokenBlacklist thu hồi token. Đặc biệt có chính sách bảo mật: tài khoản đặc quyền (admin/portal) chỉ được 1 phiên hoạt động tại một thời điểm - User.active_privileged_jti lưu phiên hợp lệ hiện tại, đăng nhập mới sẽ vô hiệu phiên cũ (token cũ bị từ chối khi jti không khớp, socket cũ bị ngắt). Tài liệu không có mục nào về phiên đăng nhập, thu hồi phiên hay chính sách single-session.

- Bổ sung vào: **Mục mới về Bảo mật tài khoản/Phiên đăng nhập (có thể trong 3.J hoặc phần Non-functional)**
- Bằng chứng: `backend/prisma/schema.prisma:32-36` · `backend/prisma/schema.prisma:304` · `backend/prisma/schema.prisma:1133-1166` · `backend/src/auth/auth.service.ts:664-667`

**5. Luồng quên mật khẩu bằng mã OTP 2 bước (PasswordResetToken)**

Code có luồng đặt lại mật khẩu: PasswordResetToken lưu mã OTP dạng hash (code_hash) gửi qua email, bước xác thực mã (verified_at) đổi sang reset token (reset_token_hash), có hạn dùng (expires_at) và chỉ dùng một lần (used_at). Kết hợp với các chính sách OTP đăng ký (OTP 8 số, khóa sau 5 lần sai theo lịch sử commit). Tài liệu hoàn toàn chưa đặc tả luồng quên mật khẩu/OTP, số lần thử, thời hạn mã.

- Bổ sung vào: **3.G MEM-01 (đăng ký/đăng nhập) - bổ sung mục quên mật khẩu & OTP**
- Bằng chứng: `backend/prisma/schema.prisma:1168-1185` · `backend/src/auth/auth.controller.ts:1`

**6. Cấu hình hệ thống SystemConfig do Admin chỉnh (giao diện, lưu trữ)**

Code có bảng SystemConfig dạng key-value (kèm người chỉnh sửa cuối) với API thật: cấu hình giao diện/appearance (public đọc được, admin chỉnh) và cấu hình lưu trữ storage kèm theo dõi dung lượng sử dụng. Đây là chế độ vận hành/quản trị hệ thống chưa có trong tài liệu.

- Bổ sung vào: **3.J Admin CMS & Dashboard + mục 6 Bảng 23 (System Config)**
- Bằng chứng: `backend/prisma/schema.prisma:1247-1254` · `backend/src/system-config/system-config.controller.ts:21-73`

### Frontend (các trang & trải nghiệm thực tế)

**1. Hiển thị giá đa tiền tệ theo ngôn ngữ với tỷ giá tự động**

Giá tiền được tự động quy đổi và hiển thị theo tiền tệ gắn với ngôn ngữ đang chọn: vi→VND, en→USD, ja→JPY, ko→KRW, zh→CNY. Tỷ giá lấy từ nhà cung cấp ngoài (open.er-api.com), cache 1 giờ, có bảng tỷ giá dự phòng khi lỗi. Tài liệu hoàn toàn không nhắc đến quy đổi tiền tệ.

- Bổ sung vào: **3.A Public Website & Navigation (bổ sung mục hiển thị đa tiền tệ)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/i18n/currency-format.ts:3-21` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/api/currency/rates/route.ts:14-25`

**2. Kiến trúc 4 cổng truy cập trên subdomain riêng + đăng nhập tập trung**

Hệ thống chạy 4 host tách biệt: public site, partner.<domain>, admin.<domain> và auth.<domain> (cổng đăng nhập tập trung). Middleware cưỡng chế: mở nhầm cổng sẽ bị redirect đúng cổng theo role; phiên đăng nhập tách biệt theo cổng (cookie tiền tố admin_/partner_); trang /chuyen-tiep làm bước bàn giao phiên an toàn giữa các cổng; khi đang đăng nhập role khác mà truy cập cổng đặc quyền sẽ bị chặn kèm thông báo 'login-blocked'. Đây là mô hình vận hành/bảo mật quan trọng chưa có trong tài liệu.

- Bổ sung vào: **Mục mới: Kiến trúc cổng truy cập & phiên đăng nhập (hoặc 3.J ADM-12)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/auth/hosts.ts:1-16` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/middleware.ts:20-39` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/middleware.ts:149-263` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(public)/chuyen-tiep/page.tsx:1-30`

**3. Chính sách 1 phiên đăng nhập/1 thiết bị và thông báo thay thế thiết bị**

Khi đăng nhập trên thiết bị mới, phiên cũ cùng role bị thu hồi (revoke token); người dùng được thông báo 'device-replaced' kèm nhãn thiết bị cũ và thời điểm hoạt động cuối. Đăng xuất sẽ thu hồi token phía server và dọn phiên ở cổng auth trung tâm. Chính sách bảo mật phiên này chưa có trong tài liệu.

- Bổ sung vào: **3.G Membership (MEM-01) hoặc mục bảo mật tài khoản mới**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/auth.ts:296-334` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/auth.ts:389-411`

**4. Luồng quên mật khẩu / đặt lại mật khẩu qua mã email**

Có 2 trang public /quen-mat-khau và /dat-lai-mat-khau: người dùng nhập email → nhận mã xác minh có thời hạn (expiresInMinutes) → xác minh mã đổi lấy resetToken có hạn (expiresAt) → đặt mật khẩu mới (nhập 2 lần). Tài liệu không có đặc tả quên mật khẩu.

- Bổ sung vào: **3.G Membership (bổ sung MEM quên mật khẩu)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/auth.ts:413-432` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(public)/quen-mat-khau/page.tsx:1` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(public)/dat-lai-mat-khau/page.tsx:1`

**5. Guest tự phục vụ booking bằng SĐT: tra cứu, hủy, đổi lịch, chat**

Guest (không đăng nhập) có kênh tự phục vụ mà tài liệu chưa mô tả: tra cứu booking bằng mã booking + email/SĐT; tự hủy và tự gửi yêu cầu đổi lịch với xác thực bằng SĐT đã khai khi đặt (nếu booking không có SĐT thì phải liên hệ Admin qua Mail); nhắn tin với Admin theo từng booking. Lịch sử booking của guest được lưu trên trình duyệt (tối đa 20 booking) và trang /lich-su-dat-cho, /dat-cho, /xac-nhan, /uu-dai đều truy cập được không cần đăng nhập.

- Bổ sung vào: **3.F Booking & Notification (bổ sung mục self-service Guest)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:602-625` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:240-252` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/lich-su-dat-cho/page.tsx:68-71` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:355-357`

**6. Chat hỗ trợ realtime toàn site + chat theo từng booking**

Hai lớp chat đã hoạt động: (1) widget chat hỗ trợ realtime (socket.io namespace /support) cho mọi khách kể cả guest — guest có session id lưu máy, lịch sử chat tự gộp vào tài khoản khi đăng nhập, Admin có màn 'Chat hỗ trợ' riêng (/admin/support-chat) với badge số hội thoại chờ; (2) chat theo từng booking giữa khách (Member/Guest) và Admin với chủ đề GENERAL/RESCHEDULE/CANCEL, người gửi GUEST/MEMBER/ADMIN/OPERATOR/SYSTEM. Tài liệu xếp 'chat khách realtime' vào P1 và không mô tả chi tiết.

- Bổ sung vào: **3.L Notification & Communication (bổ sung kênh chat in-app)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/components/layout/SupportChatWidget.tsx:642-699` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/components/layout/SupportChatWidget.tsx:817` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:289-317` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/layout.tsx:44-49`

**7. Trung tâm thông báo in-app cho member (chuông thông báo realtime)**

Member có trung tâm thông báo ngay trên web: chuông với số chưa đọc, phân loại bill/booking/system, cập nhật realtime qua socket, đánh dấu đã đọc từng cái hoặc tất cả; nội dung gồm kết quả duyệt/từ chối bill (kèm điểm được cộng, lý do từ chối), diễn biến booking... Tài liệu 3.L chỉ có Telegram/Email/LINE, không có kênh thông báo in-app.

- Bổ sung vào: **3.L Notification & Communication**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/notifications.ts:1-75` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/components/layout/SiteChrome.tsx:377-470`

**8. Giám sát dung lượng lưu trữ VPS và chặn upload khi đầy**

Admin có trang /admin/system/storage theo dõi dung lượng lưu trữ; hệ thống cảnh báo trong trung tâm thông báo admin khi dùng ≥90% và khi đầy thì hiển thị 'Dung lượng VPS đã đầy! Hệ thống đang bị ngưng upload' — tức có quy tắc vận hành chặn upload media khi hết dung lượng. Tài liệu không đề cập cơ chế này.

- Bổ sung vào: **3.J Admin CMS & Dashboard (ADM-04 media / vận hành hệ thống)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/layout.tsx:313-339` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/system/storage/page.tsx:1`

**9. Các trang hệ thống: bảo trì, 403, 500, not-found, hướng dẫn 'đang cập nhật'**

Hệ thống có bộ trang trạng thái mà tài liệu chưa đặc tả: /maintenance (màn bảo trì), /403 (không đủ quyền), /500 (lỗi hệ thống), trang not-found và error chung, cùng các màn loading/empty state chuẩn hóa; trang /trang-thai-he-thong là bộ demo UI hệ thống (toast/popup/loading) dùng nội bộ, bị chặn index. Trang 'Hướng dẫn' (/huong-dan) đang chủ động hiển thị trạng thái 'Hệ thống đang cập nhật' (noindex) thay vì nội dung — tức có khái niệm trang tạm khóa nội dung.

- Bổ sung vào: **3.A Public Website & Navigation (bổ sung trang trạng thái hệ thống)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/maintenance/page.tsx:1-5` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/components/ui/SystemStatusPage.tsx:18` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(public)/huong-dan/page.tsx:8-27` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/403/page.tsx:1`

**10. Chế độ giao diện sáng/tối cho người dùng cuối và admin**

Toàn site có nút chuyển dark/light mode ở header (mặc định dark, lưu lựa chọn trên máy); khu admin cũng có theme sáng/tối riêng. Tài liệu không đề cập chế độ hiển thị.

- Bổ sung vào: **3.A Public Website & Navigation**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/components/layout/ThemeToggle.tsx:10-38` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/layout.tsx:286`

**11. Trang bảo mật tài khoản member: quy tắc cập nhật hồ sơ**

Trang /bao-mat-tai-khoan cho member tự cập nhật họ tên (2-80 ký tự, chỉ chữ và khoảng trắng), email (validate định dạng) và SĐT (8-15 chữ số, tối đa 20 ký tự, cho phép + - ( ) .); hiển thị role/tier/status tài khoản; ghi rõ email/SĐT dùng để nhận xác nhận lịch đặt, mã QR và thông báo hỗ trợ. Tài liệu chưa có mục hồ sơ cá nhân member và các ràng buộc dữ liệu này.

- Bổ sung vào: **3.G Membership (bổ sung mục hồ sơ tài khoản)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/bao-mat-tai-khoan/page.tsx:40-96` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/bao-mat-tai-khoan/page.tsx:322`

**12. Danh sách đầy đủ các trang khu Member trên web**

Khu member thực tế gồm 10 trang mà tài liệu chưa liệt kê thành danh mục: /tai-khoan (dashboard: điểm, hạng, menu), /lich-su-dat-cho (lịch sử đặt chỗ & tour, tab Tất cả/Mới/Hoàn tất/Đã hủy, hủy/đổi lịch/chat), /dat-cho (form đặt chỗ), /xac-nhan (màn xác nhận + QR tải về được), /gui-hoa-don (gửi hóa đơn), /vi-uu-dai (ví mã ưu đãi, /chi-tiet-ma redirect về đây), /uu-dai (kho ưu đãi public), /da-luu (quán & cast đã lưu), /bao-mat-tai-khoan (hồ sơ). Trong đó chỉ /tai-khoan, /bao-mat-tai-khoan, /da-luu, /gui-hoa-don, /vi-uu-dai bắt buộc đăng nhập; các trang còn lại phục vụ cả guest.

- Bổ sung vào: **3.G Membership (bổ sung sơ đồ trang khu thành viên)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/middleware.ts:152` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/tai-khoan/page.tsx:55-59` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/lich-su-dat-cho/page.tsx:61`

## PHẦN 3 — TÀI LIỆU CÓ NHẮC NHƯNG CODE CHI TIẾT HƠN / KHÁC ĐÁNG KỂ (73 mục)

_Tài liệu nêu ý tổng quát; code đã có quy tắc/giới hạn/trạng thái cụ thể cần được đặc tả lại._

### Xác thực, tài khoản & phân quyền

**1. Đăng ký thành viên bắt buộc xác thực OTP email 8 số, có cooldown và khóa sau 5 lần sai** _(so với MEM-01)_

Luồng đăng ký Member gồm 2 bước: (1) gửi mã OTP về email, (2) đăng ký kèm OTP. Quy tắc: OTP là số 8 chữ số, hiệu lực 15 phút; giữa 2 lần gửi OTP cho cùng email phải cách nhau tối thiểu 60 giây; nhập sai OTP quá 5 lần thì email bị chặn đăng ký (thông báo 'Tài khoản/Email đã bị chặn đăng ký do nhập sai OTP quá 5 lần'), chặn cả việc xin OTP mới lẫn đăng ký; email đã có tài khoản không được xin OTP. Nếu gửi email OTP thất bại, hệ thống hủy mã và báo lỗi. Tài liệu MEM-01 chỉ ghi 'Đăng ký / đăng nhập thành viên' mà không có bất kỳ quy tắc OTP nào.

- Bổ sung vào: **3.G Membership, Point, Booking QR (thêm mục con MEM-01B: Xác thực email khi đăng ký)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:135-138` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:167-221` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:1017-1057` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:1063-1065`

**2. Hệ thống có 6 vai trò với cấp bậc (level) và quy tắc gán role theo cấp, khác với 3 vai trò trong tài liệu** _(so với ADM-12)_

Vai trò thực tế: SUPER_ADMIN (level 100), ADMIN (80), OPERATOR (50), STAFF - nhân viên quán (40), PARTNER (30), USER/Member (10). SUPER_ADMIN vượt qua mọi kiểm tra phân quyền theo role. Quy tắc gán role: người gán chỉ được gán role có level THẤP HƠN level cao nhất của mình, và không được thay đổi role của người có level bằng/cao hơn mình. Operator đã được triển khai đầy đủ (endpoint đăng nhập riêng, duyệt reschedule, chat booking, hủy booking, xem hàng đợi bill nhạy cảm) trong khi ADM-12 ghi 'Operator P1'. Tài liệu ADM-12 chỉ nêu 3 vai trò Admin/Operator/Partner; Super Admin chỉ được nhắc trong các mục về Audit Log (4.4, 4.7, mục 9), không có STAFF, không có khái niệm level.

> Ghi chú kiểm chứng: Nội dung cốt lõi đúng, chỉ sai một chi tiết: Super Admin không phải 'chỉ xuất hiện ở mục 4.7' mà xuất hiện ở cả 4.4 (actor_role 'Super Admin / Admin / Operator'), 4.7 và mục 9 AC ('log security chỉ Super Admin xem') - nhưng tất cả đều thuộc phần Audit Log, không nằm trong mô hình phân quyền ADM-12 (chỉ Admin/Operator/Partner, Operator P1). Code xác nhận: seed 00-roles.ts:3-44 đủ 6 role level 100/80/50/40/30/10; schema.prisma:9-16 enum UserRole có STAFF, SUPER_ADMIN; roles.guard.ts:24-26 SUPER_ADMIN bypass mọi @Roles; users.service.ts:395-437 assignRole chỉ cho gán role level thấp hơn level cao nhất của mình và không sửa được người ngang/cao cấp hơn; Operator đã triển khai thật (POST /auth/login/operator + các permission operator trong seed). Lưu ý phụ: seed mô tả STAFF là 'internal support staff' nhưng cách dùng thực tế (module partner-staff) là nhân viên quán.

- Bổ sung vào: **3.J Admin CMS (ADM-12: cập nhật danh sách vai trò đầy đủ + quy tắc cấp bậc gán role)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/prisma/seed/00-roles.ts:3-44` · `D:/laragon/www/NightLife-VN/backend/prisma/schema.prisma:9-16 (enum UserRole)` · `D:/laragon/www/NightLife-VN/backend/src/auth/roles.guard.ts:24-28` · `D:/laragon/www/NightLife-VN/backend/src/users/users.service.ts:395-437 (assignRole)`

**3. Ma trận phân quyền chi tiết theo permission + giới hạn phạm vi theo quán** _(so với ADM-12, PAR-04)_

Phân quyền không chỉ theo role mà theo danh mục ~29 permission gán cho từng role trong DB (ví dụ: coupon.scan, checkin.confirm, bill.approve, bill.void, bill.reverse, bill.pm_ba.confirm, ranking.manage, booking.cancel, store.policy.update, system.hard_delete chỉ Super Admin, system.role.assign...). Partner/Staff bị giới hạn phạm vi theo quán được gán (StorePermission): scan QR/xác nhận check-in chỉ hợp lệ với QR thuộc quán của mình; Admin/Operator có phạm vi toàn nền tảng. Staff có cơ chế quyền ủy quyền theo quán (wildcard store.staff.all). Tài liệu ADM-12/PAR-04 chỉ mô tả 3 quyền lõi thô của Partner.

- Bổ sung vào: **3.J Admin CMS (ADM-12: bảng ma trận permission theo role và phạm vi quán)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/prisma/seed/00-roles.ts:46-228` · `D:/laragon/www/NightLife-VN/backend/src/access/access.service.ts:283-478` · `D:/laragon/www/NightLife-VN/backend/src/access/action-policy.guard.ts:13-141` · `D:/laragon/www/NightLife-VN/backend/prisma/schema.prisma:1187-1203 (StorePermission)`

**4. Trạng thái tài khoản: ACTIVE / SUSPENDED / DELETED / INACTIVE và ảnh hưởng tới đăng nhập** _(so với 4.2 (ACCOUNT_LOCK))_

Tài khoản có 4 trạng thái: ACTIVE, SUSPENDED (tạm khóa), DELETED (vô hiệu hóa/xóa mềm), INACTIVE (ngưng hoạt động - dùng khi nhân viên bị gỡ khỏi quán). Chỉ tài khoản ACTIVE mới đăng nhập được (áp dụng cho cả đăng nhập mật khẩu, Google, LINE) và phiên đang hoạt động của tài khoản không ACTIVE cũng bị chặn ngay ở mọi request. Admin CMS lọc người dùng theo trạng thái với nhãn 'disabled' = DELETED và 'muted' = SUSPENDED. Tài liệu chỉ có action audit ACCOUNT_LOCK, không định nghĩa các trạng thái tài khoản và hệ quả nghiệp vụ.

- Bổ sung vào: **Mục 6 Dữ liệu chính (entity User: bổ sung trạng thái tài khoản) + 3.J ADM**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/prisma/schema.prisma:25-30 (enum UserStatus)` · `D:/laragon/www/NightLife-VN/backend/src/users/users.service.ts:346-371` · `D:/laragon/www/NightLife-VN/backend/src/users/users.service.ts:484-503` · `D:/laragon/www/NightLife-VN/backend/src/auth/jwt.strategy.ts:52-54`

**5. Hạng thành viên trong hệ thống có 4 mức: FREE / MEMBER / PREMIUM / VIP (tài liệu chỉ có Guest/Member/VIP)** _(so với MEM-02, mục 1.2)_

Enum hạng khách (tier) của tài khoản gồm FREE, MEMBER, PREMIUM, VIP - nhiều hơn tài liệu (Guest/Member/VIP theo MEM-02, bảng 1.2). Khi tạo tài khoản, tier hợp lệ được chuẩn hóa: VIP giữ VIP, PREMIUM giữ PREMIUM, còn lại mặc định MEMBER; tài khoản tạo qua Google/LINE luôn là MEMBER. Tier được nhúng vào token đăng nhập và trả về trong hồ sơ công khai, tức có ý nghĩa nghiệp vụ (mức giảm/quyền lợi). BA cần chốt PREMIUM/FREE có thuộc phạm vi hạng khách v1 hay không và mức ưu đãi tương ứng.

- Bổ sung vào: **1.2 Hạng khách v1 / 3.G MEM-02 (làm rõ tier PREMIUM và FREE)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/backend/prisma/schema.prisma:18-23 (enum UserTier)` · `D:/laragon/www/NightLife-VN/backend/src/users/users.service.ts:334-344` · `D:/laragon/www/NightLife-VN/backend/src/auth/auth.service.ts:737-748`

### Quán, Cast, Tìm kiếm & Ranking

**1. Bộ lọc tìm kiếm public nhiều hơn đặc tả: ưu đãi, ngôn ngữ, tag, khu vực con, tọa độ gần nhất** _(so với SEA-01, SEA-02, SEA-03, SEA-04)_

API khám phá có bộ lọc/tham số vượt đặc tả: hasActiveCoupon=true lọc quán đang có ưu đãi hiệu lực chạy ngay P0 trong khi SEA-04 chốt lọc theo ưu đãi là P1 (xung đột phase); lọc khu vực con trong thành phố (quận hoặc mã/tên khu vực - tham số area); storeSlug; q tìm quán theo cả TÊN CAST thuộc quán (với cast tìm theo nghệ danh/alias/bio/tags/ngôn ngữ/tên quán); quy tắc phân trang chi tiết (limit mặc định 24 tối đa 100; offset tối đa 10.000; sort nearest/priority chỉ hỗ trợ offset+limit ≤ 500) và cơ chế distanceKm tính Haversine. Lưu ý: bản thân 'tìm theo địa điểm gần nhất' đã có ở SEA-02 (P0) và lọc tag/ngôn ngữ cast đã được CAS-07 (P0) bao phủ ở mức tính năng - chỉ chi tiết cơ chế (lat/lng bắt buộc khi sort=nearest, distanceKm...) là chưa đặc tả.

> Ghi chú kiểm chứng: Code đúng như mô tả (DTO 12-75; buildPublicStoreWhere 15578-15682 có includeCastName:true ở listPublicStores dòng 2004; cast search 2452-2474; Haversine 16667-16691; limit 24/100, offset ≤10.000, sort window ≤500 tại const 181-188). NHƯNG doc đã bao 2 ý ở mức tính năng: SEA-02 (P0) đã có 'Tìm theo địa điểm gần nhất' → lat/lng/nearest là hiện thực hóa của SEA-02, không phải ngoài đặc tả; CAS-07 (P0) 'Tags/keywords: độ tuổi, phong cách, ngôn ngữ... Phục vụ tìm kiếm/lọc' đã bao lọc tag/ngôn ngữ cast. Cần bỏ 2 ý đó khỏi danh sách vượt đặc tả.

- Bổ sung vào: **3.B Search, Filter & Discovery**
- Bằng chứng: `backend/src/nightlife-data/dto/public-discovery-query.dto.ts:12-75` · `backend/src/nightlife-data/nightlife-data.service.ts:15578-15805` · `backend/src/nightlife-data/nightlife-data.service.ts:2436-2475` · `backend/src/nightlife-data/nightlife-data.service.ts:16636-16690`

**2. Quy tắc nghiệp vụ chi tiết của Ranking: nhóm, giới hạn 5 item, pin không trùng, điểm tay, lịch hiệu lực, sponsored** _(so với RAN-01, RAN-05, RAN-07)_

Một cấu hình ranking gồm: targetType (CAST/STORE), cityCode ('all' = tab Tổng hợp là bảng RIÊNG do Admin cấu hình, không tự gộp HN+HCM), category (null = áp dụng mọi danh mục), scope (chuỗi tự do, mặc định 'global', tối đa 40 ký tự — dùng thêm scope 'recommend-home' cho khối gợi ý trang chủ). Ràng buộc: mỗi nhóm (targetType+city+category+scope) tối đa 5 item ACTIVE; pinRank 1-5 và không được trùng trong nhóm (báo lỗi collision); manualScore 0-100.000 xếp hạng phần không ghim; trạng thái ACTIVE/PAUSED/EXPIRED (+ xóa mềm DELETED); khung thời gian hiệu lực startsAt/endsAt (bắt buộc start < end, ngoài khung tự ẩn khỏi public); cờ sponsored (quán trả tiền); chỉ hiển thị target còn ACTIVE (cast phải isPublic). Public ranking limit 1-5, mặc định 5; khi lọc theo city, hệ thống map theo mọi biến thể mã cũ ('01', '79', 'hanoi', 'saigon'...) để không rò rỉ chéo thành phố. Tài liệu 3.C chỉ mô tả 'manual ranking Top 1-5' chung chung.

- Bổ sung vào: **3.C Ranking Page & Ranking Control**
- Bằng chứng: `backend/src/nightlife-data/dto/admin-ranking.dto.ts:52-170` · `backend/src/nightlife-data/nightlife-data.service.ts:16206-16315` · `backend/src/nightlife-data/nightlife-data.service.ts:1346-1409` · `backend/src/nightlife-data/nightlife-data.service.ts:182-184`

**3. Thao tác ranking đã có Audit Log kèm thông báo hành động nhạy cảm** _(so với RAN-09, 3.L)_

Tạo/sửa/xóa cấu hình ranking đều: (1) ghi audit log module 'Ranking' với actor, role, action (ranking.config.create/update/delete), mã hiển thị RC-xxxxxxxx, snapshot before/after JSON, metadata (targetType/targetId/city/category/scope), result SUCCESS — đáp ứng RAN-09; và (2) đồng thời phát sinh THÔNG BÁO hành động nhạy cảm nội bộ (templateKey audit.ranking.config.*.v1) — tài liệu chưa nói ranking phải bắn notification. Xóa ranking là xóa mềm (status DELETED + deletedAt).

- Bổ sung vào: **3.C Ranking (RAN-09) + 3.L Notification & Communication**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:1704-1758` · `backend/src/nightlife-data/nightlife-data.service.ts:1856-1913` · `backend/src/nightlife-data/nightlife-data.service.ts:1929-1996`

**4. Trường dữ liệu quán ngoài đặc tả: menu giá cấu trúc, tọa độ, Google Place, lịch nghỉ lễ, validation tên/SĐT** _(so với STO-01, STO-02, STO-07, mục 6 Partner/Store)_

Quán có các trường nghiệp vụ chưa có trong mục 6: ward (phường), latitude/longitude, googlePlaceId, holidaySchedule (lịch nghỉ lễ tách khỏi openingHours), tags, pricingInfo dạng cấu trúc menu (nhóm món/items với amountVnd, đơn vị, mô tả, ảnh, cờ 'hot', bậc giá tier 1-4 hiển thị $-$$$$), và 'giá tham khảo từ' (startingFromVnd) = giá menu thấp nhất, fallback = giá giờ cast thấp nhất của quán; ghi chú mặc định 'Menu và mức chi phí do quán cập nhật, admin xác nhận lại sau khi đặt chỗ'. Giờ mở cửa nhập theo từng thứ với isOff và nhiều khung 'HH:mm - HH:mm' (validate 0-23h59, khung mở ≠ đóng). Validation: tên quán ≥ 2 ký tự, chỉ chữ/số/khoảng trắng/&'.,- (chặn <>{}); SĐT phải là số Việt Nam hợp lệ (di động 10 số theo đầu số nhà mạng hoặc cố định 02x 11 số, chấp nhận +84). Quán còn liên kết trực tiếp partnerAccountId (gán/tháo tài khoản đối tác, tự đồng bộ quyền quét QR của đối tác với quán).

- Bổ sung vào: **3.D Store Detail + mục 6 (data model Store)**
- Bằng chứng: `backend/src/nightlife-data/dto/admin-store.dto.ts:31-89,121-252` · `backend/src/common/validation/store-fields.validation.ts:1-47` · `backend/src/nightlife-data/nightlife-data.service.ts:15108-15275` · `backend/src/nightlife-data/nightlife-data.service.ts:2157-2200`

**5. Trường dữ liệu cast ngoài đặc tả: nghệ danh public, bio 2 lớp, GIÁ THEO GIỜ, video YouTube, giới hạn chiều cao** _(so với CAS-06)_

Cast có các trường/quy tắc ngoài đặc tả CAS-06: hourlyRateVnd - GIÁ THEO GIỜ hiển thị công khai ở trang quán/danh sách cast và được dùng làm 'giá từ' của quán (tài liệu hoàn toàn không nhắc tới giá cast); bio 2 lớp (bio nội bộ + publicBio hiển thị public); styleTags tách khỏi tags; heightCm giới hạn 50-250cm; quy tắc media: ảnh đầu tiên thành avatar (CAST_AVATAR), còn lại là album (CAST_PHOTO), video gắn CAST_VIDEO, media bị gỡ chuyển sang ẩn/protected chứ không xóa. Lưu ý: publicAlias tương ứng 'nickname' đã có trong CAS-06 và việc gắn link video đã được CAS-04 cho phép - 2 ý này không tính là ngoài đặc tả; ngoài ra publicAlias/hourlyRateVnd/styleTags không chỉnh được qua DTO admin cast mà được ghi qua luồng partner listing draft. Đúng như doc: không lưu/hiển thị ngày-năm sinh, chỉ birthMonth + cung hoàng đạo.

> Ghi chú kiểm chứng: Phần lõi đúng: hourlyRateVnd hiển thị public ở trang quán/danh sách cast (2394, 2539, 2731) và làm 'giá từ' của quán (buildStorePriceReference 15108-15127) - doc không nhắc giá cast ở đâu; bio + publicBio 2 lớp; styleTags riêng; heightCm 50-250 (admin-cast.dto.ts 33-36); youtubeLinks tự ghép vào gallery dạng video (2698-2706); media gỡ chuyển HIDDEN/PROTECTED không xóa (22603-22616); không lưu ngày/năm sinh - đúng doc. NHƯNG 2 ý phải bỏ khỏi 'ngoài đặc tả': publicAlias chính là 'nickname' đã có trong CAS-06; gắn link video đã được CAS-04 cho phép ('được phép gắn link hoặc tải lên') nên YouTube links chỉ là chi tiết hiện thực hóa.

- Bổ sung vào: **3.E Cast Profile (CAS-06) + mục 6 (data model Cast)**
- Bằng chứng: `backend/src/nightlife-data/dto/admin-cast.dto.ts:13-139` · `backend/src/nightlife-data/nightlife-data.service.ts:2587-2762` · `backend/src/nightlife-data/nightlife-data.service.ts:22744-22801`

**6. Luồng duyệt chỉnh sửa cast do Partner gửi: bản nháp PENDING_REVIEW được merge vào cast gốc khi Admin duyệt** _(so với CAS-11, PAR-04B)_

Khi Partner gửi chỉnh sửa cast (qua listing draft), hệ thống tạo BẢN SAO cast ở trạng thái PENDING_REVIEW gắn tham chiếu cast gốc. Khi Admin duyệt (đổi status sang ACTIVE), hệ thống merge nội dung + media của bản nháp vào cast gốc trong 1 transaction, ẩn media cũ không còn dùng, rồi xóa mềm bản nháp; nếu cast gốc không còn tồn tại thì báo lỗi. Danh sách cast trong CMS tự ẨN cast gốc khi đang có bản nháp chờ duyệt (tránh hiển thị trùng). Đây là cơ chế kiểm duyệt 2 bản (draft copy → merge) chưa được mô tả ở CAS-11/PAR-04B.

- Bổ sung vào: **3.E Cast Profile (CAS-11) + 3.I Partner (PAR-04B)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:22530-22648` · `backend/src/nightlife-data/nightlife-data.service.ts:22461-22477`

**7. Đếm lượt xem hồ sơ quán/cast công khai (analytics) đã chạy ở P0** _(so với RAN-04)_

Có endpoint public POST /analytics/profile-view ghi nhận lượt xem trang chi tiết quán/cast (không cần đăng nhập, chỉ nhận target STORE/CAST đang public); dữ liệu lưu vào audit log với action PROFILE_VIEW_RECORDED và được dùng làm tín hiệu xếp hạng gợi ý (đếm 30 ngày gần nhất). Frontend trang chi tiết quán và cast đều gọi. Tài liệu RAN-04 xếp 'đếm chỉ số views tự động' vào P1, P0 chỉ hiển thị thủ công — code đã đếm tự động từ bây giờ.

- Bổ sung vào: **3.C Ranking (RAN-04) hoặc mục mới về analytics public**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:2764-2808` · `backend/src/nightlife-data/nightlife-data.controller.ts:385-388` · `backend/src/nightlife-data/dto/profile-view.dto.ts:4-12` · `frontend/apps/web/src/app/(public)/stores/[slug]/StoreDetailClient.tsx`

**8. Dashboard Admin chi tiết hơn ADM-01: bộ lọc, KPI tài chính, biểu đồ 7 ngày, badge chờ xử lý** _(so với ADM-01)_

GET /admin/dashboard/stats hỗ trợ bộ lọc timeframe (hôm nay/7 ngày/tháng này), city (all/hn/hcm/1 trong 34 tỉnh/'other' = tỉnh khác), category (8 loại). KPI trả về: số quán ACTIVE (kèm tách riêng HN và HCM), tổng cast, tổng bài viết, bill chờ duyệt + TỔNG TIỀN bill chờ duyệt, cast chờ duyệt (PENDING_REVIEW), yêu cầu partner chờ duyệt, booking trong kỳ (tổng/hoàn tất/mới), doanh thu và hoa hồng trong kỳ (CHỈ tính bill VERIFIED/PAID theo ngày sử dụng dịch vụ), biểu đồ doanh thu 7 ngày gần nhất tính theo múi giờ Asia/Ho_Chi_Minh, 5 booking gần nhất, 4 thông báo Telegram gần nhất. Ngoài ra GET /admin/layout/badges đếm số chờ xử lý cho sidebar: bill, cast, partner và CHAT HỖ TRỢ (supportTicket) đang pending. Lưu ý: doc ADM-01 gợi ý 'nên có số Booking QR đã cấp/đã dùng/hết hạn' — dashboard hiện KHÔNG có thống kê QR.

- Bổ sung vào: **3.J Admin CMS & Dashboard (ADM-01)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:21909-22178` · `backend/src/nightlife-data/nightlife-data.service.ts:21725-21786` · `backend/src/nightlife-data/nightlife-data.service.ts:19434-19514` · `backend/src/nightlife-data/nightlife-data.service.ts:152-154`

**9. Quán hiển thị ưu đãi đang hiệu lực (activeCoupon) ngay trên thẻ tìm kiếm và trang chi tiết** _(so với STO-08, SEA-04)_

Danh sách quán public đính kèm 1 coupon đang hiệu lực mới nhất của quán (tên, loại giảm, giá trị, giảm tối đa, chi tiêu tối thiểu, hạn, giới hạn lượt/đã dùng); trang chi tiết quán trả toàn bộ coupon hiệu lực và tự sinh mục 'campaigns' từ coupon. Coupon hạng khách mặc định (default tier coupon theo Guest/Member/VIP) bị LOẠI khỏi hiển thị khám phá — chỉ hiển thị chiến dịch riêng của quán. Đây là quy tắc hiển thị ưu đãi ở tầng khám phá mà mục 3.B/3.D (STO-08) chưa mô tả.

- Bổ sung vào: **3.D Store Detail (STO-08) + 3.B**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:2061-2133` · `backend/src/nightlife-data/nightlife-data.service.ts:2348-2407` · `backend/src/nightlife-data/nightlife-data.service.ts:16585-16607`

**10. SEO metadata tự sinh theo template cho trang quán/cast** _(so với CON-06)_

Backend tự sinh SEO cho từng trang: quán — title '{Tên quán} | NightLife VN', description tự build, canonicalPath /stores/{slug}, ogImage lấy ảnh đầu tiên; cast — title '{Tên} tại {Tên quán} | NightLife VN', description ưu tiên publicBio (cắt 130-170 ký tự) kèm khu vực và ngôn ngữ hỗ trợ, canonicalPath /casts/{slug}. CON-06 mới chốt 'P0 title/meta description' chung chung, chưa đặc tả template và nguồn dữ liệu tự sinh.

- Bổ sung vào: **3.K SEO (CON-06)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:2425-2430` · `backend/src/nightlife-data/nightlife-data.service.ts:2755-2760` · `backend/src/nightlife-data/nightlife-data.service.ts:15277-15310`

### Booking, QR, Bill, Điểm & Hoa hồng

**1. Hạn chót hủy/đổi lịch cấu hình theo từng quán: 30/60/120 phút (mặc định 60); Admin/Operator hủy không bị giới hạn** _(so với BOO-08A)_

Doc chốt cứng 'hủy trước giờ hẹn tối thiểu 1 giờ'. Code cho phép mỗi quán cấu hình cancelCutoffMinutes = 30, 60 hoặc 120 phút (mặc định 60) qua API booking-policy dành cho Admin/Operator (có audit BOOKING_POLICY_UPDATED). Khách chỉ hủy/đổi được khi còn cách giờ hẹn >= cutoff; Admin/Operator hủy hộ thì bỏ qua cutoff. Booking CHECKED_IN/COMPLETED/NO_SHOW không được hủy/đổi.

- Bổ sung vào: **3.F Booking & Notification (BOO-08A)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:179-180` · `backend/src/nightlife-data/nightlife-data.service.ts:4667-4736` · `backend/src/nightlife-data/nightlife-data.service.ts:14684-14731` · `backend/src/nightlife-data/nightlife-data.service.ts:4947-4953`

**2. QR ưu đãi booking = coupon issue của coupon mặc định theo hạng, tự tạo coupon cho từng quán; hạn QR bị giới hạn thêm bởi ngày kết thúc campaign** _(so với MEM-03, MEM-04B, MEM-04C)_

QR ưu đãi thực tế là bản ghi CouponIssue gắn coupon mặc định GUEST5/MEMBER8/VIP10 của từng quán; nếu quán chưa có, hệ thống tự tạo coupon mặc định khi có booking đầu tiên. Hạn dùng = giờ hẹn + 24h (Guest) / + 7 ngày (Member/VIP) đúng doc, NHƯNG bị cắt ngắn (cap) theo ngày kết thúc (endsAt) của coupon nếu sớm hơn. Trạng thái ISSUED/USED/EXPIRED/REVOKED hiển thị nhãn 'Đang giữ chỗ / Đã sử dụng / Hết hạn / Đã hủy'. Coupon có usageLimit - đạt giới hạn thì không phát hành QR nữa. QR là deep-link ký số (signed token) kèm hash; hỗ trợ quét offline.

- Bổ sung vào: **3.G Membership, Point, Booking QR + mục 6.2**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:10829-10884` · `backend/src/nightlife-data/nightlife-data.service.ts:11855-11876` · `backend/src/nightlife-data/nightlife-data.service.ts:21239-21245` · `backend/src/nightlife-data/nightlife-data.service.ts:621-626`

**3. Hạng tài khoản thực tế gồm FREE/MEMBER/PREMIUM/VIP; FREE hưởng 8%, PREMIUM hưởng 10%** _(so với MEM-02)_

Doc chỉ có Guest/Member/VIP. Code có 4 tier: FREE, MEMBER, PREMIUM, VIP; khi tính ưu đãi: VIP và PREMIUM → 10% (VIP10), MEMBER và FREE → 8% (MEMBER8), còn lại → 5%. Nghĩa là mọi tài khoản đăng nhập đều tối thiểu được 8%.

- Bổ sung vào: **1.2 Hạng khách v1 và mức giảm + 3.G (MEM-02)**
- Bằng chứng: `backend/prisma/schema.prisma:18-23` · `backend/src/nightlife-data/nightlife-data.service.ts:19916-19924` · `backend/src/nightlife-data/nightlife-data.service.ts:10836-10845`

**4. Admin có thể Thu hồi (revoke) hoặc Xoay (rotate) token QR khi nghi lộ mã** _(so với 4.2 QR_INVALIDATE)_

Hai thao tác an ninh QR chưa có trong doc: (1) Revoke QR - chuyển issue sang REVOKED, QR không dùng được nữa; (2) Rotate QR - sinh token/mã QR mới cho cùng issue, token cũ bị đưa vào danh sách thu hồi và bị từ chối khi quét ('Coupon QR token has been revoked or rotated'), có đếm số lần xoay. Cả hai chỉ áp dụng cho issue đang ISSUED, có audit COUPON_QR_TOKEN_REVOKED/ROTATED với lý do 'ADMIN_QR_COMPROMISE_RESPONSE'.

- Bổ sung vào: **3.G Membership, Point, Booking QR + mục 4.2**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:7008-7186` · `backend/src/nightlife-data/nightlife-data.service.ts:21272-21294` · `backend/src/nightlife-data/nightlife-data.controller.ts:1321-1348`

**5. Bill có 7 trạng thái, gồm PENDING_PM_BA (chờ PM/BA xác nhận hoa hồng âm), PAID và VOIDED** _(so với BIL-03, BIL-04)_

Doc chỉ có Pending/duyệt/từ chối. Code có 7 trạng thái: DRAFT, SUBMITTED, PENDING_PM_BA, VERIFIED, REJECTED, PAID, VOIDED. Cơ chế PENDING_PM_BA (hoa hồng âm cần PM/BA xác nhận, bật confirmNegativeCommission kèm lý do bắt buộc) tồn tại đầy đủ trong code và có endpoint confirm-negative-commission riêng, nhưng do hoa hồng đã bị tắt hoàn toàn (snapshot luôn flags rỗng) nên với luồng duyệt hiện tại bill mới không bao giờ rơi vào PENDING_PM_BA — đây là nhánh dự phòng/ngủ đông. Bill VERIFIED không duyệt lại; PAID/VOIDED không được review. Có API xem trước kết quả duyệt (gross/giảm/net/điểm/cờ cảnh báo).

> Ghi chú kiểm chứng: 7 trạng thái đúng (schema:187-195); VERIFIED không duyệt lại, PAID/VOIDED không review, API preview admin/sensitive-bills/:billId/approval-preview có thật (8708-8845, controller:1470-1485). NHƯNG: vì commission đã bị tắt (resolveBillApprovalCommission luôn trả flags:[] — 10442), cờ NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED không bao giờ được sinh khi duyệt → bill mới không thể rơi vào PENDING_PM_BA qua luồng duyệt hiện tại; nhánh PENDING_PM_BA/confirm-negative-commission chỉ còn xử lý bill đã ở trạng thái đó từ trước (nhánh gần như ngủ đông).

- Bổ sung vào: **3.H Bill, Revenue & Commission**
- Bằng chứng: `backend/prisma/schema.prisma:187-195` · `backend/src/nightlife-data/nightlife-data.service.ts:8770-8845` · `backend/src/nightlife-data/nightlife-data.service.ts:8708-8761` · `backend/src/nightlife-data/nightlife-data.controller.ts:1476-1516`

**6. Công thức duyệt bill: gross → trừ giảm giá → net → cộng phí dịch vụ + thuế = phải trả; bill thực tế nhiều trường hơn doc** _(so với BIL-02, BIL-04, BIL-05)_

Khi duyệt: gross = subtotal (hoặc suy từ total+discount); discount theo snapshot ưu đãi (round, cap maxDiscountVnd, min spend); net = gross − discount; payable = net + serviceCharge + tax. Doc mục 6 đã nhắc chung 'giảm giá/phí/thuế nếu có' cho Bill, nhưng chưa nêu các trường: paidVnd, commissionAmountVnd, pointsEarned, billNumber, submitterType (MEMBER/VIP/PARTNER), 3 snapshot rule (discount/commission/point), người review/verify/reject + mốc thời gian từng bước. Lệch quy trình: endpoint 'admin/bills/:id/status' bắt buộc lý do khi từ chối, nhưng 'sensitive-bills/:billId/review' thiếu lý do sẽ tự điền 'Rejected by admin review' thay vì chặn (doc TC-AUD-BIL-002 yêu cầu chặn).

> Ghi chú kiểm chứng: Công thức đúng: gross = subtotal hoặc total+discount; net = gross − discount; payable = net + serviceCharge + tax (10219-10233). Lệch reject-reason đúng: admin/bills/:id/status chặn thiếu lý do (21301-21303) còn sensitive-bills/:billId/review tự điền 'Rejected by admin review' (8894) — trái TC-AUD-BIL-002. Hiệu chỉnh: doc mục 6 (entity Bill, bảng 23) ĐÃ nêu 'tổng tiền, giảm giá/phí/thuế nếu có' nên serviceCharge/tax không hoàn toàn thiếu; các trường thực sự chưa có trong doc là paidVnd, commissionAmountVnd, pointsEarned, billNumber, submitterType, 3 snapshot rule và bộ reviewer/verifier/rejecter + mốc thời gian.

- Bổ sung vào: **3.H + mục 6 (entity Bill)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:10219-10262` · `backend/src/nightlife-data/nightlife-data.service.ts:8894` · `backend/src/nightlife-data/nightlife-data.service.ts:21301-21303` · `backend/prisma/schema.prisma:861-886`

**7. Quy tắc tính điểm chi tiết: 100.000đ = 1 điểm (làm tròn xuống) trên bill gốc, chỉ cộng cho tài khoản Member** _(so với MEM-07, FLOW F)_

Điểm = floor(subtotal bill gốc trước giảm / 100.000) - khớp tỷ lệ 1 triệu = 10 điểm và cơ sở 'bill GỐC' mà doc đã nêu ở mục 6. Phần doc CHƯA nêu: cách làm tròn xuống (floor); chỉ cộng điểm khi bill thuộc user có role USER (bill do Partner nộp không gắn tài khoản khách thì không sinh điểm, Guest không có điểm); ghi sổ idempotent - mỗi bill chỉ 1 ledger EARN (duyệt lại không cộng đôi); rule version v2.2 được snapshot vào bill. Điểm hết hạn 1 năm kể từ ngày duyệt (khớp MEM-07B).

> Ghi chú kiểm chứng: Code đúng toàn bộ: floor(subtotal/100.000), chỉ user role USER, hết hạn +1 năm từ ngày duyệt, upsert idempotent theo (billId,'EARN'), version v2.2 snapshot vào bill (147-149, 14753-14849, schema:945). Hiệu chỉnh: doc mục 6 (Point/Loyalty, bảng 23) ĐÃ ghi 'Điểm tích lũy 1tr = 10đ trên bill GỐC' — tức cơ sở tính bill gốc đã có trong doc; cái doc thiếu là cách làm tròn (floor), điều kiện chỉ tài khoản role USER (bill Partner nộp không gắn khách thì không sinh điểm), tính idempotent và rule version.

- Bổ sung vào: **3.G (MEM-07) + mục 5 FLOW F**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:147-149` · `backend/src/nightlife-data/nightlife-data.service.ts:14753-14849` · `backend/prisma/schema.prisma:945`

**8. Điểm hết hạn được tính khi truy vấn (không có cron hủy điểm); cảnh báo điểm sắp hết hạn trong 30 ngày** _(so với MEM-07B)_

Doc MEM-07B nói 'quá hạn tự hủy, có log'. Code không có job định kỳ ghi bản ghi EXPIRE; thay vào đó khi tổng hợp điểm, các ledger EARN quá expiresAt bị loại khỏi điểm khả dụng và cộng vào 'expiredPoints' theo thời gian thực. Trang điểm member có chỉ số 'expiringSoonPoints' - điểm sẽ hết hạn trong 30 ngày tới. Sổ điểm hỗ trợ các loại giao dịch EARN/REDEEM/ADJUST/REVERSE/EXPIRE với trạng thái PENDING/POSTED/REVERSED/EXPIRED.

- Bổ sung vào: **3.G Membership, Point, Booking QR (MEM-07B)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:158` · `backend/src/nightlife-data/nightlife-data.service.ts:14851-14927` · `backend/src/nightlife-data/nightlife-data.service.ts:6415-6486` · `backend/prisma/schema.prisma:208-221`

**9. Báo cáo doanh thu: chỉ tính bill VERIFIED/PAID theo ngày sử dụng, múi giờ VN; hàng chờ duyệt xếp FIFO; đã có export Excel** _(so với BIL-06, BIL-06B, BIL-12)_

Báo cáo doanh thu admin chỉ gộp bill trạng thái VERIFIED hoặc PAID, nhóm theo ngày sử dụng dịch vụ (usedAt) với múi giờ mặc định Asia/Ho_Chi_Minh; lọc theo quán, mã giảm giá, cờ cảnh báo, và (khi bật cờ BI) theo partner/khu vực/cast; export Excel/PDF nằm sau feature flag. Danh sách bill chờ duyệt sắp xếp FIFO cũ nhất trước 'để tránh trôi hóa đơn cũ', bill đã xử lý xếp mới nhất trước. Ngoài ra dashboard admin có chức năng export báo cáo Excel (ExcelJS) gồm bookings + bills - doc xếp export vào P2 (BIL-06B).

- Bổ sung vào: **3.H (BIL-06) + ADM-09B**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:152-157` · `backend/src/nightlife-data/nightlife-data.service.ts:8402-8450` · `backend/src/nightlife-data/nightlife-data.service.ts:21466-21472` · `backend/src/nightlife-data/admin-dashboard-report.ts:1-60`

**10. Kênh thông báo khách thực tế: in-app + websocket cho Member, kênh LINE cho Guest, email QR cho Guest** _(so với 3.L NOT-01..NOT-05)_

Khi booking đổi trạng thái: Member nhận notification in-app (có trung tâm thông báo, đánh dấu đã đọc) + đẩy realtime qua websocket; Guest được ghi notification kênh LINE với recipient là SĐT (doc chỉ nói LINE OA cho hỗ trợ). Guest nhận email QR khi tạo booking (ảnh QR nhúng + link ảnh QR ngoài), trạng thái gửi lưu NotificationLog (QUEUED/SENT/FAILED/CANCELLED). Các kênh hệ thống hỗ trợ: EMAIL/SMS/PUSH/IN_APP/ZALO/TELEGRAM/LINE. Có template riêng cho từng sự kiện: created/cast_created/tour_created/confirmed/checked_in/completed/cancelled/rescheduled/reschedule_rejected, bill submitted/verified/rejected.

- Bổ sung vào: **3.L Notification & Communication**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:14610-14661` · `backend/src/nightlife-data/nightlife-data.service.ts:13523-13624` · `backend/prisma/schema.prisma:258-273` · `backend/src/nightlife-data/nightlife-data.controller.ts:1142-1182`

**11. Role Operator hoạt động ngay ở phân hệ booking/bill (doc xếp Operator vào P1); tồn tại thêm role STAFF và SUPER_ADMIN** _(so với ADM-12)_

Code có nhóm endpoint operator/* dùng được ngay (xem booking/bill, hủy hộ, duyệt yêu cầu đổi lịch, chat, phân tích tỷ lệ hủy, chỉnh chính sách hủy quán) dù doc xếp Operator vào P1. Hệ role thực tế: USER/PARTNER/OPERATOR/STAFF/ADMIN/SUPER_ADMIN. Doc có nhắc Super Admin nhưng chỉ trong phần phân quyền xem Audit Log (mục 4.4, 4.7), không định nghĩa trong ADM-12; role STAFF hoàn toàn không có trong doc dù được phép quét QR/xác nhận check-in như Partner và dùng OCR bill. API phân tích tỷ lệ hủy booking theo quán/cast/kênh trong N ngày cho Admin+Operator cũng chưa có trong doc.

> Ghi chú kiểm chứng: Nhóm endpoint operator/* sống đầy đủ: bookings, bills, cancel hộ, review đổi lịch, chat, cancel-analytics, booking-policy (controller:799-922); STAFF được quét/scan như Partner (controller:648, 665, 677) và dùng OCR (789); enum role USER/PARTNER/OPERATOR/STAFF/ADMIN/SUPER_ADMIN (schema:9-16); getAdminBookingCancelAnalytics có thật (4796). Hiệu chỉnh: doc KHÔNG hoàn toàn thiếu Super Admin - mục 4.4/4.7 audit log có nhắc 'Super Admin / Admin / Operator'; role thật sự vắng bóng trong doc là STAFF.

- Bổ sung vào: **3.J (ADM-12 phân quyền) + 3.F (cancel analytics)**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.controller.ts:799-922` · `backend/src/nightlife-data/nightlife-data.controller.ts:665-666` · `backend/prisma/schema.prisma:9-16` · `backend/src/nightlife-data/nightlife-data.service.ts:4796-4859`

**12. Partner nộp bill và cấu hình nguồn ghi nhận 'khách đã đến quán'** _(so với BIL-01, PAR-08)_

Partner account nộp bill với submitterType=PARTNER (lưu submittedByPartnerAccountId), chịu cùng rule 10 ngày/rate limit/chống trùng như Member; xem được bill và booking của quán mình. Chỉ tiêu 'khách đến quán' trên dashboard partner có thể cấu hình lấy theo QR đã dùng (QR_USED, mặc định) hoặc theo bill được duyệt (BILL_APPROVED) qua biến môi trường PARTNER_CUSTOMER_ARRIVAL_SOURCE - một quyết định nghiệp vụ đo lường chưa có trong doc.

- Bổ sung vào: **3.H (BIL-01) + 3.I**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:7387-7447` · `backend/src/nightlife-data/nightlife-data.service.ts:11299-11316` · `backend/src/nightlife-data/nightlife-data.service.ts:21109-21113`

**13. Booking và bill lưu snapshot 3 loại rule (giảm giá, hoa hồng, điểm) kèm version** _(so với mục 6.1, 6.2)_

Ngoài discount_snapshot như doc mục 6.1/6.2, booking và bill đều lưu thêm commissionRuleSnapshot và pointRuleSnapshot với version ('ba-v3.2' cho doanh thu, 'v2.2' cho điểm) và toàn bộ tham số tính toán tại thời điểm duyệt (basis, rate, cap, min spend, lý do bỏ qua, cờ cảnh báo) phục vụ đối soát. Doc bảng 23 (mục 6) có nhắc chung 'Tỷ lệ hoa hồng snapshot' cho entity Commission/Revenue nhưng mục 6.1/6.2 chỉ đặc tả discount_snapshot; pointRuleSnapshot và cơ chế version hoàn toàn chưa có trong doc. Lưu ý: vì hoa hồng đã bị tắt, commissionRuleSnapshot hiện chỉ ghi marker COMMISSION_DISABLED với giá trị 0.

> Ghi chú kiểm chứng: Code đúng: Booking có discountSnapshot/commissionRuleSnapshot/pointRuleSnapshot (schema:662-664), Bill tương tự (schema:874-876); version 'ba-v3.2' và 'v2.2' (145-146); snapshot chứa basis/rate/cap/minSpend/skippedReason/flags (10354-10390). Hiệu chỉnh 2 điểm: (1) doc mục 6 bảng 23 (entity Commission/Revenue) có nhắc 'Tỷ lệ hoa hồng snapshot, % giảm giá snapshot' nên khái niệm snapshot hoa hồng không hoàn toàn vắng, chỉ là chưa đặc tả thành trường trên booking/bill như 6.1/6.2; (2) do commission bị tắt, commissionRuleSnapshot hiện chỉ chứa marker COMMISSION_DISABLED/0.

- Bổ sung vào: **Mục 6 Dữ liệu chính cần quản lý**
- Bằng chứng: `backend/prisma/schema.prisma:662-664` · `backend/prisma/schema.prisma:874-876` · `backend/src/nightlife-data/nightlife-data.service.ts:145-146` · `backend/src/nightlife-data/nightlife-data.service.ts:10354-10390`

### Campaign, Tour, Media & Cấu hình hệ thống

**1. Campaign/ưu đãi theo quán: vòng đời trạng thái, tự động tạm dừng khi hết hạn, API public** _(so với ADM-06, STO-08)_

Tài liệu chỉ nói chung 'Quản lý campaign/discount/banner' (ADM-06) và 'Campaign/discount banner tại trang quán' (STO-08), code chi tiết hơn nhiều: (1) Campaign gắn với 1 quán cụ thể (targetStore), có loại giảm PERCENT hoặc FIXED_AMOUNT (giảm số tiền cố định), giá trị giảm, thời gian bắt đầu/kết thúc tùy chọn. (2) Vòng đời trạng thái: DRAFT (mặc định khi tạo) / ACTIVE / PAUSED / EXPIRED / DELETED; xóa là xóa mềm (chuyển DELETED). (3) Quy tắc tự động: mọi campaign ACTIVE/EXPIRED đã quá thời điểm kết thúc sẽ tự chuyển sang PAUSED mỗi lần hệ thống truy vấn danh sách campaign. (4) API public GET /public/campaigns chỉ trả campaign ACTIVE, có gắn quán, và đang trong khung thời gian hiệu lực; được dùng thật trên trang chủ (khối ưu đãi kèm ảnh quán, khu vực) và trang Ưu đãi của member (hiển thị đếm ngược thời gian còn lại, cập nhật mỗi phút, phân trang 4 campaign/trang). Lưu ý: campaign hiện chỉ là hiển thị/marketing, không sinh QR riêng - nhất quán với FLOW B của tài liệu, nhưng BA cần đặc tả rõ mối quan hệ campaign với mức giảm snapshot của booking.

- Bổ sung vào: **3.J ADM-06 và 3.D STO-08 - bổ sung trạng thái campaign, loại giảm giá, quy tắc tự tạm dừng khi hết hạn và điều kiện hiển thị public**
- Bằng chứng: `backend/src/campaigns/campaigns.service.ts:9-19` · `backend/src/campaigns/campaigns.controller.ts:23-124` · `backend/src/campaigns/public-campaigns.controller.ts:5-39` · `backend/prisma/schema.prisma:167-173`

**2. Chính sách upload media: định dạng cho phép, hạn mức dung lượng theo mục đích, kiểm tra nội dung thật của file** _(so với ADM-04)_

ADM-04 chỉ ghi 'Thư viện media tập trung + P0 upload', code đã có bộ quy tắc nghiệp vụ chi tiết: (1) Chỉ chấp nhận các định dạng JPG, PNG, WebP, GIF, SVG, MP4, WebM, PDF. (2) Hạn mức theo mục đích upload: ảnh 15MB; video 25MB; chứng từ bill (ảnh hoặc PDF) 25MB; icon giao diện 30KB (chỉ PNG/SVG); logo thương hiệu 200KB (chỉ PNG/SVG); banner trang chủ (BANNER_GLOBAL) và ảnh bìa blog chỉ nhận JPG/PNG. (3) Mỗi lượt upload bắt buộc khai báo mục đích (purpose) thuộc danh sách cho phép: ảnh bìa/gallery/menu/video của quán, avatar/ảnh/video cast, ảnh bìa tour, banner toàn cục, ảnh bìa blog, chứng từ bill, icon/logo giao diện, và các purpose dành cho partner tự đăng. (4) Hệ thống đọc nội dung thật của file (magic bytes) để nhận diện định dạng, từ chối: file rỗng, MIME khai báo không khớp nội dung, phần mở rộng không khớp; riêng SVG bị quét an toàn - cấm script, event handler, DOCTYPE/ENTITY, iframe/object, liên kết ngoài và CSS nguy hiểm (chống XSS). (5) Tên file được chuẩn hóa: bỏ ký tự điều khiển/ký tự ẩn/ký tự cấm của Windows, tối đa 220 ký tự.

- Bổ sung vào: **3.J ADM-04 - bổ sung bảng quy tắc upload (định dạng, dung lượng theo mục đích, kiểm tra an toàn nội dung)**
- Bằng chứng: `backend/src/storage/upload-policy.ts:1-98` · `backend/src/storage/upload-file-validation.ts:98-156` · `backend/src/storage/upload-filename.ts:3-88` · `backend/src/storage/storage.controller.ts:100-126`

**3. Phân quyền upload/xem/xóa media theo vai trò và chế độ truy cập PUBLIC/PROTECTED** _(so với ADM-04, STO-11, CAS-04)_

Tài liệu không đặc tả ai được upload/xem/xóa media. Code có ma trận quyền rõ ràng: (1) Thành viên (USER) chỉ được upload file PROTECTED gắn với bill hoặc booking của chính mình (chứng từ bill) - không được upload public hay gắn quán/cast. (2) PARTNER chỉ upload cho quán mình quản lý (upload cho cast/nội dung cũng phải thuộc quán mình, hệ thống kiểm tra quyền truy cập quán). (3) ADMIN/OPERATOR/SUPER_ADMIN khi upload PUBLIC bắt buộc phải gắn quán/cast/nội dung hoặc thuộc nhóm mục đích toàn cục cho phép (logo, icon, banner toàn cục, ảnh bìa tour). (4) File có 2 chế độ truy cập: PUBLIC (ai cũng xem qua /storage/public/...) và PROTECTED (mặc định; phải đăng nhập, chỉ chủ sở hữu, admin/operator/staff, hoặc partner của quán liên quan mới xem được - ví dụ ảnh bill). (5) Xóa media: admin/operator xóa mọi file, chủ sở hữu xóa file của mình, partner xóa file thuộc quán mình; xóa là xóa mềm trong DB kèm xóa file vật lý. (6) Video link ngoài: chỉ hỗ trợ YouTube và chỉ cho mục đích video của quán (STORE_VIDEO/PARTNER_STORE_VIDEO); URL phải chứa video id hợp lệ và được chuẩn hóa - tức 'gắn link video' trong STO-11/CAS-04 thực tế bị giới hạn: cast video không gắn được link ngoài, chỉ upload file.

- Bổ sung vào: **3.J ADM-04 (phân quyền media) + 3.D STO-11 / 3.E CAS-04 (làm rõ giới hạn gắn link video chỉ YouTube cho quán)**
- Bằng chứng: `backend/src/storage/storage.service.ts:43-48` · `backend/src/storage/storage.service.ts:75-193` · `backend/src/storage/storage.service.ts:263-298` · `backend/src/storage/storage.service.ts:300-365`

### Thông báo & Liên lạc (Telegram/Email/LINE/Chat)

**1. Chat hỗ trợ khách realtime (Support Chat) đã được xây dựng đầy đủ, không còn là P1** _(so với Mục 2.1 (P1 - chat khách realtime), ADM-13, BOO-07)_

Tài liệu chỉ ghi 'chat khách realtime' là hạng mục P1 (mục 2.1) và ADM-13 'Quản lý đối tác + Chat 1-1 (P1)', không có đặc tả chi tiết. Code đã triển khai trọn vẹn một hệ thống chat hỗ trợ realtime chạy trên web public: (1) Khách vãng lai chat không cần đăng nhập, hệ thống sinh guestSessionId lưu localStorage; Member chat bằng tài khoản. (2) Mỗi cuộc chat là một ticket với 3 trạng thái: PENDING (chờ tiếp nhận) -> ACTIVE (admin đã tiếp nhận) -> CLOSED (đã đóng); mỗi khách chỉ có 1 ticket mở tại một thời điểm (tái sử dụng ticket PENDING/ACTIVE cũ). (3) Admin 'tiếp nhận' (claim) ticket theo nguyên tắc ai nhận trước được, cập nhật atomic; admin khác bấm sau bị báo 'Ticket đã được tiếp nhận bởi người khác'. (4) Các role được phép chat phía quản trị: ADMIN, SUPER_ADMIN, STAFF, OPERATOR. (5) Có trạng thái admin online/offline (đếm admin đang kết nối); nếu không có admin online, tin nhắn khách vẫn được lưu và khách nhận auto-reply hệ thống 'Tin nhắn đã được ghi nhận. Admin sẽ phản hồi ngay khi trực tuyến.'. (6) Khi khách đăng nhập giữa chừng, phiên chat guest được gộp (merge) vào tài khoản, giữ toàn bộ lịch sử cũ và chèn system message 'Khách hàng đã đăng nhập tài khoản.'. (7) Admin đóng ticket -> phía khách bị reset cuộc chat (event ticket_closed). (8) Lịch sử chat lưu DB (SupportTicket/SupportMessage), tải theo trang mặc định 50 tin/lần; chỉ hỗ trợ tin nhắn text. (9) Màn quản trị /admin/support-chat: danh sách ticket gồm PENDING chung + ACTIVE của chính admin đó, bộ lọc 'Chờ phản hồi' (tin cuối cùng là của khách) / 'Tất cả', preview tin nhắn mới nhất, realtime new_ticket/ticket_claimed/session_merged. (10) Widget chat trên site hiển thị trạng thái kết nối, đa ngôn ngữ theo ngôn ngữ site, khôi phục lịch sử theo guestSessionId/ticketId đã lưu.

- Bổ sung vào: **3.L Notification & Communication (mục mới về Support Chat) hoặc bổ sung đặc tả BOO-07/ADM-13; cập nhật lại phase P0/P1**
- Bằng chứng: `backend/src/support-chat/support-chat.service.ts:13-17,82-100,112-145,209-246,248-290,292-300` · `backend/src/support-chat/support-chat.gateway.ts:36-41,167-171,184-246,271-321` · `backend/src/support-chat/support-chat.controller.ts:31-131` · `backend/prisma/schema.prisma:1326-1374`

**2. Telegram booking mới: STT toàn hệ thống, cảnh báo điều phối cast, link CMS/Web, timezone cấu hình** _(so với NOT-01, NOT-05, BOO-05)_

Template Telegram gửi Admin khi có booking mới (NOT-01) trong code chi tiết hơn tài liệu: (1) Có số thứ tự booking toàn hệ thống dạng 'NLF-{n}' - đếm cả booking thường lẫn tour booking tính đến thời điểm tạo. (2) Trạng thái QR luôn hiển thị nhãn cố định 'Đã cấp - Còn hiệu lực' (không đọc trạng thái QR thật). (3) Cuối tin luôn kèm cảnh báo nghiệp vụ: 'Cast mong muốn chưa phải xác nhận giữ lịch cast. Admin cần điều phối offline với quán.'; tin hủy booking kèm 'Booking đã hủy. Admin kiểm tra lại điều phối và lịch quán/cast.' và lý do hủy. (4) Bản tin fallback kèm link mở thẳng CMS (tab bookings/bills/partners) và link web. (5) Giờ hiển thị theo timezone cấu hình TELEGRAM_NOTIFICATION_TIME_ZONE (mặc định Asia/Bangkok); hỗ trợ gửi vào topic/thread cụ thể của group Telegram (TELEGRAM_ADMIN_THREAD_ID). (6) Booking tour cũng gửi Telegram admin theo cùng luồng (tour ngoài MVP theo tài liệu).

- Bổ sung vào: **3.L bảng Notification (cột Nội dung tối thiểu của NOT-01/NOT-05)**
- Bằng chứng: `backend/src/notifications/admin-notification.service.ts:153-226,458-543,856-882` · `backend/src/notifications/admin-telegram-message.formatter.ts:49-56,57-82,185-204`

**3. Telegram cho yêu cầu đối tác CHỈNH SỬA thông tin (không chỉ yêu cầu mới)** _(so với NOT-08, PAR-04B, PAR-06)_

NOT-08 chỉ đặc tả 'Partner request mới'. Code còn phân biệt yêu cầu chỉnh sửa thông tin quán đã đăng (request id tiền tố 'LISTING-') và gửi Telegram với tiêu đề riêng 'Yêu cầu đối tác chỉnh sửa' thay vì 'Yêu cầu đối tác mới' (admin-notification.service.ts:293-297, formatter:107). Nội dung/payload kèm chi tiết: tên quán, loại hình, khu vực, Maps, liên hệ, email, số nháp cast/media/content, giờ mở cửa, mô tả menu (313-356). Ngoài ra khi yêu cầu được duyệt/từ chối, đối tác nhận thông báo realtime qua socket với template 'partner.listing.reviewed.v1' (nightlife-data.service.ts:8140-8147) — điểm này doc hoàn toàn chưa có. Riêng việc payload chứa dữ liệu partner tự đăng thì doc NOT-08 đã dự kiến ('Bao gồm nội dung partner tự đăng ở P1 khi PAR-04B làm', dòng 1557), nên phần đó không phải là thiếu hoàn toàn.

> Ghi chú kiểm chứng: Code đúng như mô tả (đã xác nhận isUpdate='LISTING-', tiêu đề riêng, payload chi tiết, socket notify khi review). Hiệu chỉnh vì NOT-08 dòng 1557 đã ghi rõ thông báo sẽ 'bao gồm nội dung partner tự đăng ở P1 khi PAR-04B làm' — tức phần dữ liệu partner tự đăng trong payload đã được doc dự kiến; phần thực sự thiếu trong doc là (a) phân loại/tiêu đề riêng cho yêu cầu CHỈNH SỬA và (b) thông báo realtime kết quả duyệt cho đối tác.

- Bổ sung vào: **3.L bảng Notification (NOT-08) + 3.I Partner**
- Bằng chứng: `backend/src/notifications/admin-notification.service.ts:293-358` · `backend/src/notifications/admin-telegram-message.formatter.ts:103-118` · `backend/src/nightlife-data/nightlife-data.service.ts:8140-8147,18411`

**4. LINE chưa gửi thật; hệ thống vẫn ghi nhận 'ý định gửi LINE' cho khách chỉ có số điện thoại** _(so với NOT-06, NOT-04, NOT-05, MEM-10)_

Tài liệu NOT-06 nói khách được điều hướng sang LINE OA (fallback Mail). Thực tế code: LineService chỉ là stub — thiếu config LINE_CHANNEL_ID/SECRET thì bỏ qua, có config cũng chỉ log giả lập '[LINE MOCK]' (line.service.ts:16-29), và service này được khai báo trong notifications.module nhưng KHÔNG luồng nào inject/gọi tới. Trong khi đó luồng thật vẫn ghi log 'ý định gửi LINE' ở 2 chỗ với điều kiện KHÁC nhau: (a) khi booking ĐỔI TRẠNG THÁI (xác nhận/hủy/hoàn tất, kể cả hủy tour), MỌI khách không đăng nhập đều bị ghi NotificationLog kênh LINE trạng thái QUEUED bất kể có email hay không, recipient là SĐT hoặc guestId (nightlife-data.service.ts:14610-14650, channel = user ? IN_APP : LINE); (b) với sự kiện tạo booking/đổi lịch thành công/từ chối đổi lịch, kênh LINE chỉ dùng khi khách không có email, có email thì ghi kênh EMAIL (13452-13490). Không có worker/cron nào gửi các bản ghi QUEUED kênh LINE lẫn EMAIL (cron duy nhất là hết hạn coupon; chỉ email QR lúc tạo booking, OTP và reset mật khẩu được gửi trực tiếp) — nên các log này nằm QUEUED mãi. Hệ quả rộng hơn mô tả gốc: thông báo hủy booking (NOT-04/NOT-05) hiện không được gửi email cho BẤT KỲ guest nào, kể cả guest có email. BA cần chốt LINE có là kênh gửi chủ động ở MVP không.

> Ghi chú kiểm chứng: Hiệu chỉnh 2 điểm: (1) với đổi trạng thái booking, code ghi kênh LINE cho MỌI guest bất kể có email (channel = user ? 'IN_APP' : 'LINE' tại dòng 14625), điều kiện 'không có email mới ghi LINE' chỉ đúng ở nhánh notifyBookingCustomerTemplate (dòng 13471) cho sự kiện tạo/đổi lịch; (2) hệ quả vì vậy nặng hơn: email hủy booking không được gửi cho toàn bộ guest chứ không riêng nhóm chỉ có SĐT. Phần LINE stub/không được gọi và enum kênh LINE trong schema (schema.prisma:258-266) xác nhận đúng.

- Bổ sung vào: **3.L Notification & Communication (làm rõ vai trò kênh LINE ở MVP)**
- Bằng chứng: `backend/src/notifications/line.service.ts:16-29` · `backend/src/nightlife-data/nightlife-data.service.ts:13461-13490,14619-14650` · `backend/prisma/schema.prisma:258-266`

**5. Notification Log thực tế: 7 kênh, vòng đời trạng thái gửi và log cả lần gửi thất bại** _(so với Mục 6 - Bảng 23 (Notification Log))_

Mục 6 tài liệu chỉ mô tả Notification Log gồm 'Kênh Telegram/LINE OA/Mail, nội dung, người nhận, thời gian, trạng thái gửi'. Code chi tiết hơn đáng kể: (1) Kênh gồm EMAIL, SMS, PUSH, IN_APP, ZALO, TELEGRAM, LINE. (2) Trạng thái vòng đời: QUEUED -> SENT (kèm sentAt) / FAILED / CANCELLED; với thông báo in-app, SENT được dùng làm nghĩa 'đã đọc'. (3) Mỗi bản ghi liên kết user/guest/store/booking/bill và templateKey có version (vd telegram.admin.booking.created.v1). (4) Telegram Admin: nếu thiếu cấu hình bot/chat id, hệ thống vẫn ghi log trạng thái FAILED kèm lỗi 'TELEGRAM_BOT_TOKEN and an admin chat id are required'; nếu gửi lỗi cũng tạo bản ghi FAILED kèm thông điệp lỗi - đảm bảo mọi lần gửi/không gửi được đều truy vết được. (5) Notification Log còn được dùng làm nơi lưu sự kiện phân tích/audit phụ (coupon analytics, tín hiệu fraud).

- Bổ sung vào: **Mục 6 Dữ liệu chính cần quản lý (đặc tả entity Notification Log)**
- Bằng chứng: `backend/prisma/schema.prisma:258-273` · `backend/src/notifications/admin-notification.service.ts:12-19,360-456` · `backend/src/nightlife-data/nightlife-data.service.ts:6238-6277`

### Audit Log

**1. Màn Audit Log thực tế: bộ lọc chỉ có Module + Kết quả; có diff viewer thân thiện ngay ở MVP** _(so với 4.6, RAN-09, ADM-14)_

UI /admin/audit-logs (menu 'Lịch sử thao tác (Audit Log)') và API GET /admin/audit-logs hiện chỉ lọc theo module, action, result kèm phân trang (mặc định 20 dòng/trang); CHƯA có lọc theo thời gian, tài khoản, role, entity_code, store/booking/bill, ranking_type, batch_id như mục 4.6. Bảng hiển thị: Thời gian (kèm relative time '5 phút trước' bằng dayjs — khớp RAN-09), Người thao tác + badge role (Super Admin/Admin/Vận hành/Hệ thống), Module, Hành động (có bảng dịch tên tiếng Việt cho từng action code), Tóm tắt/mã đối tượng, Kết quả (Thành công/Thất bại), IP nếu có. Panel chi tiết có: so sánh before/after dạng bảng từng trường đã dịch nhãn tiếng Việt (diff viewer — doc xếp P1) + nút xem JSON gốc. Lưu ý: dropdown module trên UI liệt kê Store/Cast/Booking/Bill/QR/User nhưng backend chỉ ghi module cho 'Ranking' và 'TOUR_BOOKING', các bản ghi khác module=null nên lọc các module kia không ra dữ liệu.

- Bổ sung vào: **4.6 UI/UX màn Audit Log — cập nhật theo hiện trạng (bộ lọc tối giản, diff viewer đã có ở P0)**
- Bằng chứng: `frontend/apps/web/src/app/admin/audit-logs/page.tsx:208-362` · `frontend/apps/web/src/app/admin/audit-logs/page.tsx:413-479` · `frontend/apps/web/src/app/admin/layout.tsx:129-133` · `backend/src/audit-logs/audit-logs.controller.ts:14-29`

**2. Cấu trúc field audit_logs thực tế lệch bảng 19; nhiều field snapshot không được ghi** _(so với Bảng 19 (mục 4.3), RISK-AUD-002)_

Model audit_logs thực tế: id, actor_id (FK User, SetNull khi xóa user), actor_type, actor_name, actor_role, module, action, target_type, target_id, entity_display_code, before_json, after_json, changed_fields[], change_summary, reason, result (mặc định SUCCESS), ip_address, user_agent, request_id, batch_id, metadata, created_at. Khác bảng 19: (1) không có occurred_at riêng — dùng created_at; (2) không có actor_email riêng (một số nơi gán actorName = email); (3) không có correlation_id — chỉ request_id nhưng KHÔNG nơi nào ghi giá trị; (4) ip_address/user_agent/batch_id có cột nhưng không luồng nào ghi (UI có chỗ hiển thị IP nhưng dữ liệu luôn trống); (5) phần lớn bản ghi để trống actor_type/actor_name/actor_role/module — API đọc sẽ fallback lấy displayName/email/role HIỆN TẠI của tài khoản qua quan hệ, tức không phải snapshot role tại thời điểm thao tác như doc đã chốt (RISK-AUD-002); chỉ nhóm Ranking và Tour ghi snapshot actor tại chỗ; (6) changed_fields chỉ được dùng ở tour check-in, change_summary chỉ ở ranking; (7) reason là cột riêng nhưng đa số luồng ghi lý do vào metadata thay vì cột reason. Không có bất kỳ code nào update/delete audit_logs (append-only đúng như doc chốt).

- Bổ sung vào: **4.3 Data model audit_logs — cập nhật mapping field thực tế và ghi chú field chưa được ghi**
- Bằng chứng: `backend/prisma/schema.prisma:1101-1131` · `backend/src/audit-logs/audit-logs.service.ts:45-53` · `backend/src/nightlife-data/nightlife-data.service.ts:1706-1716` · `backend/src/nightlife-data/nightlife-data.service.ts:4182-4189`

**3. Timeline audit trong chi tiết đối tượng: mới chỉ có cho QR ưu đãi (coupon issue)** _(so với 4.6)_

Doc 4.6 yêu cầu tab 'Lịch sử thao tác' trong chi tiết Booking/Bill/Store/Cast/Ranking. Thực tế mới có cho QR ưu đãi: màn admin quản lý coupon issue đính kèm tối đa 5 audit log gần nhất cho mỗi issue (kèm actor, before/after) và dùng audit COUPON_ISSUE_SCANNED để suy ra thời điểm quét khi export; các đối tượng Booking/Bill/Store/Cast chưa có timeline audit trong màn chi tiết.

- Bổ sung vào: **4.6 UI/UX Audit Log — mục timeline theo object**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:20897-20934` · `backend/src/nightlife-data/nightlife-data.service.ts:6917-6928` · `frontend/apps/web/src/app/admin/AdminConsole.tsx:1939-1948` · `frontend/apps/web/src/app/admin/AdminConsole.tsx:2301`

**4. Audit duyệt partner request gộp cả cấp tài khoản đối tác và publish nội dung hàng loạt trong 1 event** _(so với Bảng 18 (PARTNER_APPROVE/PARTNER_REJECT), Bảng 21)_

Khi admin duyệt/từ chối partner request (PARTNER_REQUEST_APPROVED/REJECTED), một audit event duy nhất ghi toàn bộ hệ quả: duyệt thì store + toàn bộ draft cast/media/content được publish (PUBLIC/PUBLISHED/READY), từ chối thì đưa về DRAFT/HIDDEN/PROTECTED; metadata ghi reason, danh sách draftCastIds/draftMediaIds/draftContentIds, partnerUserId/partnerAccountId tạo khi onboard và cờ temporaryPasswordIssued; before/after là snapshot trạng thái request. Lưu ý: bảng 18 doc CÓ nhắc 'tạo/deactivate partner account' trong phạm vi PARTNER_APPROVE/PARTNER_REJECT, nhưng không đặc tả việc gộp cấp tài khoản + cờ mật khẩu tạm + publish hàng loạt nội dung nháp vào metadata của MỘT event duy nhất; và trái với quy tắc bảng 21 (thao tác đa bản ghi phải có batch_id/event con), luồng này không dùng batch_id hay event con cho từng draft.

> Ghi chú kiểm chứng: Code xác nhận đúng (service.ts:7819-8065: một tx.auditLog.create duy nhất tại 8036 với metadata draft*Ids + temporaryPasswordIssued, publish/rollback hàng loạt trong cùng transaction, không batch_id). Chỉnh mô tả vì bảng 18 (dòng 1735-1743) thực ra có câu 'Duyệt/từ chối partner hoặc tạo/deactivate partner account' — tức việc cấp tài khoản không hoàn toàn vắng trong doc; điểm vượt doc là cờ mật khẩu tạm, publish hàng loạt draft trong 1 event và thiếu batch_id/event con theo bảng 21.

- Bổ sung vào: **4.2 nhóm Partner + 3.I Partner Registration & Approval**
- Bằng chứng: `backend/src/nightlife-data/nightlife-data.service.ts:7825-7830` · `backend/src/nightlife-data/nightlife-data.service.ts:7990-8065`

### Mô hình dữ liệu (Prisma schema)

**1. Entity Campaign có vòng đời trạng thái riêng** _(so với ADM-06, STO-08)_

Code có model Campaign độc lập: tên, loại giảm PERCENT/FIXED_AMOUNT, giá trị giảm, quán mục tiêu (target_store_id, có thể null = toàn hệ thống), khoảng thời gian starts_at/ends_at, trạng thái DRAFT/ACTIVE/PAUSED/EXPIRED/DELETED; có API admin CRUD và API public xem campaign. Tài liệu chỉ nhắc "quản lý campaign/discount/banner" (ADM-06, STO-08) nhưng không đặc tả entity, trạng thái, phạm vi áp dụng.

- Bổ sung vào: **3.J Admin CMS & Dashboard (ADM-06) + mục 6 Bảng 23**
- Bằng chứng: `backend/prisma/schema.prisma:167-173` · `backend/prisma/schema.prisma:1376-1393` · `backend/src/campaigns/campaigns.controller.ts:1` · `backend/src/campaigns/public-campaigns.controller.ts:1`

**2. Hỗ trợ khách qua ticket chat (SupportTicket, SupportMessage)** _(so với Mục 2.1 (P1 - chat khách realtime))_

Code có hệ support chat riêng: SupportTicket cho cả khách vãng lai (guest_session_id) lẫn user đăng nhập, trạng thái PENDING/ACTIVE/CLOSED, admin được gán xử lý (assigned_admin_id), thời điểm đóng ticket; SupportMessage với loại người gửi GUEST/USER/ADMIN/SYSTEM và cờ đã đọc (is_read). Có module support-chat với API /api/support. Tài liệu chỉ nhắc "chat khách realtime" là hạng mục P1 trong quy ước phase, không có đặc tả entity/trạng thái/luồng.

- Bổ sung vào: **3.L Notification & Communication (hoặc nhóm mới Support Chat) + mục 6 Bảng 23**
- Bằng chứng: `backend/prisma/schema.prisma:1326-1374` · `backend/src/support-chat/support-chat.controller.ts:1`

**3. Field nghiệp vụ của Booking ngoài Bảng 24: tiền, coupon, mã hiển thị, snapshot rule** _(so với Mục 6.1 Bảng 24)_

Model Booking có nhiều field nghiệp vụ mà Bảng 24 chưa liệt kê: 3 lớp định danh (id UUID, booking_number tự tăng, booking_code hiển thị tối đa 15 ký tự - doc mới chỉ có một 'mã booking duy nhất' và entity_display_code BK-000123 ở phần audit); các trường tiền subtotal_vnd/discount_vnd/total_vnd ngay trên booking; liên kết coupon_id/coupon_issue_id; liên kết tour (tour_booking_id, tour_stop_id, tour_stop_order); ngoài discount_snapshot còn snapshot rule hoa hồng (commission_rule_snapshot) và rule tích điểm (point_rule_snapshot); thời điểm hủy cancelled_at tách riêng với cancel_reason.

> Ghi chú kiểm chứng: Hầu hết đúng và có trong schema:626-669: booking_number tự tăng, subtotal/discount/total_vnd, coupon_id/coupon_issue_id, tour_booking_id/tour_stop_id/tour_stop_order, commission_rule_snapshot + point_rule_snapshot ngoài discount_snapshot, cancelled_at tách với cancel_reason. Riêng ý 'booking_code là field doc chưa liệt kê' cần nói lại: Bảng 24 đã có booking_id 'Mã booking duy nhất' và mục 4.3 đã nhắc entity_display_code dạng BK-000123, tức doc đã có khái niệm mã booking hiển thị; điểm mới của code là tách 3 lớp định danh (id UUID + booking_number tự tăng + booking_code 15 ký tự dùng đối soát).

- Bổ sung vào: **Mục 6.1 Field tối thiểu cho Booking**
- Bằng chứng: `backend/prisma/schema.prisma:626-669`

**4. Field nghiệp vụ của Bill: số bill, loại người gửi, phí dịch vụ/thuế, hoa hồng và điểm tính sẵn** _(so với BIL-01, BIL-02, Bảng 23 (entity Bill))_

Bill trong code lưu: bill_number duy nhất; submitter_type (schema chú thích MEMBER/VIP/PARTNER nhưng runtime chỉ ghi MEMBER hoặc PARTNER - VIP gửi bill vẫn ghi MEMBER); các khoản tiền tách bạch subtotal/discount/service_charge/tax/total/paid_vnd; kết quả tính sẵn commission_amount_vnd và points_earned; 3 snapshot rule (discount/commission/point); reject_reason; liên kết coupon và coupon_issue. Bill có thể gắn guest_id và code thực sự gán guest_id khi Partner gửi bill cho booking của guest - cần làm rõ với BIL-01 (Guest không tự gửi bill nhưng bill CÓ THỂ thuộc về guest).

> Ghi chú kiểm chứng: Các field đều có thật (schema:836-897): bill_number, các khoản tiền tách bạch, commission_amount_vnd, points_earned, 3 snapshot rule, reject_reason, coupon/coupon_issue link, guest_id; và guest_id thực sự được gán khi Partner gửi bill gắn booking của guest (service:7480 'guestId: booking?.guestId ?? couponLink.guestId'). Điểm cần sửa: submitter_type '3 giá trị MEMBER/VIP/PARTNER' chỉ là comment trong schema — runtime chỉ ghi 2 giá trị 'MEMBER' và 'PARTNER' (service:7262, 7467...; VIP không bao giờ được set).

- Bổ sung vào: **3.H Bill, Revenue & Commission + mục 6 (nên thêm bảng field tối thiểu cho Bill)**
- Bằng chứng: `backend/prisma/schema.prisma:861-886` · `backend/prisma/schema.prisma:840`

**5. Sổ điểm PointLedger: 5 loại giao dịch, 4 trạng thái, đổi điểm và đảo điểm đã có trong data model** _(so với MEM-07, MEM-07B, MEM-07C)_

Code quản lý điểm bằng sổ cái PointLedger: enum 5 loại EARN/REDEEM/ADJUST/REVERSE/EXPIRE và 4 trạng thái PENDING/POSTED/REVERSED/EXPIRED; unique(bill_id+type) chống cộng điểm trùng; hạn điểm theo dòng (expires_at); amount_vnd + rule snapshot. Đã chạy thật: EARN (khi duyệt bill) và REVERSE (khi void/hoàn bill, trỏ reversed_ledger_id về ledger gốc). REDEEM/ADJUST/EXPIRE mới chỉ có trong enum và logic đọc tổng hợp, chưa có luồng tạo; balance_after có trong schema nhưng chưa được ghi. Tài liệu (MEM-07/07B/07C) chưa đặc tả loại/trạng thái giao dịch điểm hay khái niệm pending/posted.

> Ghi chú kiểm chứng: Schema đúng như mô tả (208-221, 922-952) gồm unique(bill_id+type). EARN và REVERSE được tạo trong luồng thật (duyệt bill tạo EARN/POSTED - service:9481; void/reverse bill tạo REVERSE + set EARN sang REVERSED - 9518-9549, 15004-15022). NHƯNG: REDEEM/ADJUST/EXPIRE không có luồng nào tạo bản ghi (chỉ được đọc trong hàm tổng hợp điểm 14890-14917); balance_after không được ghi ở bất kỳ đâu trong service. Cần hạ mức: 'đổi điểm' mới có ở enum + logic đọc, chưa có API/luồng đổi điểm.

- Bổ sung vào: **3.G Membership, Point, Booking QR + mục 6 Bảng 23 (entity Point/Loyalty)**
- Bằng chứng: `backend/prisma/schema.prisma:208-221` · `backend/prisma/schema.prisma:922-952` · `backend/src/nightlife-data/nightlife-data.controller.ts:1027`

**6. Cấu hình hoa hồng theo quán: tỷ lệ tích điểm riêng, hoa hồng cố định, ngưỡng bill tối thiểu, hiệu lực theo thời gian** _(so với BIL-09, FLOW F)_

Schema có CommissionConfig theo từng quán (loại PERCENT/FIXED_AMOUNT, point_earn_rate riêng, min_bill_vnd, active_from/active_to, ACTIVE/INACTIVE/ARCHIVED) nhưng đây gần như là data model chết: không có API cấu hình, logic tính hoa hồng runtime đã bị tắt hoàn toàn (mọi bill duyệt đều ghi commission = 0 với snapshot 'COMMISSION_DISABLED', ghi chú trong code: CommissionConfig logic was removed by product decision), điểm dùng hằng số chung 10 điểm/1 triệu chứ không dùng point_earn_rate, và API commission-overrides chỉ còn là stub deprecated (GET trả rỗng, ghi POST/PATCH/DELETE trả 410 Gone). Mâu thuẫn thật với doc là chiều ngược lại: BIL-09 (P0, Đã chốt) yêu cầu hoa hồng cấu hình theo từng quán nhưng code hiện tại disable hoàn toàn hoa hồng - BA cần chốt lại với product.

> Ghi chú kiểm chứng: Model CommissionConfig có thật với đúng các field (schema:899-920), nhưng phần lớn là DEAD ở runtime: (1) không có API CRUD nào cho CommissionConfig (chỉ deleteMany khi xóa store - service:23101); (2) tính hoa hồng đã bị TẮT - commission luôn = 0, snapshot ghi source 'COMMISSION_DISABLED' và 'CommissionConfig logic was removed by product decision' (service:10414-10465), spec còn assert không gọi commissionConfig.findFirst; (3) point_earn_rate không được dùng - điểm tính bằng hằng số toàn cục BILL_LOYALTY_POINTS_PER_1M_VND = 10 (service:148); (4) API commission-overrides là stub deprecated: GET trả rỗng + disabled:true, POST/PATCH/DELETE ném GoneException 'Commission override is no longer used' (service:8657-8706, controller cũng ghi 'Deprecated... disabled').

- Bổ sung vào: **3.H Bill, Revenue & Commission (BIL-09) + mục 6 Bảng 23 (Commission/Revenue)**
- Bằng chứng: `backend/prisma/schema.prisma:197-206` · `backend/prisma/schema.prisma:899-920` · `backend/src/nightlife-data/nightlife-data.controller.ts:1224-1286`

**7. Vòng đời và field nghiệp vụ của Store chưa được đặc tả** _(so với Bảng 23 (Partner/Store))_

Store trong code có vòng đời 6 trạng thái DRAFT/PENDING_REVIEW/ACTIVE/SUSPENDED/CLOSED/DELETED mà tài liệu không đặc tả (chỉ nói 'trạng thái hợp tác'). Khu vực được quản lý bằng entity Area riêng (mã, thành phố, quận, phường, trạng thái) chứ không phải text như Bảng 23. Một số field mới hoàn toàn so với doc: slug SEO, tọa độ latitude/longitude + google_place_id, tags, supported_languages, booking_cancel_cutoff_minutes. Các field holiday_schedule, pricing_info, staff_profile_info, seo_title/seo_description thực chất là hiện thực hóa của STO-02/STO-07/STO-04/CON-06 đã có trong doc - Bảng 23 chỉ cần gom lại thành đặc tả entity.

> Ghi chú kiểm chứng: Đúng: StoreStatus 6 trạng thái (schema:82-89), slug unique, latitude/longitude/google_place_id/map_url, tags, supported_languages, và Area là entity riêng (code/city/district/ward, ACTIVE/INACTIVE/DELETED, schema:481-498) — doc không đặc tả (Bảng 23 chỉ 'khu vực' dạng thuộc tính + 'trạng thái hợp tác'). NHƯNG một số field nêu là 'chưa có trong tài liệu' thực ra doc đã có ở mức TÍNH NĂNG: holiday_schedule = STO-02 (ngày nghỉ lễ/định kỳ), pricing_info = STO-07/ADM-05 (bảng giá), staff_profile_info = STO-04 (chính finding cũng ghi 'phục vụ STO-04'), seo_title/seo_description = CON-06 (P0 title/meta description cho store), map = STO-03. Vấn đề chỉ là Bảng 23 chưa gom thành field entity.

- Bổ sung vào: **3.D Store Detail + mục 6 Bảng 23 (thêm entity Area, vòng đời Store)**
- Bằng chứng: `backend/prisma/schema.prisma:82-89` · `backend/prisma/schema.prisma:500-559` · `backend/prisma/schema.prisma:481-498`

**8. Cast có giá theo giờ (hourly_rate_vnd), trạng thái OFF_DUTY và hồ sơ public tách riêng** _(so với CAS-06, CAS-11, Bảng 23 (Cast/Staff))_

Model Cast có các field/trạng thái tài liệu chưa đặc tả: hourly_rate_vnd - đơn giá theo giờ của cast (doc không có khái niệm giá cast); vòng đời DRAFT/PENDING_REVIEW/ACTIVE/OFF_DUTY/SUSPENDED/DELETED - trong đó OFF_DUTY (tạm nghỉ) và bước PENDING_REVIEW (khớp CAS-11 kiểm duyệt) chưa được đặc tả thành trạng thái; cờ is_public riêng ngoài status; cặp thông tin public tách khỏi nội bộ (public_alias/public_bio so với stage_name/bio). Lưu ý: birth_month/zodiac_sign đã khớp CAS-06 (tháng sinh & cung hoàng đạo), style_tags khớp CAS-07, youtube_links khớp CAS-04 - các field này là hiện thực hóa doc, không phải thiếu.

> Ghi chú kiểm chứng: Đúng và dùng thật (schema:91-98, 561-596; hourlyRateVnd/publicAlias/OFF_DUTY xuất hiện 147 chỗ trong src gồm DTO public-discovery): hourly_rate_vnd (doc không có khái niệm giá cast), vòng đời DRAFT/PENDING_REVIEW/ACTIVE/OFF_DUTY/SUSPENDED/DELETED, cờ is_public riêng, public_alias/public_bio tách khỏi stage_name/bio. NHƯNG zodiac_sign + birth_month KHÔNG phải 'tài liệu chưa nhắc' — CAS-06 đã có 'tháng sinh & cung HĐ' và 'Không hiển thị ngày/năm sinh cụ thể'; style_tags trùng tinh thần CAS-07 ('phong cách'); youtube_links khớp CAS-04 (cho phép gắn link video). Cần rút các mục đó khỏi danh sách thiếu.

- Bổ sung vào: **3.E Cast/Staff Profile + mục 6 Bảng 23**
- Bằng chứng: `backend/prisma/schema.prisma:91-98` · `backend/prisma/schema.prisma:561-596`

**9. Hệ vai trò 6 role, trong đó STAFF (nhân viên quán) do Partner tự quản lý** _(so với ADM-12, PAR-04)_

Tài liệu ADM-12 chỉ đặc tả Admin/Operator/Partner (Super Admin chỉ xuất hiện ở phần audit), nhưng code có 6 role: USER, PARTNER, OPERATOR, STAFF, ADMIN, SUPER_ADMIN. Role STAFF là nhân viên quán: Partner tạo/xóa tài khoản staff và gán quyền qua module partner-staff (API /partner/staff), quyền mặc định là coupon.scan và checkin.confirm; staff được scan QR booking/coupon/tour và xác nhận check-in như Partner. Ngoài ra trạng thái tài khoản người dùng gồm ACTIVE/SUSPENDED/DELETED/INACTIVE (tài liệu chưa đặc tả khóa/tạm ngưng tài khoản người dùng).

- Bổ sung vào: **3.I Partner + 3.J ADM-12 (bảng role đầy đủ) + mục 6 Bảng 23 (Partner Staff)**
- Bằng chứng: `backend/prisma/schema.prisma:9-16` · `backend/prisma/schema.prisma:25-30` · `backend/src/partner-staff/partner-staff.controller.ts:41-79` · `backend/src/partner-staff/partner-staff.service.ts:11`

**10. Guest có vòng đời riêng: chuyển đổi thành Member và chặn guest** _(so với Bảng 23 (Guest))_

Entity Guest có liên kết converted_user_id được dùng thật để theo dõi guest chuyển đổi thành Member (gán khi email guest khớp tài khoản, dùng để gộp lịch sử booking) - phễu chuyển đổi này chưa có trong Bảng 23. Enum GuestStatus có thêm CONVERTED/BLOCKED nhưng mới chỉ ở mức data model: chưa có luồng nào set 2 trạng thái này và chưa có API chặn guest.

> Ghi chú kiểm chứng: converted_user_id là thật: được gán trong luồng nghiệp vụ (service:3832, 3928) và được dùng để gộp lịch sử booking của guest đã chuyển đổi (10778). NHƯNG hai trạng thái CONVERTED và BLOCKED chỉ tồn tại trong enum (schema:38-43) - grep toàn src không có chỗ nào set status='CONVERTED' hay 'BLOCKED', không có API chặn guest. Phần 'chính sách chống lạm dụng chặn guest' mới chỉ là enum trong schema.

- Bổ sung vào: **3.G Membership + mục 6 Bảng 23 (Guest)**
- Bằng chứng: `backend/prisma/schema.prisma:38-43` · `backend/prisma/schema.prisma:353-379`

**11. Form Join Us tạo sẵn tài khoản (mật khẩu) và hồ sơ quán/cast nháp (PartnerRequest)** _(so với PAR-01, PAR-03, PAR-04B)_

PartnerRequest trong code phong phú hơn nhiều so với PAR-01: đối tác đặt mật khẩu ngay khi gửi form (password_hash) - tức duyệt xong là có tài khoản đăng nhập; gửi kèm mô tả quán, địa chỉ, giờ mở cửa, tóm tắt menu, danh sách media, hồ sơ cast dạng nháp; hệ thống giữ các bản nháp chờ duyệt (draft_cast_ids, draft_media_ids, draft_content_ids) và trạng thái hiển thị public_state (mặc định HIDDEN); duyệt/từ chối có review_reason. Kèm luồng "partner listing draft": Partner tự soạn và submit thông tin quán/cast chờ Admin duyệt - tài liệu xếp việc partner tự đăng (PAR-04B) ở P1 nhưng code đã có.

- Bổ sung vào: **3.I Partner Registration & Approval + mục 6 Bảng 23**
- Bằng chứng: `backend/prisma/schema.prisma:275-279` · `backend/prisma/schema.prisma:1052-1099` · `backend/src/nightlife-data/nightlife-data.controller.ts:484` · `backend/src/nightlife-data/nightlife-data.controller.ts:560-633`

**12. Kênh thông báo nhiều hơn tài liệu và thông báo in-app có trạng thái đã đọc** _(so với 3.L (Bảng 16), Bảng 23 (Notification Log))_

Enum NotificationChannel có 7 kênh EMAIL/SMS/PUSH/IN_APP/ZALO/TELEGRAM/LINE trong khi doc 3.L chỉ đặc tả Telegram/Email/LINE OA - tuy nhiên runtime hiện mới thực gửi 3 kênh EMAIL, TELEGRAM và IN_APP (SMS/PUSH/ZALO/LINE mới ở mức enum). NotificationLog có trạng thái gửi QUEUED/SENT/FAILED/CANCELLED, template_key, người nhận, lỗi gửi. Member có trung tâm thông báo in-app thật (xem danh sách, đánh dấu đã đọc từng cái/tất cả; trạng thái đã đọc được mô hình hóa bằng status QUEUED→SENT chứ không có cờ is_read riêng). Doc cần bổ sung kênh IN_APP và tính năng thông báo trong ứng dụng.

> Ghi chú kiểm chứng: Enum 7 kênh + NotificationLog QUEUED/SENT/FAILED/CANCELLED, template_key, recipient, error (schema:258-273, 1020-1050) đúng. Trung tâm thông báo in-app member là thật: GET /member/notifications + read/read-all (controller:1137-1179; service:6203-6277). Hai điểm cần chỉnh: (1) 'đã đọc' không phải cờ riêng mà được mô hình hóa bằng status (chưa đọc = QUEUED, đã đọc = SENT + sentAt) - BA cần biết khi đặc tả; (2) runtime hiện chỉ ghi 3 kênh EMAIL/TELEGRAM/IN_APP; SMS/PUSH/ZALO/LINE chỉ nằm trong enum (LINE chỉ xuất hiện trong test), chưa có luồng gửi.

- Bổ sung vào: **3.L Notification & Communication**
- Bằng chứng: `backend/prisma/schema.prisma:258-273` · `backend/prisma/schema.prisma:1020-1050` · `backend/src/nightlife-data/nightlife-data.controller.ts:1142-1182`

**13. Hệ nội dung 6 loại (BLOG/STORE_POST/BANNER/POLICY/FAQ/VIDEO), chuyên mục và hot video có đếm view/like** _(so với 3.K (CON-01, CON-02), WEB-02)_

Content trong code hỗ trợ 6 loại nội dung: BLOG, STORE_POST (bài đăng của quán), BANNER, POLICY, FAQ, VIDEO với vòng đời DRAFT/PUBLISHED/ARCHIVED/DELETED và publish date; có entity Category (chuyên mục blog) quản lý qua admin. Ngoài ra có nghiệp vụ "hot videos" theo thành phố với API công khai đếm lượt xem/lượt thích từng video và admin sắp xếp danh sách hot video theo city. Tài liệu 3.K chỉ đặc tả blog và trang chính sách; banner được nhắc ở WEB-02 nhưng không mô tả là một loại content; FAQ/STORE_POST/hot video chưa có.

- Bổ sung vào: **3.K Blog, Tour, SEO & Legal + mục 6 Bảng 23 (Content/Category)**
- Bằng chứng: `backend/prisma/schema.prisma:242-256` · `backend/prisma/schema.prisma:994-1018` · `backend/prisma/schema.prisma:1235-1245` · `backend/src/nightlife-data/nightlife-data.controller.ts:193-241`

**14. Ranking hỗ trợ cả COUPON/CONTENT, cờ sponsored, pin thứ hạng, điểm thủ công và lịch hiệu lực** _(so với 3.C (RAN-05, RAN-07), Bảng 20)_

RankingConfig trong code có cơ chế vượt đặc tả 3.C: manual_score (điểm thủ công), pin_rank (ghim vị trí - public ranking sắp theo pinRank rồi manualScore), cờ sponsored, phạm vi city_code/category/scope, reason, lịch hiệu lực starts_at/ends_at và trạng thái ACTIVE/PAUSED/EXPIRED/DELETED - tất cả đang chạy thật qua API admin rankings (có audit log). Enum target_type có thêm COUPON/CONTENT nhưng chỉ ở mức schema - API hiện chặn, chỉ cho CAST/STORE. Doc đã nhắc 'sponsored flag' trong phần audit (Bảng 18, 20) nhưng 3.C chưa đặc tả sponsored/pin_rank/manual_score/lịch hiệu lực thành field nghiệp vụ - cần bổ sung vì liên quan tranh chấp quảng cáo.

> Ghi chú kiểm chứng: Phần lớn đúng và chạy thật: RankingConfig có manual_score/pin_rank/sponsored/city_code/category/scope/reason/starts_at/ends_at/status (schema:1205-1233); public ranking sắp theo pinRank → manualScore và lọc theo hiệu lực (service:1363-1376); admin CRUD /admin/rankings có audit (controller:254-314). HAI điểm phải sửa: (1) target_type COUPON/CONTENT chỉ nằm trong enum - resolveRankingTargetType ném BadRequest 'targetType must be CAST or STORE' (service:16269-16277), nên KHÔNG có nghiệp vụ xếp hạng coupon/content thật; (2) 'sponsored flag' thực ra đã được doc nhắc tên tại Bảng 18 và Bảng 20 (before/after audit có 'sponsored flag, publish flag') dù chưa đặc tả thành field nghiệp vụ trong 3.C.

- Bổ sung vào: **3.C Ranking Page & Ranking Control**
- Bằng chứng: `backend/prisma/schema.prisma:281-293` · `backend/prisma/schema.prisma:1205-1233` · `backend/src/nightlife-data/nightlife-data.controller.ts:257-315`

**15. Media có phân quyền truy cập PUBLIC/PROTECTED và vòng đời riêng** _(so với ADM-04)_

Entity Media trong code có chính sách truy cập: access PUBLIC/PROTECTED (mặc định PROTECTED - ví dụ ảnh bill, ảnh booking chỉ người có quyền xem), trạng thái UPLOADING/READY/HIDDEN/DELETED, mục đích sử dụng (purpose), và gắn được vào store/cast/booking/bill/content/avatar. Tài liệu ADM-04 chỉ nói "thư viện media tập trung" mà chưa đặc tả chính sách bảo vệ file riêng tư - điểm quan trọng vì bill chứa thông tin nhạy cảm.

- Bổ sung vào: **3.J Admin CMS & Dashboard (ADM-04) + mục 6 Bảng 23 (Media)**
- Bằng chứng: `backend/prisma/schema.prisma:223-240` · `backend/prisma/schema.prisma:954-992`

**16. Favorite quán/cast đã triển khai với data model riêng (doc xếp P1)** _(so với STO-06, CAS-03)_

Code đã có MemberFavoriteCast và MemberFavoriteStore (unique theo user+cast / user+store) cùng bộ API member đầy đủ: xem danh sách, thêm/xóa favorite theo slug quán/cast. Tài liệu có nhắc tính năng ở STO-06/CAS-03 nhưng xếp P1 và không đặc tả entity; thực tế tính năng đã chạy ở bản hiện tại nên BA cần cập nhật phase và mô tả dữ liệu.

- Bổ sung vào: **3.D STO-06 / 3.E CAS-03 (cập nhật phase) + mục 6 Bảng 23**
- Bằng chứng: `backend/prisma/schema.prisma:598-624` · `backend/src/nightlife-data/nightlife-data.controller.ts:1035-1122`

**17. Tài khoản đối tác PartnerAccount có hồ sơ pháp lý/ngân hàng và vòng đời 5 trạng thái** _(so với Bảng 23 (Partner Account), PAR-04)_

PartnerAccount trong code lưu thông tin nghiệp vụ chưa có trong tài liệu: tên pháp nhân (legal_name), mã số thuế (tax_code), thông tin ngân hàng (bank_info) phục vụ chi trả hoa hồng, số hợp đồng (contract_number), người liên hệ; vòng đời PENDING_REVIEW/ACTIVE/SUSPENDED/CLOSED/DELETED. Bảng 23 chỉ mô tả Partner Account = "đăng nhập, quét QR, xác nhận khách". Một User có thể có nhiều PartnerAccount và một PartnerAccount quản lý nhiều Store.

- Bổ sung vào: **3.I Partner + mục 6 Bảng 23 (Partner Account)**
- Bằng chứng: `backend/prisma/schema.prisma:45-51` · `backend/prisma/schema.prisma:455-479`

### Frontend (các trang & trải nghiệm thực tế)

**1. Hỗ trợ 5 ngôn ngữ (vi/en/ja/ko/zh) trên toàn site** _(so với WEB-01)_

Frontend hỗ trợ thật 5 ngôn ngữ: tiếng Việt, Anh, Nhật, Hàn, Trung (giản thể) với bộ từ điển dịch đầy đủ cho mọi trang (kể cả trang ưu đãi, gửi hóa đơn, xếp hạng...); bộ chọn ngôn ngữ ở header và tham số ?lang được giữ qua luồng đăng nhập. Tài liệu chỉ nói 'chọn ngôn ngữ, ưu tiên tiếng Nhật' (WEB-01) và 'đa ngôn ngữ đầy đủ' để P2 — thực tế đa ngôn ngữ đã hoạt động đầy đủ ở MVP với danh sách 5 ngôn ngữ cụ thể cần được chốt trong tài liệu.

- Bổ sung vào: **3.A Public Website & Navigation (WEB-01)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/i18n/translations.ts:1` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/middleware.ts:19` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/uu-dai/page.tsx:231-311`

**2. Hệ role 6 cấp và quản lý vòng đời tài khoản trong Admin CMS** _(so với ADM-12)_

Code có 6 role SUPER_ADMIN/ADMIN/OPERATOR/PARTNER/STAFF/USER (middleware, hosts.ts). Trang Admin 'Tài khoản' quản lý vòng đời thật qua API /admin/users: tạo tài khoản mọi role (mật khẩu ≥8 ký tự, nút tạo ngẫu nhiên), đổi thông tin, đổi mật khẩu (ép đăng xuất mọi thiết bị), đổi email (gửi thư xác minh tới email mới + ép đăng xuất), vô hiệu hóa/khôi phục/xóa cứng; bộ lọc Super Admin chỉ hiện với Super Admin. Riêng trang 'Ma trận quyền' (/admin/permissions) hiện chỉ là UI demo: toggle lưu ở React state cục bộ, KHÔNG gọi API lưu cấu hình (file không import apiClient/fetch); chỉ có ràng buộc hiển thị/chỉnh cột theo role (cột Operator chỉ Admin/Super Admin, cột Super Admin chỉ Super Admin) là chạy phía client. Tài liệu chỉ có ADM-12 (Admin/Operator/Partner, Operator P1) và nhắc Super Admin/Operator ở mục audit 4.4/4.7 như role xem log, không có nghiệp vụ quản lý tài khoản/ma trận quyền.

> Ghi chú kiểm chứng: Hiệu chỉnh: Ma trận quyền chưa nối backend (mock UI, toggle không persist) — cần ghi rõ khi đưa vào tài liệu; phần 6 role + vòng đời tài khoản là thật và đúng như mô tả.

- Bổ sung vào: **3.J Admin CMS & Dashboard (ADM-12) + mục 4.7**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/middleware.ts:24-31` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/roles/page.tsx:239-286` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/roles/page.tsx:452` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/roles/page.tsx:525-638`

**3. Đăng ký member bằng OTP email 8 số; đăng nhập Google và LINE** _(so với MEM-01)_

Đăng ký thành viên yêu cầu nhập mã OTP 8 chữ số gửi qua email (có thời hạn hiệu lực trả về theo phút). Ngoài email/mật khẩu, member có thể đăng nhập bằng Google (OAuth) và LINE; luồng LINE có trang riêng /line-email-consent yêu cầu người dùng đồng ý cung cấp email trước khi tiếp tục (cam kết không dùng email cho quảng cáo). Tài liệu MEM-01 chỉ ghi 'đăng ký/đăng nhập thành viên', không có OTP hay social login.

- Bổ sung vào: **3.G Membership, Point, Booking QR (MEM-01)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(public)/dang-nhap/page.tsx:182-187` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/auth.ts:220-247` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(public)/line-email-consent/page.tsx:50-62`

**4. Hạn chót hủy booking cấu hình được theo từng quán (30/60/120 phút)** _(so với BOO-08A)_

Mốc 'hủy trước giờ hẹn tối thiểu 1 giờ' không cố định: mỗi quán có bookingCancelCutoffMinutes do Admin cấu hình qua CMS với 3 lựa chọn 30/60/120 phút (mặc định 60). Admin còn có màn phân tích tỷ lệ hủy (cancel-analytics) theo quán/cast/kênh (MEMBER/GUEST) trong N ngày để hỗ trợ quyết định chỉnh cutoff. Tài liệu BOO-08A chốt cứng 1 giờ.

- Bổ sung vào: **3.F Booking & Notification (BOO-08A)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:354` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:423-432` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:655-666` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bookings.ts:319-352`

**5. Sổ điểm chi tiết và cơ chế thăng hạng thành viên theo điểm** _(so với MEM-02, FLOW F)_

member.ts có point ledger 5 loại EARN/REDEEM/ADJUST/REVERSE/EXPIRE và MemberPointSummary với availablePoints/earned/spent/expired/expiringSoon + currentTier/nextTierName/nextTierThreshold/pointsToNextTier/progressPercent; trang tài khoản hiển thị nhãn hạng GUEST/MEMBER/VIP (tier VIP/PREMIUM đều hiện VIP) và thanh tiến độ lên hạng. Gap thật so với doc: (1) cơ chế THĂNG HẠNG THEO NGƯỠNG ĐIỂM — doc xác định hạng theo loại tài khoản (mục 1.2), không theo điểm; (2) loại giao dịch REDEEM (tiêu điểm) và sổ điểm chi tiết trên UI. Lưu ý doc KHÔNG hoàn toàn thiếu các loại giao dịch còn lại: MEM-07C đã có 'Hủy/hoàn bill -> đảo điểm' (= REVERSE, P1/P2), mục 4.2 có POINT_ADJUST (= ADJUST, P1), MEM-07B có điểm hết hạn 1 năm (= EXPIRE).

> Ghi chú kiểm chứng: Hiệu chỉnh: câu 'chưa có ... REVERSE - đảo điểm' sai — doc đã có đảo điểm (MEM-07C), chỉnh điểm thủ công (POINT_ADJUST) và hết hạn điểm (MEM-07B). Gap thật là REDEEM, sổ điểm UI và mô hình lên hạng theo điểm.

- Bổ sung vào: **3.G Membership, Point, Booking QR**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/member.ts:3-33` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/tai-khoan/page.tsx:48-53` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/tai-khoan/page.tsx:127`

**6. Favorite quán & cast đã chạy ở MVP kèm trang 'Đã lưu'** _(so với STO-06, CAS-03)_

Member có thể favorite/unfavorite quán và cast tại trang chi tiết và trang danh sách; trang /da-luu tổng hợp quán & cast đã lưu để đặt lại nhanh. Tài liệu xếp STO-06 và CAS-03 vào P1 — thực tế đã có ở bản hiện tại (trang /da-luu yêu cầu đăng nhập).

- Bổ sung vào: **3.D Store Detail / 3.E Cast Profile (cập nhật phase thực tế)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/store-favorite.ts:17-28` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/cast-detail.ts:40-48` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/da-luu/page.tsx:1` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/middleware.ts:152`

**7. Bill: 6 trạng thái, trần 100 triệu, file chứng từ ≤25MB, OCR gợi ý** _(so với BIL-02, BIL-03)_

Nghiệp vụ bill trong code chi tiết hơn tài liệu: trạng thái DRAFT/SUBMITTED/VERIFIED/REJECTED/PAID/VOIDED (tài liệu chỉ có Pending/duyệt/từ chối); tổng tiền tối đa 100.000.000đ/bill; file chứng từ JPG/PNG/WEBP/GIF/PDF tối đa 25MB, lưu chế độ PROTECTED; quy tắc 10 ngày được thực thi trên form (khớp BIL-02C); người gửi phân loại MEMBER/PARTNER; có bước OCR xem trước tự gợi ý tổng tiền và thời gian sử dụng kèm độ tin cậy (confidence) và cờ 'cần kiểm tra thủ công' — nếu file không đọc được, khách nhập tay và file chỉ làm chứng từ. Partner gửi bill từ cổng partner (/partner/gui-hoa-don) cho quán của mình.

- Bổ sung vào: **3.H Bill, Revenue & Commission**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/bills.ts:3` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/gui-hoa-don/page.tsx:72` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/gui-hoa-don/page.tsx:265` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(member)/gui-hoa-don/page.tsx:937-958`

**8. Cổng Partner đầy đủ 6 khu vực + quản lý nhân viên quán (STAFF)** _(so với PAR-04, PAR-04B, PAR-08)_

Cổng partner vượt xa phạm vi MVP trong tài liệu (login + quét QR + check-in): gồm 6 khu vực — Quét mã QR; Tổng quan (dashboard với kỳ Hôm nay/7 ngày/30 ngày: đặt chỗ, lượt xem, khách đến); Đối soát coupon (log sử dụng); Đăng thông tin (partner tự soạn draft thông tin quán: mô tả, menu, bảng giá, ảnh bìa, album, video, hồ sơ cast — nộp để Admin duyệt trước khi công khai); Gửi hóa đơn; Cài đặt tài khoản. Partner (chủ quán) còn tạo và quản lý tài khoản nhân viên quán (role STAFF) với phân quyền riêng từng nhân viên và đổi mật khẩu. Tài liệu xếp PAR-04B, PAR-08 vào P1 và không có khái niệm tài khoản STAFF của quán.

- Bổ sung vào: **3.I Partner Registration & Approval (cập nhật phạm vi MVP thực tế)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/partner/page.tsx:1368-1390` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/partner/page.tsx:1861` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/partner/page.tsx:1953-2045` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/partner/page.tsx:2727`

**9. Quét QR 2 bước và 3 loại mã (booking / tour / coupon)** _(so với MEM-05B, MEM-04B)_

Luồng scan của Partner gồm 2 bước nghiệp vụ: bước 1 scan để xem/kiểm tra thông tin mã, bước 2 'confirm-check-in' mới chốt sử dụng (một lần). Hỗ trợ 3 loại mã: QR booking, QR tour booking (xác nhận theo từng chặng của tour), QR coupon độc lập. Trạng thái mã phát hành: ISSUED/USED/EXPIRED/REVOKED — REVOKED (thu hồi) dùng cho xử lý nghi ngờ gian lận, dashboard admin có mục 'Fraud review - revoked tokens'. Tài liệu MEM-05B chỉ mô tả scan 1 bước cho 1 loại QR booking.

- Bổ sung vào: **3.G Membership, Point, Booking QR (MEM-05B)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/partner/page.tsx:2338-2354` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/partner/page.tsx:2632-2652` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/coupons.ts:26` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/AdminConsole.tsx:1951-1955`

**10. Danh sách menu Admin CMS thực tế (nhiều mục ngoài tài liệu)** _(so với ADM-01..ADM-14)_

Sidebar Admin CMS gồm: Bảng điều khiển; Booking (kèm duyệt yêu cầu đổi lịch); Chat hỗ trợ; Duyệt hóa đơn; Coupon & QR; Quán; Cast; Ranking; Tour; Nội dung trang chủ (tab campaign/banner/featured/recommend/tour/video/blog, kèm checklist SEO cho bài blog); Giao diện & Logo; Duyệt đối tác; Tài khoản; Ma trận quyền; Lịch sử thao tác (Audit Log); Dung lượng lưu trữ. Topbar có bộ lọc dữ liệu toàn cục theo khu vực (Tất cả/HN/HCM) và 8 loại hình; giao diện admin có chế độ sáng/tối. Màn Audit Log có lọc theo module/kết quả và diff viewer before/after (tài liệu xếp diff viewer ở P1). Tài liệu 3.J chưa liệt kê các mục: Chat hỗ trợ, Coupon & QR, Tour, Giao diện, Ma trận quyền, Dung lượng lưu trữ.

- Bổ sung vào: **3.J Admin CMS & Dashboard (liệt kê menu thực tế)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/layout.tsx:24-136` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/layout.tsx:286` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/content/page.tsx:168` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/content/page.tsx:214-256`

**11. Admin tùy biến giao diện trang chủ: logo, brand, nhãn khối, quick access, bottom nav** _(so với WEB-02, WEB-03, WEB-04)_

Trang 'Giao diện & Logo' cho Admin cấu hình: tên thương hiệu + tagline + logo; nhãn/icon/màu 8 ô quick access trang chủ; 5 mục bottom navigation mobile; tiêu đề từng khối trang chủ (Đề xuất, Coupon Hot, Bảng xếp hạng, Dịch vụ nổi bật + nhãn tab Nhà hàng/Spa, Video Hot, Tour·Blog·Guide); tỷ lệ khung banner (16:9, 21:9, 4:1). Trang chủ thực tế có các khối vượt tài liệu: khối Video Hot (WEB-04 để P2 nhưng đã chạy, có đếm view và like video), khối Coupon Hot, khối Tour, tab dịch vụ Nhà hàng/Spa dẫn tới trang danh mục riêng /nha-hang và /spa.

- Bổ sung vào: **3.A Public Website & Navigation + 3.J (bổ sung ADM giao diện)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/appearance.ts:39-71` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/content/page.tsx:2792` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/HomePageClient.tsx:67-68` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/HomePageClient.tsx:1113-1119`

**12. Bộ lọc tìm kiếm mở rộng: Đang mở, Gần tôi, sort, lọc theo ưu đãi/ngôn ngữ** _(so với SEA-02, SEA-04)_

Code thật: discovery.ts có sort newest/nearest/priority, hasActiveCoupon, language/tag, lat/lng; danh-sach-quan có isOpenNow, nearMe (xin định vị, hiển thị khoảng cách), hasDeals, lọc khu vực/loại hình/nhu cầu. Tuy nhiên phần vượt tài liệu cần thu hẹp: 'Gần tôi' KHÔNG vượt doc — SEA-02 P0 đã chốt 'Tìm theo địa điểm gần nhất'; lọc cast theo ngôn ngữ/tag cũng đã nằm trong CAS-07 P0 ('Tags/keywords: độ tuổi, phong cách, ngôn ngữ... Phục vụ tìm kiếm/lọc'). Vượt tài liệu thật sự: filter 'Đang mở' theo giờ mở cửa hiện tại, 3 lựa chọn sắp xếp Phổ biến/Gần nhất/Mới nhất, lọc theo 'nhu cầu', và lọc quán đang có ưu đãi (SEA-04 xếp P1 nhưng đã chạy ở MVP).

> Ghi chú kiểm chứng: Hiệu chỉnh: bỏ 'Gần tôi' và 'lọc cast theo ngôn ngữ' khỏi danh sách vượt doc (đã có ở SEA-02/CAS-07 P0); giữ 'Đang mở', sort, nhu cầu, hasActiveCoupon (P1 làm sớm).

- Bổ sung vào: **3.B Search, Filter & Discovery**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/discovery.ts:7-22` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(public)/danh-sach-quan/page.tsx:59-101` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/i18n/translations.ts:20-23`

**13. Cast có giá tham khảo theo giờ công khai; gợi ý liên quan tự động** _(so với CAS-06, SEA-05, STO-07, STO-10)_

Gap thật: (1) hourlyRateVnd xuất hiện trong PublicCastDetail/RelatedCast/StoreDetailCast public — không nằm trong danh sách public fields của CAS-06; (2) gợi ý liên quan đã TỰ ĐỘNG theo lý do: RelatedCastReason same-store/same-area/same-tag/ranking và RelatedStore relatedReason same-area/same-category/same-city — trong khi SEA-05/STO-10 chốt P0 chọn thủ công, P1 mới tự động. Hai ý còn lại cần thu hẹp: 'lịch nghỉ đặc biệt' (specialClosures theo ngày kèm lý do) về bản chất đã được STO-02 P0 bao ('Giờ mở/đóng cửa, ngày nghỉ lễ/định kỳ') — code chỉ chi tiết hóa cấu trúc dữ liệu; 'bảng giá cấu trúc' (nhóm món/đơn vị/tier/hot/displayPrice) là phạm vi 'tách chi tiết P1' đã ghi trong STO-07, tức làm sớm hơn phase chứ không phải thiếu hoàn toàn.

> Ghi chú kiểm chứng: Hiệu chỉnh: giữ 2 gap chính (hourlyRateVnd public, related tự động); specialClosures và bảng giá cấu trúc chỉ là chi tiết hóa/làm sớm các mục STO-02/STO-07 đã có trong doc.

- Bổ sung vào: **3.E Cast Profile (CAS-06) + 3.D Store Detail**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/cast-detail.ts:24-37` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/cast-detail.ts:64` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/store-detail.ts:22-30` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/api/store-detail.ts:54-71`

**14. Đăng ký đối tác tạo luôn tài khoản (kèm mật khẩu) và chặn đăng ký trùng** _(so với PAR-01)_

Form 'Đăng ký đối tác' (/dang-ky-doi-tac) không chỉ gửi thông tin liên hệ: đối tác khai tên cơ sở, loại hình, tỉnh/thành + địa chỉ, người liên hệ, SĐT và đặt luôn mật khẩu — tạo tài khoản partner ở trạng thái chờ duyệt; yêu cầu được gửi Admin qua Telegram. Người đang đăng nhập bằng tài khoản PARTNER truy cập trang đăng ký sẽ bị chặn và chuyển về cổng partner với thông báo 'partner-registration-blocked'. Tài liệu PAR-01 chỉ mô tả form Join Us gửi thông tin.

- Bổ sung vào: **3.I Partner Registration & Approval (PAR-01)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(public)/dang-ky-doi-tac/page.tsx:891-893` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(public)/dang-ky-doi-tac/page.tsx:1244` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(public)/dang-ky-doi-tac/page.tsx:772-776` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/middleware.ts:142-147`

**15. SEO/PWA triển khai vượt mức P0: structured data, sitemap động, PWA, blog category/tag** _(so với CON-05, CON-06)_

SEO thực tế đã ở mức tài liệu xếp P1-P2: JSON-LD structured data cho quán (LocalBusiness theo loại hình: BarOrPub/NightClub/Restaurant/Casino..., kèm giờ mở cửa) và breadcrumb; sitemap.xml động (trang tĩnh + quán + cast + bài blog + chuyên mục/tag blog + trang legal có điều kiện noindex); robots.txt chặn index toàn bộ khu member/admin/partner/trang hệ thống; site là PWA cài được như app (webmanifest, standalone, tên 'Vietyoru'); blog có trang chuyên mục /blog/category/[slug] và tag /blog/tag/[slug]; admin có checklist chấm SEO bài blog (từ khóa trong tiêu đề/mô tả, heading, bullet, ảnh). Có tracking hành vi người dùng qua dataLayer (sự kiện click booking/coupon/call/map/favorite trên trang quán).

- Bổ sung vào: **3.K Blog, Tour, SEO & Legal**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/(public)/stores/[slug]/store-detail.schema.ts:17-45` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/sitemap.ts:16-60` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/robots.ts:1-35` · `D:/laragon/www/NightLife-VN/frontend/apps/web/public/site.webmanifest:1-10`

**16. Trang pháp lý: thêm 'Điều khoản sử dụng' và quản lý legal qua CMS** _(so với CON-04)_

Có 3 tài liệu pháp lý (không phải 2 như CON-04): Chính sách bảo mật (/legal/chinh-sach-bao-mat), Điều khoản sử dụng (/legal/dieu-khoan-su-dung), Chính sách hoạt động (/legal/chinh-sach-hoat-dong), cùng trang tổng /legal; nội dung legal có thể quản lý/ghi đè qua CMS với cờ noindex ảnh hưởng việc đưa vào sitemap.

- Bổ sung vào: **3.K Blog, Tour, SEO & Legal (CON-04)**
- Bằng chứng: `D:/laragon/www/NightLife-VN/frontend/apps/web/src/lib/content/legal.ts:24-79` · `D:/laragon/www/NightLife-VN/frontend/apps/web/src/app/sitemap.ts:52-58`
