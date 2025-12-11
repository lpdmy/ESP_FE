import { useStarPointApi } from "@/features/admin/hooks/useStarPointApi";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import {
  Clock,
  ArrowLeft,
  Gift,
  PlusCircle,
  MinusCircle,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/common/constants/routes";
import { LoadingCard } from "@/common/components/ui/loading";

// Mock data
const historyData = [
  {
    id: 1,
    date: "2025-10-10",
    description: "Đổi thưởng: Voucher Shopee 50k",
    points: -100,
    type: "redeem",
  },
  {
    id: 2,
    date: "2025-10-05",
    description: "Hoàn thành khóa học Python cơ bản",
    points: +200,
    type: "earn",
  },
  {
    id: 3,
    date: "2025-09-28",
    description: "Tham gia sự kiện Hackathon",
    points: +300,
    type: "earn",
  },
  {
    id: 4,
    date: "2025-09-25",
    description: "Đổi thưởng: Voucher Highlands Coffee",
    points: -80,
    type: "redeem",
  },
  {
    id: 5,
    date: "2025-09-20",
    description: "Nhận thưởng hoạt động cộng đồng",
    points: +150,
    type: "earn",
  },
];

export default function PointHistory() {
  const [tab, setTab] = useState("all");
  const [totalPoints, setTotalPoints] = useState(0); // có thể từ user info
  const [historyData, setHistoryData] = useState([]);
  const { getPointHistory, error } = useStarPointApi();
  const [loading, setLoading] = useState(false);

  const filtered = historyData.filter((item) => {
    if (tab === "all") return true;
    return tab === "earn" ? item.actionType === "Earn" : item.actionType === "Redeem" || item.actionType === "Adjustment";
  });

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const resp = await getPointHistory();
        setHistoryData(resp.data);

        // Tính tổng điểm từ history (hoặc lấy từ user)
        const pointsSum = resp.data.reduce((sum, item) => {
          return item.actionType === "Earn"
            ? sum + item.points
            : sum - item.points;
        }, 0);
        setTotalPoints(pointsSum);
      } catch (err) {
        console.error("Failed to fetch point history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Lịch sử điểm
              </h1>
              <p className="text-gray-600">
                Theo dõi toàn bộ giao dịch tích lũy và đổi điểm
              </p>
            </div>
          </div>

          <Card className="bg-gradient-orange text-white">
            <CardContent className="p-4 text-center">
              <p className="text-sm opacity-90">Tổng điểm hiện tại</p>
              <p className="text-2xl font-bold">{totalPoints}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="earn">Nhận điểm</TabsTrigger>
                <TabsTrigger value="redeem">Đổi điểm</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Lịch sử giao dịch */}
        <Card>
          <LoadingCard isLoading={loading}>
          <CardContent className="divide-y divide-gray-100 p-0">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Không có giao dịch nào trong mục này.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-orange-50 transition"
                >
                  <div className="flex items-center gap-4">
                    {item.actionType === "Earn" ? (
                      <PlusCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <MinusCircle className="w-6 h-6 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-bold ${item.actionType === "Earn" ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {item.actionType === "Earn" ? "+" : "-"}
                      {item.points}
                    </span>
                    <p className="text-sm text-gray-500">điểm</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          </LoadingCard>
        </Card>

        {/* Nút quay lại */}
        <div className="flex justify-center mt-8">
          <Link to={ROUTES.STAR_POINT.REWARD_STORE}>
            <Button className="bg-gradient-orange text-white hover:opacity-90">
              <Gift className="w-4 h-4 mr-2" />
              Quay lại cửa hàng đổi thưởng
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
