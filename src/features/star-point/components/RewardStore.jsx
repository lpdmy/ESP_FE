import { Card, CardContent } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { useState, useEffect } from "react";
import { useStarPointApi } from "@/features/admin/hooks/useStarPointApi";
import { useSelector, useDispatch } from "react-redux";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import {
  Gift,
  ShoppingBag,
  BookOpen,
  Smartphone,
  Star,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { REWARD_CATEGORY, REWARD_CATEGORY_LABELS } from "@/features/admin/components/StarPointManagement/enums/rewardCategory";
import { set } from "date-fns";
import { subtractPoints } from "@/store/star-point/pointSlice";
import { LoadingCard } from "@/common/components/ui/loading";
import { ROUTES } from "@/common/constants/routes";

const categoryIcons = {
  [REWARD_CATEGORY.VOUCHER]: Gift,
  [REWARD_CATEGORY.BOOK]: BookOpen,
  [REWARD_CATEGORY.ELECTRONICS]: Smartphone,
};

const categories = [
  { id: "all", name: "Tất cả", icon: Gift },
  ...Object.values(REWARD_CATEGORY).map((value) => ({
    id: value.toString(),
    name: REWARD_CATEGORY_LABELS[value],
    icon: categoryIcons[value] || Gift,
  })),
];


export default function RewardStore() {
  const dispatch = useDispatch();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedReward, setSelectedReward] = useState(null);
  const currentPoints = useSelector((state) => state.points.current);

  const { getAllRewards, redeemReward } = useStarPointApi();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false); // trạng thái loading
  const [exchangeSuccess, setExchangeSuccess] = useState(false);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const resp = await getAllRewards();
      setRewards(resp.data);
    } catch (err) {
      console.error("Failed to fetch rewards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const filteredRewards = rewards.filter((reward) => {
    if (selectedCategory === "all") return true;
    return reward.category.toString() === selectedCategory;
  });

  const handleExchange = async (reward) => {
    if (currentPoints < reward.pointCost) return;

    setIsRedeeming(true);
    try {
      await redeemReward(reward.id);
      dispatch(subtractPoints(reward.pointCost));
      const response = await getAllRewards();
      setRewards(response.data);
      setIsRedeemDialogOpen(false);
      setExchangeSuccess(true);
      setSelectedReward(null);
    } catch (err) {
      console.error("Đổi thưởng thất bại:", err);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Đổi thưởng</h1>
              <p className="text-gray-600">
                Sử dụng điểm tích lũy để đổi những phần thưởng hấp dẫn
              </p>
            </div>
          </div>

          <Card className="py-4 bg-gradient-orange text-white">
            <CardContent className="p-4 text-center">
              <p className="text-sm opacity-90">Điểm hiện tại</p>
              <p className="text-2xl font-bold">{currentPoints}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/points/history">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="font-medium">Lịch sử điểm</p>
                  <p className="text-sm text-gray-600">Xem chi tiết giao dịch</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4 flex items-center gap-3">
              <Star className="w-8 h-8 text-purple-500" />
              <div>
                <p className="font-medium text-purple-700">Hạng thành viên</p>
                <p className="text-sm text-purple-600">Vàng (1000+ điểm)</p>
              </div>
            </CardContent>
          </Card>
          <Link to={ROUTES.STAR_POINT.MY_REDEMPTIONS}>
            <Card className="hover:shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Gift className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-medium text-green-700">Đã đổi tháng này</p>
                  <p className="text-sm text-green-600">10 phần thưởng</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Categories */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid grid-cols-4 w-full">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="flex items-center gap-2"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{category.name}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
        <LoadingCard isLoading={loading}>
          {/* Rewards Grid */}
          {filteredRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map((reward) => (
                <Card
                  key={reward.id}
                  className="py-0 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={reward.imageUrl || "/placeholder.svg"}
                        alt={reward.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      {reward.popular && (
                        <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                          Phổ biến
                        </Badge>
                      )}
                      <Badge className="absolute top-3 right-3 bg-white text-gray-700">
                        Còn {reward.stock}
                      </Badge>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2">{reward.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Phần thưởng hấp dẫn dành cho bạn
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-orange-600">
                            {reward.pointCost}
                          </span>
                          <span className="text-sm text-gray-500">điểm</span>
                        </div>
                        <Button
                          className={`bg-gradient-orange text-white hover:opacity-90 ${reward.stock === 0 ? "bg-gray-300 text-gray-600 cursor-not-allowed" : ""
                            }`}
                          disabled={currentPoints < reward.pointCost || reward.stock === 0}
                          onClick={() => {
                            if (reward.stock > 0) {
                              setSelectedReward(reward);
                              setIsRedeemDialogOpen(true);
                            }
                          }}
                        >
                          {reward.stock === 0
                            ? "Hết hàng"
                            : currentPoints < reward.pointCost
                              ? "Không đủ điểm"
                              : "Đổi ngay"}
                        </Button>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              ))}
              <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Xác nhận đổi thưởng</DialogTitle>
                  </DialogHeader>
                  {selectedReward && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedReward.imageUrl || "/placeholder.svg"}
                          alt={selectedReward.name}
                          className="w-20 h-20 rounded-lg"
                        />
                        <div>
                          <h4 className="font-bold">
                            {selectedReward.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {selectedReward.description}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span>Điểm cần thiết:</span>
                          <span className="font-bold text-orange-600">
                            {selectedReward.pointCost} điểm
                          </span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Điểm hiện tại:</span>
                          <span className="font-bold">
                            {currentPoints} điểm
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Điểm còn lại:</span>
                          <span className="font-bold text-green-600">
                            {currentPoints - selectedReward.pointCost} điểm
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="cancelled"
                          className="flex-1"
                          onClick={() => {
                            setSelectedReward(null)
                            setIsRedeemDialogOpen(false);
                          }}
                        >
                          Hủy
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-orange text-white hover:opacity-90"
                          onClick={() => handleExchange(selectedReward)}
                          disabled={isRedeeming}
                        >
                          {isRedeeming ? "Đang đổi..." : "Xác nhận đổi"}
                        </Button>

                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg font-medium">
                Chưa có phần thưởng phù hợp với lựa chọn của bạn.
              </p>
              <p className="mt-2 text-sm">
                Hãy quay lại sau hoặc chọn danh mục khác để khám phá các phần thưởng hấp dẫn!
              </p>
            </div>
          )}
        </LoadingCard>
        {/* Dialog Thông báo thành công */}
        <Dialog open={!isRedeemDialogOpen && exchangeSuccess} onOpenChange={() => setIsRedeemDialogOpen(false)}>
          <DialogContent className="max-w-sm text-center">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
                🎉 Đổi thưởng thành công!
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 text-gray-700">
              <p>
                Chúc mừng bạn đã đổi thành công <strong>{selectedReward?.name}</strong>.
              </p>
              <p className="mt-2">
                Vui lòng mang mã học sinh của bạn đến văn phòng Đoàn trường để nhận phần thưởng.
              </p>
            </div>
            <div className="mt-6">
              <Button
                className="bg-gradient-orange text-white w-full"
                onClick={() => {
                  setIsRedeemDialogOpen(false);
                  setSelectedReward(null);
                  setExchangeSuccess(false);
                }}
              >
                Đóng
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div >
  );
}
