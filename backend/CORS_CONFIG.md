# Hướng dẫn cấu hình CORS (Thêm Domain mới)

CORS (Cross-Origin Resource Sharing) là cơ chế bảo mật của trình duyệt nhằm ngăn chặn các trang web trái phép gọi API của bạn. 

Hiện tại hệ thống NightLife-VN đang giới hạn CORS cho API (trong `main.ts`) và WebSocket (trong `support-chat.gateway.ts`) chỉ cho phép một số domain cụ thể:
- Localhost (cho môi trường dev)
- Các domain production đã được hardcode (như `https://demonightlight.test9.io.vn`)
- Các domain được cung cấp qua biến môi trường (Environment Variable) `CORS_ORIGINS`.

## Cách 1: Thêm domain thông qua biến môi trường (Khuyên dùng)
Bạn **không cần sửa code**. Chỉ cần cấu hình trên Server (VPS / Vercel / Heroku...).
1. Mở file `.env` trên Server Backend.
2. Thêm hoặc cập nhật biến `CORS_ORIGINS` bằng danh sách các domain mới (ngăn cách bằng dấu phẩy).

```env
# Ví dụ thêm domain mới
CORS_ORIGINS=https://new-domain.com,https://admin.new-domain.com
```

3. Khởi động lại Server Backend. Cả REST API và WebSocket Chat sẽ tự động chấp nhận các domain này.

## Cách 2: Thêm trực tiếp vào Source Code (Hardcode)
Nếu bạn muốn fix cứng domain vào code để toàn bộ team dev đều có:

1. Mở file `src/main.ts`
2. Tìm mảng `productionOrigins` và thêm domain của bạn vào:
```typescript
const productionOrigins = [
  'https://demonightlight.test9.io.vn',
  'https://www.demonightlight.test9.io.vn',
  'https://nightlife.lptech.info.vn',
  // Thêm domain mới vào đây:
  'https://domain-moi-cua-ban.com'
];
```

3. Mở file `src/support-chat/support-chat.gateway.ts`
4. Cũng tìm mảng `productionOrigins` tương tự và thêm domain đó vào (để Socket.io nhận dạng):
```typescript
const productionOrigins = [
  'https://demonightlight.test9.io.vn',
  'https://www.demonightlight.test9.io.vn',
  'https://nightlife.lptech.info.vn',
  // Thêm domain mới vào đây:
  'https://domain-moi-cua-ban.com'
];
```

> **Lưu ý quan trọng**: Khi thêm domain, TUYỆT ĐỐI KHÔNG có dấu `/` ở cuối URL. 
> - Đúng: `https://demonightlight.test9.io.vn`
> - Sai: `https://demonightlight.test9.io.vn/`
