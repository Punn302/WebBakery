import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User as UserIcon,
  ShoppingBag,
  MapPin,
  Ticket,
  Crown,
  Lock,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit2,
  Star,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCcw,
  Truck,
  Package,
  XCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Coins,
  CreditCard,
  Award,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { addressApi, orderApi, voucherApi, userApi, loyaltyApi } from '@/api'
import type { Address, AddressRequest, Order, Voucher, LoyaltySummary, LoyaltyTransaction } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDate } from '@/utils/format'

type TabType = 'profile' | 'orders' | 'addresses' | 'vouchers' | 'loyalty'

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth()
  const { addItem, setIsCartOpen } = useCart()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<TabType>('profile')

  // --- Profile Edit State ---
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  // --- Password Change State ---
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [isChangingPw, setIsChangingPw] = useState(false)

  // --- Address Book State ---
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState<AddressRequest>({
    receiverName: '',
    phone: '',
    province: 'TP. Hồ Chí Minh',
    district: '',
    ward: '',
    addressLine: '',
    defaultAddress: false,
  })

  // --- Order Status Filter & Detail Modal ---
  const [orderFilter, setOrderFilter] = useState<string>('ALL')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // --- Cancel & Return Order States ---
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null)
  const [cancelReason, setCancelReason] = useState('Thay đổi nhu cầu đặt hàng')
  const [returnOrder, setReturnOrder] = useState<Order | null>(null)
  const [returnReason, setReturnReason] = useState('')

  // --- Copied Voucher State ---
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // ================= QUERIES =================
  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: addressApi.getAddresses,
    enabled: !!user,
  })

  const { data: myOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: orderApi.getMyOrders,
    enabled: !!user,
    staleTime: 30_000,
  })

  const { data: vouchers = [], isLoading: isLoadingVouchers } = useQuery({
    queryKey: ['profile-vouchers'],
    queryFn: voucherApi.getAvailable,
    staleTime: 60_000,
  })

  // Loyalty & VVIP Queries
  const { data: loyaltyProfile } = useQuery<LoyaltySummary>({
    queryKey: ['loyalty-profile'],
    queryFn: loyaltyApi.getProfile,
    enabled: !!user,
  })

  const { data: loyaltyTxData } = useQuery({
    queryKey: ['loyalty-transactions'],
    queryFn: () => loyaltyApi.getTransactions(0, 20),
    enabled: !!user,
  })

  const { data: loyaltyTiers = [] } = useQuery({
    queryKey: ['loyalty-tiers'],
    queryFn: loyaltyApi.getTiers,
  })

  // ================= MUTATIONS =================
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name: string; phone?: string }) => userApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Cập nhật thông tin tài khoản thành công!')
      setIsUpdatingProfile(false)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Không thể cập nhật hồ sơ')
      setIsUpdatingProfile(false)
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userApi.changePassword(data),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsChangingPw(false)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Mật khẩu hiện tại không chính xác')
      setIsChangingPw(false)
    },
  })

  const createAddressMutation = useMutation({
    mutationFn: (data: AddressRequest) => addressApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
      toast.success('Đã lưu địa chỉ mới vào sổ')
      closeAddressDialog()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Không thể lưu địa chỉ')
    },
  })

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddressRequest }) =>
      addressApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
      toast.success('Cập nhật địa chỉ thành công')
      closeAddressDialog()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Không thể cập nhật địa chỉ')
    },
  })

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => addressApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
      toast.success('Đã xóa địa chỉ khỏi sổ')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Không thể xóa địa chỉ')
    },
  })

  const cancelOrderMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      orderApi.cancelOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('Hủy đơn hàng thành công')
      setCancelOrder(null)
      setCancelReason('Thay đổi nhu cầu đặt hàng')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Không thể hủy đơn hàng')
    },
  })

  const returnOrderMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      orderApi.requestReturn(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('Đã gửi yêu cầu đổi trả đơn hàng!')
      setReturnOrder(null)
      setReturnReason('')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Không thể gửi yêu cầu đổi trả')
    },
  })

  const confirmReceivedMutation = useMutation({
    mutationFn: (id: string) => orderApi.confirmReceived(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('Xác nhận đã nhận hàng thành công!')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Không thể xác nhận nhận hàng')
    },
  })

  // ================= HANDLERS =================
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Họ tên không được để trống')
      return
    }
    setIsUpdatingProfile(true)
    updateProfileMutation.mutate({ name: name.trim(), phone: phone.trim() })
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    setIsChangingPw(true)
    changePasswordMutation.mutate({ currentPassword, newPassword })
  }

  const openCreateAddressDialog = () => {
    setEditingAddress(null)
    setFormData({
      receiverName: user?.name || '',
      phone: user?.phone || '',
      province: 'TP. Hồ Chí Minh',
      district: '',
      ward: '',
      addressLine: '',
      defaultAddress: addresses.length === 0,
    })
    setIsDialogOpen(true)
  }

  const openEditAddressDialog = (addr: Address) => {
    setEditingAddress(addr)
    setFormData({
      receiverName: addr.receiverName,
      phone: addr.phone,
      province: addr.province || 'TP. Hồ Chí Minh',
      district: addr.district || '',
      ward: addr.ward || '',
      addressLine: addr.addressLine || '',
      defaultAddress: !!addr.defaultAddress,
    })
    setIsDialogOpen(true)
  }

  const closeAddressDialog = () => {
    setIsDialogOpen(false)
    setEditingAddress(null)
  }

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.receiverName.trim() || !formData.phone.trim() || !formData.addressLine.trim()) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc')
      return
    }
    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data: formData })
    } else {
      createAddressMutation.mutate(formData)
    }
  }

  const handleSetDefaultAddress = (addr: Address) => {
    updateAddressMutation.mutate({
      id: addr.id,
      data: {
        receiverName: addr.receiverName,
        phone: addr.phone,
        province: addr.province || 'TP. Hồ Chí Minh',
        district: addr.district || '',
        ward: addr.ward || '',
        addressLine: addr.addressLine || '',
        defaultAddress: true,
      },
    })
  }

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Đã sao chép mã giảm giá: ${code}`)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  const handleReorder = async (order: Order) => {
    if (!order.items || order.items.length === 0) {
      toast.error('Đơn hàng không có sản phẩm để mua lại')
      return
    }
    for (const it of order.items) {
      await addItem(
        {
          id: it.productId,
          name: it.productName,
          price: it.price,
          imageUrl: it.imageUrl,
          active: true,
          stock: 50,
          lowStockThreshold: 5,
          category: { id: 1, name: 'Bánh HeBekery', slug: 'banh-hebekery', active: true },
          description: it.productName,
        },
        it.quantity
      )
    }
    toast.success(`Đã thêm toàn bộ sản phẩm đơn #${order.id} vào giỏ hàng!`)
    setIsCartOpen(true)
  }

  // Calculate Loyalty Tier & Points
  const totalSpent = loyaltyProfile?.totalSpent ?? myOrders
    .filter((o) => o.orderStatus === 'DELIVERED')
    .reduce((sum, o) => sum + (o.total || 0), 0)
  const loyaltyPoints = loyaltyProfile?.loyaltyPoints ?? 0

  const tierKey = loyaltyProfile?.membershipTier || 'BRONZE'
  const tierName = loyaltyProfile?.tierDisplayName || 'Mầm Xanh (Bronze)'
  const nextTierName = loyaltyProfile?.nextTierName || 'Hạt Lành'
  const nextTierThreshold = loyaltyProfile?.nextTierThreshold || 1000000
  const tierProgress = loyaltyProfile?.progressPercent || Math.min(100, Math.round((totalSpent / nextTierThreshold) * 100))

  const badgeColor =
    tierKey === 'DIAMOND'
      ? 'bg-neutral-900 border border-amber-400 text-amber-300'
      : tierKey === 'GOLD'
      ? 'bg-amber-600 text-white'
      : tierKey === 'SILVER'
      ? 'bg-slate-500 text-white'
      : 'bg-[#006561] text-white'

  // Filtered Orders
  const filteredOrders = myOrders.filter((o) => {
    if (orderFilter === 'ALL') return true
    return o.orderStatus === orderFilter
  })

  if (!user) return null

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen py-8 sm:py-12">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#6B6661]">
          <Link to="/" className="hover:text-[#006561] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#2A2725] font-semibold">Tài khoản của tôi</span>
        </nav>

        {/* Member Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2DF] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#006561] text-[#FEFBF4] flex items-center justify-center font-display font-bold text-2xl sm:text-3xl select-none ring-4 ring-[#FAF7F2] shadow-sm shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2A2725]">
                  {user.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold text-white uppercase tracking-wider ${badgeColor}`}
                >
                  <Crown className="w-3 h-3" />
                  {tierName}
                </span>
                {user.role === 'ADMIN' && (
                  <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 text-[10px]">
                    Quản trị viên
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B6661]">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#006561]" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#006561]" />
                  {user.phone || 'Chưa có SĐT'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user.role === 'ADMIN' && (
              <Link to="/admin">
                <Button
                  variant="outline"
                  className="rounded-full border-[#006561] text-[#006561] hover:bg-[#006561] hover:text-white text-xs font-bold px-4"
                >
                  Vào trang Admin
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              onClick={logout}
              className="rounded-full border-[#E5E2DF] text-[#6B6661] hover:text-red-600 hover:border-red-200 text-xs px-4"
            >
              Đăng xuất
            </Button>
          </div>
        </div>

        {/* 5-Tab Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#E5E2DF]">
          {[
            { id: 'profile', label: 'Hồ sơ cá nhân & Mật khẩu', icon: UserIcon },
            { id: 'orders', label: `Đơn hàng của tôi (${myOrders.length})`, icon: ShoppingBag },
            { id: 'addresses', label: `Sổ địa chỉ (${addresses.length})`, icon: MapPin },
            { id: 'vouchers', label: `Ví Voucher (${vouchers.length})`, icon: Ticket },
            { id: 'loyalty', label: 'Hebekery VVIP Member', icon: Crown },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#006561] text-white shadow-xs'
                    : 'bg-white text-[#6B6661] hover:text-[#2A2725] border border-[#E5E2DF] hover:border-[#006561]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#006561]'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ================= TAB 1: PROFILE & PASSWORD ================= */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Card: Update Personal Info */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2DF] shadow-xs space-y-6">
              <div className="border-b border-[#E5E2DF] pb-4 space-y-1">
                <h2 className="font-display text-lg font-bold text-[#2A2725] flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-[#006561]" />
                  <span>Thông tin cá nhân</span>
                </h2>
                <p className="text-xs text-[#6B6661]">
                  Cập nhật họ tên và số điện thoại để Hebekery phục vụ bạn chu đáo nhất
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                    className="rounded-xl border-[#E5E2DF] focus:border-[#006561] text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                    Email đăng nhập (Không thể thay đổi)
                  </label>
                  <div className="relative">
                    <Input
                      value={user.email}
                      disabled
                      className="rounded-xl border-[#E5E2DF] bg-stone-50 text-stone-500 text-sm pl-10 cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Đã xác thực
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                    Số điện thoại nhận bánh
                  </label>
                  <div className="relative">
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0987 654 321"
                      className="rounded-xl border-[#E5E2DF] focus:border-[#006561] text-sm pl-10"
                    />
                    <Phone className="w-4 h-4 text-[#006561] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="btn-act rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {isUpdatingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Card: Change Password */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2DF] shadow-xs space-y-6">
              <div className="border-b border-[#E5E2DF] pb-4 space-y-1">
                <h2 className="font-display text-lg font-bold text-[#2A2725] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#C9785C]" />
                  <span>Đổi mật khẩu</span>
                </h2>
                <p className="text-xs text-[#6B6661]">
                  Đổi mật khẩu định kỳ để nâng cao bảo mật tài khoản cá nhân
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="rounded-xl border-[#E5E2DF] focus:border-[#006561] text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      required
                      className="rounded-xl border-[#E5E2DF] focus:border-[#006561] text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    className="rounded-xl border-[#E5E2DF] focus:border-[#006561] text-sm"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isChangingPw}
                    className="bg-[#2A2725] hover:bg-[#000] text-white rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {isChangingPw ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MY ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Status Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'PENDING', label: 'Chờ thanh toán / xác nhận' },
                { id: 'CONFIRMED', label: 'Đang chuẩn bị' },
                { id: 'SHIPPING', label: 'Đang giao' },
                { id: 'DELIVERED', label: 'Đã hoàn thành' },
                { id: 'CANCELLED', label: 'Đã hủy' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    orderFilter === f.id
                      ? 'bg-[#006561] text-white font-bold'
                      : 'bg-white text-[#6B6661] hover:text-[#2A2725] border border-[#E5E2DF]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {isLoadingOrders ? (
              <div className="bg-white rounded-3xl p-12 text-center text-sm text-[#6B6661] border border-[#E5E2DF]">
                Đang nạp lịch sử đơn hàng của bạn...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-[#E5E2DF]">
                <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#E5E2DF] flex items-center justify-center mx-auto text-[#006561]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-[#2A2725]">
                    {orderFilter === 'ALL'
                      ? 'Bạn chưa có đơn đặt bánh nào'
                      : 'Không có đơn hàng nào trong trạng thái này'}
                  </h3>
                  <p className="text-xs text-[#6B6661] max-w-md mx-auto">
                    Thưởng thức bánh ăn kiêng ngon lành chuẩn Eat Clean & Keto từ lò bánh Hebekery ngay hôm nay!
                  </p>
                </div>
                <Link to="/products">
                  <Button className="btn-act rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider">
                    Khám phá bánh Hebekery
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const statusColors: Record<string, string> = {
                    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
                    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
                    SHIPPING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
                  }
                  const statusLabels: Record<string, string> = {
                    PENDING: 'Chờ thanh toán',
                    CONFIRMED: 'Đã xác nhận',
                    SHIPPING: 'Đang vận chuyển',
                    DELIVERED: 'Giao thành công',
                    CANCELLED: 'Đã hủy',
                  }

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-6 border border-[#E5E2DF] shadow-xs hover:border-[#006561]/40 transition-all space-y-4"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E2DF]">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-[#006561]">
                            ĐƠN #{order.id}
                          </span>
                          <span className="text-stone-300">·</span>
                          <span className="text-xs text-[#6B6661] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#C9785C]" />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                              statusColors[order.orderStatus || 'PENDING'] || 'bg-stone-50 text-stone-700 border-stone-200'
                            }`}
                          >
                            {statusLabels[order.orderStatus || 'PENDING'] || order.orderStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-3">
                        {order.items?.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={it.imageUrl || 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/placeholder_1x1.png'}
                                alt={it.productName}
                                className="w-12 h-12 rounded-xl object-cover border border-[#E5E2DF] shrink-0"
                              />
                              <div>
                                <p className="text-xs font-bold text-[#2A2725] line-clamp-1">{it.productName}</p>
                                <p className="text-[11px] text-[#6B6661]">Số lượng: x{it.quantity}</p>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#2A2725]">
                              {formatCurrency(it.price * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Card Footer */}
                      <div className="pt-3 border-t border-[#E5E2DF] flex flex-wrap items-center justify-between gap-4">
                        <div className="text-xs">
                          <span className="text-[#6B6661]">Tổng thanh toán: </span>
                          <span className="font-mono font-bold text-sm text-[#006561]">
                            {formatCurrency(order.total)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {order.orderStatus === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCancelOrder(order)
                                setCancelReason('Thay đổi nhu cầu đặt hàng')
                              }}
                              className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Hủy đơn
                            </Button>
                          )}

                          {order.orderStatus === 'SHIPPING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={confirmReceivedMutation.isPending}
                              onClick={() => confirmReceivedMutation.mutate(order.id)}
                              className="rounded-full border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Đã nhận hàng
                            </Button>
                          )}

                          {(order.orderStatus === 'DELIVERED' || order.orderStatus === 'RECEIVED') && !order.returnStatus && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReturnOrder(order)
                                setReturnReason('')
                              }}
                              className="rounded-full border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-1" />
                              Yêu cầu đổi trả
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-full border-[#E5E2DF] text-xs font-semibold hover:border-[#006561] text-[#2A2725] cursor-pointer"
                          >
                            Chi tiết hóa đơn
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReorder(order)}
                            className="btn-act rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Mua lại đơn này</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: ADDRESS BOOK ================= */}
        {activeTab === 'addresses' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2DF] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E2DF]">
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-[#2A2725] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#006561]" />
                  <span>Sổ địa chỉ nhận bánh</span>
                </h2>
                <p className="text-xs text-[#6B6661]">
                  Lưu các địa chỉ nhận hàng thân quen để thanh toán 1-chạm khi thèm bánh healthy
                </p>
              </div>

              <Button
                onClick={openCreateAddressDialog}
                className="btn-act rounded-full px-5 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm địa chỉ mới</span>
              </Button>
            </div>

            {isLoadingAddresses ? (
              <div className="py-12 text-center text-xs text-[#6B6661]">Đang nạp danh sách địa chỉ...</div>
            ) : addresses.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#E5E2DF] rounded-2xl p-6 space-y-2">
                <MapPin className="w-10 h-10 text-[#C9785C] mx-auto opacity-70" />
                <p className="font-bold text-sm text-[#2A2725]">Chưa có địa chỉ nào được lưu</p>
                <p className="text-xs text-[#6B6661]">
                  Thêm địa chỉ nhà riêng hoặc công ty để việc giao bánh được nhanh chóng nhất.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={cn(
                      'p-5 rounded-2xl border bg-white flex flex-col justify-between space-y-4 transition-all',
                      addr.defaultAddress
                        ? 'border-[#006561] bg-[#006561]/5 ring-1 ring-[#006561]'
                        : 'border-[#E5E2DF] hover:border-[#006561]/40'
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-[#2A2725]">{addr.receiverName}</span>
                        {addr.defaultAddress ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#006561] text-white">
                            <Star className="w-3 h-3 fill-current" /> Mặc định
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefaultAddress(addr)}
                            className="text-[11px] text-[#6B6661] hover:text-[#006561] underline cursor-pointer"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                      </div>

                      <div className="space-y-1 text-xs text-[#6B6661]">
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#006561]" />
                          <span className="font-medium text-[#2A2725]">{addr.phone}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#C9785C] shrink-0 mt-0.5" />
                          <span>
                            {addr.fullAddress ||
                              `${addr.addressLine}, ${addr.ward || ''}, ${addr.district || ''}, ${addr.province || ''}`}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5E2DF] flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditAddressDialog(addr)}
                        className="text-xs text-[#6B6661] hover:text-[#006561] h-8 px-2.5 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Sửa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAddressMutation.mutate(addr.id)}
                        className="text-xs text-[#6B6661] hover:text-red-600 h-8 px-2.5 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: VOUCHER WALLET ================= */}
        {activeTab === 'vouchers' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2DF] shadow-xs space-y-6">
            <div className="border-b border-[#E5E2DF] pb-4 space-y-1">
              <h2 className="font-display text-lg font-bold text-[#2A2725] flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#C9785C]" />
                <span>Ví Voucher Hebekery của bạn</span>
              </h2>
              <p className="text-xs text-[#6B6661]">
                Bấm sao chép mã và dán tại bước thanh toán để nhận ngay ưu đãi hấp dẫn
              </p>
            </div>

            {isLoadingVouchers ? (
              <div className="py-12 text-center text-xs text-[#6B6661]">Đang nạp danh sách mã giảm giá...</div>
            ) : vouchers.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#E5E2DF] rounded-2xl p-6 space-y-2">
                <Ticket className="w-10 h-10 text-[#C9785C] mx-auto opacity-70" />
                <p className="font-bold text-sm text-[#2A2725]">Chưa có mã giảm giá nào</p>
                <p className="text-xs text-[#6B6661]">Hãy theo dõi các chương trình ưu đãi sắp tới của Hebekery nhé!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vouchers.map((v) => {
                  const isCopied = copiedCode === v.code
                  const discountLabel =
                    (v.discountType as string) === 'FREE_SHIPPING'
                      ? 'MIỄN PHÍ VẬN CHUYỂN'
                      : `GIẢM ${formatCurrency(v.discountValue)}`
                  const minSpend = v.minOrderAmount ? `Đơn từ ${formatCurrency(v.minOrderAmount)}` : 'Mọi đơn hàng'

                  return (
                    <div
                      key={v.id}
                      className="border-2 border-dashed border-[#006561]/40 rounded-2xl p-4 bg-[#FAF7F2] hover:bg-white hover:border-[#006561] transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group shadow-2xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold text-[#006561] bg-white px-2.5 py-0.5 rounded-md border border-[#006561]/30">
                            {v.code}
                          </span>
                          <span className="text-[10px] text-[#C9785C] font-bold uppercase tracking-wider">
                            {v.usageLimit ? `Còn lượt` : 'Vô hạn'}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-base text-[#2A2725]">{discountLabel}</h4>
                        <p className="text-xs text-[#6B6661]">{minSpend}</p>
                      </div>

                      <div className="pt-2 border-t border-[#E5E2DF] flex items-center justify-between">
                        <span className="text-[11px] text-stone-500">Chuẩn Healthy</span>
                        <Button
                          size="sm"
                          onClick={() => handleCopyVoucher(v.code)}
                          className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-[#006561] text-white'
                              : 'bg-white text-[#006561] border border-[#006561] hover:bg-[#006561] hover:text-white'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 mr-1" /> Đã sao chép
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" /> Dùng ngay
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: VVIP LOYALTY ================= */}
        {activeTab === 'loyalty' && (
          <div className="space-y-8">
            {/* Digital VVIP Card & Quick Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left: Interactive Digital VVIP Card (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div
                  className={`w-full rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl flex flex-col justify-between min-h-[250px] sm:min-h-[270px] ${
                    tierKey === 'DIAMOND'
                      ? 'bg-linear-to-br from-[#1F1F1F] via-[#0E0E0E] to-[#2B2B2B] border-2 border-amber-300/80 shadow-2xl'
                      : tierKey === 'GOLD'
                      ? 'bg-linear-to-br from-[#A86800] via-[#854E00] to-[#543000] border-2 border-amber-300/60 shadow-xl'
                      : tierKey === 'SILVER'
                      ? 'bg-linear-to-br from-[#4A5568] via-[#2D3748] to-[#1A202C] border-2 border-slate-300/60 shadow-xl'
                      : 'bg-linear-to-br from-[#006561] via-[#004e4a] to-[#00302E] border-2 border-emerald-400/40 shadow-xl'
                  }`}
                >
                  {/* Subtle Background Radial Pattern */}
                  <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                  <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

                  {/* Card Top: Logo & Tier */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span className="font-display font-bold text-sm tracking-wider uppercase text-amber-200">
                          HeBekery Privilege
                        </span>
                      </div>
                      <p className="text-[10px] tracking-widest uppercase text-white/60 font-mono">
                        Nutrition & Healthy Bakery
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        tierKey === 'DIAMOND'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-300/40'
                          : tierKey === 'GOLD'
                          ? 'bg-amber-400/20 text-amber-200 border border-amber-300/40'
                          : tierKey === 'SILVER'
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/40'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>{tierName}</span>
                    </span>
                  </div>

                  {/* Card Middle: EMV Chip & Card Number */}
                  <div className="relative z-10 my-4 space-y-3">
                    {/* Metallic EMV Chip */}
                    <div className="w-11 h-8 rounded-md bg-linear-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/70 shadow-inner flex items-center justify-center relative overflow-hidden">
                      <div className="w-full h-[1px] bg-amber-800/40 absolute top-2.5" />
                      <div className="w-full h-[1px] bg-amber-800/40 absolute bottom-2.5" />
                      <div className="h-full w-[1px] bg-amber-800/40 absolute left-3.5" />
                      <div className="h-full w-[1px] bg-amber-800/40 absolute right-3.5" />
                    </div>

                    <div className="font-mono text-sm sm:text-base tracking-[0.22em] text-white/90 drop-shadow-sm font-semibold select-all">
                      HBK •••• •••• {user.id.padStart(4, '0').slice(-4)}
                    </div>
                  </div>

                  {/* Card Bottom: Holder Name, Balance, Valid */}
                  <div className="relative z-10 pt-2 border-t border-white/15 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-white/60">Chủ thẻ thành viên</p>
                      <p className="font-semibold text-xs sm:text-sm text-white tracking-wide truncate max-w-[170px]">
                        {user.name.toUpperCase()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-wider text-white/60">Số dư Điểm Lành</p>
                      <p className="font-mono font-bold text-base sm:text-lg text-amber-300">
                        {loyaltyPoints} <span className="text-[10px] font-sans text-white/80">điểm</span>
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-[11px] text-[#6B6661] mt-2 italic">
                  Thẻ điện tử được áp dụng tự động cho mọi đơn hàng HeBekery
                </p>
              </div>

              {/* Right: Membership Tier Progress & Benefits Card (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2DF] shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B6661]">
                      Tiến Trình Thăng Hạng Thành Viên
                    </span>
                    <span className="text-xs font-bold font-mono text-[#006561]">
                      {tierProgress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#E5E2DF] rounded-full h-3.5 overflow-hidden p-0.5">
                    <div
                      className="bg-linear-to-r from-[#006561] via-[#C9785C] to-amber-500 h-full rounded-full transition-all duration-700 shadow-xs"
                      style={{ width: `${tierProgress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs text-[#6B6661] pt-1">
                    <span>
                      Đã chi tiêu: <b className="text-[#2A2725]">{formatCurrency(totalSpent)}</b>
                    </span>
                    <span>
                      Mục tiêu {nextTierName}: <b className="text-[#2A2725]">{formatCurrency(nextTierThreshold)}</b>
                    </span>
                  </div>

                  {loyaltyProfile?.amountToNextTier ? (
                    <div className="p-3.5 rounded-2xl bg-[#006561]/8 border border-[#006561]/20 text-xs text-[#006561] flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 shrink-0 text-[#006561]" />
                      <span>
                        Chỉ cần tích lũy thêm <b>{formatCurrency(loyaltyProfile.amountToNextTier)}</b> để mở khóa đặc quyền hạng <b>{nextTierName}</b>!
                      </span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2.5">
                      <Crown className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>
                        Chúc mừng bạn đã đạt cấp độ cao nhất <b>Hebe Diamond VIP</b> với đặc quyền Freeship trọn đời!
                      </span>
                    </div>
                  )}
                </div>

                {/* 3 Metric Mini Cards */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#E5E2DF]">
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DF] text-center space-y-1">
                    <p className="text-[10px] uppercase font-bold text-[#6B6661]">Số Điểm Lành</p>
                    <p className="font-mono text-lg font-bold text-[#006561]">{loyaltyPoints}</p>
                    <p className="text-[10px] text-[#6B6661]">1 điểm = 1.000đ</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DF] text-center space-y-1">
                    <p className="text-[10px] uppercase font-bold text-[#6B6661]">Giá Trị Quy Đổi</p>
                    <p className="font-mono text-lg font-bold text-[#C9785C]">
                      {formatCurrency(loyaltyPoints * 1000)}
                    </p>
                    <p className="text-[10px] text-[#6B6661]">Giảm tối đa 30% đơn</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5E2DF] text-center space-y-1">
                    <p className="text-[10px] uppercase font-bold text-[#6B6661]">Tỷ Lệ Hoàn Điểm</p>
                    <p className="font-mono text-lg font-bold text-amber-600">
                      {loyaltyProfile?.earnPercent || 1}%
                    </p>
                    <p className="text-[10px] text-[#6B6661]">Mọi đơn hàng bánh</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Transactions History Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2DF] shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#E5E2DF] pb-4">
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-[#2A2725] flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span>Lịch Sử Biến Động Điểm Lành</span>
                  </h3>
                  <p className="text-xs text-[#6B6661]">
                    Chi tiết các lượt tích lũy và sử dụng Điểm Lành từ đơn hàng bánh của bạn
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {loyaltyTxData?.totalElements || 0} giao dịch
                </Badge>
              </div>

              {loyaltyTxData && loyaltyTxData.content && loyaltyTxData.content.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E5E2DF] text-[#6B6661] uppercase text-[10px] tracking-wider font-semibold">
                        <th className="py-3 px-3">Thời gian</th>
                        <th className="py-3 px-3">Loại giao dịch</th>
                        <th className="py-3 px-3 text-right">Biến động</th>
                        <th className="py-3 px-3 text-right">Số dư sau</th>
                        <th className="py-3 px-4">Diễn giải</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E2DF]/60">
                      {loyaltyTxData.content.map((tx: LoyaltyTransaction) => {
                        const isPositive = tx.points > 0
                        return (
                          <tr key={tx.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                            <td className="py-3 px-3 font-mono text-[#6B6661] whitespace-nowrap">
                              {new Date(tx.createdAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isPositive
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {isPositive ? (
                                  <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                  <ArrowDownLeft className="w-3 h-3" />
                                )}
                                <span>{tx.transactionTypeName || tx.transactionType}</span>
                              </span>
                            </td>
                            <td className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${isPositive ? 'text-[#006561]' : 'text-[#B23A2A]'}`}>
                              {isPositive ? `+${tx.points}` : `${tx.points}`} điểm
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-semibold text-[#2A2725] whitespace-nowrap">
                              {tx.balanceAfter} điểm
                            </td>
                            <td className="py-3 px-4 text-[#6B6661] max-w-xs truncate">
                              {tx.description}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center space-y-2">
                  <Coins className="w-8 h-8 text-[#6B6661]/40 mx-auto" />
                  <p className="text-xs font-semibold text-[#2A2725]">Chưa có lịch sử biến động điểm</p>
                  <p className="text-[11px] text-[#6B6661]">
                    Điểm Lành sẽ được tự động tích lũy khi bạn hoàn thành các đơn hàng bánh ngon tại HeBekery!
                  </p>
                </div>
              )}
            </div>

            {/* 4-Tier Perks Matrix */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E2DF] shadow-xs space-y-6">
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-[#2A2725]">
                  Đặc Quyền 4 Hạng Thành Viên HeBekery VVIP
                </h3>
                <p className="text-xs text-[#6B6661]">
                  Nâng hạng chi tiêu tích lũy để tận hưởng dịch vụ chăm sóc thực dưỡng và ưu đãi cao nhất
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    key: 'BRONZE',
                    tier: 'Mầm Xanh (Bronze)',
                    spend: '0đ - Khách Hàng Mới',
                    earn: 'Tích 1% điểm',
                    perks: ['Tích 1% điểm cho mọi đơn hàng', 'Voucher chào mừng 10%', 'Hỗ trợ tư vấn dinh dưỡng Eat Clean'],
                  },
                  {
                    key: 'SILVER',
                    tier: 'Hạt Lành (Silver)',
                    spend: 'Tích lũy từ 1.000.000đ',
                    earn: 'Tích 2% điểm',
                    perks: ['Tích 2% điểm cho mọi đơn hàng', 'Voucher sinh nhật 50.000đ', 'Ưu tiên trải nghiệm mẻ bánh mới'],
                  },
                  {
                    key: 'GOLD',
                    tier: 'Bánh Mộc (Gold)',
                    spend: 'Tích lũy từ 3.000.000đ',
                    earn: 'Tích 3% điểm',
                    perks: ['Tích 3% điểm mọi đơn hàng', 'Freeship mọi đơn từ 199.000đ', 'Tặng quà hộp bánh mới dùng thử'],
                  },
                  {
                    key: 'DIAMOND',
                    tier: 'Hebe Diamond (VIP)',
                    spend: 'Tích lũy từ 7.000.000đ',
                    earn: 'Tích 5% điểm cao nhất',
                    perks: ['Tích 5% điểm cao nhất', 'Freeship mọi đơn trọn đời', 'Trợ lý dinh dưỡng riêng & Quà Tết độc quyền'],
                  },
                ].map((item) => {
                  const isCurrent = tierKey === item.key
                  return (
                    <div
                      key={item.key}
                      className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                        isCurrent
                          ? 'border-[#006561] bg-[#006561]/5 shadow-sm ring-2 ring-[#006561]/30'
                          : 'border-[#E5E2DF] bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-base text-[#2A2725]">{item.tier}</h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#006561] text-white uppercase tracking-wider">
                              Hạng hiện tại
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-[#006561] font-bold">{item.spend}</p>
                        <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {item.earn}
                        </span>

                        <ul className="space-y-1.5 pt-2 text-xs text-[#6B6661]">
                          {item.perks.map((p, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-[#006561] shrink-0 mt-0.5" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= ORDER DETAIL MODAL ================= */}
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
            <DialogContent className="sm:max-w-[650px] rounded-3xl bg-white p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <DialogHeader className="space-y-2 border-b border-[#E5E2DF] pb-4">
                <DialogTitle className="font-display text-xl font-bold text-[#2A2725] flex items-center justify-between">
                  <span>Chi tiết đơn hàng #{selectedOrder.id}</span>
                  <Badge variant="outline" className="text-xs font-mono">
                    {selectedOrder.orderStatus}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-[#6B6661]">
                  Đặt lúc: {formatDate(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4 text-xs">
                {/* Shipping Info */}
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5E2DF] space-y-1.5">
                  <p className="font-bold text-[#2A2725] uppercase tracking-wider text-[11px]">Địa chỉ giao hàng</p>
                  <p className="font-bold text-sm text-[#2A2725]">{selectedOrder.customerName || user.name}</p>
                  <p className="text-[#6B6661]">{selectedOrder.phone || user.phone}</p>
                  <p className="text-[#6B6661]">{selectedOrder.address}</p>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <p className="font-bold text-[#2A2725] uppercase tracking-wider text-[11px]">Danh sách sản phẩm</p>
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-stone-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.imageUrl || 'https://bizweb.dktcdn.net/100/415/009/themes/1136612/assets/placeholder_1x1.png'}
                          alt={it.productName}
                          className="w-12 h-12 rounded-xl object-cover border border-[#E5E2DF]"
                        />
                        <div>
                          <p className="font-bold text-[#2A2725]">{it.productName}</p>
                          <p className="text-[#6B6661]">Số lượng: x{it.quantity}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#2A2725]">
                        {formatCurrency(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="space-y-2 pt-2 border-t border-[#E5E2DF] text-xs">
                  <div className="flex justify-between text-[#6B6661]">
                    <span>Tạm tính</span>
                    <span className="font-mono">{formatCurrency(selectedOrder.subtotal || selectedOrder.total)}</span>
                  </div>
                  {selectedOrder.voucherCode && (
                    <div className="flex justify-between text-[#006561] font-medium">
                      <span>Mã giảm giá ({selectedOrder.voucherCode})</span>
                      <span className="font-mono">-{formatCurrency(selectedOrder.discountAmount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#6B6661]">
                    <span>Phí vận chuyển</span>
                    <span className="font-mono text-[#006561]">
                      {selectedOrder.shippingFee && selectedOrder.shippingFee > 0
                        ? formatCurrency(selectedOrder.shippingFee)
                        : 'Miễn phí'}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#006561] pt-2 border-t border-stone-200">
                    <span>Tổng thanh toán</span>
                    <span className="font-mono text-base">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-[#E5E2DF]">
                <Button
                  onClick={() => {
                    handleReorder(selectedOrder)
                    setSelectedOrder(null)
                  }}
                  className="btn-act rounded-full w-full py-2.5 text-xs font-bold uppercase tracking-wider"
                >
                  Mua lại đơn hàng này
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ================= ADDRESS FORM DIALOG ================= */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[480px] rounded-3xl bg-white p-6 sm:p-8">
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-display text-xl font-bold text-[#2A2725]">
                {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ nhận bánh mới'}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6B6661]">
                Điền thông tin người nhận bánh để đơn hàng được giao chính xác nhất
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                  Họ tên người nhận <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  required
                  className="rounded-xl border-[#E5E2DF] text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0987 654 321"
                  required
                  className="rounded-xl border-[#E5E2DF] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">Tỉnh / Thành</label>
                  <Input
                    value={formData.province || ''}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    placeholder="TP. Hồ Chí Minh"
                    className="rounded-xl border-[#E5E2DF] text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">Quận / Huyện</label>
                  <Input
                    value={formData.district || ''}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Quận Tân Phú"
                    className="rounded-xl border-[#E5E2DF] text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">Phường / Xã</label>
                <Input
                  value={formData.ward || ''}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  placeholder="Phường Tân Thành"
                  className="rounded-xl border-[#E5E2DF] text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2A2725] uppercase tracking-wider">
                  Địa chỉ cụ thể (Số nhà, tên đường) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  placeholder="2D Hồ Ngọc Cẩn"
                  required
                  className="rounded-xl border-[#E5E2DF] text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultAddress"
                  checked={formData.defaultAddress}
                  onChange={(e) => setFormData({ ...formData, defaultAddress: e.target.checked })}
                  className="rounded text-[#006561] focus:ring-[#006561] cursor-pointer"
                />
                <label htmlFor="defaultAddress" className="text-xs text-[#2A2725] cursor-pointer select-none">
                  Đặt làm địa chỉ nhận hàng mặc định
                </label>
              </div>

              <DialogFooter className="pt-4 border-t border-[#E5E2DF]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAddressDialog}
                  className="rounded-full text-xs"
                >
                  Hủy
                </Button>
                <Button type="submit" className="btn-act rounded-full px-6 text-xs font-bold">
                  {editingAddress ? 'Cập nhật' : 'Lưu địa chỉ'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ================= CANCEL ORDER DIALOG ================= */}
        {cancelOrder && (
          <Dialog open={!!cancelOrder} onOpenChange={(open) => !open && setCancelOrder(null)}>
            <DialogContent className="sm:max-w-[450px] rounded-3xl bg-white p-6 sm:p-8">
              <DialogHeader className="space-y-1">
                <DialogTitle className="font-display text-xl font-bold text-[#2A2725]">
                  Xác Nhận Hủy Đơn Hàng #{cancelOrder.id}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#6B6661]">
                  Bạn chỉ có thể hủy đơn khi đơn hàng đang ở trạng thái Chờ xử lý (PENDING).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs">
                <div>
                  <label className="block font-bold text-[#2A2725] mb-1.5">Lý do hủy đơn (*)</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E2DF] bg-white focus:border-[#006561] focus:outline-none"
                  >
                    <option value="Thay đổi nhu cầu đặt hàng">Thay đổi nhu cầu đặt hàng</option>
                    <option value="Muốn thay đổi địa chỉ nhận hàng">Muốn thay đổi địa chỉ nhận hàng</option>
                    <option value="Muốn thêm bớt sản phẩm khác">Muốn thêm bớt sản phẩm khác</option>
                    <option value="Tìm thấy giá tốt hơn">Tìm thấy giá tốt hơn</option>
                    <option value="Lý do khác">Lý do khác</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-[#E5E2DF] flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelOrder(null)}
                  className="rounded-full text-xs"
                >
                  Đóng
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={cancelOrderMutation.isPending}
                  onClick={() =>
                    cancelOrderMutation.mutate({
                      id: cancelOrder.id,
                      reason: cancelReason,
                    })
                  }
                  className="rounded-full text-xs font-bold"
                >
                  {cancelOrderMutation.isPending ? 'Đang hủy...' : 'Xác Nhận Hủy Đơn'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ================= RETURN ORDER DIALOG ================= */}
        {returnOrder && (
          <Dialog open={!!returnOrder} onOpenChange={(open) => !open && setReturnOrder(null)}>
            <DialogContent className="sm:max-w-[480px] rounded-3xl bg-white p-6 sm:p-8">
              <DialogHeader className="space-y-1">
                <DialogTitle className="font-display text-xl font-bold text-[#2A2725]">
                  Yêu Cầu Đổi Trả Đơn Hàng #{returnOrder.id}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#6B6661]">
                  Chính sách Hebekery: Đổi mới 1-1 miễn phí nếu bánh bị lỗi sản xuất, móp méo hoặc không đúng mô tả.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-xs">
                <div>
                  <label className="block font-bold text-[#2A2725] mb-1.5">Lý do đổi trả (*)</label>
                  <textarea
                    rows={3}
                    required
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Mô tả cụ thể vấn đề bạn gặp phải (ví dụ: hộp bánh bị bung nắp, nhầm hương vị...)"
                    className="w-full text-xs p-3 rounded-xl border border-[#E5E2DF] focus:border-[#006561] focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-[#E5E2DF] flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReturnOrder(null)}
                  className="rounded-full text-xs"
                >
                  Đóng
                </Button>
                <Button
                  size="sm"
                  disabled={returnOrderMutation.isPending || !returnReason.trim()}
                  onClick={() =>
                    returnOrderMutation.mutate({
                      id: returnOrder.id,
                      reason: returnReason.trim(),
                    })
                  }
                  className="btn-act rounded-full text-xs font-bold"
                >
                  {returnOrderMutation.isPending ? 'Đang gửi...' : 'Gửi Yêu Cầu Đổi Trả'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
export default ProfilePage
