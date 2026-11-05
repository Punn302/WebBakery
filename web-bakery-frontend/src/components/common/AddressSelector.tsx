import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Check, Plus, Star } from 'lucide-react'
import { addressApi } from '@/api'
import type { Address } from '@/types'
import { cn } from '@/utils/cn'

interface AddressSelectorProps {
  selectedAddressId?: string | null
  onSelectAddress: (address: Address) => void
  onSelectManual: () => void
  isManualSelected: boolean
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddressId,
  onSelectAddress,
  onSelectManual,
  isManualSelected,
}) => {
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: addressApi.getAddresses,
  })

  // Auto-select default address on first load if nothing selected yet
  React.useEffect(() => {
    if (!selectedAddressId && !isManualSelected && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.defaultAddress) || addresses[0]
      if (defaultAddr) {
        onSelectAddress(defaultAddr)
      }
    }
  }, [addresses, selectedAddressId, isManualSelected, onSelectAddress])

  if (isLoading) {
    return (
      <div className="p-4 border border-[#e7e5e4] bg-[#faf8f5] text-xs text-[#78716c] animate-pulse">
        Đang nạp sổ địa chỉ nhận hàng...
      </div>
    )
  }

  if (addresses.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#1c1917] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#47654c]" />
          <span>Chọn từ sổ địa chỉ của bạn</span>
        </label>
        <span className="text-[11px] text-[#78716c]">
          {addresses.length} địa chỉ đã lưu
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addresses.map((addr) => {
          const isSelected = !isManualSelected && selectedAddressId === addr.id
          return (
            <div
              key={addr.id}
              onClick={() => onSelectAddress(addr)}
              className={cn(
                'relative p-3.5 border cursor-pointer transition-all select-none',
                isSelected
                  ? 'border-[#47654c] bg-[#47654c]/5 ring-1 ring-[#47654c]'
                  : 'border-[#e7e5e4] bg-white hover:border-[#a8a29e] hover:bg-[#faf8f5]'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#1c1917]">{addr.receiverName}</span>
                    <span className="text-[11px] text-[#78716c]">({addr.phone})</span>
                  </div>
                  <p className="text-[11px] text-[#57534e] line-clamp-2 leading-relaxed">
                    {addr.fullAddress || `${addr.addressLine}, ${addr.ward || ''}, ${addr.district || ''}, ${addr.province || ''}`}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  {addr.defaultAddress && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#d97724] text-white">
                      <Star className="w-2.5 h-2.5 fill-current" /> Mặc định
                    </span>
                  )}
                  {isSelected && (
                    <div className="w-4 h-4 bg-[#47654c] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Option: Enter a new address */}
        <div
          onClick={onSelectManual}
          className={cn(
            'p-3.5 border border-dashed cursor-pointer transition-all flex items-center justify-center gap-2 select-none min-h-[76px]',
            isManualSelected
              ? 'border-[#47654c] bg-[#47654c]/5 ring-1 ring-[#47654c] text-[#47654c]'
              : 'border-[#d6d3d1] bg-white hover:border-[#1c1917] text-[#57534e]'
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs font-semibold">Giao đến địa chỉ mới khác</span>
        </div>
      </div>
    </div>
  )
}
