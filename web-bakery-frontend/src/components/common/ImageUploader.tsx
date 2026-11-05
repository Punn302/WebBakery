import React, { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadApi } from '@/api'
import { optimizeCloudinaryUrl } from '@/utils/format'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  className?: string
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange, className }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn định dạng hình ảnh (JPG, PNG, WEBP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB')
      return
    }

    try {
      setIsUploading(true)
      const res = await uploadApi.uploadImage(file)
      onChange(res.url)
      toast.success('Tải ảnh lên thành công!')
    } catch {
      toast.error('Tải ảnh thất bại, vui lòng thử lại!')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0])
          }
        }}
      />

      {value ? (
        <div className="relative border border-[#e7e5e4] bg-[#faf8f5] p-2 flex items-center gap-4">
          <img
            src={optimizeCloudinaryUrl(value, 200)}
            alt="Preview"
            className="w-20 h-20 object-cover border border-[#e7e5e4]"
          />
          <div className="flex-1 min-w-0 text-xs">
            <p className="font-semibold text-[#1c1917] truncate">{value}</p>
            <p className="text-[#78716c] mt-0.5">Ảnh đã tải lên Cloudinary CDN</p>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 text-[#a8a29e] hover:text-[#dc2626] transition-colors cursor-pointer"
            title="Gỡ ảnh"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed border-[#d6d3d1] bg-[#faf8f5] hover:bg-[#f4efe6]/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors',
            isDragOver && 'border-[#47654c] bg-[#47654c]/5'
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 text-[#47654c] animate-spin" />
              <p className="text-xs text-[#78716c]">Đang tải ảnh lên Cloudinary...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-white border border-[#e7e5e4] flex items-center justify-center text-[#78716c]">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1c1917]">
                  Kéo thả ảnh vào đây hoặc click để chọn tệp
                </p>
                <p className="text-[11px] text-[#a8a29e] mt-0.5">
                  Hỗ trợ JPG, PNG, WEBP tối đa 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
