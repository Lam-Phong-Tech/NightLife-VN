import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/page-metadata";
import { jsonLdDocument, webPageJsonLd } from "@/lib/seo/structured-data";
import { siteConfig } from "@/lib/site";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = createPageMetadata({
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
  absoluteTitle: true,
});

const homePageStructuredData = jsonLdDocument(
  webPageJsonLd({
    path: "/",
    name: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
  }),
);

const homeSeoFaqItems = [
  {
    question: "Vietyoru phù hợp với ai khi tìm nightlife tại Việt Nam?",
    answer:
      "Vietyoru phù hợp với người muốn chuẩn bị trước cho một buổi tối tại Hà Nội, TP.HCM hoặc các khu vực có dịch vụ nightlife nổi bật. Người dùng có thể xem nhanh loại hình quán, khu vực, ưu đãi, nội dung hướng dẫn và những lựa chọn đang được đề xuất. Thay vì phải mở nhiều nguồn rời rạc, trang chủ gom các lối đi chính để người dùng bắt đầu từ nhu cầu thực tế: tìm quán để đặt bàn, xem Cast, săn ưu đãi, chọn tour trải nghiệm, tham khảo spa thư giãn hoặc tìm nhà hàng trước khi đi chơi.",
  },
  {
    question: "Nên bắt đầu từ danh sách quán hay bảng xếp hạng?",
    answer:
      "Nếu đã biết khu vực hoặc loại hình dịch vụ mong muốn, danh sách quán là lối đi nhanh nhất vì người dùng có thể lọc theo địa điểm, nhóm dịch vụ và nhu cầu đặt chỗ. Nếu chưa có lựa chọn rõ ràng, bảng xếp hạng giúp tham khảo những quán và Cast đang nổi bật hơn trong hệ thống. Hai trang này bổ trợ cho nhau: bảng xếp hạng tạo điểm bắt đầu, còn danh sách quán giúp so sánh sâu hơn trước khi xem trang chi tiết hoặc gửi yêu cầu đặt chỗ.",
  },
  {
    question: "Ưu đãi thành viên trên Vietyoru nên được xem như thế nào?",
    answer:
      "Ưu đãi thành viên là nhóm nội dung giúp người dùng kiểm tra nhanh các coupon, chương trình giảm giá hoặc quyền lợi đang còn hiệu lực. Trước khi quyết định đặt bàn hoặc ghé địa điểm, người dùng nên xem điều kiện áp dụng, thời hạn, loại dịch vụ liên quan và trạng thái xác nhận. Việc đưa ưu đãi thành một trang riêng cũng giúp cấu trúc SEO rõ hơn, vì Google có thể hiểu đây là cụm nội dung độc lập liên quan tới deal nightlife, coupon dịch vụ và quyền lợi hội viên.",
  },
  {
    question: "Trang tour khác gì so với danh sách quán thông thường?",
    answer:
      "Trang tour tập trung vào trải nghiệm theo lịch trình hoặc gói khám phá, phù hợp với người muốn có một buổi tối được gợi ý sẵn thay vì tự chọn từng địa điểm. Nội dung tour có thể kết hợp quán, nhà hàng, trải nghiệm nightlife, hoạt động nhóm hoặc những điểm đến phù hợp theo khung giờ. Nhờ tách tour thành chuyên mục riêng, website có thêm cụm nội dung phục vụ người tìm kiếm các truy vấn như tour nightlife Việt Nam, trải nghiệm buổi tối, lịch trình đi chơi hoặc gợi ý địa điểm cho nhóm bạn.",
  },
  {
    question: "Vì sao nên có trang spa và nhà hàng trong cùng hệ sinh thái nightlife?",
    answer:
      "Nightlife không chỉ là quán bar hoặc lounge. Nhiều người dùng bắt đầu buổi tối bằng bữa ăn, kết hợp thư giãn tại spa, rồi mới chuyển sang hoạt động giải trí hoặc đặt bàn. Việc có trang spa và nhà hàng giúp website bao phủ hành trình rộng hơn, từ chuẩn bị, thư giãn, ăn uống đến giải trí. Với SEO on-page, các chuyên mục này tạo thêm liên kết nội bộ tự nhiên và giúp công cụ tìm kiếm hiểu Vietyoru là một guide dịch vụ buổi tối, không chỉ là một danh sách địa điểm đơn lẻ.",
  },
  {
    question: "Breadcrumb và canonical hỗ trợ gì cho cấu trúc trang chủ?",
    answer:
      "Canonical giúp xác định URL gốc của trang chủ, hạn chế tình trạng các biến thể URL bị hiểu là nội dung trùng lặp. Breadcrumb giúp thể hiện vị trí của trang trong cấu trúc website và bổ sung dữ liệu có tổ chức cho công cụ tìm kiếm. Khi kết hợp canonical, breadcrumb, sitemap và liên kết nội bộ, trang chủ có tín hiệu rõ ràng hơn: đây là cửa vào chính của Vietyoru, dẫn tới các chuyên mục như danh sách quán, danh sách Cast, ưu đãi, tour, spa, nhà hàng, blog và trang pháp lý.",
  },
  {
    question: "Người dùng nên xem thông tin nào trước khi đặt chỗ?",
    answer:
      "Trước khi đặt chỗ, người dùng nên kiểm tra khu vực, loại hình dịch vụ, hình ảnh, mô tả, mức giá tham khảo, ưu đãi đang có, trạng thái hoạt động và các ghi chú xác nhận. Với những dịch vụ có lịch, yêu cầu riêng hoặc phụ thuộc vào thời điểm, thông tin cuối cùng vẫn nên được xác nhận lại trước khi phục vụ. Cách trình bày này giúp kỳ vọng của người dùng rõ hơn, đồng thời giúp nội dung trên website có chiều sâu hơn so với chỉ hiển thị tên quán và một nút hành động.",
  },
  {
    question: "Blog và hướng dẫn đóng vai trò gì trong SEO của website?",
    answer:
      "Blog và hướng dẫn giúp mở rộng ngữ cảnh tìm kiếm ngoài các trang giao dịch. Người dùng có thể cần đọc về kinh nghiệm đi chơi, cách chọn khu vực, mẹo sử dụng ưu đãi, lưu ý khi đặt bàn, gợi ý lịch trình hoặc phân biệt các loại hình dịch vụ. Những nội dung này hỗ trợ SEO dài hạn vì chúng trả lời câu hỏi cụ thể, liên kết ngược về trang chuyên mục và giúp Google hiểu rõ hơn chủ đề chính của website. Khi blog, tour và danh sách dịch vụ liên kết với nhau, cấu trúc nội dung trở nên tự nhiên và dễ thu thập dữ liệu hơn.",
  },
  {
    question: "Vietyoru có thể mở rộng SEO địa phương như thế nào?",
    answer:
      "SEO địa phương nên dựa trên cụm khu vực, thành phố và nhu cầu tìm kiếm thực tế. Với nightlife, người dùng thường tìm theo địa danh, quận, loại hình dịch vụ hoặc bối cảnh sử dụng như đi nhóm, tiếp khách, sinh nhật, hẹn hò, thư giãn sau giờ làm. Website có thể mở rộng nội dung bằng các trang chuyên mục theo thành phố, bài hướng dẫn theo khu vực, mô tả dịch vụ rõ ràng trên trang chi tiết và dữ liệu có cấu trúc cho doanh nghiệp, địa điểm, breadcrumb, bài viết và trang web.",
  },
  {
    question: "Tại sao text/HTML ratio của một app hiện đại thường thấp?",
    answer:
      "Những website xây bằng React hoặc Next.js thường có nhiều markup, script, style và dữ liệu phục vụ tương tác. Vì vậy một số công cụ SEO cũ có thể báo tỷ lệ text/HTML thấp, dù trang vẫn có metadata, nội dung chính, liên kết nội bộ và dữ liệu có cấu trúc. Cách xử lý đúng không phải nhồi từ khóa, mà là bổ sung nội dung hữu ích, giảm markup thừa khi có thể, giữ heading rõ ràng và đảm bảo trang có các đoạn mô tả thật cho người dùng. Phần cẩm nang này được thêm để tăng ngữ cảnh nội dung mà vẫn giữ trải nghiệm trang chủ gọn gàng.",
  },
];

