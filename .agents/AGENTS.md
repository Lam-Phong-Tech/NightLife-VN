# Project-Scoped Rules

- Sau khi hoàn thành việc chỉnh sửa mã nguồn, hãy tự động tạo một commit trên Github và push lên (sử dụng các lệnh `git add`, `git commit -m "..."` và `git push`). Đừng quên báo cáo lại cho người dùng sau khi commit thành công.
- Tuyệt đối không dùng alert mặc định của trình duyệt (ví dụ: `alert()`, `confirm()`, `prompt()`), hãy sử dụng toast hoặc modal tự dựng để thông báo.
- Tuyệt đối không sử dụng giao diện thẻ `<select>` mặc định của trình duyệt để tránh lỗi hiển thị hoặc xấu giao diện, thay vào đó hãy tự dựng custom dropdown/picker.
- Tuyệt đối không sử dụng thư viện DatePicker/DateTimePicker mặc định của trình duyệt (còn gọi là "native browser date picker"), hãy sử dụng custom date-picker component tự dựng của dự án.
- Tuyệt đối không để chữ màu trắng hoặc màu quá nhạt trên giao diện sáng. Tất cả chữ ở giao diện sáng phải hiển thị màu sẫm, tương phản cao, đậm nét và dễ đọc. Khi xử lý các thành phần dùng CSS `filter: invert(1)`, cần kiểm tra kỹ màu gốc để tránh bị đảo ngược thành chữ trắng trên nền trắng.

