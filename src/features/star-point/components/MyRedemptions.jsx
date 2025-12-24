import { useEffect, useState } from "react"
import { Card, CardContent } from "@/common/components/ui/card"
import { Button } from "@/common/components/ui/button"
import { Badge } from "@/common/components/ui/badge"
import { useToast } from "@/common/hooks/useToast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/common/components/ui/dialog"
import { useStarPointApi } from "@/features/admin/hooks/useStarPointApi"
import { ArrowLeft, Gift, Package, CheckCircle2, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import { REWARD_CATEGORY_LABELS, getCategoryLabel } from "@/features/admin/components/StarPointManagement/enums/rewardCategory"
import {
  getStatusLabel,
  isPendingStatus,
  isReceivedStatus,
  convertStatusFromBE,
  REDEMPTION_STATUS,
} from "@/features/admin/components/StarPointManagement/enums/redemptionStatus"
import { ROUTES } from "@/common/constants/routes"
import { LoadingCard } from "@/common/components/ui/loading"

export default function MyRedemptions() {
    const toast = useToast()
    const [redemptions, setRedemptions] = useState([])
    const [selectedRedemption, setSelectedRedemption] = useState(null)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [pickingUp, setPickingUp] = useState(false)
    const [loadingRedemptions, setLoadingRedemptions] = useState(false)

    const { getMyRedemptions, pickupRedemption, loading, error } = useStarPointApi()

    useEffect(() => {
        loadRedemptions()
    }, [])

    const loadRedemptions = async () => {
        try {
            setLoadingRedemptions(true)
            const queryParams = { pageNumber: 1, pageSize: 100 }
            const data = await getMyRedemptions(queryParams)
            setRedemptions(data.items)
        } catch (err) {

        } finally {
            setLoadingRedemptions(false)
        }
    }

    const handleConfirmPickup = async () => {
        if (!selectedRedemption) return

        setPickingUp(true)
        try {
            await pickupRedemption(selectedRedemption.id)

            setRedemptions((prev) =>
                prev.map((r) => (r.id === selectedRedemption.id ? { ...r, status: REDEMPTION_STATUS.RECEIVED } : r))
            )

            toast.showSuccess("Đã xác nhận! Vui lòng đến văn phòng Đoàn trường để nhận phần thưởng nếu cần.")

            setConfirmDialogOpen(false)
            setSelectedRedemption(null)
        } catch (err) {
            toast.showError("Không thể xác nhận nhận thưởng. Vui lòng thử lại.")
        } finally {
            setPickingUp(false)
        }
    }

    const openConfirmDialog = (redemption) => {
        setSelectedRedemption(redemption)
        setConfirmDialogOpen(true)
    }

    const pendingCount = redemptions.filter((r) => isPendingStatus(r.status)).length
    const receivedCount = redemptions.filter((r) => isReceivedStatus(r.status)).length
    const totalPoints = redemptions.reduce((sum, r) => sum + (r.totalPointsSpent || 0), 0)

    return (
        <LoadingCard isLoading={loadingRedemptions}>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link to={ROUTES.STAR_POINT.REWARD_STORE}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">Phần thưởng đã đổi</h1>
                            <p className="text-gray-600">Quản lý và xác nhận nhận các phần thưởng của bạn</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-orange-600 font-medium">Chưa nhận</p>
                                        <p className="text-2xl font-bold text-orange-700">{pendingCount}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-600 font-medium">Đã nhận</p>
                                        <p className="text-2xl font-bold text-green-700">{receivedCount}</p>
                                    </div>
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-purple-600 font-medium">Tổng điểm đã dùng</p>
                                        <p className="text-2xl font-bold text-purple-700">{totalPoints}</p>
                                    </div>
                                    <Gift className="w-8 h-8 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Error */}
                    {error && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="p-6 text-center">
                                <p className="text-red-600">{error}</p>
                                <Button onClick={loadRedemptions} className="mt-4 bg-transparent" variant="outline">
                                    Thử lại
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Redemptions */}
                    {!loading && redemptions.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {redemptions.map((redemption) => (
                                <Card key={redemption.id} className="hover:shadow-lg transition-all hover-lift">
                                    <CardContent className="p-0">
                                        <div className="relative">
                                            <img
                                                src={redemption.reward.imageUrl || "/placeholder.svg"}
                                                alt={redemption.rewardName}
                                                width={400}
                                                height={200}
                                                className="w-full h-48 object-cover rounded-t-lg"
                                            />
                                            <Badge
                                                className={`absolute top-3 right-3 ${isPendingStatus(redemption.status) ? "bg-orange-500 text-white" : "bg-green-500 text-white"
                                                    }`}
                                            >
                                                {getStatusLabel(redemption.status)}
                                            </Badge>
                                        </div>

                                        <div className="p-6">
                                            <h3 className="font-bold text-lg mb-2">{redemption.rewardName}</h3>
                                            <p className="text-gray-600 text-sm mb-4">{redemption.rewardDescription}</p>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Điểm đã dùng:</span>
                                                    <span className="font-bold text-orange-600">{redemption.totalPointsSpent} điểm</span>
                                                </div>

                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Danh mục:</span>
                                                    <Badge variant="secondary">{getCategoryLabel(redemption.reward.category)}</Badge>
                                                </div>

                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500">Ngày đổi:</span>
                                                    <span className="text-gray-700">
                                                        {!isPendingStatus(redemption.status) && redemption.redeemedAt ? new Date(redemption.redeemedAt).toLocaleDateString("vi-VN") : "N/A"}
                                                    </span>
                                                </div>

                                                {isPendingStatus(redemption.status) && (
                                                    <Button
                                                        className="w-full bg-gradient-orange text-white hover:opacity-90 mt-2"
                                                        onClick={() => openConfirmDialog(redemption)}
                                                    >
                                                        <Package className="w-4 h-4 mr-2" />
                                                        Xác nhận đã nhận
                                                    </Button>
                                                )}

                                                {isReceivedStatus(redemption.status) && (
                                                    <div className="flex items-center justify-center gap-2 text-green-600 mt-2 py-2">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                        <span className="font-medium">Đã nhận thưởng</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && redemptions.length === 0 && !error && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Chưa có phần thưởng nào</h3>
                                <p className="text-gray-600 mb-6">Bạn chưa đổi phần thưởng nào. Hãy tích điểm và đổi thưởng ngay!</p>
                                <Link to="/rewards">
                                    <Button className="bg-gradient-orange text-white hover:opacity-90">Đổi thưởng ngay</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Confirm Dialog */}
                    <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Xác nhận đã nhận phần thưởng</DialogTitle>
                                <DialogDescription>Bạn có chắc chắn đã nhận phần thưởng này không?</DialogDescription>
                            </DialogHeader>

                            {selectedRedemption && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <img
                                            src={selectedRedemption.reward.imageUrl || "/placeholder.svg"}
                                            alt={selectedRedemption.rewardName}
                                            width={80}
                                            height={80}
                                            className="rounded-lg"
                                        />
                                        <div>
                                            <h4 className="font-bold">{selectedRedemption.rewardName}</h4>
                                            <p className="text-sm text-gray-600">{selectedRedemption.pointsUsed} điểm</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600">
                                        Sau khi xác nhận, trạng thái phần thưởng sẽ được cập nhật thành "Đã nhận". Nếu bạn chưa nhận phần
                                        thưởng, vui lòng đến văn phòng Đoàn trường để nhận.
                                    </p>
                                </div>
                            )}

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={pickingUp}>
                                    Hủy
                                </Button>
                                <Button
                                    className="bg-gradient-orange text-white hover:opacity-90"
                                    onClick={handleConfirmPickup}
                                    disabled={pickingUp}
                                >
                                    {pickingUp ? "Đang xử lý..." : "Xác nhận"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </LoadingCard>
    )
}
