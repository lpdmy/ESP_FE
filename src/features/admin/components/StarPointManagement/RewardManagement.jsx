import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { SimpleSelect } from "@/common/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import {
  Star,
  Gift,
  Trophy,
  Settings,
  Plus,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  Package,
} from "lucide-react";
import {
  REWARD_CATEGORY,
  REWARD_CATEGORY_LABELS,
} from "@/features/admin/components/StarPointManagement/enums/rewardCategory"; // import file của bạn
import { uploadImage } from "@common/utils/upload";
import { useStarPointApi } from "@/features/admin/hooks/useStarPointApi";
import { REWARD_ACTION_LABELS } from "./enums/rewardActionType";
import { LoadingCard } from "@/common/components/ui/loading";
const rewardOptions = Object.values(REWARD_CATEGORY).map((value) => ({
  value: value.toString(),
  label: REWARD_CATEGORY_LABELS[value],
}));

const leaderboard = [
  { rank: 1, name: "Nguyễn Văn An", points: 2850, change: "+50" },
  { rank: 2, name: "Trần Thị Bình", points: 2720, change: "+30" },
  { rank: 3, name: "Lê Minh Đức", points: 2650, change: "-10" },
  { rank: 4, name: "Phạm Thu Hà", points: 2580, change: "+20" },
  { rank: 5, name: "Hoàng Văn Nam", points: 2450, change: "+15" },
];

