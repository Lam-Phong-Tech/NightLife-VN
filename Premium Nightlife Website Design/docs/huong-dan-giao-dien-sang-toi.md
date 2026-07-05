# Hướng dẫn áp dụng chế độ Sáng / Tối — Giao diện người dùng Vietyoru

> Tài liệu bàn giao cho dev phía user-facing (web + mobile web).
> Cơ chế này đã chạy thật trên Admin Console (`admin/Admin Topbar.dc.html`) — copy nguyên logic, chỉ đổi key lưu trữ.

---

## 0. Tóm tắt nhanh

| Hạng mục | Giá trị |
|---|---|
| Class kích hoạt | `vy-light` đặt trên **`<html>`** (documentElement) — **không đặt trên `<body>`** |
| Key localStorage | `vy-user-theme` (admin đang dùng `vy-admin-theme` — tách riêng 2 key) |
| Giá trị | `'light'` hoặc `'dark'` (mặc định `dark`) |
| Nút toggle | Hình tròn 39×39px, viền gold `rgba(212,178,106,.28)`, icon mặt trời (đang tối) / mặt trăng (đang sáng) |
| 2 phương án | **A. Filter invert** (nhanh, 15 phút, đang dùng ở admin) · **B. CSS variables** (chuẩn production, khuyến nghị lâu dài) |

---

## Phương án A — Filter invert (đang chạy ở Admin)

Đảo toàn bộ màu bằng CSS filter, sau đó đảo ngược lại ảnh/video để giữ màu gốc.
Ưu: không phải sửa từng màu hardcode. Nhược: màu sắc là "ước lượng", blur nền (backdrop-filter) bị mất.

### A.1 — CSS (inject 1 lần vào `<head>`)

```css
/* QUAN TRỌNG: phải là html.vy-light, KHÔNG phải body.vy-light.
   Filter đặt trên body sẽ biến body thành containing block của
   position:fixed → drawer/toast/thanh sticky trôi theo cuộn trang. */
html.vy-light {
  filter: invert(1) hue-rotate(180deg);
  background: #0c0c0f; /* giữ nguyên, sẽ bị invert thành nền sáng */
}

/* Đảo ngược lại các phần tử phải giữ màu thật */
html.vy-light img,
html.vy-light video,
html.vy-light canvas,
html.vy-light iframe,
html.vy-light [data-noinvert] {
  filter: invert(1) hue-rotate(180deg);
}
```

Phần tử nào muốn giữ màu gốc (mã QR, ảnh cast, logo dạng ảnh, bản đồ) → thêm attribute `data-noinvert`.

### A.2 — JS toggle + lưu lựa chọn

```js
const THEME_KEY = 'vy-user-theme';

function applyTheme(t) {
  document.documentElement.classList.toggle('vy-light', t === 'light');
}

function toggleTheme() {
  const cur = localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  const next = cur === 'light' ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}
```

### A.3 — Chống chớp trắng/đen khi load (bắt buộc)

Đặt inline `<script>` **trong `<head>`, trước CSS của trang**, để theme áp trước khi paint:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem('vy-user-theme');
      if (!t && window.matchMedia('(prefers-color-scheme: light)').matches) t = 'light';
      if (t === 'light') document.documentElement.classList.add('vy-light');
    } catch (e) {}
  })();
</script>
```

### A.4 — Giới hạn đã biết của phương án A

- `backdrop-filter: blur()` (header kính mờ, overlay) **mất tác dụng** bên trong phần tử bị filter → header chỉ còn nền mờ tĩnh, chấp nhận được.
- Màu sau invert + hue-rotate chỉ *gần đúng*: gold `#D4B26A` → nâu vàng đậm, vẫn nhận diện thương hiệu nhưng không tinh chỉnh được từng màu.
- Ảnh đặt trong phần tử có `overflow:hidden` + `border-radius` vẫn ổn; nhưng **shadow tối** sẽ thành "shadow sáng" (quầng trắng) — nếu thấy khó chịu, override shadow trong `html.vy-light`.
- Không dùng cho in ấn/screenshot marketing — dùng phương án B.

---

## Phương án B — CSS Variables (khuyến nghị cho production)

Định nghĩa token màu 2 bộ, component chỉ dùng `var(--*)`. Đổi theme = đổi giá trị token, màu chuẩn 100%, giữ được backdrop-filter.

### B.1 — Bảng token (dark là bản gốc hiện tại)

| Token | Dark (hiện tại) | Light (đề xuất) | Dùng cho |
|---|---|---|---|
| `--bg` | `#0C0C0F` | `#F6F4EF` | Nền trang |
| `--bg-2` | `#0E0D12` | `#FFFFFF` | Nền khối preview/hero |
| `--surface` | `#131218` | `#FFFFFF` | Card, drawer, popup |
| `--surface-2` | `rgba(255,255,255,.03)` | `rgba(0,0,0,.03)` | Card lồng, input |
| `--border` | `rgba(255,255,255,.07)` | `rgba(0,0,0,.09)` | Viền card |
| `--border-gold` | `rgba(212,178,106,.28)` | `rgba(150,116,52,.45)` | Viền nhấn gold |
| `--text` | `#F3F0EA` | `#211E19` | Chữ chính |
| `--text-2` | `#C5C0B6` | `#57534B` | Chữ phụ |
| `--muted` | `#8C8679` | `#8C8679` | Nhãn mờ (giữ nguyên) |
| `--faint` | `#57534B` | `#A8A296` | Caption nhỏ nhất |
| `--gold` | `#D4B26A` | `#A87C34` | Icon/CTA gold (đậm hơn để đủ tương phản trên nền sáng) |
| `--gold-hi` | `#E3C27E` | `#8F6A2A` | Số liệu nổi bật |
| `--gold-grad` | `linear-gradient(135deg,#F4E3B4,#D4B26A 55%,#B6924A)` | giữ nguyên | Nút CTA, logo wordmark |
| `--success` | `#7FD3A2` | `#1F8A5B` | Trạng thái xanh |
| `--warn` | `#E7B869` | `#B07818` | Cảnh báo |
| `--error` | `#E88B99` | `#C2455C` | Lỗi/hủy |
| `--info` | `#8FB6E4` | `#3D6FB0` | Thông tin |
| `--pink` | `#E79AB8` | `#C2517E` | Nhấn hồng (cast) |
| `--shadow` | `0 20px 44px -18px rgba(0,0,0,.85)` | `0 16px 36px -20px rgba(40,30,10,.25)` | Đổ bóng card |