const homeSeoGuideItems = [
  {
    title: "Cách chọn khu vực nightlife ở Hà Nội",
    body:
      "Khi tìm nightlife ở Hà Nội, người dùng thường bắt đầu từ khu vực vì mỗi quận có nhịp đi chơi khác nhau. Tây Hồ phù hợp với người thích lounge, rooftop, bar có không gian mở và nhóm khách quốc tế. Hoàn Kiếm thuận tiện cho lịch trình trung tâm, dễ kết hợp ăn tối, đi bộ, nghe nhạc và di chuyển sang điểm kế tiếp. Ba Đình, Cầu Giấy hoặc Đống Đa phù hợp với người muốn tìm karaoke, nhà hàng, spa hoặc các dịch vụ riêng tư hơn. Trên Vietyoru, việc tách khu vực và loại hình giúp người dùng không phải đọc từng địa điểm một cách rời rạc. Họ có thể bắt đầu từ nhu cầu: gần nơi ở, gần khách sạn, tiện đón xe, phù hợp nhóm đông, có ưu đãi hay có dịch vụ đặt chỗ. Với SEO địa phương, các mô tả theo khu vực này cũng giúp Google hiểu website đang phục vụ truy vấn nightlife Hà Nội, quán bar Hà Nội, lounge Tây Hồ, karaoke VIP hoặc nhà hàng buổi tối trong từng bối cảnh cụ thể.",
  },
  {
    title: "Cách chọn khu vực nightlife ở TP.HCM",
    body:
      "TP.HCM có hành vi tìm kiếm nightlife rất mạnh theo quận, tuyến đường và phong cách trải nghiệm. Quận 1 thường được xem là điểm bắt đầu cho người muốn tìm bar, club, lounge, rooftop hoặc địa điểm tiếp khách ở trung tâm. Quận 3 phù hợp với lịch trình nhẹ hơn, dễ kết hợp nhà hàng, cafe đêm và các điểm giải trí vừa phải. Thảo Điền, Bình Thạnh hoặc Phú Nhuận có thể phù hợp với người muốn không gian riêng, dịch vụ cao cấp hoặc nơi gặp gỡ sau giờ làm. Khi người dùng vào Vietyoru, các liên kết từ trang chủ tới danh sách quán, ưu đãi và tour giúp họ đi từ ý định chung sang lựa chọn cụ thể. Nội dung theo TP.HCM nên luôn ưu tiên sự rõ ràng: địa điểm nằm ở đâu, hợp với nhóm nào, mức giá tham khảo ra sao, có cần đặt trước không và có chương trình ưu đãi nào đang áp dụng. Đây là các tín hiệu nội dung hữu ích cho cả người dùng lẫn công cụ tìm kiếm.",
  },
  {
    title: "Lên lịch trình buổi tối cho nhóm bạn",
    body:
      "Một lịch trình buổi tối tốt thường không bắt đầu trực tiếp bằng quán cuối cùng, mà bắt đầu bằng nhịp di chuyển của nhóm. Nhóm có thể ăn tối trước, sau đó chọn lounge hoặc karaoke, rồi kết thúc bằng một địa điểm nhẹ hơn nếu còn thời gian. Nếu nhóm có khách mới đến Việt Nam, tour trải nghiệm hoặc gợi ý theo khu vực sẽ hữu ích hơn một danh sách dài. Nếu nhóm đã biết phong cách mong muốn, trang danh sách quán và bảng xếp hạng giúp rút ngắn thời gian chọn. Vietyoru nên giữ các nội dung này liên kết với nhau để người dùng không bị mắc kẹt ở một trang đơn lẻ. Từ góc nhìn SEO, những đoạn cẩm nang về lịch trình giúp website bao phủ truy vấn có ý định tư vấn như đi đâu buổi tối, gợi ý nightlife cho nhóm bạn, lịch trình ăn tối và đi bar, hoặc cách chọn quán phù hợp cho sinh nhật, tiếp khách và hẹn hò.",
  },
  {
    title: "So sánh bar, lounge, karaoke, club và KTV",
    body:
      "Không phải người dùng nào cũng phân biệt rõ các loại hình nightlife. Bar thường phù hợp với người muốn uống nhẹ, nghe nhạc và trò chuyện. Lounge ưu tiên không gian, dịch vụ và cảm giác thoải mái hơn, phù hợp tiếp khách hoặc nhóm nhỏ. Club thiên về âm nhạc, ánh sáng, năng lượng cao và khung giờ muộn. Karaoke hoặc KTV phù hợp với nhóm riêng tư, cần phòng, dịch vụ theo giờ và đặt trước. Khi các loại hình này được mô tả rõ trên website, người dùng chọn nhanh hơn và ít nhầm kỳ vọng hơn. Vietyoru có thể dùng trang chủ để giới thiệu các lối đi chính, sau đó để trang chuyên mục và trang chi tiết giải thích sâu hơn. Đây là nội dung tốt cho SEO vì nó trả lời câu hỏi thật, chứa ngữ cảnh dịch vụ tự nhiên và giúp công cụ tìm kiếm hiểu rằng website không chỉ liệt kê địa điểm mà còn đóng vai trò hướng dẫn lựa chọn.",
  },
  {
    title: "Kinh nghiệm dùng ưu đãi và coupon nightlife",
    body:
      "Ưu đãi nightlife thường có điều kiện áp dụng, thời hạn, số lượng giới hạn hoặc yêu cầu xác nhận trước khi sử dụng. Người dùng nên xem kỹ chương trình còn hiệu lực không, áp dụng cho dịch vụ nào, có cần đặt bàn trước không và có giới hạn theo ngày hoặc khung giờ không. Trên website, trang ưu đãi nên liên kết với trang quán hoặc dịch vụ liên quan để người dùng hiểu bối cảnh đầy đủ. Nếu coupon chỉ hiện như một mẩu thông tin độc lập, người dùng dễ bỏ qua chi tiết quan trọng và công cụ tìm kiếm cũng khó hiểu mối liên hệ giữa ưu đãi, địa điểm và loại hình dịch vụ. Việc đưa ưu đãi thành cụm nội dung riêng giúp tăng khả năng index các truy vấn như coupon nightlife, ưu đãi đặt bàn, deal karaoke, giảm giá spa, combo nhà hàng hoặc chương trình thành viên.",
  },
  {
    title: "Kết hợp nhà hàng, spa và nightlife trong một buổi tối",
    body:
      "Nhiều người dùng không tìm một địa điểm duy nhất mà tìm một chuỗi trải nghiệm. Một buổi tối có thể bắt đầu bằng nhà hàng, chuyển sang lounge hoặc karaoke, sau đó kết thúc bằng một dịch vụ nhẹ hơn. Một lịch trình khác có thể bắt đầu bằng spa thư giãn rồi mới đi ăn hoặc gặp bạn bè. Khi trang chủ có lối đi tới nhà hàng, spa, tour, quán và ưu đãi, website phục vụ được nhiều nhu cầu trong cùng hành trình. Đây là lý do các chuyên mục ngoài quán bar vẫn quan trọng cho SEO nightlife: chúng mở rộng phạm vi tìm kiếm, tạo thêm liên kết nội bộ và giúp người dùng ở lại website lâu hơn. Nội dung nên tránh hứa hẹn quá mức, thay vào đó mô tả rõ loại hình, khu vực, mức giá tham khảo và cách xác nhận dịch vụ trước khi đi.",
  },
  {
    title: "Tiêu chí nội dung tốt cho trang chi tiết địa điểm",
    body:
      "Một trang chi tiết địa điểm nên có tên rõ ràng, khu vực, loại hình, mô tả dịch vụ, hình ảnh có alt, mức giá tham khảo, giờ hoạt động nếu có, ưu đãi liên quan, thông tin đặt chỗ và các lưu ý cần xác nhận. Nếu có dữ liệu đánh giá, bảng xếp hạng hoặc nội dung media, chúng nên được trình bày theo cách giúp người dùng ra quyết định chứ không chỉ trang trí. Với SEO on-page, trang chi tiết cần canonical đúng URL, breadcrumb từ trang chủ tới chuyên mục rồi tới địa điểm, schema phù hợp và liên kết ngược về các chuyên mục liên quan. Trang chủ có vai trò dẫn đường tới các trang này, còn trang chi tiết chịu trách nhiệm trả lời câu hỏi sâu hơn: địa điểm này hợp với ai, nên đi lúc nào, cần đặt trước không và có ưu đãi gì nổi bật.",
  },
  {
    title: "Lưu ý an toàn và xác nhận trước khi đi",
    body:
      "Nightlife là nhóm dịch vụ có nhiều yếu tố thay đổi theo thời điểm: chỗ trống, khung giờ, giá, chương trình ưu đãi, yêu cầu đặt cọc hoặc quy định riêng của từng địa điểm. Người dùng nên kiểm tra thông tin mới nhất và xác nhận lại trước khi di chuyển. Website nên trình bày các lưu ý này rõ ràng để tránh hiểu nhầm và giảm rủi ro trải nghiệm. Về mặt SEO, nội dung an toàn và xác nhận giúp tăng độ tin cậy vì nó thể hiện website không chỉ tập trung vào quảng bá, mà còn giúp người dùng chuẩn bị đúng. Các cụm nội dung như chính sách hoạt động, điều khoản, quyền lợi thành viên và hướng dẫn đặt chỗ nên được liên kết với nhau để tạo nền tảng thông tin minh bạch cho toàn bộ hệ thống.",
  },
  {
    title: "Cách xây dựng liên kết nội bộ cho website nightlife",
    body:
      "Liên kết nội bộ nên đi theo hành trình thật của người dùng. Trang chủ dẫn tới danh sách quán, danh sách Cast, ưu đãi, tour, spa, nhà hàng, blog và pháp lý. Trang danh sách quán dẫn tới trang chi tiết từng địa điểm. Trang ưu đãi dẫn tới quán hoặc loại dịch vụ liên quan. Blog và hướng dẫn nên dẫn ngược về chuyên mục có giá trị giao dịch. Cách làm này giúp người dùng không bị cụt đường và giúp Google hiểu trang nào là chuyên mục, trang nào là chi tiết, trang nào là nội dung tư vấn. Breadcrumb, canonical và sitemap là nền kỹ thuật, còn liên kết nội bộ là phần làm cấu trúc đó có ý nghĩa trong trải nghiệm thật.",
  },
  {
    title: "Cách đánh giá hiệu quả SEO sau khi triển khai",
    body:
      "Sau khi sửa on-page SEO, không nên chỉ dựa vào một tiện ích trình duyệt. Cần kiểm tra nhiều lớp: view-source hoặc HTML render có canonical, favicon và structured data không; Google Search Console có index URL đúng không; sitemap có route quan trọng không; robots có chặn nhầm trang công khai không; và dữ liệu Analytics có ghi nhận phiên truy cập thật không. Với website app hiện đại, text/HTML ratio chỉ là tín hiệu tham khảo vì markup tương tác có thể làm tỷ lệ thấp. Điều quan trọng hơn là nội dung thật, cấu trúc URL sạch, schema hợp lệ, tốc độ tải ổn, trang không bị lỗi render và người dùng có thể đi từ trang chủ tới trang chuyên mục, trang chi tiết và hành động đặt chỗ một cách tự nhiên.",
  },
  {
    title: "Tối ưu hình ảnh, alt text và media nightlife",
    body:
      "Hình ảnh là phần quan trọng của website nightlife vì người dùng cần nhìn không gian, ánh sáng, phong cách dịch vụ và cảm giác tổng thể trước khi chọn địa điểm. Tuy vậy, hình ảnh không nên chỉ đẹp về giao diện mà cần có alt text mô tả đúng nội dung. Alt text tốt không nhồi từ khóa, mà nói rõ ảnh đang thể hiện điều gì: không gian lounge, phòng karaoke VIP, khu vực bàn, món ăn, spa, banner ưu đãi hoặc hoạt động tour. Khi ảnh có tên file hợp lý, kích thước tối ưu và alt text rõ ràng, website vừa dễ truy cập hơn vừa giúp công cụ tìm kiếm hiểu nội dung ngoài phần chữ. Với trang chủ Vietyoru, hình ảnh nên dẫn người dùng tới chuyên mục hoặc trang chi tiết liên quan, còn nội dung chữ bên dưới giúp bổ sung ngữ cảnh cho những ảnh thiên về trải nghiệm.",
  },
  {
    title: "Nội dung cho Cast nên được trình bày ra sao?",
    body:
      "Trang Cast cần cân bằng giữa tính khám phá, sự rõ ràng và quyền riêng tư. Người dùng thường muốn biết Cast thuộc khu vực hoặc địa điểm nào, phong cách phục vụ, ngôn ngữ, lịch khả dụng nếu có và cách gửi yêu cầu phù hợp. Nội dung nên tránh mơ hồ hoặc gây hiểu nhầm, đồng thời cần liên kết về danh sách Cast, trang quán liên quan và các chính sách cần thiết. Với SEO, Cast là một cụm nội dung riêng vì truy vấn tìm kiếm có thể khác với truy vấn tìm quán. Trang chủ có liên kết tới danh sách Cast giúp Google hiểu đây là chuyên mục quan trọng, còn trang chi tiết Cast có schema, breadcrumb và mô tả riêng sẽ giúp nội dung được tổ chức đầy đủ hơn.",
  },
  {
    title: "Vai trò của sitemap và robots sau khi thêm canonical",
    body:
      "Canonical chỉ là một phần của bộ tín hiệu index. Sitemap giúp công cụ tìm kiếm biết những URL công khai nào nên được thu thập, còn robots giúp chặn các khu vực không phù hợp như đăng nhập, tài khoản, đặt chỗ, ví ưu đãi, trang xác nhận hoặc trang kỹ thuật. Nếu sitemap đưa vào trang không nên index, Google có thể mất thời gian crawl nhầm. Nếu robots chặn nhầm trang chuyên mục công khai, website lại mất cơ hội hiển thị. Vì vậy sau khi thêm canonical và breadcrumb, cần rà lại sitemap và robots theo nhóm trang: trang chủ, chuyên mục, trang chi tiết, bài viết và trang pháp lý index được; trang thành viên, admin, form xác nhận và trang trung gian nên noindex hoặc bị chặn phù hợp.",
  },
  {
    title: "Theo dõi Analytics cần chuẩn bị gì trên production?",
    body:
      "Google Analytics chỉ hoạt động khi website có mã đo lường thật của tài khoản GA4, thường có dạng bắt đầu bằng G-. Code có thể chuẩn bị sẵn component nhúng script, nhưng production vẫn cần biến môi trường đúng để script được xuất ra HTML và gửi dữ liệu về tài khoản của chủ website. Sau khi deploy, nên mở trang ở chế độ production, kiểm tra network request tới googletagmanager.com, dùng DebugView trong GA4 hoặc Tag Assistant để xác nhận page_view. Nếu chỉ nhìn SEOquake, công cụ có thể báo không có Analytics khi mã đo lường chưa được cấu hình. Vì vậy phần code và phần cấu hình deploy phải đi cùng nhau.",
  },
  {
    title: "Trải nghiệm mobile ảnh hưởng thế nào tới SEO on-page?",
    body:
      "Phần lớn người dùng nightlife tra cứu bằng điện thoại, đặc biệt khi đang di chuyển hoặc chuẩn bị đi chơi. Trang mobile cần có nội dung dễ quét, nút rõ, ảnh tải ổn, link nội bộ dễ chạm và không che khuất thông tin chính. SEO on-page không chỉ là thẻ meta; trải nghiệm mobile kém có thể làm người dùng thoát nhanh, giảm tương tác và khiến nội dung khó được đánh giá tốt. Với trang chủ, các khối tìm kiếm, danh mục, ưu đãi, bảng xếp hạng và cẩm nang nên xuất hiện theo thứ tự tự nhiên. Cụm FAQ/cẩm nang ở cuối trang giúp tăng nội dung mà không đẩy các hành động chính xuống dưới màn hình đầu.",
  },
  {
    title: "Quy trình cập nhật nội dung để giữ SEO bền hơn",
    body:
      "SEO cho website nightlife cần được cập nhật đều vì địa điểm, ưu đãi, tour, hình ảnh và nhu cầu người dùng thay đổi liên tục. Khi thêm một quán mới, nên kiểm tra tên, slug, khu vực, loại hình, ảnh đại diện, alt text, mô tả và liên kết tới ưu đãi liên quan. Khi một ưu đãi hết hạn, cần cập nhật trạng thái để tránh người dùng gặp thông tin cũ. Khi có bài blog hoặc guide mới, nên liên kết về chuyên mục phù hợp thay vì để bài viết đứng riêng. Quy trình này giúp sitemap sạch, canonical ổn định, breadcrumb có ý nghĩa và nội dung trang chủ luôn phản ánh đúng những phần quan trọng nhất của hệ thống.",
  },
  {
    title: "Cách viết heading để trang chủ dễ hiểu hơn",
    body:
      "Heading trên trang chủ nên phản ánh đúng vai trò của từng khối nội dung. H1 có thể là thông điệp chính hoặc banner nổi bật, còn H2 nên dành cho các chuyên mục như đề xuất tối nay, coupon, bảng xếp hạng, dịch vụ nổi bật, video và cẩm nang. Không nên dùng heading chỉ để tạo kiểu chữ lớn, vì công cụ tìm kiếm và trình đọc màn hình đều dựa vào heading để hiểu thứ tự nội dung. Với Vietyoru, các heading có nhiệm vụ dẫn người dùng từ khám phá tổng quan tới hành động cụ thể. Khi heading rõ, nội dung FAQ và cẩm nang ở cuối trang cũng không bị xem là phần rời rạc mà trở thành lớp thông tin bổ sung cho chủ đề nightlife Việt Nam.",
  },
  {
    title: "Nội dung pháp lý và độ tin cậy của website",
    body:
      "Những website có đặt chỗ, ưu đãi, tài khoản thành viên hoặc đối tác cần trình bày nội dung pháp lý rõ ràng. Chính sách bảo mật, điều khoản sử dụng và chính sách hoạt động giúp người dùng hiểu quyền lợi, giới hạn dịch vụ và cách dữ liệu được xử lý. Với SEO, các trang pháp lý không phải lúc nào cũng tạo nhiều traffic, nhưng chúng góp phần vào độ tin cậy tổng thể của website. Trang chủ nên có liên kết footer tới các trang này, còn sitemap chỉ nên đưa vào khi nội dung đã sẵn sàng index. Cách tổ chức đó giúp website tránh tình trạng Google thu thập những trang còn placeholder hoặc thông tin chưa hoàn thiện.",
  },
  {
    title: "Tối ưu nội dung cho người dùng quốc tế",
    body:
      "Nightlife tại Việt Nam có nhóm người dùng quốc tế khá rõ, đặc biệt ở các khu trung tâm, khách sạn, khu expat và địa điểm phục vụ khách du lịch. Nội dung nên ưu tiên tên khu vực dễ hiểu, mô tả loại hình dịch vụ rõ ràng, thông tin đặt chỗ đơn giản và khả năng chuyển ngôn ngữ nếu website hỗ trợ. Các từ như Vietnam nightlife guide, Hanoi nightlife, Ho Chi Minh City lounge, karaoke VIP hoặc spa relaxation có thể xuất hiện tự nhiên trong tiêu đề phụ, mô tả và bài hướng dẫn. Điều quan trọng là không trộn ngôn ngữ một cách lộn xộn trên cùng một đoạn; nội dung chính vẫn cần mạch lạc và phục vụ người đọc trước.",
  },
  {
    title: "Theo dõi chuyển đổi sau khi người dùng rời trang chủ",
    body:
      "Trang chủ thường là điểm bắt đầu, nhưng hiệu quả kinh doanh nằm ở các bước sau: người dùng mở danh sách quán, xem trang chi tiết, lưu ưu đãi, gửi yêu cầu đặt chỗ, đăng nhập hoặc liên hệ hỗ trợ. Khi Analytics đã được cấu hình, nên theo dõi các sự kiện này thay vì chỉ nhìn lượt xem trang. Dữ liệu chuyển đổi giúp biết chuyên mục nào mang lại giá trị, nội dung nào khiến người dùng đi tiếp và trang nào cần cải thiện. Với SEO, đây là vòng phản hồi quan trọng: nội dung thu hút traffic phải kết nối được với trải nghiệm thật, nếu không website có thể có lượt truy cập nhưng không tạo ra hành động hữu ích.",
  },
  {
    title: "Tối ưu nội dung theo mùa và sự kiện",
    body:
      "Nightlife thay đổi mạnh theo mùa, dịp lễ, cuối tuần, sự kiện âm nhạc, sinh nhật, tiệc công ty hoặc các giai đoạn du lịch cao điểm. Trang chủ nên có khả năng phản ánh những chủ đề này bằng banner, tour, ưu đãi hoặc bài hướng dẫn phù hợp. Khi có sự kiện mới, nội dung không chỉ cần ảnh đẹp mà còn cần mô tả rõ thời gian, khu vực, loại trải nghiệm, điều kiện đặt chỗ và trang liên quan. Cách làm này giúp người dùng hiểu nhanh giá trị của sự kiện, đồng thời giúp SEO có thêm nội dung tươi mới. Sau khi sự kiện kết thúc, nên cập nhật trạng thái hoặc chuyển hướng người dùng sang tour, danh sách quán hoặc bài viết liên quan để không tạo trang mỏng, lỗi thời.",
  },
  {
    title: "Giữ nội dung không bị trùng lặp giữa các chuyên mục",
    body:
      "Một địa điểm có thể xuất hiện ở danh sách quán, bảng xếp hạng, ưu đãi, tour hoặc bài blog. Nếu mỗi nơi lặp lại cùng một đoạn mô tả, website dễ tạo cảm giác trùng nội dung. Cách tốt hơn là để trang chi tiết giữ phần mô tả đầy đủ, còn các chuyên mục dùng đoạn giới thiệu ngắn theo ngữ cảnh. Ví dụ ưu đãi tập trung vào quyền lợi, tour tập trung vào lịch trình, bảng xếp hạng tập trung vào độ nổi bật và blog tập trung vào kinh nghiệm. Canonical giúp xác định URL gốc, nhưng chất lượng nội dung vẫn cần khác biệt tự nhiên để người dùng có lý do đi qua nhiều trang.",
  },
  {
    title: "Dữ liệu có cấu trúc nên dùng vừa đủ",
    body:
      "Schema.org hiệu quả nhất khi phản ánh nội dung thật đang có trên trang. Trang chủ có thể dùng Organization, WebSite, WebPage và BreadcrumbList. Bài viết có thể dùng Article, trang chi tiết địa điểm có thể dùng loại schema phù hợp hơn với doanh nghiệp hoặc local business nếu dữ liệu đủ. Không nên thêm quá nhiều schema không khớp nội dung chỉ để công cụ báo xanh, vì validator có thể chấp nhận cú pháp nhưng Google vẫn bỏ qua nếu dữ liệu không hữu ích. Với Vietyoru, ưu tiên hiện tại là để type rõ ràng, URL chuẩn, tên thương hiệu, mô tả, breadcrumb và mối liên hệ giữa website, tổ chức và trang chủ.",
  },
  {
    title: "Khi nào nên tạo thêm landing page SEO riêng?",
    body:
      "Trang chủ không nên gánh mọi từ khóa. Khi một nhóm truy vấn có nhu cầu riêng và đủ nội dung, nên tạo landing page hoặc chuyên mục riêng: nightlife Hà Nội, nightlife TP.HCM, lounge cao cấp, karaoke VIP, spa thư giãn, nhà hàng buổi tối hoặc tour trải nghiệm. Mỗi trang cần mục đích rõ, liên kết nội bộ, danh sách nội dung phù hợp và metadata riêng. Trang chủ lúc đó đóng vai trò trung tâm điều hướng, còn các landing page xử lý ý định tìm kiếm cụ thể hơn. Cách phân tầng này giúp website phát triển SEO bền hơn, giảm áp lực nhồi nội dung vào trang chủ và tạo đường đi tự nhiên cho người dùng.",
  },
  {
    title: "Giữ cân bằng giữa SEO và trải nghiệm đặt chỗ",
    body:
      "Một trang chủ SEO tốt không nên biến thành bài viết dài che mất hành động chính. Người dùng vẫn cần tìm quán, xem Cast, mở ưu đãi, chọn tour hoặc đi tới trang đặt chỗ thật nhanh. Vì vậy phần nội dung chuyên sâu nên nằm sau các khối chức năng quan trọng, dùng cấu trúc mở rộng để ai cần đọc thì có thể đọc, còn người muốn thao tác vẫn không bị cản trở. Cách cân bằng này phù hợp với website dịch vụ: màn hình đầu phục vụ khám phá và chuyển đổi, phần dưới bổ sung ngữ cảnh, câu hỏi thường gặp, hướng dẫn địa phương và liên kết nội bộ. Khi đo bằng SEOquake, lượng text tăng lên; khi người dùng thật truy cập, họ vẫn thấy giao diện chính trước tiên.",
  },
  {
    title: "Các chỉ số nên theo dõi sau khi sửa trang chủ",
    body:
      "Sau khi triển khai các thay đổi SEO, nên theo dõi lượt hiển thị trong Google Search Console, tỷ lệ nhấp của trang chủ, truy vấn dẫn vào các chuyên mục, thời gian tương tác, số lượt mở trang chi tiết và số hành động đặt chỗ hoặc lưu ưu đãi. Nếu một chuyên mục có nhiều lượt xem nhưng ít hành động, có thể cần cải thiện nội dung, hình ảnh hoặc lời dẫn. Nếu trang chủ có nhiều traffic nhưng người dùng không đi tiếp, liên kết nội bộ và thứ tự khối nội dung cần được xem lại. SEO bền không dừng ở việc công cụ báo xanh; nó cần dữ liệu thật để biết người dùng có tìm được thứ họ cần hay không. Khi dữ liệu đủ lớn, nên so sánh nhóm người dùng đi từ Google với nhóm đi từ mạng xã hội, quảng cáo hoặc truy cập trực tiếp để biết nội dung organic đang đóng góp ở bước nào trong hành trình. Những chỉ số này cũng giúp quyết định nên mở rộng trang nào trước, ví dụ thêm landing page địa phương, bổ sung bài hướng dẫn hoặc cải thiện trang ưu đãi đang có nhu cầu cao. Việc đo đều theo tuần giúp phát hiện sớm khi một route mất index, một ưu đãi hết hạn hoặc một chuyên mục cần thêm nội dung hỗ trợ. Đây cũng là cơ sở để ưu tiên nội dung theo doanh thu thay vì chỉ theo lượt xem.",
  },
  {
    title: "Cách giữ trang chủ gọn sau khi thêm nhiều nội dung SEO",
    body:
      "Khi cần tăng nội dung cho SEO nhưng vẫn giữ trang chủ dễ dùng, cách hợp lý là gom phần kiến thức dài vào các mục mở rộng ở cuối trang. Người dùng mới vẫn thấy ngay tìm kiếm, banner, danh mục, ưu đãi, bảng xếp hạng và các lối đi quan trọng. Người muốn đọc sâu có thể mở từng mục cẩm nang để hiểu cách chọn khu vực, so sánh dịch vụ, dùng coupon, theo dõi Analytics hoặc đánh giá hiệu quả SEO. Cách tổ chức này tránh nhồi chữ ở màn hình đầu, đồng thời vẫn tạo đủ nội dung có ngữ cảnh cho công cụ tìm kiếm. Khi sau này có blog hoặc landing page chuyên sâu hơn, các mục này có thể rút gọn và chuyển thành liên kết tới bài viết riêng.",
  },
];

