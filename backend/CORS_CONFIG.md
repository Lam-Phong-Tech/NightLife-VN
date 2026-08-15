# Hướng dẫn cấu hình CORS (Thêm Domain mới)

CORS (Cross-Origin Resource Sharing) là cơ chế bảo mật của trình duyệt nhằm ngăn chặn các trang web trái phép gọi API của bạn.

Hiện tại hệ thống NightLife-VN dùng một danh sách origin chung cho API và tất cả WebSocket gateway. Production mặc định chỉ gồm:

- `https://vietyoru.com`
- `https://www.vietyoru.com`
- `https://admin.vietyoru.com`
- `https://auth.vietyoru.com`
- `https://partner.vietyoru.com`

`https://api.vietyoru.com` là đích API/socket, không phải origin frontend; chỉ thêm nó nếu có một trang web chạy trên chính domain đó.

Danh sách cũng có thể nhận thêm domain từ biến `CORS_ORIGINS`. Socket gateway kiểm tra cả CORS và Origin của handshake WebSocket; quyền nhận dữ liệu vẫn được xác thực bằng token và kiểm tra room phía server.

Các origin local chỉ được bật ngoài production.

Có thể thêm origin bổ sung qua biến môi trường `CORS_ORIGINS`.

## Cách 1: Thêm domain thông qua biến môi trường (Khuyên dùng)

Bạn **không cần sửa code**. Chỉ cần cấu hình trên Server (VPS / Vercel / Heroku...).

1. Mở file `.env` trên Server Backend.
2. Thêm hoặc cập nhật biến `CORS_ORIGINS` bằng danh sách các domain mới (ngăn cách bằng dấu phẩy).

```env
# Ví dụ thêm domain mới
CORS_ORIGINS=https://new-domain.com,https://admin.new-domain.com
```

3. Khởi động lại backend. Cả REST API và hai Socket.IO gateway sẽ nhận danh sách mới.

## Cách 2: Thêm trực tiếp vào Source Code (Hardcode)

Nếu bạn muốn fix cứng domain vào code để toàn bộ team dev đều có:

1. Mở file `src/security/cors-origins.ts`.
2. Thêm domain vào mảng `productionOrigins`:

```typescript
const productionOrigins = [
  'https://vietyoru.com',
  'https://admin.vietyoru.com',
  // Thêm origin frontend mới vào đây:
  'https://domain-moi-cua-ban.com',
];
```

> **Lưu ý quan trọng**: Khi thêm domain, TUYỆT ĐỐI KHÔNG có dấu `/` ở cuối URL.
>
> - Đúng: `https://vietyoru.com`
> - Sai: `https://vietyoru.com/`
