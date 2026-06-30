export type LegalSection = {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
  items: Array<{
    heading: string;
    body: string;
  }>;
};

export const legalPlaceholderNotice =
  "Bản nháp placeholder. Nội dung pháp lý cuối cùng cần được khách hàng cung cấp và rà soát trước khi phát hành chính thức.";

export const legalSections: LegalSection[] = [
  {
    slug: "chinh-sach-bao-mat",
    title: "Chính sách bảo mật",
    description:
      "Placeholder về cách Vietyoru thu thập, sử dụng và bảo vệ dữ liệu người dùng trong quá trình đặt chỗ.",
    updatedAt: "2026-06-30",
    items: [
      {
        heading: "Thông tin có thể thu thập",
        body:
          "Tên, số điện thoại, thông tin đặt chỗ, lịch sử dùng ưu đãi và dữ liệu tài khoản cần thiết để vận hành dịch vụ.",
      },
      {
        heading: "Mục đích sử dụng",
        body:
          "Dữ liệu được dùng để xác nhận đặt chỗ, điều phối với quán, chăm sóc khách hàng, tích điểm và phòng chống lạm dụng ưu đãi.",
      },
      {
        heading: "Quyền của người dùng",
        body:
          "Người dùng có thể yêu cầu cập nhật hoặc xóa thông tin theo kênh liên hệ chính thức sau khi khách hàng cung cấp quy trình pháp lý cuối cùng.",
      },
    ],
  },
  {
    slug: "dieu-khoan-su-dung",
    title: "Điều khoản sử dụng",
    description:
      "Placeholder về điều kiện sử dụng nền tảng, giới hạn trách nhiệm và quy tắc đặt chỗ qua Vietyoru.",
    updatedAt: "2026-06-30",
    items: [
      {
        heading: "Điều kiện sử dụng",
        body:
          "Dịch vụ dành cho người dùng đủ điều kiện theo quy định pháp luật Việt Nam. Người dùng cần cung cấp thông tin chính xác khi đặt chỗ.",
      },
      {
        heading: "Giá và xác nhận",
        body:
          "Giá, tình trạng bàn, cast và ưu đãi hiển thị chỉ mang tính tham khảo cho đến khi admin xác nhận với quán.",
      },
      {
        heading: "Tài khoản và hành vi",
        body:
          "Tài khoản có dấu hiệu spam, lạm dụng mã ưu đãi hoặc cung cấp thông tin sai có thể bị tạm khóa theo quy trình chính thức.",
      },
    ],
  },
  {
    slug: "chinh-sach-hoat-dong",
    title: "Chính sách hoạt động",
    description:
      "Placeholder về cách Vietyoru điều phối đặt chỗ, xử lý ưu đãi, tích điểm và hỗ trợ sau trải nghiệm.",
    updatedAt: "2026-06-30",
    items: [
      {
        heading: "Điều phối đặt chỗ",
        body:
          "Yêu cầu đặt chỗ được admin tiếp nhận và xác nhận với quán. Vietyoru không thu cọc hay thanh toán online nếu chưa có thông báo chính thức.",
      },
      {
        heading: "Ưu đãi và tích điểm",
        body:
          "Coupon áp dụng theo điều kiện từng chương trình. Điểm thành viên được cộng sau khi hóa đơn hợp lệ được duyệt.",
      },
      {
        heading: "Hỗ trợ sau đặt chỗ",
        body:
          "Khi có thay đổi lịch hoặc phản hồi dịch vụ, người dùng liên hệ admin để được điều phối theo quy trình vận hành đã công bố.",
      },
    ],
  },
];

export const getLegalSection = (slug: string) =>
  legalSections.find((section) => section.slug === slug);