export default function Page() {
  return (
    <>
      <script
        id="home-webpage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageStructuredData) }}
      />
      <BreadcrumbJsonLd items={[{ name: "Trang chủ", path: "/" }]} idPath="/" />
      <HomePageClient />
      <HomeSeoContent />
    </>
  );
}

function HomeSeoContent() {
  return (
    <section
      className="nl-home-seo-content"
      data-no-scroll-reveal="true"
      aria-labelledby="home-seo-title"
    >
      <div className="nl-home-seo-inner">
        <div className="nl-home-seo-heading">
          <p>Nightlife guide Vietnam</p>
          <h2 id="home-seo-title">Vietyoru - cẩm nang nightlife, quán đẹp và ưu đãi tại Việt Nam</h2>
        </div>

        <div className="nl-home-seo-copy">
          <p>
            Vietyoru giúp người dùng khám phá nightlife Việt Nam theo cách rõ ràng và dễ chọn hơn:
            tìm quán bar, lounge, karaoke, nhà hàng, spa, Cast, tour trải nghiệm và các ưu đãi đang
            hoạt động tại Hà Nội, TP.HCM cùng nhiều khu vực nổi bật. Nội dung trên trang chủ được tổ
            chức để người dùng nhanh chóng so sánh địa điểm, xem khu vực, nhận diện dịch vụ phù hợp
            và đi tiếp tới trang chi tiết trước khi đặt chỗ.
          </p>
          <p>
            Với nhóm người dùng mới, trang chủ đóng vai trò như bản đồ tổng quan: danh mục dịch vụ,
            bảng xếp hạng, ưu đãi, video nổi bật và bài hướng dẫn được gom về một luồng duy nhất.
            Các liên kết nội bộ tới danh sách quán, danh sách Cast, ưu đãi, tour, spa và nhà hàng
            giúp Google hiểu cấu trúc website, đồng thời giúp khách truy cập tìm đúng trang chuyên
            mục thay vì chỉ xem một banner riêng lẻ.
          </p>
          <p>
            Dữ liệu quán và dịch vụ được trình bày theo nhu cầu thực tế như khu vực, loại hình, mức
            giá tham khảo, ưu đãi, trạng thái đặt chỗ và nội dung hướng dẫn. Cách tổ chức này hỗ trợ
            trải nghiệm on-page SEO: trang chủ có nội dung mô tả rõ chủ đề, có liên kết tới các cụm
            nội dung chính và bổ sung ngữ cảnh cho các thẻ canonical, breadcrumb, schema.org và Open
            Graph đang dùng trên website.
          </p>
        </div>

        <nav className="nl-home-seo-links" aria-label="Liên kết nội bộ trang chủ">
          <Link href="/danh-sach-quan">Tìm quán nightlife</Link>
          <Link href="/danh-sach-cast">Danh sách Cast</Link>
          <Link href="/uu-dai">Ưu đãi thành viên</Link>
          <Link href="/tour">Tour trải nghiệm</Link>
          <Link href="/spa">Spa thư giãn</Link>
          <Link href="/nha-hang">Nhà hàng</Link>
        </nav>

        <div className="nl-home-seo-faq" aria-label="Câu hỏi thường gặp về nightlife">
          {homeSeoFaqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>

        <div className="nl-home-seo-faq nl-home-seo-guide" aria-label="Cẩm nang nightlife chuyên sâu">
          {homeSeoGuideItems.map((item) => (
            <details key={item.title}>
              <summary>{item.title}</summary>
              <p>{item.body}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