const redeemedRewards = [
  {
    id: 1,
    studentName: "Nguyễn Văn An",
    studentId: "HS001234",
    rewardName: "Voucher Shopee 50k",
    quantity: 1,
    redemptionDate: "2024-01-15",
    status: "pending", // pending or picked_up
  },
  {
    id: 2,
    studentName: "Trần Thị Bình",
    studentId: "HS001235",
    rewardName: "Áo thun EduSphere",
    quantity: 1,
    redemptionDate: "2024-01-14",
    status: "picked_up",
  },
  {
    id: 3,
    studentName: "Lê Minh Đức",
    studentId: "HS001236",
    rewardName: "Sách lập trình",
    quantity: 2,
    redemptionDate: "2024-01-13",
    status: "pending",
  },
  {
    id: 4,
    studentName: "Phạm Thu Hà",
    studentId: "HS001237",
    rewardName: "Voucher Grab 30k",
    quantity: 3,
    redemptionDate: "2024-01-12",
    status: "picked_up",
  },
  {
    id: 5,
    studentName: "Hoàng Văn Nam",
    studentId: "HS001238",
    rewardName: "Tai nghe Bluetooth",
    quantity: 1,
    redemptionDate: "2024-01-11",
    status: "pending",
  },
  {
    id: 6,
    studentName: "Đỗ Thị Lan",
    studentId: "HS001239",
    rewardName: "Voucher Shopee 50k",
    quantity: 2,
    redemptionDate: "2024-01-10",
    status: "pending",
  },
  {
    id: 7,
    studentName: "Vũ Minh Tuấn",
    studentId: "HS001240",
    rewardName: "Áo thun EduSphere",
    quantity: 1,
    redemptionDate: "2024-01-09",
    status: "picked_up",
  },
  {
    id: 8,
    studentName: "Bùi Thu Hương",
    studentId: "HS001241",
    rewardName: "Sách lập trình",
    quantity: 1,
    redemptionDate: "2024-01-08",
    status: "pending",
  },
];
// ================= MAIN COMPONENT =================
export default function RewardsManagement() {
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState("0");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [pickupSearch, setPickupSearch] = useState("");
  const [selectedRule, setSelectedRule] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [isPickupDialogOpen, setIsPickupDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [pickupFilter, setPickupFilter] = useState("all");
  const [pickups, setPickups] = useState([]);
  const [loadingPickups, setLoadingPickups] = useState(false);

  const {
    getAllRules,
    updatePoints,
    getAllRewards,
    createReward,
    updateReward,
    deleteReward,
    getAllRedemptionsAdmin,
    pickupRedemption,
    loading,
  } = useStarPointApi();
  const [rules, setRules] = React.useState([]);
  const [editingRule, setEditingRule] = React.useState(null);
  const [newPoints, setNewPoints] = React.useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [uploadError, setUploadError] = useState("");

  const [editingReward, setEditingReward] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [isCreateRewardDialogOpen, setIsCreateRewardDialogOpen] =
    useState(false);
  const [isEditRewardDialogOpen, setIsEditRewardDialogOpen] = useState(false);
  const [rewardForm, setRewardForm] = useState({
    name: "",
    pointCost: 0,
    stock: 0,
    category: "",
    imageUrl: "",
  });

  const [loadingRules, setLoadingRules] = useState(false);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const [loadingCreateReward, setLoadingCreateReward] = useState(false);
  const [loadingUpdateReward, setLoadingUpdateReward] = useState(false);

  const [deleteRewardId, setDeleteRewardId] = useState(null);
  const [loadingDeleteReward, setLoadingDeleteReward] = useState(false);
  const [pickupSearchInput, setPickupSearchInput] = useState("");

  const [totalPickups, setTotalPickups] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingRules(true);
        setLoadingRewards(true);
        const rulesResp = await getAllRules();
        setRules(rulesResp.data);

        const rewardsResp = await getAllRewards();
        setRewards(rewardsResp.data);
      } catch (err) {
      } finally {
        setLoadingRules(false);
        setLoadingRewards(false);
      }
    };
    fetchData();
  }, [getAllRules, getAllRewards]);

  const fetchPickups = async () => {
    setLoadingPickups(true);
    try {
      const queryParams = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        status: pickupFilter === "all" ? undefined : pickupFilter,
        category: undefined,
        queryString: pickupSearch || undefined,
      };
      const resp = await getAllRedemptionsAdmin(queryParams);
      setPickups(resp.items);
      setTotalPickups(resp.totalCount);
    } catch (err) {
      console.error("Lấy dữ liệu nhận thưởng thất bại:", err);
    } finally {
      setLoadingPickups(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, [currentPage, pickupFilter, pickupSearch]);

  useEffect(() => {
    if (!isEditRewardDialogOpen) {
      setEditingReward(null);
      setSelectedFile(null);
      setRewardForm({
        name: "",
        pointCost: 0,
        stock: 0,
        category: "",
        imageUrl: "",
      });
      setImageUrl(null);
    }
  }, [isEditRewardDialogOpen]);

  const handleEditRuleClick = (rule) => {
    setEditingRule(rule);
    setNewPoints(rule.points);
    setIsEditDialogOpen(true);
  };

  const handleSaveRuleEdit = async () => {
    try {
      const updatedRule = await updatePoints(
        editingRule.actionType,
        Number(newPoints)
      );
      setRules((prev) =>
        prev.map((r) =>
          r.actionType === updatedRule.actionType ? updatedRule : r
        )
      );
      const response = await getAllRules();
      setRules(response.data);
      setIsEditDialogOpen(false);
      setEditingRule(null);
    } catch (err) {
      console.error("Update points failed:", err);
    }
  };
  // Edit Reward
  const handleEditRewardClick = (reward) => {
    setEditingReward(reward);
    setRewardForm({
      name: reward.name,
      pointCost: reward.pointCost,
      stock: reward.stock,
      category: reward.category,
      imageUrl: reward.imageUrl,
    });
    setImageUrl(reward.imageUrl);
    setIsEditRewardDialogOpen(true);
  };

  const handleSaveRewardEdit = async () => {
    try {
      setLoadingUpdateReward(true);
      let finalImageUrl = rewardForm.imageUrl;
      rewardForm.category = Number(rewardForm.category);
      if (selectedFile) {
        setUploading(true);
        finalImageUrl = await uploadImage(selectedFile);
        setUploading(false);
      }
      await updateReward(editingReward.id, {
        ...rewardForm,
        imageUrl: finalImageUrl,
        pointCost: Number(rewardForm.pointCost),
      });
      const resp = await getAllRewards();
      setRewards(resp.data);
      setRewardForm({
        name: "",
        pointCost: 0,
        stock: 0,
        category: "",
        imageUrl: "",
      });
      setIsEditRewardDialogOpen(false);
      setEditingReward(null);
      setSelectedFile(null);
      setImageUrl("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUpdateReward(false);
    }
  };

  const handleCreateReward = async () => {
    try {
      setLoadingCreateReward(true);
      let finalImageUrl = "";
      rewardForm.category = Number(rewardForm.category);
      if (selectedFile) {
        setUploading(true);
        finalImageUrl = await uploadImage(selectedFile);
        setUploading(false);
      }
      await createReward({
        ...rewardForm,
        imageUrl: finalImageUrl,
        pointCost: Number(rewardForm.pointCost),
      });
      const resp = await getAllRewards();
      setRewards(resp.data);
      setRewardForm({
        name: "",
        pointCost: 0,
        stock: 0,
        category: "",
        imageUrl: "",
      });
      setIsCreateRewardDialogOpen(false);
      setSelectedFile(null);
      setImageUrl("");
      setRewardForm({
        name: "",
        pointCost: 0,
        stock: 0,
        category: "",
        imageUrl: "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCreateReward(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };
  // Delete reward
  const handleDeleteReward = async (id) => {
    try {
      setLoadingDeleteReward(true);
      await deleteReward(id);
      const resp = await getAllRewards();
      setRewards(resp.data);
      setDeleteRewardId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDeleteReward(false);
    }
  };

  const totalPages = Math.ceil(totalPickups / itemsPerPage);
  const [loadingPickup, setLoadingPickup] = useState(false);

  const handlePickupConfirm = async () => {
    if (!selectedPickup) return;
    try {
      setLoadingPickup(true);
      await pickupRedemption(selectedPickup.id); // gọi API đánh dấu đã nhận
      await fetchPickups(); // cập nhật lại danh sách pickups
      setIsPickupDialogOpen(false);
      setSelectedPickup(null);
    } catch (err) {
      console.error("Pickup failed", err);
    } finally {
      setLoadingPickup(false);
    }
  };

  return (
    <div className="space-y-6 px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Điểm thưởng & Phần thưởng
        </h1>
        <p className="text-gray-600">
          Quản lý hệ thống điểm thưởng và kho phần thưởng
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules">Quy tắc điểm thưởng</TabsTrigger>
          <TabsTrigger value="rewards">Kho phần thưởng</TabsTrigger>
          <TabsTrigger value="pickups">Nhận thưởng</TabsTrigger>
          <TabsTrigger value="leaderboard">Bảng xếp hạng</TabsTrigger>
        </TabsList>

        {/* Tab: Quy tắc điểm */}
        <TabsContent value="rules">
          <LoadingCard isLoading={loadingRules}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-600" /> Cấu hình
                      quy tắc điểm thưởng
                    </CardTitle>
                    <CardDescription>
                      Thiết lập điểm thưởng cho các hành động của người dùng
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hành động</TableHead>
                      <TableHead>Điểm thưởng</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">
                          {REWARD_ACTION_LABELS[rule.actionType]}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">
                            +{rule.points}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {rule.description}
                        </TableCell>
                        <TableCell className="text-right flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200"
                            onClick={() => handleEditRuleClick(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Edit Points Dialog */}
                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Chỉnh sửa điểm thưởng</DialogTitle>
                      <DialogDescription>
                        Cập nhật điểm thưởng cho hành động:{" "}
                        {editingRule?.actionName}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <InputField
                        label="Điểm thưởng"
                        type="number"
                        value={newPoints}
                        onChange={(e) => setNewPoints(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="cancelled"
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleSaveRuleEdit}
                        disabled={loading}
                      >
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </LoadingCard>
        </TabsContent>
        {/* Tab: Kho phần thưởng */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-blue-600" /> Quản lý kho phần
                    thưởng
                  </CardTitle>
                  <CardDescription>
                    Quản lý các phần thưởng có thể đổi bằng điểm
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsCreateRewardDialogOpen(true)}
                  className="h-11 px-6 bg-blue-500 hover:bg-blue-700 text-white rounded-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm phần thưởng
                </Button>

                <Dialog
                  open={isCreateRewardDialogOpen}
                  onOpenChange={setIsCreateRewardDialogOpen}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm phần thưởng mới</DialogTitle>
                      <DialogDescription>
                        Tạo phần thưởng mới cho kho
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <InputField
                        label="Tên phần thưởng"
                        placeholder="Ví dụ: Voucher Shopee 50k"
                        value={rewardForm.name}
                        onChange={(e) =>
                          setRewardForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                      <InputField
                        label="Giá điểm"
                        type="number"
                        placeholder="500"
                        value={rewardForm.pointCost}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRewardForm((prev) => ({
                            ...prev,
                            pointCost: val === "" ? "" : Number(val),
                          }));
                        }}
                      />
                      <InputField
                        label="Số lượng"
                        type="number"
                        placeholder="20"
                        value={rewardForm.stock}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRewardForm((prev) => ({
                            ...prev,
                            stock: val === "" ? "" : Number(val),
                          }));
                        }}
                      />
                      <Label>Danh mục</Label>
                      <SimpleSelect
                        value={rewardForm.category}
                        onValueChange={(value) =>
                          setRewardForm((prev) => ({
                            ...prev,
                            category: value,
                          }))
                        }
                        placeholder="Chọn danh mục"
                        options={rewardOptions}
                      />
                      <Label>Hình ảnh</Label>
                      <label className="cursor-pointer inline-flex items-center px-2 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100">
                        Chọn ảnh
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSelectedFile(e.target.files[0]);
                              setImageUrl(
                                URL.createObjectURL(e.target.files[0])
                              );
                            }
                          }}
                        />
                      </label>
                      {imageUrl && (
                        <div className="relative mt-2 w-32 h-32 border-gray-300 border rounded-md overflow-hidden">
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="object-cover w-full h-full"
                          />
                          {uploading && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <span className="text-white text-sm">
                                Đang tải...
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="cancelled"
                        onClick={() => setIsCreateRewardDialogOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        variant="green"
                        onClick={handleCreateReward}
                        disabled={uploading || loadingCreateReward}
                      >
                        {loadingCreateReward
                          ? "Đang tạo..."
                          : uploading
                          ? "Đang tải..."
                          : "Lưu phần thưởng"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => (
                  <Card
                    key={reward.id}
                    className="border hover:shadow-md transition"
                  >
                    <CardHeader className="pb-3 flex justify-between">
                      <div>
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {REWARD_CATEGORY_LABELS[reward.category]}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200"
                          onClick={() => handleEditRewardClick(reward)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200"
                          onClick={() => setDeleteRewardId(reward.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Giá điểm:</span>
                        <Badge className="bg-orange-100 text-orange-800">
                          {reward.pointCost}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Còn lại:</span>
                        <span>{reward.stock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Đã đổi:</span>
                        <span className="text-green-600">{reward.claimed}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* DIALOG EDIT REWARD */}
          <Dialog
            open={isEditRewardDialogOpen}
            onOpenChange={setIsEditRewardDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chỉnh sửa phần thưởng</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin phần thưởng
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <InputField
                  label="Tên phần thưởng"
                  value={rewardForm.name}
                  onChange={(e) =>
                    setRewardForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <InputField
                  label="Giá điểm"
                  type="number"
                  value={rewardForm.pointCost}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRewardForm((prev) => ({
                      ...prev,
                      pointCost: val === "" ? "" : Number(val),
                    }));
                  }}
                />
                <InputField
                  label="Số lượng"
                  type="number"
                  value={rewardForm.stock}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRewardForm((prev) => ({
                      ...prev,
                      stock: val === "" ? "" : Number(val),
                    }));
                  }}
                />

                <Label>Danh mục</Label>
                <SimpleSelect
                  value={rewardForm.category.toString()}
                  onValueChange={(value) =>
                    setRewardForm((prev) => ({ ...prev, category: value }))
                  }
                  placeholder="Chọn danh mục"
                  options={rewardOptions}
                />

                <Label>Hình ảnh</Label>
                <label className="cursor-pointer inline-flex items-center px-2 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100">
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {imageUrl && (
                  <div className="relative mt-2 w-32 h-32 border-gray-300 border rounded-md overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="cancelled"
                  onClick={() => setIsEditRewardDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="green"
                  onClick={handleSaveRewardEdit}
                  disabled={uploading || loadingUpdateReward}
                >
                  {loadingUpdateReward
                    ? "Đang lưu..."
                    : uploading
                    ? "Đang tải..."
                    : "Lưu thay đổi"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* DIALOG DELETE REWARD */}
          <Dialog
            open={deleteRewardId !== null}
            onOpenChange={() => setDeleteRewardId(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận xóa phần thưởng</DialogTitle>
                <DialogDescription>
                  Bạn có chắc muốn xóa phần thưởng này không? Hành động này
                  không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2">
                <Button
                  variant="cancelled"
                  onClick={() => setDeleteRewardId(null)}
                >
                  Hủy
                </Button>
                <Button
                  variant="red"
                  onClick={async () => handleDeleteReward(deleteRewardId)}
                  disabled={loadingDeleteReward}
                >
                  {loadingDeleteReward ? "Đang xóa..." : "Xóa"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        {/* Reward Pickups Tab */}
        <TabsContent value="pickups" className="space-y-6">
          <LoadingCard isLoading={loadingPickups}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-indigo-600" />
                      Quản lý nhận thưởng
                    </CardTitle>
                    <CardDescription>
                      Danh sách phần thưởng đã đổi và trạng thái nhận thưởng
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="min-h-[400px]">
                {/* Filter and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
                      value={pickupSearchInput}
                      onChange={(e) => setPickupSearchInput(e.target.value)} // cập nhật input khi gõ
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setPickupSearch(pickupSearchInput);
                          setCurrentPage(1);
                        }
                      }}
                      className="w-full"
                    />
                  </div>

                  <SimpleSelect
                    value={pickupFilter}
                    onValueChange={(value) => {
                      setPickupFilter(value);
                      setCurrentPage(1);
                    }}
                    options={[
                      { value: "all", label: "Tất cả" },
                      { value: "0", label: "Chưa nhận" },
                      { value: "1", label: "Đã nhận" },
                    ]}
                  />
                </div>

                {/* Table */}
                <div className="">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Học sinh</TableHead>
                        <TableHead>Phần thưởng</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead>Ngày đổi</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pickups.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-gray-500 py-8"
                          >
                            Không tìm thấy kết quả phù hợp
                          </TableCell>
                        </TableRow>
                      ) : (
                        pickups.map((pickup) => (
                          <TableRow key={pickup.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {pickup.userName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {pickup.studentId}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {pickup.rewardName}
                            </TableCell>
                            <TableCell>{pickup.quantity}</TableCell>
                            <TableCell>
                              {pickup.status !== 0
                                ? new Date(
                                    pickup.redeemedAt
                                  ).toLocaleDateString("vi-VN")
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {pickup.status === 0 ? (
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                >
                                  Chưa nhận
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200"
                                >
                                  Đã nhận
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {pickup.status === 0 ? (
                                <Button
                                  variant="indigo"
                                  onClick={() => {
                                    setSelectedPickup(pickup);
                                    setIsPickupDialogOpen(true);
                                  }}
                                  className="py-0"
                                >
                                  Nhận
                                </Button>
                              ) : (
                                <span className="text-sm text-gray-400">
                                  Đã xử lý
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                      {Math.min(currentPage * itemsPerPage, totalPickups)} trong
                      tổng số {totalPickups} kết quả
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "indigo" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </LoadingCard>
          {/* Pickup Confirmation Dialog */}
          <Dialog
            open={isPickupDialogOpen}
            onOpenChange={setIsPickupDialogOpen}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Xác nhận nhận thưởng</DialogTitle>
                <DialogDescription>
                  Vui lòng kiểm tra thông tin học sinh trước khi xác nhận
                </DialogDescription>
              </DialogHeader>
              {selectedPickup && (
                <div className="space-y-4 py-4">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Học sinh</div>
                      <div className="font-medium text-gray-900">
                        {selectedPickup.userName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Mã học sinh</div>
                      <div className="font-mono font-bold text-lg text-indigo-600">
                        {selectedPickup.studentNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Phần thưởng</div>
                      <div className="font-medium text-gray-900">
                        {selectedPickup.rewardName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Số lượng</div>
                      <div className="font-medium text-gray-900">
                        {selectedPickup.quantity}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Ngày đổi</div>
                      <div className="font-medium text-gray-900">
                        {new Date().toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Lưu ý:</strong> Vui lòng đối chiếu mã học sinh với
                      thẻ học sinh của người đến nhận trước khi xác nhận.
                    </p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="cancelled"
                  onClick={() => setIsPickupDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="indigo"
                  onClick={handlePickupConfirm}
                  disabled={loadingPickup}
                >
                  {loadingPickup ? "Đang xử lý..." : "Xác nhận đã nhận"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tab: Bảng xếp hạng */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" /> Bảng xếp hạng
                điểm thưởng
              </CardTitle>
              <CardDescription>Top người dùng có điểm cao nhất</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        user.rank === 1
                          ? "bg-yellow-500"
                          : user.rank === 2
                          ? "bg-gray-400"
                          : user.rank === 3
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {user.rank}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        {user.points} điểm
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      user.change.startsWith("+")
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.change}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InputField({ label, placeholder, type = "text", value, onChange }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
