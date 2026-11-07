import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Sparkles, Calendar, Clock, ArrowRight, ChevronRight, BookOpen } from 'lucide-react'
import { BLOG_POSTS, type BlogPost } from './blogData'

const BLOG_CATEGORIES = [
  'Tất cả',
  'Ăn uống lành mạnh',
  'Dinh dưỡng Mẹ & Bé',
  'Sống lành & Tập luyện',
  'Kiến thức bánh Healthy',
]

export const BlogListPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')

  const filteredPosts =
    selectedCategory === 'Tất cả'
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === selectedCategory)

  const featuredPost = BLOG_POSTS[0]

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12 sm:space-y-16 pb-16">
      {/* 1. BREADCRUMBS */}
      <nav className="flex items-center gap-2 text-xs text-[#6B6661] font-text">
        <Link to="/" className="hover:text-[#006561] transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#9A938C]" />
        <span className="text-[#006561] font-semibold">Kiến thức sống lành</span>
      </nav>

      {/* 2. HEADER BANNER */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#006561]/8 text-[#006561] text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#C9785C]" />
          <span>Góc Chia Sẻ HeBekery</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2A2725] tracking-tight">
          Kiến Thức Dinh Dưỡng &amp; Sống Lành
        </h1>

        <p className="text-xs sm:text-sm text-[#6B6661] font-text leading-relaxed">
          Bí quyết ăn đúng, sống khỏe và hiểu rõ nguồn dinh dưỡng nạp vào cơ thể mỗi ngày từ các
          chuyên gia làm bánh lành mạnh.
        </p>
      </div>

      {/* 3. CATEGORY PILL FILTER */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 flex-wrap">
        {BLOG_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#006561] text-[#FEFBF4] shadow-xs'
                : 'bg-white border border-[#E5E2DF] text-[#6B6661] hover:text-[#2A2725] hover:border-[#006561]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. FEATURED HERO POST */}
      {featuredPost && selectedCategory === 'Tất cả' && (
        <div className="bg-white rounded-3xl border border-[#E5E2DF] overflow-hidden shadow-xs hover:shadow-md transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 relative aspect-[16/10] overflow-hidden">
              <img
                src={featuredPost.imageUrl}
                alt={featuredPost.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-[#006561] text-[#FEFBF4] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Bài viết nổi bật
              </span>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-10 space-y-4">
              <div className="flex items-center gap-3 text-xs text-[#6B6661] font-mono">
                <span className="text-[#C9785C] font-bold uppercase font-text">
                  {featuredPost.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {featuredPost.date}
                </span>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2A2725] hover:text-[#006561] transition-colors leading-snug">
                <Link to={`/blogs/${featuredPost.slug}`}>{featuredPost.title}</Link>
              </h2>

              <p className="text-xs sm:text-sm text-[#6B6661] line-clamp-3 leading-relaxed font-text">
                {featuredPost.excerpt}
              </p>

              <Link
                to={`/blogs/${featuredPost.slug}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#006561] hover:gap-3 transition-all pt-2"
              >
                <span>Đọc bài viết chi tiết</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. ARTICLE GRID (3 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="group bg-white rounded-2xl border border-[#E5E2DF] overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-[#006561]/40 transition-all cursor-pointer"
          >
            <div>
              <Link
                to={`/blogs/${post.slug}`}
                className="block relative aspect-[16/10] overflow-hidden bg-[#FEFBF4]"
              >
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-[#2A2725] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-text shadow-2xs">
                  {post.category}
                </span>
              </Link>

              <div className="p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-[11px] text-[#9A938C] font-mono">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                <h3 className="font-display font-bold text-base text-[#2A2725] group-hover:text-[#006561] transition-colors line-clamp-2 leading-snug">
                  <Link to={`/blogs/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="text-xs text-[#6B6661] line-clamp-2 leading-relaxed font-text">
                  {post.excerpt}
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-1 border-t border-[#E5E2DF]/60 flex items-center justify-between text-xs">
              <span className="text-[#9A938C] font-medium">{post.author}</span>
              <Link
                to={`/blogs/${post.slug}`}
                className="font-bold text-[#006561] flex items-center gap-1 group-hover:translate-x-1 transition-transform"
              >
                <span>Xem &gt;</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
