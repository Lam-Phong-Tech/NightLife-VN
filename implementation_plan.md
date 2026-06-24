# Khởi tạo dự án NestJS (NightLife-VN Backend)

Kế hoạch này phác thảo các bước thiết lập một dự án backend bằng NestJS theo các yêu cầu bạn đã chọn: dùng `pnpm`, database `PostgreSQL` (chạy qua **Docker**), `Prisma` ORM, xác thực `JWT`, API `REST` và tài liệu `Swagger`.

## Phản hồi từ người dùng cần thiết

> [!IMPORTANT]
> **Docker Desktop**: Vì bạn chọn cấu hình database qua Docker, hãy đảm bảo rằng máy bạn đã cài đặt và đang bật **Docker Desktop** trước khi chạy dự án.
>
> Vui lòng xem qua kế hoạch này và bấm "Proceed" nếu bạn đồng ý để tôi bắt đầu thực thi!

## Câu hỏi mở
Không có câu hỏi mở nào ở bước này.

## Những thay đổi dự kiến

### 1. Khởi tạo dự án NestJS
- Khởi tạo dự án NestJS trong thư mục `d:\laragon\www\NightLife-VN\backend`.
- Cấu hình sử dụng `pnpm` làm package manager.
- Cài đặt các thư viện cần thiết cơ bản.

### 2. Thiết lập Database với Docker
- Tạo file `docker-compose.yml` để cấu hình container chạy PostgreSQL.
- Thiết lập thông tin kết nối mặc định (Username, Password, Database Name, Port 5432).

### 3. Cài đặt và Cấu hình Prisma (ORM)
- Cài đặt `prisma` (dev) và `@prisma/client`.
- Khởi tạo file `prisma/schema.prisma` để kết nối với PostgreSQL trong Docker.
- Tạo model `User` cơ bản để phục vụ cho tính năng xác thực.
- Cấu hình file `.env` chứa `DATABASE_URL` kết nối tới container PostgreSQL.

### 4. Cấu hình Swagger (Tài liệu API)
- Cài đặt `@nestjs/swagger` và `swagger-ui-express`.
- Thiết lập Swagger trong `main.ts` để bạn có thể xem và test API tại đường dẫn `/api` (hoặc `/docs`).

### 5. Thiết lập Xác thực JWT & Bảo mật cơ bản
- Cài đặt `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `class-validator`, `class-transformer`.
- Kích hoạt Global Validation Pipe để kiểm tra dữ liệu đầu vào tự động.
- Chuẩn bị sẵn cấu trúc module cho `Auth` và `Users`.

## Kế hoạch kiểm tra (Verification Plan)

### Kiểm tra tự động
- Chạy lệnh build (`pnpm run build`) để đảm bảo không có lỗi TypeScript.
- Chạy lệnh test mặc định của NestJS.

### Kiểm tra thủ công
- Chạy lệnh `docker-compose up -d` để khởi động database.
- Chạy server ở chế độ dev (`pnpm run start:dev`).
- Mở Swagger UI trên trình duyệt (thường ở `http://localhost:3000/api`) để kiểm tra xem server có chạy thành công và kết nối được với database Docker không.
