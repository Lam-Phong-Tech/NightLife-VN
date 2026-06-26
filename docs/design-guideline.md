# Vietyoru — Design Guideline

**Phương án A · Premium Elegant**
Vietnam Nightlife Guide · Dark Mode · Mobile-first

> Tài liệu chuẩn hoá để dựng mọi màn hình đồng nhất theo Phương án A: than đen + Gold premium, neon dùng cực tiết chế, chữ Inter. Mọi giá trị bên dưới là chuẩn — copy trực tiếp, không tự chế thêm màu/size.

---

## 0. Nguyên tắc thiết kế (đọc trước khi vẽ)

1. **Tối giản, nhiều khoảng thở.** Mỗi màn hình ưu tiên 1 trọng tâm. Đừng nhồi. "Một nghìn lần không cho mỗi lần có".
2. **Gold là nhân vật chính của điểm nhấn**, không phải neon. Gold dành cho: VIP, Ranking #1, Coupon, Membership, CTA chính, giá tiền nổi bật.
3. **Neon (hồng `#e0729e`) chỉ là chấm nhỏ** — dot "đang diễn ra", badge thông báo. Không bao giờ làm nền lớn, không glow mạnh. Đây là điểm khác biệt với Phương án B.
4. **Nền tối luôn ấm, không xanh lạnh.** Nền chuẩn `#0c0c0f` (than đen hơi ấm), chữ trắng ngả kem `#f3f0ea` — dịu mắt khi xem ban đêm.
5. **Không bo góc quá tròn kiểu bong bóng.** Radius card 14–18px, vừa phải, sang.
6. **Tap target tối thiểu 44px.** Icon button 38px nhưng vùng chạm tính cả padding.
7. **Ảnh thật** cho quán & cast, luôn phủ lớp gradient tối ở đáy để chữ đọc được và tổng thể trầm.

---

## 1. Bảng màu (Color tokens)

### Nền & bề mặt
| Token | Hex / giá trị | Dùng cho |
|---|---|---|
| `--bg` | `#0c0c0f` | Nền chính toàn app |
| `--bg-bezel` | `#000000` | Khung viền ngoài / vùng tối tuyệt đối |
| `--surface-1` | `rgba(255,255,255,.035)` | Card thường (đề xuất, dịch vụ) |
| `--surface-2` | `rgba(255,255,255,.04)` | Search bar, icon tile category |
| `--surface-3` | `rgba(255,255,255,.05)` | Card nhấn nhẹ / hover |
| `--nav-bg` | `rgba(8,8,11,.9)` | Thanh điều hướng đáy |

