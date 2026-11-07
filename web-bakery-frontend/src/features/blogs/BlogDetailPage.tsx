import React from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Share2,
  CheckCircle2,
  Bookmark,
} from 'lucide-react'
import { BLOG_POSTS } from './blogData'
import { toast } from 'sonner'

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()

  const post = BLOG_POSTS.find((p) => p.slug === slug) || BLOG_POSTS[0]
  const relatedPosts = BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 3)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Đã sao chép liên kết bài viết!')
  }

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 sm:space-y-14 pb-16">
      {/* 1. BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-xs text-[#6B6661] font-text flex-wrap">
        <Link to="/" className="hover:text-[#006561] transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#9A938C]" />
        <Link to="/blogs" className="hover:text-[#006561] transition-colors">
          Kiến thức sống lành
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#9A938C]" />
        <span className="text-[#006561] font-semibold truncate max-w-xs sm:max-w-md">
          {post.title}
        </span>
      </nav>

      {/* 2. ARTICLE HEADER */}
      <div className="max-w-3xl mx-auto space-y-4 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C9785C] bg-[#C9785C]/10 px-3.5 py-1 rounded-full font-text">
          {post.category}
        </span>

        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#2A2725] leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-center gap-3 text-xs text-[#6B6661] font-mono flex-wrap pt-2">
          <span className="flex items-center gap-1 font-text">
            <User className="w-3.5 h-3.5 text-[#006561]" />
            {post.author}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {post.date}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime}
          </span>
        </div>
      </div>

      {/* 3. FEATURED IMAGE */}
      <div className="max-w-4xl mx-auto relative aspect-[16/9] rounded-3xl overflow-hidden border border-[#E5E2DF] shadow-xs">
        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
      </div>

      {/* 4. EDITORIAL BODY */}
      <div className="max-w-3xl mx-auto space-y-8 font-text text-sm sm:text-base text-[#2A2725] leading-relaxed">
        {/* Lead Excerpt */}
        <p className="font-medium text-base sm:text-lg text-[#6B6661] leading-relaxed border-l-4 border-[#006561] pl-4 italic">
          {post.excerpt}
        </p>

        {/* Content Paragraphs */}
        {post.content.map((p, i) => (
          <p key={i}>{p}</p>
        ))}

        {/* Cormorant Garamond Quote Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#FEFBF4] border border-[#E5E2DF] text-center space-y-2">
          <p className="font-serif text-xl sm:text-2xl text-[#2A2725] italic leading-snug">
            “Chọn nguyên liệu kỹ, làm chỉn chu — HeBekery đồng hành cùng lối sống lành mạnh của
            bạn.”
          </p>
          <span className="text-xs uppercase tracking-widest text-[#C9785C] font-bold font-text">
            HeBekery Health &amp; Beauty Foods
          </span>
        </div>

        {/* Useful Tips Card */}
        {post.tips && post.tips.length > 0 && (
          <div className="p-6 rounded-2xl bg-white border border-[#E5E2DF] space-y-3 shadow-xs">
            <h3 className="font-display font-bold text-base text-[#006561] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c8983d]" />
              <span>Lời khuyên hữu ích từ chuyên gia:</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#6B6661]">
              {post.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#006561] shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Share & Actions */}
        <div className="pt-6 border-t border-[#E5E2DF] flex items-center justify-between">
          <span className="text-xs text-[#6B6661]">Chia sẻ bài viết này:</span>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E2DF] bg-white text-xs font-bold text-[#006561] hover:bg-[#006561]/8 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Sao chép liên kết</span>
          </button>
        </div>
      </div>

      {/* 5. BAKERY PROMO CALLOUT */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-[#006561] text-[#FEFBF4] p-8 sm:p-12 text-center space-y-4 shadow-sm">
        <span className="text-xs uppercase tracking-widest text-[#E2F4E0] font-bold">
          Dinh dưỡng thuần khiết
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold">
          Bắt đầu lối sống lành mạnh cùng HeBekery
        </h2>
        <p className="text-xs sm:text-sm text-[#f6e9df]/90 max-w-lg mx-auto leading-relaxed">
          Thực phẩm dinh dưỡng nướng mẻ nhỏ mỗi sáng, không đường tinh luyện, giàu chất xơ hòa tan.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-[#FEFBF4] text-[#006561] font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full hover:bg-white transition-all shadow-xs"
        >
          <span>Khám phá thực đơn bánh</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 6. RELATED ARTICLES */}
      <div className="max-w-4xl mx-auto space-y-6 pt-6">
        <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2A2725]">
          Bài viết liên quan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {relatedPosts.map((p) => (
            <Link
              key={p.id}
              to={`/blogs/${p.slug}`}
              className="group bg-white rounded-2xl border border-[#E5E2DF] overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#FEFBF4]">
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 space-y-2">
                <span className="text-[10px] text-[#C9785C] font-bold uppercase">
                  {p.category}
                </span>
                <h4 className="font-display font-bold text-xs sm:text-sm text-[#2A2725] group-hover:text-[#006561] transition-colors line-clamp-2">
                  {p.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