### B.2 — Khai báo

```css
:root {
  --bg:#0C0C0F; --bg-2:#0E0D12; --surface:#131218;
  --surface-2:rgba(255,255,255,.03);
  --border:rgba(255,255,255,.07); --border-gold:rgba(212,178,106,.28);
  --text:#F3F0EA; --text-2:#C5C0B6; --muted:#8C8679; --faint:#57534B;
  --gold:#D4B26A; --gold-hi:#E3C27E;
  --gold-grad:linear-gradient(135deg,#F4E3B4,#D4B26A 55%,#B6924A);
  --success:#7FD3A2; --warn:#E7B869; --error:#E88B99;
  --info:#8FB6E4; --pink:#E79AB8;
  --shadow:0 20px 44px -18px rgba(0,0,0,.85);
  color-scheme: dark;
}

html.vy-light {
  --bg:#F6F4EF; --bg-2:#FFFFFF; --surface:#FFFFFF;
  --surface-2:rgba(0,0,0,.03);
  --border:rgba(0,0,0,.09); --border-gold:rgba(150,116,52,.45);
  --text:#211E19; --text-2:#57534B; --muted:#8C8679; --faint:#A8A296;
  --gold:#A87C34; --gold-hi:#8F6A2A;
  --success:#1F8A5B; --warn:#B07818; --error:#C2455C;
  --info:#3D6FB0; --pink:#C2517E;
  --shadow:0 16px 36px -20px rgba(40,30,10,.25);
  color-scheme: light;
}
```

JS toggle **dùng chung** với phương án A (vẫn class `vy-light` trên `<html>`, vẫn key `vy-user-theme`) — nên có thể ship A trước, nâng cấp lên B sau mà không đổi hành vi nút.

### B.3 — Quy tắc chuyển đổi component

- Thay màu hardcode → token: `background:#131218` → `background:var(--surface)`; `color:#f3f0ea` → `color:var(--text)`…
- **Giữ nguyên** gradient gold của CTA/logo ở cả 2 theme (nhận diện thương hiệu), chỉ chữ trên gradient luôn là `#241A0A`.
- Ảnh thumbnail quán/cast: thêm lớp phủ khi light mode nếu ảnh quá tối: `html.vy-light .thumb::after { background:rgba(255,255,255,.04); }` (tùy chọn).

---

## Nút toggle (spec UI — đồng bộ với Admin)

- Vị trí đề xuất: header, giữa nút ngôn ngữ `VI` và avatar/chat. Mobile: trong menu Tài khoản.
- Kích thước 39×39px (mobile tối thiểu 44×44px vùng chạm), tròn, viền `1px solid var(--border-gold)`, icon 17px màu `var(--gold)`, hover nền `rgba(212,178,106,.1)`.
- Đang tối → hiện **mặt trời** (bấm để sáng). Đang sáng → hiện **mặt trăng**. Kèm `title`/`aria-label`: "Chuyển giao diện sáng/tối".

```html
<!-- Mặt trời (hiện khi đang dark) -->
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="4"/>
  <path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>
</svg>

<!-- Mặt trăng (hiện khi đang light) -->
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 14.5A8.3 8.3 0 0 1 9.5 4 8.3 8.3 0 1 0 20 14.5z"/>
</svg>
```

---

## Checklist QA khi bật light mode

- [ ] Header sticky, bottom nav mobile, drawer, toast, modal **bám đúng viewport khi cuộn** (nếu trôi → filter đang nằm trên `body`, chuyển lên `html`)
- [ ] Ảnh quán / avatar cast / video / mã QR giữ màu gốc (không bị âm bản)
- [ ] Logo wordmark gradient gold còn đọc được trên nền sáng
- [ ] Chữ gold nhỏ (label "LẤY MÃ", giá) đạt tương phản ≥ 4.5:1 — phương án B đã xử lý bằng `--gold` đậm hơn
- [ ] Badge trạng thái (Đang chạy / Tạm dừng / VIP) còn phân biệt được
- [ ] Chuyển trang giữ nguyên theme (đọc localStorage trước paint, không chớp màn)
- [ ] Lần đầu truy cập: theo `prefers-color-scheme` của máy; sau khi user bấm nút thì lựa chọn tay luôn thắng
- [ ] `color-scheme` đổi theo theme để scrollbar/form control hệ điều hành khớp màu

---

## Ghi chú tích hợp

- **Không dùng chung key với admin**: user = `vy-user-theme`, admin = `vy-admin-theme`. Nhân viên mở cả 2 sẽ không bị "lây" theme.
- Nếu sau này làm app native: map bảng token B.1 sang theme object của app.
- Transition đổi theme: có thể thêm `html { transition: filter .2s ease; }` (phương án A) — nếu thấy giật trên máy yếu thì bỏ.