### Viền (Border)
| Token | Giá trị | Dùng cho |
|---|---|---|
| `--border-soft` | `rgba(255,255,255,.06)` | Viền card trung tính |
| `--border-hair` | `rgba(255,255,255,.08)` | Đường kẻ mảnh phân tách |
| `--border-gold-12` | `rgba(212,178,106,.18)` | Viền vàng rất nhẹ (icon tile) |
| `--border-gold-22` | `rgba(212,178,106,.22)` | Viền vàng search/coupon |
| `--border-gold-32` | `rgba(212,178,106,.32)` | Viền vàng icon button header |
| `--border-gold-40` | `rgba(212,178,106,.4)` | Viền vàng nhấn (hàng #1, badge) |

### Chữ (Text)
| Token | Hex | Dùng cho |
|---|---|---|
| `--text` | `#f3f0ea` | Chữ chính (trắng ngả kem) |
| `--text-2` | `#c5c0b6` | Chữ phụ sáng |
| `--text-muted` | `#8c8679` | Chữ phụ / địa điểm / category |
| `--text-tertiary` | `#9b958a` | "Xem tất cả", chú thích mờ |
| `--text-on-gold` | `#241a0a` | Chữ trên nền gold (nâu đen) |

### Gold premium (điểm nhấn chủ lực)
| Token | Giá trị | Dùng cho |
|---|---|---|
| `--gold-grad` | `linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)` | Logo, CTA chính, badge VIP, nút Lấy mã, thẻ membership |
| `--gold` | `#d4b26a` | Icon, viền, số liệu, nhãn uppercase |
| `--gold-bright` | `#e3c27e` | Số đánh giá ⭐, giá nổi bật, rank #1 |
| `--gold-pale` | `#f0dda8` | Chữ trên nền tối trong ngữ cảnh gold (nút trong thẻ VIP) |
| `--gold-icon` | `#d9bd84` | Màu icon category |

### Neon (DÙNG CỰC HẠN CHẾ)
| Token | Hex | Dùng cho — chỉ dạng chấm/điểm |
|---|---|---|
| `--neon-pink` | `#e0729e` | Dot "đang diễn ra", chấm badge thông báo, tim yêu thích. **Không** dùng làm nền/khối lớn. |

### Đường phân cách section (đặc trưng A)
```css
/* divider vàng tan dần — luôn đi sau tiêu đề section */
background: linear-gradient(90deg, rgba(212,178,106,.45), transparent);
height: 1px;
```

---

## 2. Typography

**Font duy nhất: `Inter`** (toàn bộ — đã chốt). Hỗ trợ tiếng Việt tốt.
Import: `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap`

| Vai trò | Size | Weight | Letter-spacing | Ghi chú |
|---|---|---|---|---|
| Logo wordmark | 26px | 800 | −0.4px | Tô bằng `--gold-grad` (background-clip:text) |
| Tagline | 8.5px | 400 | 3.6px | UPPERCASE, `--text-muted` |
| Hero title | 22px | 700 | normal | Trắng `#fff`, text-shadow nhẹ |
| Section title | 21px | 600 | normal | `--text`, theo sau là divider gold |
| Card title (quán/cast) | 16px | 600 | normal | `--text` |
| Giá / rank số | 13px | 700 | normal | `--gold-bright` |
| Body / mô tả | 12–13px | 400 | normal | `--text-2` / `--text-muted` |
| Nhãn nhỏ / địa điểm | 11px | 400–500 | normal | `--text-muted` |
| Nhãn uppercase (eyebrow) | 9.5–10px | 600 | 1.5–2px | UPPERCASE, `--gold` |
| Nav label | 9.5px | 500–600 | normal | active = gold, inactive = `#6f6b62` |

**Quy tắc:** chữ càng to letter-spacing càng âm (tight); nhãn uppercase nhỏ thì giãn rộng. Không dùng dưới 9px. Title luôn 600 (không 800) để giữ vẻ thanh lịch — độ tương phản tạo bằng size + divider, không bằng độ đậm.

---

## 3. Spacing, Radius, Shadow

### Spacing
- **Lề ngang màn hình:** 18–22px (search/header 22px, lưới card 18px).
- **Section header padding:** `20px 20px 10px` (trên / ngang / dưới).
- **Gap card ngang (carousel):** 13px · **Gap lưới 2 cột:** 12px.
- **Gap icon category:** `16px 6px` (dọc / ngang).
- **Padding trong card:** 11–13px.

### Radius
| Phần tử | Radius |
|---|---|
| Màn hình điện thoại (screen) | 38px |
| Hero / membership card | 18px |
| Card thường (đề xuất, coupon, dịch vụ) | 14–16px |
| Icon tile category | 15px |
| Nút / pill CTA | 10–11px |
| Chip filter (Quán/Cast) | 18px |
| Avatar tile / thumb ranking | 12px |
| Icon button header | 50% (tròn) |

### Shadow
```css
/* card nổi (hero, đề xuất) */
box-shadow: 0 16px 34px -18px rgba(0,0,0,.7);
/* thẻ VIP gold */
box-shadow: 0 16px 34px -16px rgba(168,124,60,.6);
/* màn hình tổng */
box-shadow: 0 40px 80px -30px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.05);
```
Không dùng glow màu neon. Bóng luôn trung tính/ấm.

---

## 4. Iconography

- **Bộ icon:** line/stroke, `stroke-width: 1.6–1.8`, `stroke-linecap/linejoin: round`. Style Lucide/Feather.
- **Màu icon:** category = `--gold-icon` (#d9bd84); icon button header = `--gold`; icon trong card trắng/muted.
- **Icon đặc (fill):** chỉ ngôi sao ⭐ (đánh giá), vương miện/sparkle VIP, tim (yêu thích). Sao & vương miện = gold; tim = `--neon-pink`.
- **Kích thước:** category 22px, header button 17px, inline (sao/tim) 13px, nav 21px.

---

## 5. Thư viện Component (chuẩn theo Phương án A)

> Tất cả là inline-style. Đây là spec “nguồn chân lý”; khi dựng màn hình mới hãy tái dùng đúng các khối này.

### 5.1 Status bar
Cao ~30px, padding `13px 22px 4px`, giờ bên trái (13px/500), cụm sóng–wifi–pin bên phải màu `--text`.

### 5.2 Header
- Trái: **Logo** `Vietyoru` (26px/800, gold-grad) + **tagline** `VIETNAM NIGHTLIFE GUIDE` (8.5px, spacing 3.6px, muted).
  - *Biến thể không tagline:* bỏ dòng tagline, căn giữa logo theo chiều dọc. (Phương án A khuyến nghị **có tagline**.)
- Phải: 2 icon button tròn 38px, viền `--border-gold-32`, icon gold (chat/tìm + chuông). Chuông có chấm `--neon-pink` 6px góc trên phải.

### 5.3 Search bar
```
nền --surface-2 · viền --border-gold-22 · radius 14 · padding 13px 15px
[icon search gold] "Tìm quán hoặc cast gần bạn…" (13px muted) ............ [icon filter muted]
```

### 5.4 Category grid (lối tắt)
Lưới 4 cột. Mỗi mục: icon tile 50×50 (radius 15, nền `--surface-2`, viền `--border-gold-12`, icon `--gold-icon`) + nhãn 11px `--text-2` bên dưới.
**Ô VIP** là ngoại lệ nhấn: nền `linear-gradient(135deg,rgba(244,227,180,.2),rgba(168,124,60,.12))`, viền `--border-gold-40`, icon + nhãn `--gold-pale`/`--gold-bright`.

### 5.5 Hero banner
- Cao 182px, radius 18, ảnh phủ `linear-gradient(180deg,rgba(12,12,15,.05),rgba(12,12,15,.82))` + `url(...)`.
- Pill "ĐANG DIỄN RA" góc trên trái: nền `rgba(12,12,15,.45)`, viền `--border-gold-40`, blur 4px, dot `--neon-pink` có glow nhỏ.
- Đáy: eyebrow uppercase gold → tiêu đề 22px/700 trắng → hàng giá + **CTA gold** ("Đặt ngay" nền gold-grad, chữ `--text-on-gold`).
- Dưới banner: 3 chấm phân trang, chấm active = thanh 18px màu `--gold`.

### 5.6 Thẻ Membership / VIP (đặc trưng)
- Nền **đặc** `linear-gradient(135deg,#f4e3b4 0%,#d4b26a 48%,#a87c3c 100%)`, chữ `--text-on-gold`. Đây là khối duy nhất nền sáng — cố ý, để VIP "sang như thẻ kim loại".
- Vòng sáng góc: `radial-gradient(circle,rgba(255,255,255,.45),transparent 70%)`.
- Icon sparkle + tên "Vietyoru VIP" (20px/700) → mô tả 12.5px (opacity .85) → nút đen `#241a0a` chữ `--gold-pale` "Trở thành VIP" + giá "từ 199.000₫/tháng".

### 5.7 Section header
`[Tiêu đề 21px/600] [divider gold tan dần, flex:1] [Xem tất cả 11px tertiary]`

### 5.8 Card đề xuất (carousel ngang)
Rộng 172px, nền `--surface-1`, viền `--border-soft`, radius 16. Ảnh cao 112px (phủ gradient đáy) + nút tim tròn góc phải. Thân: tên 16px/600 → "Quận · Loại" 11px muted → hàng ⭐ gold `4.9` + `(212)` muted.

### 5.9 Coupon ticket
Hàng ngang, nền `--surface-1`, viền `--border-gold-22`, radius 14:
`[ảnh 74×74] [ −30% (18px/700 gold-bright) + "Happy Hour" 12.5/600 · "Quán · HSD ..." 11 muted ] | [tab dọc "LẤY MÃ" gold, viền trái dashed gold]`

### 5.10 Ranking list
- Chip filter trên đầu: "Quán" active (nền gold-grad, chữ on-gold) / "Cast" inactive (nền `--surface-3`). Bên phải: "Hà Nội ▾" 11px.
- **Hàng #1 (nổi bật):** nền `linear-gradient(135deg,rgba(212,178,106,.14),rgba(255,255,255,.03))`, viền `--border-gold-40`. Badge số "1" 30×30 nền gold-grad chữ on-gold + sparkle gold phía trên. Thumb 42×42 viền gold.
- **Hàng #2,3:** nền `--surface-1`, badge số nền `rgba(212,178,106,.1)` viền gold-30 chữ gold. Số liệu phải: lượt đặt 13px/700 (hàng 1 = gold-bright, còn lại = `--text-2`).

### 5.11 Bottom nav
Cao 66px, nền `--nav-bg`, viền trên `--border-gold-12`. 5 mục: Trang chủ / Cast / Ưu đãi / Đặt chỗ / Tài khoản. Active = gold-bright + label 600; inactive = `#6f6b62`.

---

## 6. Guideline theo từng màn hình

### 6.1 Homepage *(đã dựng — màn chuẩn)*
Thứ tự: Status → Header → Search → Category 4×2 → Hero → **Thẻ VIP** → Đề xuất tối nay → Coupon Hot → Ranking → Dịch vụ nổi bật (Nhà hàng/Spa) → Video Hot → Bottom nav.
- Mỗi section cách nhau bằng section-header có divider gold.
- Thẻ VIP đặt ngay sau Hero để "đập vào mắt" sớm.

### 6.2 Store Profile (Trang quán)
- **Hero ảnh quán** full-width cao ~240px, gradient đáy đậm; nút back tròn (như icon button header) góc trên trái; nút share/tim góc phải.
- **Khối tên:** tên quán 24px/700 trắng → "Loại hình · Quận" muted → hàng ⭐ gold + (số review) + chip trạng thái "Đang mở" (viền gold).
- **Hàng chỉ số nhanh** (3 cột, phân tách bằng `--border-hair`): Giờ mở · Khoảng giá · Khoảng cách. Số liệu gold.
- **Nút hành động:** "Đặt bàn" (CTA gold-grad, full-width) + icon gọi/chỉ đường phụ (viền gold).
- **Tab:** Tổng quan · Menu · Cast · Đánh giá · Ảnh — tab active gạch chân gold.
- **Coupon của quán:** dùng đúng component 5.9.
- **Cast đang làm:** hàng avatar tròn 84px (như Featured Cast) → link sang Cast Profile.
- **Bản đồ + địa chỉ**, **giờ hoạt động** dạng list kẻ hair.

### 6.3 Cast Profile (Trang cast)
- **Ảnh chân dung thật**: hoặc cover lớn (240px) + avatar tròn đè, hoặc full-bleed gradient đáy. Avatar viền gold 2px.
- **Tên + tuổi/chiều cao** (tuỳ chính sách hiển thị) 22px/700 → quán đang thuộc (link) muted.
- **Badge xếp hạng:** nếu top → ruy băng gold "#1 Ranking tháng 6" (nền gold-grad).
- **Chỉ số:** ⭐ đánh giá · lượt yêu thích (tim neon-pink) · lượt đặt — hàng 3 cột kẻ hair.
- **Giới thiệu** (bio) 13px `--text-2`, line-height 1.7.
- **Lịch trống / khung giờ:** chip giờ (viền gold khi chọn).
- **Thẻ ưu đãi gắn cast** (nếu có) — component coupon.
- **CTA:** "Đặt cast này" gold-grad full-width, dính đáy (sticky) trên nền `--nav-bg` + blur.
- **Gallery ảnh:** lưới 2–3 cột radius 12.

### 6.4 Ranking (Trang xếp hạng)
- **Tab lớn:** Quán / Cast (chip như 5.10). **Filter phụ:** khu vực (Hà Nội ▾), thời gian (Tuần/Tháng).
- **Top 3 podium** (tuỳ chọn nâng cao): hạng 2-1-3 dạng bục, #1 ở giữa cao nhất, avatar viền gold + vương miện sparkle.
- **Danh sách 4→N:** dùng component 5.10, badge số gold cho 1–3, trung tính cho phần còn lại.
- Mỗi hàng cast hiển thị quán trực thuộc; mỗi hàng quán hiển thị "lượt đặt".

### 6.5 Coupon (Trang ưu đãi)
- **Filter chip:** Tất cả · Sắp hết hạn · Theo quán · VIP-only (VIP-only viền gold-40).
- **Danh sách coupon** dọc, component 5.9. Coupon VIP có dải gold-grad mảnh trên đỉnh + nhãn "VIP".
- **Trạng thái:** sắp hết hạn → đếm ngược nhỏ màu neon-pink (chấm). Đã dùng → giảm opacity .5 + nhãn "Đã dùng".
- **Modal lấy mã:** nền `#0c0c0f`, mã trong khung dashed gold, nút "Sao chép mã" gold-grad.

### 6.6 Membership / VIP (Trang thành viên)
- **Thẻ hạng** lớn dùng nền gold-grad (component 5.6) — hiển thị tên thành viên, hạng, mã QR/thẻ.
- **Bảng quyền lợi:** list kẻ hair, icon gold mỗi dòng (ưu tiên đặt bàn, coupon độc quyền, hỗ trợ tiếng Nhật, tích điểm).
- **So sánh hạng** (Member / Gold / Platinum): cột Gold viền gold-40 nổi bật, các cột khác trung tính. Tránh dùng nhiều màu — phân hạng bằng độ đậm của gold.
- **CTA nâng cấp:** gold-grad full-width + giá/tháng.
- Không dùng neon ở trang này — giữ thuần gold cho cảm giác cao cấp.

---

## 6B. Hệ thống nhãn song ngữ (VN + EN) — *đã chốt: có dùng nhãn EN*

**Nguyên tắc:** tiếng Việt là chính, **EN là nhãn phụ để khách nước ngoài quét nhanh** — KHÔNG dịch song song cả câu (gây rối, mất chất tối giản của bản A).

### 3 tầng áp dụng

**Tầng 1 — Tiêu đề section (nơi EN xuất hiện chủ yếu).**
VN lớn (21px/600) + EN nhỏ uppercase ngay *bên dưới* (9px, weight 600, letter-spacing 1.6px, màu `--text-muted #8c8679`).
```
Đề xuất tối nay        ← 21px / 600 / #f3f0ea
TONIGHT'S PICKS        ← 9px / 600 / spacing 1.6px / #8c8679 / UPPERCASE
```
Cặp nhãn chuẩn:
| Tiếng Việt | Nhãn EN |
|---|---|
| Đề xuất tối nay | TONIGHT'S PICKS |
| Coupon Hot | HOT DEALS |
| Bảng xếp hạng | RANKING |
| Dịch vụ nổi bật | FEATURED SERVICES |
| Video Hot | WATCH NOW |
| Cast nổi bật | FEATURED CAST |
| Giờ mở cửa | OPENING HOURS |
| Quyền lợi thành viên | MEMBER BENEFITS |

**Tầng 2 — Toggle ngôn ngữ toàn cục.**
Pill nhỏ `🌐 VI` (globe + "VI") gold-outline ở header, đặt *trước* icon chat/chuông. Specs: cao 38px, padding `0 11px`, radius 19, viền `--border-gold-32`, chữ + icon `--gold` 12px/600. Bấm để đổi **VI ⇄ EN** (mở rộng JP sau). Khi sang EN: toàn bộ UI dịch, lúc đó EN thành chính / VN ẩn hoặc thành nhãn phụ.

**Tầng 3 — Nội dung động** (tên quán/cast, địa chỉ, mô tả): **giữ nguyên gốc, KHÔNG ghép EN**.

### Nên / Tránh
- ✅ EN đặt *dưới* tiêu đề VN, uppercase, tracked, mờ hơn — phân cấp rõ, không cạnh tranh.
- ✅ Bottom nav giữ **VN-only** (nhãn quá ngắn, thêm EN gây chật) — toggle toàn cục lo phần dịch.
- ❌ Không ghép cùng dòng kiểu "Đề xuất tối nay · Tonight's Picks".
- ❌ Không dịch song song cả câu mô tả / body.
- ❌ Nhãn EN không dùng gold (để dành gold cho điểm nhấn) — dùng `--text-muted`.

---

## 7. Ảnh & nội dung

- **Ảnh quán/sự kiện:** không khí ban đêm, đèn ấm, lounge/bar; luôn phủ gradient tối đáy `rgba(12,12,15,.82)`.
- **Ảnh cast:** chân dung thật, ánh sáng dịu; khung bo 12px hoặc tròn (viền gold cho top rank).
- **Tránh:** ảnh quá chói/flash, tông xanh lạnh, ảnh phông trắng kiểu thương mại điện tử.
- **Tiền tệ:** định dạng `2.500.000₫` (dấu chấm ngăn nghìn, ký hiệu ₫ liền sau).
- **Giọng văn:** ngắn, lịch sự, tin cậy. Eyebrow uppercase tiếng Việt; có thể thêm nhãn EN nhỏ nếu cần cho khách nước ngoài (tuỳ chọn — bản A mặc định tiếng Việt).

---

## 8. Checklist đồng nhất (trước khi ship 1 màn hình)

- [ ] Nền `#0c0c0f`, chữ `#f3f0ea` — không có nền trắng (trừ thẻ VIP gold cố ý).
- [ ] Font Inter, title 600 (không 800), không có font lạ.
- [ ] Điểm nhấn = gold. Neon chỉ ở dạng chấm nhỏ, ≤ 2 chỗ/màn.
- [ ] Mỗi section có header + divider gold tan dần.
- [ ] Card radius 14–18, icon tile 15, CTA 10–11. Không bo tròn quá mức.
- [ ] CTA chính = gold-grad, chữ `#241a0a`.
- [ ] Tap target ≥ 44px. Ảnh có gradient đáy. Bóng trung tính (không glow màu).
- [ ] Lề ngang 18–22px nhất quán.
- [ ] Nhãn EN phụ dưới tiêu đề section (uppercase 9px, muted) — không dịch song song cả câu. Toggle VI ở header.

---

*File này là chuẩn thiết kế cho toàn hệ thống Vietyoru theo Phương án A. Mọi màn hình mới phải bám token & component ở trên để đảm bảo đồng nhất.*
