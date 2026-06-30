export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  updatedAt: string;
  readTime: string;
  author: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
  tags: string[];
  sections: Array<{
    heading: string;
    body: string;
  }>;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "tay-ho-night-guide",
    title: "Hướng dẫn trọn vẹn một đêm ở Tây Hồ",
    description:
      "Lộ trình gợi ý cho khách muốn đi lounge, club và ăn khuya ở Tây Hồ, kèm lưu ý đặt chỗ qua Vietyoru.",
    category: "Cẩm nang khu vực",
    date: "2026-06-21",
    updatedAt: "2026-06-30",
    readTime: "6 phút đọc",
    author: "Đội ngũ Vietyoru",
    image:
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=78",
    imageAlt: "Không gian lounge ban đêm với ánh đèn ấm",
    featured: true,
    tags: ["Tây Hồ", "Lounge", "Đặt chỗ"],
    sections: [
      {
        heading: "Bắt đầu bằng một lounge dễ tiếp khách",
        body:
          "Tây Hồ hợp cho nhóm muốn có không gian riêng, nhạc vừa đủ và dịch vụ ổn định. Nên chọn điểm mở đầu có phòng VIP hoặc bàn lớn nếu đi cùng đối tác.",
      },
      {
        heading: "Giữ lịch trình linh hoạt",
        body:
          "Giá hiển thị trên Vietyoru chỉ mang tính tham khảo. Khi gửi yêu cầu đặt chỗ, admin sẽ xác nhận lại với quán trước khi chốt lịch.",
      },
      {
        heading: "Khép lại bằng điểm ăn khuya",
        body:
          "Sau lounge hoặc club, một quán ăn khuya gần hồ giúp nhóm nghỉ nhịp trước khi di chuyển. Hãy kiểm tra giờ mở cửa trong ngày vì cuối tuần thường đông sớm.",
      },
    ],
  },
  {
    slug: "karaoke-nhat-ha-noi",
    title: "Văn hóa karaoke Nhật tại Hà Nội",
    description:
      "Các lưu ý về phòng riêng, etiquette khi đi cùng khách Nhật và cách đặt trước để tránh chờ cuối tuần.",
    category: "Văn hóa Nhật",
    date: "2026-06-20",
    updatedAt: "2026-06-30",
    readTime: "7 phút đọc",
    author: "Đội ngũ Vietyoru",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=78",
    imageAlt: "Sân khấu biểu diễn trong không gian đêm",
    tags: ["Karaoke", "Nhật Bản", "Hà Nội"],
    sections: [
      {
        heading: "Ưu tiên phòng riêng",
        body:
          "Khách Nhật thường đánh giá cao không gian riêng tư, âm lượng vừa phải và phục vụ kín đáo. Khi đặt chỗ, hãy ghi rõ số lượng khách và mục đích buổi gặp.",
      },
      {
        heading: "Chọn khung giờ ít rủi ro",
        body:
          "Khung 20:00-22:00 thường dễ điều phối hơn sau 22:30. Với cuối tuần, nên gửi yêu cầu trước tối thiểu vài giờ.",
      },
    ],
  },
  {
    slug: "dat-ban-cuoi-tuan",
    title: "5 mẹo đặt bàn nhanh dịp cuối tuần",
    description:
      "Checklist ngắn để đặt bàn nightlife nhanh hơn: chọn khu vực, giờ đến, số khách, yêu cầu phòng và coupon.",
    category: "Mẹo đặt chỗ",
    date: "2026-06-16",
    updatedAt: "2026-06-30",
    readTime: "4 phút đọc",
    author: "Đội ngũ Vietyoru",
    image:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=78",
    imageAlt: "Quầy bar sáng đèn trong buổi tối",
    tags: ["Booking", "Coupon", "Cuối tuần"],
    sections: [
      {
        heading: "Gửi đủ thông tin ngay từ đầu",
        body:
          "Admin xử lý nhanh hơn khi có giờ đến, số khách, khu vực mong muốn và nhu cầu phòng riêng. Nếu có coupon, hãy chọn trước khi gửi yêu cầu.",
      },
      {
        heading: "Luôn có phương án gần khu vực",
        body:
          "Nếu quán đầu tiên kín chỗ, lựa chọn cùng khu vực giúp giữ lịch trình ổn định và giảm thời gian di chuyển.",
      },
    ],
  },
  {
    slug: "quan-1-night-map",
    title: "Bản đồ Quận 1 về đêm cho khách mới",
    description:
      "Gợi ý cách chia một buổi tối ở Quận 1 theo lounge, rooftop bar và điểm ăn khuya gần trung tâm.",
    category: "Cẩm nang khu vực",
    date: "2026-06-19",
    updatedAt: "2026-06-30",
    readTime: "6 phút đọc",
    author: "Đội ngũ Vietyoru",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=78",
    imageAlt: "Đồ uống trong không gian nightlife",
    tags: ["Quận 1", "Rooftop", "TP.HCM"],
    sections: [
      {
        heading: "Điểm hẹn trung tâm",
        body:
          "Quận 1 phù hợp nhóm muốn di chuyển ngắn giữa nhiều điểm. Hãy chọn điểm đầu gần khách sạn hoặc tuyến xe chính để dễ đổi lịch.",
      },
      {
        heading: "Đặt trước nếu cần view đẹp",
        body:
          "Rooftop và bàn gần sân khấu thường hết sớm. Với nhóm business, nên ghi rõ nhu cầu không gian trò chuyện khi đặt chỗ.",
      },
    ],
  },
  {
    slug: "nightlife-coupon-guide",
    title: "Cách dùng coupon và tích điểm hiệu quả",
    description:
      "Tóm tắt cách xem ưu đãi, dùng mã hợp lệ và tích điểm thành viên sau khi hóa đơn được duyệt.",
    category: "Ưu đãi",
    date: "2026-06-08",
    updatedAt: "2026-06-30",
    readTime: "5 phút đọc",
    author: "Đội ngũ Vietyoru",
    image:
      "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=1200&q=78",
    imageAlt: "Ly cocktail đặt trên quầy bar",
    tags: ["Coupon", "Điểm thành viên", "Ưu đãi"],
    sections: [
      {
        heading: "Kiểm tra điều kiện mã",
        body:
          "Một số mã áp dụng theo hạng thành viên, thời gian hoặc mức chi tiêu. Điều kiện cuối cùng sẽ được admin xác nhận với quán.",
      },
      {
        heading: "Điểm cộng sau khi duyệt bill",
        body:
          "Điểm thành viên được cộng sau khi hóa đơn hợp lệ được duyệt. Nếu thông tin hóa đơn chưa đủ, admin có thể yêu cầu bổ sung.",
      },
    ],
  },
];

export const featuredBlogPost = blogPosts.find((post) => post.featured) ?? blogPosts[0]!;

export const getBlogPost = (slug: string) => blogPosts.find((post) => post.slug === slug);
