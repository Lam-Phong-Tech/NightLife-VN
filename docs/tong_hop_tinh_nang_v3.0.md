# INTERNAL DOCUMENT · CONFIDENTIAL
## NIGHTLIFE VIETNAM
# Tổng hợp tính năng & Phân chia Phase
Nền tảng giới thiệu & booking dịch vụ nightlife — tài liệu định hướng scope sản phẩm.

## DOCUMENT VERSION: v3.0
*Bản chốt v3.0 — tài liệu cuối phục vụ khởi động dự án. Toàn bộ scope, phase và cấu hình đã được khách hàng xác nhận.*

| PHIÊN BẢN | NGÀY PHÁT HÀNH | LOẠI TÀI LIỆU | ĐỐI TƯỢNG |
| :---: | :---: | :--- | :--- |
| **v3.0** | 22 / 06 / 2026 | Feature Summary & Phase Plan | Khách hàng · PM · BA · Dev · QA |

---

## Mục lục
Tài liệu nội bộ phục vụ khởi động dự án — gồm 7 mục chính.
1. [Baseline & mô hình nghiệp vụ (bắt buộc thống nhất)](#1-baseline--mo-hinh-nghiep-vu-bat-buoc-thong-nhat)
2. [Quy ước trạng thái xác nhận & Phase](#2-quy-uoc-trang-thai-xac-nhan)
3. [Tính năng theo nhóm chức năng (Phase & Trạng thái)](#3-tinh-nang-theo-nhom-chuc-nang-phase--trang-thai)
   * [3.A Public Website & Navigation](#3a-public-website--navigation)
   * [3.B Search, Filter & Discovery](#3b-search-filter--discovery)
   * [3.C Ranking Page & Ranking Control](#3c-ranking-page--ranking-control)
   * [3.D Store Detail — Trang chi tiết địa điểm](#3d-store-detail--trang-chi-tiet-dia-diem)
   * [3.E Cast / Staff Profile — Trang chi tiết nhân viên](#3e-cast--staff-profile--trang-chi-tiet-nhan-vien)
   * [3.F Booking & Notification](#3f-booking--notification)
   * [3.G Membership, Point, Coupon & QR](#3g-membership-point-coupon--qr)
   * [3.H Bill, Revenue & Commission](#3h-bill-revenue--commission)
   * [3.I Partner Registration & Approval](#3i-partner-registration--approval)
   * [3.J Admin CMS & Dashboard](#3j-admin-cms--dashboard)
   * [3.K Blog, Tour, SEO & Legal](#3k-blog-tour-seo--legal)
   * [3.L Notification & Communication](#3l-notification--communication)
4. [Các luồng nghiệp vụ chính (Flow A–F)](#4-cac-luong-nghiep-vu-chinh)
5. [Dữ liệu chính cần quản lý](#5-du-lieu-chinh-can-quan-ly)
6. [Phạm vi KHÔNG thuộc MVP (theo baseline)](#6-pham-vi-khong-thuoc-mvp-theo-baseline)
7. [Thứ tự triển khai MVP đề xuất](#7-thu-tu-trien-hai-mvp-de-xuat)

---

NightLife Vietnam — nền tảng giới thiệu & booking dịch vụ nightlife. Tài liệu này mô tả phạm vi tính năng MVP và phân chia phase P0 / P1 / P2 để đội dự án tiến hành thiết kế UI, viết SRS và lập backlog.

*   `✓ Đã chốt`
*   `» Phase sau`
*   `◇ Backlog`

| Thông tin | Chi tiết |
| :--- | :--- |
| **Dự án** | NightLife Vietnam — nền tảng giới thiệu & booking dịch vụ nightlife |
| **Loại tài liệu** | Feature Summary & Phase Plan (bản chốt khởi động dự án) |
| **Phiên bản** | 3.0 (bản chốt cuối) |
| **Ngày phát hành** | 22/06/2026 |
| **Đối tượng đọc** | Khách hàng, PM/Lead, BA, UI/UX, Dev, QA |
| **Nguồn tổng hợp** | Biên bản & transcript họp, BA Requirement, các vòng xác nhận với khách hàng (tổng hợp đến 22/06/2026) |

*Toàn bộ tính năng trong tài liệu này đã được khách hàng xác nhận. Không còn câu hỏi mở blocking thiết kế — đội dự án có thể khóa scope chi tiết và khởi động ngay.*

---

## 1 Baseline & mô hình nghiệp vụ (bắt buộc thống nhất)

NightLife là **SÀN TRUNG GIAN** (phễu dẫn khách), **KHÔNG** phải hệ thống vận hành đặt bàn nội bộ kiểu Haidilao. Hệ thống không quản lý order, không POS, không thanh toán online, không cho đặt món / lên đơn trên web. Menu / bảng giá chỉ để tham khảo.

**Luồng nghiệp vụ lõi:** Khách xem quán/cast → Booking hoặc lấy mã QR/coupon → thông tin gửi về Telegram (ưu tiên) để Admin điều phối → khách đến quán dùng dịch vụ (offline) → gửi bill/hóa đơn chuyển khoản → Admin duyệt & đối soát doanh thu/hoa hồng/điểm.

### Phạm vi dịch vụ
*   **Dịch vụ lõi (nightlife chính):** Bar, Club, Lounge, Karaoke/KTV, Girls bar — trọng tâm nghiệp vụ.
*   **Dịch vụ phễu (chỉ hiển thị thông tin):** nhà hàng, quán ăn, massage, khách sạn, casino — chỉ tham khảo menu/thông tin/ưu đãi, nghiệp vụ nhẹ hơn.

### Hạng khách v1 (đã chốt)
*   **Khách thường (Guest, chưa đăng ký):** giảm 5% · hạn dùng mã giảm giá 24 giờ.
*   **Thành viên (Member):** giảm 8% · hạn dùng mã 7 ngày · được tích điểm.
*   **VIP:** giảm 10% · tích điểm · ưu đãi cao nhất.

### Khu vực phục vụ
Phiên bản đầu tập trung 2 thành phố lớn: **Hà Nội (HN)** và **TP. Hồ Chí Minh (HCM)**, kèm tab **Tổng hợp** hiển thị toàn bộ. Đà Nẵng và Hải Phòng không thuộc MVP — có thể bổ sung ở phase sau.

### Tích điểm theo nhóm dịch vụ
MVP ưu tiên tích điểm cho nhóm nightlife chính (Bar, Club, Lounge, Karaoke/KTV, Girls bar).

#### ✓ Kiểm bill & hoa hồng & điểm — nguyên tắc đã chốt
*   **Công thức hoa hồng:** Hoa hồng Admin = Tổng bill GỐC × (% hoa hồng thỏa thuận − % giảm giá cho khách) → tính trên bill **TRƯỚC** giảm giá.
*   **Tỷ lệ tích điểm:** 1.000.000đ trên hóa đơn GỐC = 10 điểm.
*   **Thời hạn điểm:** 1 năm.
*   **Đảo điểm:** Khi hóa đơn bị hủy / hoàn tiền, hệ thống đảo lại số điểm tương ứng.
*   **Hóa đơn — phạm vi:** Phiên bản đầu chỉ ghi nhận TỔNG TIỀN hóa đơn, không nhập chi tiết từng món / dịch vụ.
*   **Thời hạn gửi hóa đơn:** trong vòng 10 ngày kể từ ngày khách sử dụng dịch vụ.

---

## 2 Quy ước trạng thái xác nhận

*   `✓ Đã chốt` — Khách đã xác nhận; sẵn sàng đưa vào phase & viết user story chi tiết.
*   `» Phase sau` — Có giá trị nhưng đồng ý để Phase 2/3, không bắt buộc cho MVP.
*   `◇ Backlog` — Hạng mục chỉ xem xét lại nếu khách xác nhận bổ sung; không thuộc MVP/P1.

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│        115        │     │         3         │     │         0         │
│      ĐÃ CHỐT      │     │     PHASE SAU     │     │      BLOCKER      │
└───────────────────┘     └───────────────────┘     └───────────────────┘
```
*Toàn bộ tính năng đã được xác nhận và phân phase rõ ràng — không còn item nào blocking quá trình thiết kế.*

### Quy ước Phase
*   **P0 — MVP bắt buộc:** public site (HN/HCM/Tổng hợp), tìm kiếm, chi tiết quán/cast (có album ảnh + video), booking (3 trạng thái: Mới / Đã hủy / Hoàn tất), coupon/QR cơ bản (1 lần / coupon, nhân viên quán quét), bill manual + Admin duyệt, ghi nhận điểm cơ bản (1tr = 10đ), CMS cơ bản, tài khoản đối tác tối giản (auth + quét QR + xác nhận check-in), thông báo qua Telegram. → Để demo / launch bản đầu.
*   **P1 — Tự động hóa & tối ưu:** đăng thông tin partner (PAR-04B), dashboard partner tối thiểu (PAR-08), quản lý đối tác + chat 1-1 trong CMS (ADM-13), paid ranking, audit log, chat khách realtime, báo cáo chi tiết + xuất Excel/PDF (P2), partner portal mở rộng. → Sau khi MVP ổn định.
*   **P2 — Mở rộng:** tour, video/SNS nâng cao trên trang chủ, đa ngôn ngữ đầy đủ, BI dashboard, Bill Reversal tự động. → Cần cam kết riêng.

---

## 3 Tính năng theo nhóm chức năng (Phase & Trạng thái)

### 3.A Public Website & Navigation
Mặt tiền hệ thống: khách tìm địa điểm, xem nhanh thông tin và chuyển sang booking / lấy mã.

| ID | Tính năng | Phase | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **WEB-01** | Header/nav, menu danh mục, login/register, chọn ngôn ngữ | **P0** | `✓ Đã chốt` | Ưu tiên tiếng Nhật |
| **WEB-02** | Hero slider/banner: sự kiện hot, quán nổi bật, cast mới | **P0** | `✓ Đã chốt` | Admin quản lý trong CMS |
| **WEB-03** | Quick access grid: tìm quán, ưu đãi, album ảnh, tìm cast, sự kiện, blog | **P0** | `✓ Đã chốt` | Theo ghi chú ảnh yêu cầu |
| **WEB-04** | Video/SNS section trên trang chủ (YouTube/TikTok/upload) | **P2** | `» Phase sau` | Trang chủ: phase sau. Video tại Store Detail & Cast Profile đã ở P0. |
| **WEB-05** | New updates: quán/cast mới cập nhật | **P0** | `✓ Đã chốt` | Dùng publish date từ CMS. |
| **WEB-06** | Blog nổi bật + footer (bản quyền, điều khoản, MXH, liên hệ hợp tác) | **P0** | `✓ Đã chốt` | Liên quan SEO/legal |
| **WEB-07** | Trang chủ mobile: cấu trúc rõ, ưu tiên ranking + CTA nhanh | **P0** | `✓ Đã chốt` | Tham khảo ranking Việt Kara |

### 3.B Search, Filter & Discovery
Giúp khách tìm đúng địa điểm / cast theo nhu cầu, khu vực, loại hình.

| ID | Tính năng | Phase | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **SEA-01** | Tìm nhanh theo tên quán / tên cast | **P0** | `✓ Đã chốt` | Thanh tìm Shop/Cast |
| **SEA-02** | Tìm theo địa điểm gần nhất + khu vực thành phố | **P0** | `✓ Đã chốt` | Chỉ HN / HCM ở MVP. ĐN, HP không thuộc phạm vi. |
| **SEA-03** | Lọc theo loại hình: Bar, Club, Lounge, Girls bar, Karaoke, Massage/Spa, Nhà hàng, Casino (8 loại) | **P0** | `✓ Đã chốt` | Taxonomy cuối: 8 loại, tách riêng Club / Lounge / Girls bar (không gộp vào Bar). |
| **SEA-04** | Lọc theo ưu đãi / rating / lượt thích / view | **P1** | `✓ Đã chốt` | Mở khi đã có đủ dữ liệu thật ở P1. |
| **SEA-05** | Gợi ý địa điểm liên quan dưới trang chi tiết | **P0** | `✓ Đã chốt` | P0 chọn thủ công bởi Admin; P1 tự động theo tag/khu vực. |

### 3.C Ranking Page & Ranking Control
Quan trọng cho trải nghiệm và mô hình kinh doanh quảng cáo / VIP. Tham khảo Việt Kara, top 1–5 theo khu vực.

| ID | Tính năng | Phase | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **RAN-01** | Trang xếp hạng có tab khu vực (HN, HCM, Tổng hợp) | **P0** | `✓ Đã chốt` | Top 1–5 mỗi khu vực. |
| **RAN-02** | Lọc ranking theo danh mục (Top Karaoke / Bar / Massage / Quán ăn) | **P0** | `✓ Đã chốt` | Theo ghi chú ảnh |
| **RAN-03** | Ranking card: ảnh, tên quán, khu vực, nút xem chi tiết / gọi ngay | **P0** | `✓ Đã chốt` | Chuyển đổi nhanh |
| **RAN-04** | Chỉ số: stars / hearts / views trong tháng | **P1** | `✓ Đã chốt` | P0 hiển thị thủ công; P1 đếm tự động. |
| **RAN-05** | Admin điều hướng ranking thủ công (đưa lên top) | **P0** | `✓ Đã chốt` | Manual ranking cho MVP |
| **RAN-07** | Ranking giai đoạn đầu 100% thủ công, Admin tự cấu hình; quán trả tiền tài trợ/quảng cáo có thể lên Top, không phụ thuộc thuật toán view/like/rating | **P0** | `✓ Đã chốt` | Không dùng thuật toán view/like/rating |
| **RAN-08** | Ưu tiên thứ tự xếp hạng: Cast trước, rồi đến Quán | **P0** | `✓ Đã chốt` | Theo bản chốt 21/06/2026 |

### 3.D Store Detail — Trang chi tiết địa điểm
Trang chuyển đổi chính. *Lưu ý baseline: bảng giá / menu chỉ để THAM KHẢO, không lên đơn trên web.*

| ID | Tính năng | Phase | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **STO-01** | Sidebar nhanh: logo / avatar, tên quán, SĐT click-to-call | **P0** | `✓ Đã chốt` | Theo ghi chú ảnh |
| **STO-02** | Giờ mở / đóng cửa, ngày nghỉ lễ / định kỳ | **P0** | `✓ Đã chốt` | Admin nhập CMS |
| **STO-03** | Địa chỉ + link Google Maps chỉ đường | **P0** | `✓ Đã chốt` | Quan trọng để khách tới quán |
| **STO-04** | Đặc điểm nhân sự: tỷ lệ quốc tịch, khả năng ngôn ngữ | **P0** | `✓ Đã chốt` | Rất quan trọng với khách Nhật |
| **STO-05** | Cast grid → click sang profile cast | **P0** | `✓ Đã chốt` | |
| **STO-06** | Favorite quán / cast tại trang địa điểm | **P1** | `✓ Đã chốt` | Liên kết membership. |
| **STO-07** | Bảng giá (phí hệ thống, phòng, đồ uống, phụ thu, thuế) — chỉ hiển thị | **P0** | `✓ Đã chốt` | P0 cơ bản; tách chi tiết P1 |
| **STO-08** | Campaign / discount: banner ưu đãi, thời gian áp dụng, first-time offer | **P0** | `✓ Đã chốt` | Liên quan coupon / booking |
| **STO-09** | Booking trên trang quán → gửi Admin điều phối | **P0** | `✓ Đã chốt` | Không gửi thẳng quán ở MVP |
| **STO-10** | Gợi ý quán liên quan bên dưới | **P1** | `✓ Đã chốt` | P0 chọn thủ công; P1 tự động. |
| **STO-11** | Album ảnh và video tại trang chi tiết quán (cho phép gắn link hoặc tải video lên) | **P0** | `✓ Đã chốt` | Trang chủ video P2; nhưng trang chi tiết quán có video P0. |

### 3.E Cast / Staff Profile — Trang chi tiết nhân viên
Khách xem hình ảnh, thông tin ở mức cho phép, ngôn ngữ, tags. *Lưu ý kiểm duyệt & dữ liệu nhạy cảm.*

| ID | Tính năng | Phase | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **CAS-01** | Ảnh đại diện lớn, chất lượng cao | **P0** | `✓ Đã chốt` | Theo ghi chú ảnh |
| **CAS-02** | Breadcrumbs: Trang chủ › Tìm quán › Quán › Nhân viên | **P0** | `✓ Đã chốt` | |
| **CAS-03** | Like / Favorite cast | **P1** | `✓ Đã chốt` | Phục vụ membership. |
| **CAS-04** | Ảnh / video tại trang Cast (KHÔNG hiển thị lịch trống) | **P0** | `✓ Đã chốt` | Lịch trống KHÔNG hiển thị. Video & album ảnh được phép gắn link hoặc tải lên. |
| **CAS-05** | Booking từ profile cast → gửi Admin điều phối (dùng chung biểu mẫu, thêm tham chiếu cast) | **P0** | `✓ Đã chốt` | Booking theo cast dùng chung biểu mẫu chuẩn, bổ sung tham chiếu đến cast. |
| **CAS-06** | Bio data & field public: Nick name, ảnh đại diện / album, video, tháng sinh & cung HĐ (KHÔNG ngày/năm), chiều cao, số đo (nếu có), sở thích, tags, ngôn ngữ (JP/EN/VN) | **P0** | `✓ Đã chốt` | Public fields: Nick name, Avatar/Album, Video, Tháng sinh & Cung HĐ (KHÔNG hiển thị ngày/năm cụ thể), Chiều cao, Số đo, Sở thích, Tags, Ngôn ngữ. |
| **CAS-07** | Tags / keywords: độ tuổi, phong cách, ngôn ngữ, ngoại hình | **P0** | `✓ Đã chốt` | Phục vụ tìm kiếm / lọc |
| **CAS-08** | Personal message / greeting (cast tự viết hoặc Admin nhập) | **P1** | `✓ Đã chốt` | Có kiểm duyệt nội dung trước khi public. |
| **CAS-09** | Gallery đa góc + lightbox / swipe mobile | **P0** | `✓ Đã chốt` | P0 cơ bản; hiệu ứng nâng cao P1 |
| **CAS-10** | Sidebar liên kết ngược về quán chủ quản | **P0** | `✓ Đã chốt` | Để khách lấy địa chỉ / SĐT quán |
| **CAS-11** | Admin kiểm duyệt dữ liệu cast trước khi public | **P0** | `✓ Đã chốt` | Admin kiểm duyệt; dữ liệu được phép hiển thị |

### 3.F Booking & Notification
Luồng chuyển đổi chính. MVP: Admin nhận booking nhanh qua nhóm Telegram (ưu tiên) / Zalo chung. *KHÔNG thanh toán.*

| ID | Tính năng | Phase | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **BOO-01** | Khách chọn: booking qua form hoặc đăng nhập để nhận ưu đãi cao hơn | **P0** | `✓ Đã chốt` | |
| **BOO-02** | Nút CTA booking / đăng nhập sticky dưới màn hình mobile | **P0** | `✓ Đã chốt` | |
| **BOO-03** | Form tối thiểu: tên, SĐT, số người, khung giờ, quán/cast, ghi chú | **P0** | `✓ Đã chốt` | Đặt chỗ theo Cast dùng chung biểu mẫu, bổ sung tham chiếu cast. |
| **BOO-04** | Booking → nhóm Telegram (ưu tiên) / Zalo CHUNG của Admin | **P0** | `✓ Đã chốt` | Ưu tiên Telegram cho nội bộ team. |
| **BOO-05** | Admin liên hệ quán báo khách sắp đến (quy trình offline ở MVP) | **P0** | `✓ Đã chốt` | |
| **BOO-06** | 3 trạng thái booking: Mới / Đã hủy / Hoàn tất (lưu lịch sử đặt chỗ + thông báo Telegram) | **P0** | `✓ Đã chốt` | MVP dùng 3 trạng thái cơ bản. Trạng thái mở rộng (Đã liên hệ / Đã xác nhận) ở P1. |
| **BOO-07** | Chat nhanh khách ↔ Admin (realtime, tích hợp trong code — không dùng kênh ngoài) | **P1** | `✓ Đã chốt` | WebSocket / SSE / Firebase realtime tùy stack. Không dùng LINE / Telegram / Zalo. |
| **BOO-08A**| Hủy booking trước giờ hẹn tối thiểu 01 giờ | **P0** | `✓ Đã chốt` | Không hoàn tiền (MVP không thu cọc / thanh toán online) |
| **BOO-08B**| Không sửa trực tiếp booking cũ | **P0** | `✓ Đã chốt` | Tránh rối dữ liệu |
| **BOO-08C**| Đổi giờ / số người / quán: khách hủy & đặt lại HOẶC liên hệ Admin. Khách hàng (khách Nhật): ưu tiên LINE OA, fallback Mail nếu P0 chưa setup LINE OA. Nội bộ: Telegram. | **P0** | `✓ Đã chốt` | Khách (Nhật): ưu tiên LINE OA, fallback Mail. Nội bộ: Telegram. |
| **BOO-09** | Cho phép liên kết Booking – Mã giảm giá – Hóa đơn (nếu có) | **P0** | `✓ Đã chốt` | Data model: cần FK từ Bill → Booking, Bill → Coupon, Coupon → Booking. |

### 3.G Membership, Point, Coupon & QR
Giữ chân khách, cấp ưu đãi, xác nhận khách thực sự tới quán. Điểm ưu tiên cho nhóm nightlife chính (xem Mục 1).

#### ✓ Hạng khách, mức giảm, thời hạn mã — ĐÃ CHỐT
*   **Mức giảm theo hạng:** Khách thường (Guest, chưa đăng ký) 5% · Thành viên 8% · VIP 10%.
*   **Thời hạn mã giảm giá / QR:** Guest = 24 giờ · Member = 7 ngày.
*   **Trạng thái mã:** Đang giữ chỗ / Đã sử dụng / Hết hạn (tự hủy qua cron 5 phút).
*   **Cơ chế quét mã tại quán:** NHÂN VIÊN QUÁN (qua tài khoản đối tác — xem PAR-04) quét / xác nhận mã giảm giá tại quán.
*   **Điểm:** 1.000.000đ trên hóa đơn GỐC = 10 điểm · thời hạn 1 năm · hủy / hoàn bill → đảo điểm.

| ID | Tính năng | Phase | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **MEM-01** | Đăng ký / đăng nhập thành viên | **P0** | `✓ Đã chốt` | |
| **MEM-02** | Hạng khách v1: Guest (chưa đăng ký) / Thành viên / VIP — giảm 5% / 8% / 10% | **P0** | `✓ Đã chốt` | Theo bản chốt 21/06/2026. |
| **MEM-03** | Coupon/QR: mã, ảnh QR, tên quán, hạn dùng (Guest 24h / Member 7 ngày), trạng thái | **P0** | `✓ Đã chốt` | Hạn dùng đã chốt. |
| **MEM-04** | Coupon/QR dùng MỘT lần — 1 lần / Coupon: khách lấy coupon → tạo QR riêng → quét → hết hiệu lực | **P0** | `✓ Đã chốt` | Phạm vi “1 lần / Coupon”: mỗi coupon phát ra mang QR riêng — sau khi quét sẽ Expired. |
| **MEM-04B**| Trạng thái mã: Đang giữ chỗ / Đã sử dụng / Hết hạn. Cơ chế tự hủy: cron 5 phút/lần, mã quá hạn → status “Expired” + ẩn nút QR của khách. | **P0** | `✓ Đã chốt` | Cron 5 phút/lần; khi Expired thì ẩn nút QR ở phía khách. |
| **MEM-05A**| Coupon/QR dùng để khách nhận ưu đãi tại quán (check-in / áp coupon khi tới quán) | **P0** | `✓ Đã chốt` | Mục đích sử dụng đã chốt |
| **MEM-05B**| Cơ chế redeem / scan / validate QR: NHÂN VIÊN QUÁN quét/xác nhận tại quán (qua tài khoản đối tác) | **P0** | `✓ Đã chốt` | Đối tác có tài khoản (PAR-04 — đã ở P0 với scope tối giản) để thực hiện. |
| **MEM-06** | Lịch sử coupon đã dùng (ngày, quán, bill, giá trị giảm) | **P0** | `✓ Đã chốt` | |
| **MEM-07** | Ghi nhận điểm: sau khi Admin duyệt bill, 1.000.000đ trên bill GỐC = 10 điểm | **P0** | `✓ Đã chốt` | Tính trên hóa đơn TRƯỚC giảm giá. |
| **MEM-07B**| Điểm có thời hạn 1 năm | **P0** | `✓ Đã chốt` | Quá hạn tự huỷ; có log để Admin tra cứu. |
| **MEM-07C**| Hủy / hoàn bill → đảo lại số điểm tương ứng (Admin chỉnh thủ công qua CMS ở P1; tự động cùng BIL-11 ở P2) | **P1** | `✓ Đã chốt` | Ở MVP xử lý hủy/hoàn ngoài hệ thống. |
| **MEM-10** | Thông báo chương trình / đổi thưởng qua Line / Mail | **P1** | `✓ Đã chốt` | P0 ưu tiên thông báo Admin |

### 3.H Bill, Revenue & Commission
Nhóm lõi sau họp. *Bill = bằng chứng khách đã dùng dịch vụ, dùng để ĐỐI SOÁT (không lên đơn / món trên web). Admin duyệt thủ công bằng mắt.*

#### ✓ Công thức hoa hồng & nguyên tắc hóa đơn — ĐÃ CHỐT
*   **Công thức hoa hồng:** Hoa hồng Admin = Tổng bill GỐC × (% hoa hồng thỏa thuận − % giảm giá cho khách) → tính trên bill **TRƯỚC** giảm giá. Các mức % cụ thể do Admin tự cấu hình theo từng quán / campaign.
*   **Phạm vi:** Phiên bản đầu chỉ ghi nhận TỔNG TIỀN hóa đơn, không nhập chi tiết từng món / dịch vụ.
*   **Người gửi:** Cả khách và chủ quán đều có thể gửi (khuyến khích, không bắt buộc).
*   **Ảnh / chứng từ:** KHUYẾN KHÍCH gửi, không bắt buộc (khách vẫn nên gửi để Admin đối chiếu).
*   **Thời hạn gửi:** Trong vòng 10 ngày kể từ ngày khách dùng dịch vụ.
*   **% giảm giá theo hạng khách đã chốt:** 5% / 8% / 10% (theo 3 hạng thành viên). Các campaign khác do Admin tự cấu hình trong CMS.
*   **% hoa hồng cụ thể theo từng quán:** = dữ liệu cấu hình vận hành, Admin nhập trong CMS khi onboard từng quán. *Không phải logic — không cần chốt ở spec.*

| ID | Tính năng | Phase | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **BIL-01** | Khách hoặc chủ quán gửi hóa đơn (ảnh bill / chứng từ chuyển khoản là KHUYẾN KHÍCH, không bắt buộc) | **P0** | `✓ Đã chốt` | Khách vẫn nên gửi ảnh để Admin đối chiếu. |
| **BIL-02** | Bill tối thiểu: tên quán, số tiền, thời gian, địa điểm / cơ sở (nếu có), ảnh / chứng từ (nếu có) | **P0** | `✓ Đã chốt` | Bắt buộc: quán + số tiền + thời gian. Tùy chọn: địa điểm/cơ sở + ảnh. |
| **BIL-02B**| Bill chỉ ghi nhận TỔNG TIỀN, không nhập chi tiết từng món / dịch vụ | **P0** | `✓ Đã chốt` | |
| **BIL-02C**| Thời hạn gửi hóa đơn: trong vòng 10 ngày kể từ ngày khách dùng dịch vụ | **P0** | `✓ Đã chốt` | Quá hạn không nhận. |
| **BIL-03** | Bill ở trạng thái Pending Admin Approval trước khi ghi nhận | **P0** | `✓ Đã chốt` | |
| **BIL-04** | Admin duyệt / từ chối bill (thủ công bằng mắt) — bill mờ/sai/gửi nhầm quán → trạng thái Bị từ chối, yêu cầu gửi lại, lưu LÝ DO từ chối | **P0** | `✓ Đã chốt` | Luồng từ chối có lý do đã chốt. |
| **BIL-05** | Sau duyệt: ghi nhận doanh thu, hoa hồng, điểm, gửi Telegram | **P0** | `✓ Đã chốt` | Công thức hoa hồng & tỷ lệ điểm (1tr = 10đ) đã chốt. |
| **BIL-06** | Báo cáo doanh thu theo ngày/tháng/năm, quán, bill — TÁCH RIÊNG: doanh thu gộp / thuần / hoa hồng / tiền giảm giá. Tính theo NGÀY KHÁCH SỬ DỤNG DỊCH VỤ. | **P0** | `✓ Đã chốt` | Thứ tự ưu tiên xem báo cáo: ngày → quán → mã giảm giá → khác. |
| **BIL-06B**| Xuất báo cáo ra file Excel / PDF | **P2** | `✓ Đã chốt` | Đã chốt P2 (sau MVP). |
| **BIL-09** | Commission cấu hình theo từng quán / thỏa thuận riêng | **P0** | `✓ Đã chốt` | Nguyên tắc & công thức đã chốt. Pending: nhập dữ liệu % cụ thể. |
| **BIL-10** | Tính lợi nhuận từng bill (cần giá vốn / margin) | **P1** | `» Phase sau` | Phiên bản đầu chỉ tính doanh thu & hoa hồng. Giá vốn / biên lợi nhuận để giai đoạn sau. |
| **BIL-11** | Hủy / hoàn tiền bill → bản ghi điều chỉnh ngược (reversal), KHÔNG xóa hóa đơn gốc; đồng thời trừ/đảo lại điểm và doanh thu (TỰ ĐỘNG) | **P2** | `✓ Đã chốt` | Đẩy về P2; MVP & P1 xử lý thủ công (P1: Admin chỉnh điểm qua CMS — xem MEM-07C). |
| **BIL-12** | Thứ tự ưu tiên xem báo cáo: theo ngày → quán → mã giảm giá → các thông tin khác | **P0** | `✓ Đã chốt` | Ảnh hưởng đến cấu trúc menu báo cáo trong CMS. |

### 3.I Partner Registration & Approval
Mở rộng nguồn quán / cast; nội dung partner luôn qua Admin duyệt trước khi public.

#### ✓ Scope Tài khoản đối tác ở MVP
*   Ở MVP (P0), tài khoản đối tác chỉ có **3 quyền lõi**: (a) đăng nhập, (b) quét mã QR của khách tại quán, (c) xác nhận khách đến quán. Các tính năng mở rộng (đăng thông tin quán/cast, dashboard partner) thuộc P1.
*   MVP partner chỉ có **3 màn hình**: **màn đăng nhập + màn quét QR + nút xác nhận check-in**. *Không có màn đăng thông tin, không có dashboard.*

| ID | Tính năng | Phase | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **PAR-01** | Form Join Us cho đối tác gửi thông tin | **P0** | `✓ Đã chốt` | Gửi CMS + Telegram / Zalo |
| **PAR-02** | Admin duyệt đối tác trước khi hiển thị public | **P0** | `✓ Đã chốt` | |
| **PAR-03** | Admin tự nhập thông tin quán lấy từ đối tác | **P0** | `✓ Đã chốt` | Luồng 1: bên vận hành nhập thay (chính ở MVP — vì PAR-04B đã chuyển P1). |
| **PAR-04** | Đối tác có TÀI KHOẢN RIÊNG (scope MVP rút gọn): (a) đăng nhập, (b) quét mã QR của khách, (c) xác nhận khách đến quán | **P0** | `✓ Đã chốt` | 3 quyền lõi ở MVP. Các tính năng đăng thông tin / dashboard ở P1 (PAR-04B, PAR-08). |
| **PAR-04B**| Đối tác đăng được: thông tin quán, thực đơn / bảng giá, hình ảnh, video, thông tin cast — TẤT CẢ qua Admin duyệt trước khi public | **P1** | `✓ Đã chốt` | MVP: Admin nhập thay qua PAR-03; partner tự đăng từ P1. |
| **PAR-05** | Chuyển form Join Us → bài đăng chính thức 1 click | **P1** | `✓ Đã chốt` | Có mapping form → store profile. |
| **PAR-06** | Thông báo khi có yêu cầu hợp tác mới | **P0** | `✓ Đã chốt` | |
| **PAR-07** | Không yêu cầu giấy phép kinh doanh | **P0** | `✓ Đã chốt` | Nên xác nhận trách nhiệm bằng văn bản |
| **PAR-08** | Đối tác xem dữ liệu tổng hợp TỐI THIỂU của RIÊNG quán họ: đặt chỗ tại quán, lượt xem trang, số khách đến. KHÔNG xem dữ liệu khách chi tiết. | **P1** | `✓ Đã chốt` | Dashboard partner tối thiểu ở P1. |

### 3.J Admin CMS & Dashboard
Quản lý tập trung toàn bộ dữ liệu website không cần can thiệp code.

| ID | Tính năng | Phase | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **ADM-01** | Dashboard: số quán, cast, bài viết, booking, bill, alert | **P0** | `✓ Đã chốt` | P0 thống kê cơ bản |
| **ADM-02** | CRUD địa điểm (thông tin, bảng giá, giờ, ảnh, maps) | **P0** | `✓ Đã chốt` | |
| **ADM-03** | CRUD nhân sự / cast (hồ sơ, ảnh / video, trạng thái, tags) | **P0** | `✓ Đã chốt` | |
| **ADM-04** | Thư viện media tập trung + tối ưu ảnh / video | **P0** | `✓ Đã chốt` | P0 upload; tối ưu nâng cao P1 |
| **ADM-05** | Quản lý bảng giá / phụ phí / thuế | **P0** | `✓ Đã chốt` | P0 mô tả; cấu trúc chi tiết P1 |
| **ADM-06** | Quản lý campaign / discount / banner | **P0** | `✓ Đã chốt` | |
| **ADM-07** | Ranking control thủ công (ưu tiên Cast trước, rồi đến Quán) | **P0** | `✓ Đã chốt` | Paid ranking sang P1. |
| **ADM-08** | Membership & point management (xem điểm theo khách, lịch sử bill, audit) | **P1** | `✓ Đã chốt` | Ghi nhận điểm cơ bản 1tr = 10đ đã ở P0 — MEM-07. |
| **ADM-09** | Bill / revenue / commission management (gồm luồng từ chối có lý do; bản ghi đảo tự động ở P2) | **P0** | `✓ Đã chốt` | BIL-11 (reversal tự động) ở P2; P1 Admin chỉnh điểm thủ công (MEM-07C). |
| **ADM-09B**| Báo cáo & thứ tự ưu tiên xem: ngày → quán → mã giảm giá → khác. Tách doanh thu gộp/thuần/hoa hồng/giảm giá. | **P0** | `✓ Đã chốt` | |
| **ADM-10** | Bộ lọc tìm kiếm Admin trên dữ liệu lớn | **P1** | `✓ Đã chốt` | Mở khi dữ liệu CMS lớn. |
| **ADM-11** | Internal alerts thời gian thực | **P0** | `✓ Đã chốt` | P0 qua Telegram; P1 alert trong CMS |
| **ADM-12** | Phân quyền Admin / Operator / Partner (roles). P0 tối thiểu: Admin = full quyền + Partner = đăng nhập + quét QR + xác nhận check-in. Role Operator + role mở rộng → P1. | **P0** | `✓ Đã chốt` | Nguyên tắc role tối thiểu: Admin full; Partner (P0) = login + quét QR + check-in; Operator = P1. |
| **ADM-13** | Quản lý đối tác + Chat 1-1: Admin quản lý danh sách / thông tin các thành viên - đối tác trong CMS & chat riêng với từng đối tác (realtime trong hệ thống, không dùng kênh ngoài) | **P1** | `✓ Đã chốt` | Dùng chung tầng chat realtime với BOO-07. |

### 3.K Blog, Tour, SEO & Legal
Nội dung phục vụ SEO, quảng bá quán có booking, và (Phase sau) tour trải nghiệm.

| ID | Tính năng | Phase | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **CON-01** | Trang blog hiển thị bài viết hệ thống | **P0** | `✓ Đã chốt` | Dùng SEO + quảng bá quán |
| **CON-02** | Trang chi tiết blog (thumbnail, nội dung trái, liên quan/ads phải) | **P0** | `✓ Đã chốt` | Theo ghi chú ảnh |
| **CON-03** | Trang tour chi tiết (thời gian, địa điểm, đồ ăn, HDV, đặt lịch) | **P2** | `» Phase sau` | Không thuộc nightlife core |
| **CON-04** | Chính sách bảo mật + chính sách hoạt động | **P0** | `✓ Đã chốt` | Nội dung legal cuối từ khách |
| **CON-05** | robots.txt, sitemap / Google Console | **P0** | `✓ Đã chốt` | Kỹ thuật cơ bản |
| **CON-06** | SEO metadata cho store / cast / blog | **P0** | `✓ Đã chốt` | P0: title & meta description. Structured data (schema.org) ở P1. |

### 3.L Notification & Communication
Vận hành nhanh, tránh phụ thuộc Admin phải đăng nhập CMS liên tục. Ưu tiên kênh Telegram cho nội bộ; LINE OA cho khách Nhật.

| ID | Tính năng | Phase | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **NOT-01** | Booking → Telegram (ưu tiên) / Zalo nhóm chung Admin | **P0** | `✓ Đã chốt` | Ưu tiên Telegram cho nội bộ. |
| **NOT-02** | Bill mới / pending / đã duyệt / từ chối → Telegram Admin | **P0** | `✓ Đã chốt` | Cần template nội dung, bao gồm cả lý do từ chối |
| **NOT-03** | Partner request mới → Telegram Admin | **P0** | `✓ Đã chốt` | Bao gồm nội dung partner tự đăng (P1 khi PAR-04B làm). |
| **NOT-04** | Thông báo chương trình / đổi thưởng cho user qua LINE OA / Mail | **P1** | `✓ Đã chốt` | Ưu tiên LINE OA cho khách Nhật, Mail fallback. |
| **NOT-05** | Notification log (nội dung, người nhận, thời gian, trạng thái) | **P1** | `✓ Đã chốt` | Truy vết khi gửi lỗi. |
| **NOT-06** | Kênh hỗ trợ khách hủy/đổi booking: ưu tiên LINE OA (khách Nhật), fallback Mail nếu P0 chưa setup LINE OA | **P0** | `✓ Đã chốt` | Khi bấm nút liên hệ hỗ trợ → điều hướng sang LINE OA của Admin (fallback Mail). |

---

## 4 Các luồng nghiệp vụ chính

### FLOW A: Booking (P0 · ✓ Đã chốt)
Khách xem quán/cast → bấm Booking/CTA → form hoặc đăng nhập → hệ thống tạo booking (gắn cast nếu là booking theo cast) → gửi Telegram (ưu tiên) / Zalo Admin → Admin điều phối với quán → cập nhật trạng thái **Mới / Đã hủy / Hoàn tất**.
*   **Quy tắc hủy:** cho hủy trước 01 giờ. Không sửa trực tiếp booking cũ — muốn đổi giờ / số người / quán thì hủy & đặt lại HOẶC bấm nút liên hệ hỗ trợ.
*   **Kênh hỗ trợ khách hủy / đổi:** ưu tiên nhảy sang LINE Official Account của Admin (khách Nhật); fallback Mail nếu P0 chưa setup được LINE OA. Nội bộ team vẫn đẩy về Telegram.
*   **Liên kết:** Booking có thể được liên kết với Mã giảm giá và Hóa đơn về sau (BOO-09).

### FLOW B: Lấy & dùng Coupon / QR (P0 · ✓ Đã chốt)
Khách xem quán → lấy coupon (form / member) → hệ thống cấp **QR riêng cho coupon đó** với hạn dùng (Guest 24h / Member 7 ngày), trạng thái Đang giữ chỗ → khách đưa mã tại quán → **NHÂN VIÊN QUÁN** quét / xác nhận qua tài khoản đối tác (PAR-04 đã ở P0 với scope tối giản) → hệ thống chuyển trạng thái **Đã sử dụng** + ghi lịch sử + log Admin.
*   **Phạm vi “1 lần”:** 1 lần / Coupon. Mỗi coupon phát ra mang QR riêng — sau khi quét/check-in sẽ Expired, không tái sử dụng.
*   **Mức giảm:** Khách thường 5% · Thành viên 8% · VIP 10%.
*   **Trạng thái mã:** Đang giữ chỗ / Đã sử dụng / Hết hạn (tự hủy qua cron 5 phút). Mã hết hạn → ẩn nút QR của khách.

### FLOW C: Ghi nhận Bill (P0 · ✓ Đã chốt)
Khách HOẶC chủ quán gửi thông tin bill (ảnh là khuyến khích, không bắt buộc; tối thiểu: tên quán, số tiền, thời gian) **trong vòng 10 ngày** → bill ở trạng thái Pending → Admin đối chiếu với quán (duyệt thủ công bằng mắt) → duyệt HOẶC từ chối (có lý do, yêu cầu gửi lại) → ghi nhận doanh thu / hoa hồng / điểm (1tr = 10đ trên bill GỐC) → gửi Telegram.
*   **Hủy / hoàn tiền sau khi đã duyệt:** tạo bản ghi đảo, không xóa bill gốc, đảo điểm & doanh thu. Tự động hóa (BIL-11) ở P2; ở P1 Admin chỉnh điểm thủ công qua CMS (MEM-07C); MVP xử lý ngoài hệ thống.
*   **Phạm vi bill v1:** chỉ ghi nhận tổng tiền, không nhập chi tiết món / dịch vụ.

### FLOW D: Partner onboarding & vận hành (P0 · ✓ Đã chốt)
Đối tác điền Join Us → request vào CMS + Telegram → Admin kiểm duyệt → duyệt → Admin nhập thông tin quán/cast lên hệ thống (PAR-03). Đối tác có TÀI KHOẢN RIÊNG để đăng nhập + quét mã QR của khách + xác nhận khách đến quán.
*   **Scope MVP:** chỉ 3 quyền lõi ở P0 — đăng nhập, quét QR, xác nhận check-in. Các tính năng đăng thông tin quán/cast (PAR-04B) và dashboard partner (PAR-08) thuộc P1.
*   **Quản lý đối tác trong CMS** (P1, ADM-13): Admin quản lý danh sách đối tác và chat riêng 1-1 với từng đối tác qua realtime trong hệ thống.

### FLOW E: Ranking / Ads (P0 · ✓ Đã chốt)
Admin cấu hình ranking 100% thủ công (RAN-05 / RAN-07, ADM-07): tự đưa quán / cast lên Top.
*   **Phạm vi khu vực ở MVP:** HN, HCM, Tổng hợp. Ưu tiên thứ tự xếp hạng Cast trước, rồi đến Quán.
*   **Cơ chế:** Quán trả tiền tài trợ / quảng cáo có thể lên Top; không phụ thuộc thuật toán view / like / rating. Chi tiết gói tài trợ / quảng cáo cấu hình ở khâu vận hành.

### FLOW F: Membership / Point (P0 · ✓ Đã chốt)
Member dùng dịch vụ → gửi bill → Admin duyệt → hệ thống ghi nhận điểm (1.000.000đ trên bill GỐC = 10 điểm) → member xem lịch sử điểm. Khi bill bị hủy / hoàn, hệ thống đảo lại điểm tương ứng.
*   **Thời hạn điểm:** 1 năm.
*   **Khi bill bị hủy / hoàn:** đảo lại số điểm tương ứng — Admin chỉnh thủ công qua CMS ở P1 (MEM-07C); tự động cùng BIL-11 ở P2; MVP xử lý ngoài hệ thống.

---

## 5 Dữ liệu chính cần quản lý

Bảng dưới mô tả các entity chính cần quản lý trong hệ thống. Một số entity có thay đổi nhỏ về thông tin / phase sau phản hồi 22/06/2026.

| Entity | Thông tin chính | Phase |
| :--- | :--- | :---: |
| **User / Member** | Đăng nhập, hồ sơ, ngôn ngữ, điểm (tỷ lệ 1tr = 10đ), thời hạn điểm 1 năm, hạng (Guest / Member / VIP), lịch sử coupon / bill / favorite | P0/P1 |
| **Guest** | Lưu khách chưa đăng ký điền form lấy mã (tên, SĐT, lượt coupon, hạn dùng 24h) | P0 |
| **Partner / Store** | Tên quán, loại hình, khu vực (HN/HCM), địa chỉ, maps, giờ, liên hệ, trạng thái hợp tác, album ảnh, video, % hoa hồng thỏa thuận | P0 |
| **Partner Account**| Tài khoản đăng nhập của đối tác — **3 quyền lõi ở MVP**: đăng nhập, quét mã QR của khách, xác nhận khách đến quán. Các tính năng đăng thông tin / dashboard ở P1. | P0 |
| **Cast / Staff** | Public fields (CAS-06): Nick name, ảnh đại diện / album, video, tháng sinh & cung hoàng đạo (KHÔNG ngày/năm), chiều cao, số đo (nếu có), sở thích, tags, ngôn ngữ (JP/EN/VN). KHÔNG lưu / hiển thị lịch trống. | P0 |
| **Booking** | Người đặt, quán / cast (tham chiếu khi booking theo cast), thời gian, số người, ghi chú, trạng thái (Mới / Đã hủy / Hoàn tất), nguồn gửi, liên kết tới Coupon & Bill (nếu có) | P0 |
| **Coupon / Voucher / QR** | Mã, ảnh QR (**riêng cho mỗi coupon**), quán áp dụng, hạn dùng (Guest 24h / Member 7 ngày), số lần (**1 lần / coupon**), trạng thái (Đang giữ chỗ / Đã sử dụng / Hết hạn — tự hủy qua cron 5 phút), lịch sử | P0 |
| **Bill** | Quán, khách, thời gian (ngày dùng dịch vụ), số tiền (tổng — không chi tiết món), giảm giá, phí / thuế (nếu có), ảnh (nếu có), trạng thái duyệt, lý do từ chối (nếu có), liên kết Booking & Coupon (nếu có), thời hạn gửi 10 ngày | P0 |
| **Bill Reversal** | Bản ghi điều chỉnh ngược khi bill bị hủy / hoàn tiền. Tham chiếu bill gốc; cờ trừ/đảo điểm và doanh thu. Không xóa bill gốc. (Tự động hóa ở P2; ở P1 chỉnh điểm thủ công qua CMS.) | P2 |
| **Commission / Revenue** | Tỷ lệ hoa hồng (snapshot theo quán / campaign), % giảm giá, doanh thu (gộp / thuần), tiền giảm giá, số tiền chủ sàn nhận (theo công thức đã chốt), lợi nhuận (P1) | P0/P1 |
| **Point / Loyalty** | Điểm tích lũy (1tr = 10đ trên bill GỐC), hạn 1 năm, lịch sử theo bill. | P0 |
| **Content / Media** | Banner, blog, video, album (Store + Cast P0), thumbnail, SEO metadata | P0/P1 |
| **Notification Log**| Kênh (Telegram ưu tiên cho nội bộ / LINE OA cho khách / Zalo / Mail), nội dung, người nhận, trạng thái gửi, thời gian | P1 |
| **Partner Message Thread** | Phục vụ ADM-13 — luồng chat 1-1 giữa Admin và đối tác qua CMS. Lưu nội dung tin nhắn, người gửi, thời gian, file đính kèm (nếu có). | P1 |
| **Audit Log** | Người thao tác, hành động, dữ liệu trước/sau, lý do, thời gian | P1 |

---

## 6 Phạm vi KHÔNG thuộc MVP (theo baseline)

Các hạng mục dưới đây không mặc định nằm trong MVP. Nếu khách hàng muốn đưa vào, cần cập nhật lại timeline, effort và acceptance criteria.

| Hạng mục KHÔNG thuộc MVP | Đề xuất | Lý do |
| :--- | :---: | :--- |
| **Thanh toán online trực tiếp trên web** | BASELINE | Mô hình không phải e-commerce / checkout |
| **Đặt món / lên đơn / chọn dịch vụ trên web trước khi tới quán** | BASELINE | Menu chỉ để tham khảo |
| **Nhập chi tiết từng món / dịch vụ trên hóa đơn** | BASELINE | Phiên bản đầu chỉ ghi nhận tổng tiền hóa đơn |
| **Tích hợp POS tại quán** | BASELINE | Không quản lý vận hành nội bộ quán |
| **Vận hành đặt bàn nội bộ kiểu Haidilao** | BASELINE | NightLife là sàn trung gian, không phải hệ thống vận hành quán |
| **Hiển thị lịch trống của Cast** | BACKLOG | KHÔNG hiển thị vì khó kiểm soát |
| **Tab khu vực ĐN, HP trong ranking / search** | BACKLOG | Không thuộc MVP; có thể bổ sung ở phase mở rộng khi cần. |
| **Đăng thông tin quán/cast bởi đối tác (PAR-04B)** | P1 | MVP: Admin nhập thay qua PAR-03; partner tự đăng từ P1. |
| **Đối tác xem dashboard / dữ liệu tổng hợp (PAR-08)** | P1 | Dashboard partner ra mắt ở P1. |
| **Quản lý đối tác + chat 1-1 trong CMS (ADM-13)** | P1 | Triển khai sau khi MVP ổn định. |
| **Tự động duyệt bill dưới ngưỡng tiền** | P2 | Chưa có rule gian lận / bill trùng |
| **Bill Reversal tự động (BIL-11)** | P2 | P1 Admin chỉnh điểm thủ công; MVP xử lý ngoài hệ thống. |
| **Partner Portal đầy đủ (quán tự xem booking / bill / doanh thu chi tiết, tự sửa giá v.v.)** | P2 | Cần phân quyền + đối soát chặt. |
| **BI dashboard nâng cao (cohort, conversion, ROI ads)** | P2 | Cần dữ liệu lịch sử đủ lớn |
| **Đa ngôn ngữ đầy đủ 5 thứ tiếng cho toàn bộ nội dung** | P2 | Khối lượng nhập liệu / QA lớn |
| **Tour trải nghiệm đầy đủ (điều phối HDV, lịch)** | P2 | Không thuộc nightlife core |
| **Quản lý margin / giá vốn chi tiết để tính lợi nhuận thật** | P1 | Phiên bản đầu chỉ tính doanh thu & hoa hồng. |

---

## 7 Thứ tự triển khai MVP đề xuất

Thứ tự triển khai MVP đề xuất, từ khóa scope đến QA. Bước 9 liệt kê các hạng mục P1 triển khai sau khi MVP ổn định.

| Bước | Hạng mục | Kết quả |
| :---: | :--- | :--- |
| **1** | Khóa scope P0 & cấu hình ban đầu | Confirm scope: PAR-04 ở P0 chỉ 3 quyền lõi; PAR-04B + PAR-08 + ADM-13 ở P1; khu vực HN/HCM/Tổng hợp. Admin nhập % hoa hồng theo từng quán khi onboard. |
| **2** | Thiết kế data model lõi | User / Member (3 hạng), Store (+ Partner Account 3 quyền lõi), Cast (không lịch trống, public fields theo CAS-06), Booking (3 trạng thái, có liên kết Coupon / Bill), Coupon (Đang giữ chỗ / Đã sử dụng / Hết hạn, QR riêng/coupon, 1 lần/coupon), Bill (+ Bill Reversal P2), Commission (tách doanh thu gộp / thuần / hoa hồng / giảm giá), Point (1tr = 10đ, hạn 1 năm), Content |
| **3** | Public Website core | Trang chủ, search (HN/HCM), ranking cơ bản (manual, 3 tab khu vực, ưu tiên Cast trước), store detail (có album ảnh + video), cast profile (album ảnh + video, public fields theo CAS-06, KHÔNG có lịch trống) |
| **4** | Booking + Notification | CTA / form booking gửi Telegram (ưu tiên) Admin; rule hủy trước 01 giờ; 3 trạng thái Mới / Đã hủy / Hoàn tất; booking theo cast dùng chung biểu mẫu (+ tham chiếu cast); kênh hỗ trợ khách: LINE OA (fallback Mail) |
| **5** | Coupon / QR + Membership basic + Point cơ bản | Tạo coupon (QR riêng/coupon, Guest 24h / Member 7 ngày), 3 trạng thái Đang giữ chỗ / Đã sử dụng / Hết hạn (cron 5 phút, ẩn QR khi expired), 1 lần/coupon, lịch sử sử dụng, 3 hạng khách (5 / 8 / 10%), nhân viên quán quét QR (qua Partner Account), ghi nhận điểm 1tr = 10đ |
| **6** | Bill manual + Admin approval | Khách / chủ quán gửi bill (ảnh không bắt buộc, trong 10 ngày), duyệt bằng mắt, từ chối có lý do, ghi nhận doanh thu / hoa hồng / điểm theo công thức đã chốt. (Hủy / hoàn bill: xử lý thủ công ngoài hệ thống ở MVP; P1 Admin chỉnh điểm qua CMS; P2 tự động hóa.) |
| **7** | Partner Account (tối giản) + Admin CMS | **MVP partner chỉ cần**: màn đăng nhập + màn quét QR + nút xác nhận check-in khách (không có màn đăng thông tin, không có dashboard). Admin CMS: CRUD dữ liệu, ranking thủ công (ưu tiên Cast trước), banner / blog / campaign, báo cáo (gộp / thuần / hoa hồng / giảm — ưu tiên xem theo ngày → quán → mã giảm giá → khác). |
| **8** | QA / UAT | Test end-to-end Booking, Coupon (QR riêng + cron 5 phút + ẩn QR khi expired), Bill (gồm cả luồng từ chối), Partner (auth + quét QR + xác nhận check-in), CMS, báo cáo |
| **9** | P1 (sau khi MVP ổn định) | PAR-04B (partner tự đăng thông tin), PAR-08 (dashboard partner tối thiểu), ADM-13 (CMS quản lý đối tác + chat 1-1), BOO-07 (chat realtime khách), MEM-07C (Admin chỉnh điểm qua CMS khi hủy bill), BIL-10 (margin / giá vốn — phase sau), BOO-06 mở rộng (Đã liên hệ / Đã xác nhận). |

---
**— HẾT TÀI LIỆU · NightLife Vietnam · Tổng hợp tính năng v3.0 · 22/06/2026 —**
