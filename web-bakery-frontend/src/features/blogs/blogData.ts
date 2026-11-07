export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  author: string
  imageUrl: string
  readTime: string
  content: string[]
  tips?: string[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'yoga-la-gi-loi-ich-cua-viec-thuc-hanh-yoga-doi-voi-me-sau-sinh',
    title: 'Yoga là gì? Lợi ích của việc thực hành yoga đối với mẹ sau sinh',
    excerpt:
      'Tập yoga nhẹ nhàng giúp các mẹ bỉm sữa phục hồi cơ sàn chậu, giảm căng thẳng stress và lấy lại vóc dáng thon gọn tự nhiên kết hợp cùng chế độ ăn dinh dưỡng.',
    category: 'Sống lành & Tập luyện',
    date: '24/10/2026',
    author: 'Chuyên gia dinh dưỡng HeBekery',
    imageUrl:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
    readTime: '5 phút đọc',
    content: [
      'Sau khi sinh, cơ thể người phụ nữ trải qua nhiều biến đổi lớn về cả thể chất lẫn tinh thần. Việc phục hồi vóc dáng cần sự kiên nhẫn và phương pháp an toàn, không nên ép cân bằng cách nhịn ăn tiêu cực.',
      'Yoga sau sinh là một trong những bộ môn nhẹ nhàng và hiệu quả nhất, giúp làm săn chắc cơ bụng, giải tỏa căng thẳng và cải thiện chất lượng giấc ngủ.',
      'Bên cạnh việc vận động, việc nạp năng lượng bằng các bữa phụ giàu chất xơ hòa tan và protein thực vật như Biscotti nguyên cám và Granola siêu hạt giúp mẹ đủ sữa mà không lo tăng mỡ thừa.',
    ],
    tips: [
      'Bắt đầu tập nhẹ nhàng sau sinh 6-8 tuần đối với sinh thường.',
      'Kết hợp uống đủ 2-2.5 lít nước ấm mỗi ngày.',
      'Dùng bữa phụ lành mạnh trước buổi tập 30 phút với 2 lát bánh Biscotti.',
    ],
  },
  {
    id: '2',
    slug: 'tai-sao-me-cho-con-bu-nen-an-qua-oc-cho',
    title: 'Tại Sao Mẹ Cho Con Bú Nên Ăn Quả Óc Chó & Hạt Dinh Dưỡng?',
    excerpt:
      'Quả óc chó chứa lượng Omega-3, DHA và Folate tự nhiên dồi dào, là chìa khóa vàng phát triển não bộ và thị giác của bé qua dòng sữa mẹ thơm mát.',
    category: 'Dinh dưỡng Mẹ & Bé',
    date: '18/10/2026',
    author: 'Bếp Bánh HeBekery',
    imageUrl:
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=800&auto=format&fit=crop',
    readTime: '4 phút đọc',
    content: [
      'Quả óc chó và hạt hạnh nhân từ lâu đã được mệnh danh là “vua của các loại hạt” nhờ hàm lượng axit béo không bão hòa đơn và đa cực kỳ quý giá.',
      'Đối với mẹ đang cho con bú, ăn óc chó thường xuyên giúp sữa mẹ đặc sánh hơn, tăng lượng chất béo tốt và bổ sung canxi tự nhiên cho xương khớp.',
      'HeBekery kết hợp hạt óc chó Chile nhập khẩu cùng yến mạch và mật ong hoa nhãn trong mẻ bánh Granola Siêu Hạt nướng mộc tươi mới mỗi sáng.',
    ],
    tips: [
      'Nên ăn từ 4-6 quả óc chó hoặc 30g granola hạt mỗi ngày.',
      'Bảo quản hạt trong hũ thủy tinh kín nắp hoặc ngăn mát tủ lạnh.',
    ],
  },
  {
    id: '3',
    slug: 'loi-ich-tuyet-voi-cua-yen-mach-trong-che-do-an-uong',
    title: 'Lợi Ích Tuyệt Vời Của Yến Mạch Tươi Trong Chế Độ Ăn Eat Clean',
    excerpt:
      'Beta-glucan trong yến mạch nguyên cám giúp ổn định đường huyết, hạ cholesterol xấu và tạo cảm giác no lâu bền vững suốt 4-5 tiếng.',
    category: 'Ăn uống lành mạnh',
    date: '12/10/2026',
    author: 'Đội ngũ R&D HeBekery',
    imageUrl:
      'https://images.unsplash.com/photo-1517673400267-0251440c45dc?q=80&w=800&auto=format&fit=crop',
    readTime: '6 phút đọc',
    content: [
      'Yến mạch là nguồn carbohydrate phức hợp hoàn hảo cho những ai muốn giảm mỡ tự nhiên mà không bị hạ đường huyết hay mệt mỏi.',
      'Nhờ chỉ số đường huyết thấp (Low GI), yến mạch giải phóng năng lượng từ từ vào máu, ngăn chặn các cơn thèm ăn vặt giữa buổi làm việc.',
      'Tại HeBekery, chúng tôi sử dụng 100% yến mạch tươi nguyên cám cán vỡ, kết hợp nướng mật ong ở nhiệt độ thấp để giữ nguyên vi chất dinh dưỡng.',
    ],
    tips: [
      'Thưởng thức yến mạch nướng Granola cùng sữa chua không đường và dâu tây.',
      'Thích hợp dùng cho bữa sáng nhanh gọn hoặc bữa phụ trước giờ tập gym.',
    ],
  },
  {
    id: '4',
    slug: 'banh-biscotti-nguyen-cam-mon-an-vat-lanh-manh',
    title: 'Bánh Biscotti Nguyên Cám: Món Ăn Vặt Lành Mạnh Cho Dân Văn Phòng',
    excerpt:
      'Nướng 2 lần theo công thức cổ điển nước Ý, hoàn toàn không dầu chiên và không đường tinh luyện, Biscotti là bạn đồng hành lý tưởng bên tách trà chiều.',
    category: 'Kiến thức bánh Healthy',
    date: '05/10/2026',
    author: 'Thợ làm bánh HeBekery',
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
    readTime: '4 phút đọc',
    content: [
      'Dân văn phòng thường xuyên đối mặt với cơn đói lúc 3-4 giờ chiều. Chọn các loại bánh ngọt nhiều đường hóa học sẽ gây tích mỡ bụng và uể oải.',
      'Biscotti HeBekery được nướng 2 lần giòn rụm với 4 vị đặc sắc: Trái cây hạt, Cacao Đắk Lắk, Matcha Nhật Bản và Phô mai mặn ít béo.',
      'Mỗi lát bánh chỉ chứa khoảng 55-60 kcal, giàu chất xơ và đạm thực vật từ hạt hạnh nhân, hạt bí và nho khô tự nhiên.',
    ],
    tips: [
      'Nhúng nhẹ vào cà phê đen hoặc trà hoa cúc ấm để bánh tan giòn trong miệng.',
      'Đậy kín nắp hộp sau khi mở để bánh giữ độ giòn tan suốt 6 tháng.',
    ],
  },
]
