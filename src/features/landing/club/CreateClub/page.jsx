import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { uploadImage } from "@/common/utils/upload";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { Checkbox } from "@/common/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SimpleSelect,
} from "@/common/components/ui/select";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Calendar,
  Users,
  Target,
  BookOpen,
  Lightbulb,
  Info,
  Loader2,
} from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/common/components/ui/Tabs";
import { useClubApi } from "../hooks/useClubApi";
import { useToast } from "@/common/hooks/useToast";
const categories = [
  { value: 9, label: "Công nghệ" },
  { value: 10, label: "Học tập" },
  { value: 11, label: "Nghệ thuật" },
  { value: 12, label: "Ngôn ngữ" },
  { value: 13, label: "Khoa học" },
  { value: 14, label: "Thể thao" },
  { value: 15, label: "Âm nhạc" },
  { value: 16, label: "Nhiếp ảnh" },
  { value: 17, label: "Khác" },
];

import { useNavigate } from "react-router-dom";
function CreateClub() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openCategory, setOpenCategory] = useState(false);
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [clubName, setClubName] = useState("");
  const [categoryId, setCategoryId] = useState(0);
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [requirements, setRequirements] = useState("");
  const [allowAutoJoin, setAllowAutoJoin] = useState(false);
  const [allowMembersToPost, setAllowMembersToPost] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [errors, setErrors] = useState({ email: "", phone: "" });
  const [error, setError] = useState("");
  const { createClub } = useClubApi();
  const toast = useToast();
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file); // dùng hàm bạn đã viết
      setAvatarUrl(url); // cập nhật state
    } catch (err) {
      console.error("Upload thất bại:", err);
    }
  };
  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Bạn phải đồng ý với điều khoản trước khi tiếp tục");
      return;
    }
    setError("");
    setLoading(true);
    try {
      let uploadedAvatarUrl = avatarUrl;
      let uploadedCoverUrl = coverUrl;
      if (avatarFile) {
        uploadedAvatarUrl = await uploadImage(avatarFile);
        setAvatarUrl(uploadedAvatarUrl);
      }
      if (coverFile) {
        uploadedCoverUrl = await uploadImage(coverFile);
        setCoverUrl(uploadedCoverUrl);
      }
      const payload = {
        description,
        shortDescription,
        clubName,
        categoryId,
        avatarUrl: uploadedAvatarUrl,
        coverUrl: uploadedCoverUrl,
        requirements,
        allowAutoJoin,
        allowMembersToPost,
        contactEmail,
        contactPhone,
      };
      const response = await createClub(payload);
      handleAvatarUpload()
      toast.createClubSuccess();
    } catch (error) {
      console.error("Lỗi khi tạo CLB:", error);
      toast.showError(error.message);
    }
  };

  const handleChooseAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file); // ✅ chỉ lưu file để preview
    }
  };
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl(""); // reset luôn URL
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };
  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverUrl("");
    if (coverInputRef.current) coverInputRef.current.value = "";
  };
  const handleChooseCover = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
    }
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email không được để trống";
    if (!emailRegex.test(email)) return "Email không hợp lệ";
    return "";
  };
  const validatePhone = (phone) => {
    const phoneRegex = /^0\d{9}$/;
    if (!phone) return ""; // không bắt buộc thì cho phép bỏ trống
    if (!phoneRegex.test(phone)) {
      return "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0";
    }
    return "";
  };
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setContactEmail(value);
    setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setContactPhone(value);
    setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold gradient-text mb-2">Tạo câu lạc bộ</h1>
          <p className="text-gray-600 text-lg">
            Tạo một cộng đồng học tập và chia sẻ kiến thức
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Thông tin cơ bản</CardTitle>
                <p className="text-gray-600">
                  Điền thông tin chi tiết về câu lạc bộ của bạn
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên câu lạc bộ *</Label>
                    <Input
                      id="name"
                      placeholder="Ví dụ: CLB Lập trình, CLB Toán nâng cao..."
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Mô tả ngắn *</Label>
                    <Input
                      id="shortDescription"
                      placeholder="Mô tả ngắn gọn về CLB (tối đa 100 ký tự)"
                      maxLength={100}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullDescription">Mô tả chi tiết *</Label>
                    <Textarea
                      id="fullDescription"
                      placeholder="Mô tả chi tiết về mục tiêu, hoạt động, lợi ích khi tham gia..."
                      className="min-h-[120px]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Danh mục *</Label>
                    <SimpleSelect
                      value={selectedCategory}
                      onValueChange={(value) => {
                        setSelectedCategory(value);
                        setCategoryId(Number(value));
                      }}
                      options={categories}
                      placeholder="Chọn danh mục"
                    />
                  </div>
                </div>
                {/* Cover Image */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hình ảnh</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Ảnh đại diện *</Label>
                      {/* Input ẩn để chọn file */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleChooseAvatar}
                        className="hidden"
                        id="avatarInput"
                        ref={avatarInputRef}
                      />
                      <div
                        className="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                        style={{
                          borderColor: avatarFile ? "#f97316" : "#d1d5db", // đổi màu viền nếu có ảnh
                        }}
                      >
                        {!avatarFile ? (
                          <>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 mb-2">
                              Kéo thả ảnh vào đây hoặc click để chọn
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent"
                              onClick={() =>
                                document.getElementById("avatarInput").click()
                              }
                            >
                              Chọn ảnh
                            </Button>
                            <p className="text-xs text-gray-500 mt-2">
                              PNG, JPG tối đa 5MB
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="relative w-32 h-32 mx-auto">
                              <img
                                src={URL.createObjectURL(avatarFile)}
                                alt="Ảnh đại diện"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 hover:bg-red-100 transition"
                                title="Xoá ảnh"
                              >
                                <X className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Ảnh bìa</Label>

                      {/* Input ẩn */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleChooseCover}
                        className="hidden"
                        id="coverInput"
                        ref={coverInputRef}
                      />

                      <div
                        className="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                        style={{              
                          borderColor: coverFile ? "#f97316" : "#d1d5db",
                        }}
                      >
                        {!coverFile ? (
                          <>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 mb-2">
                              Ảnh bìa cho trang chi tiết (tùy chọn)
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent"
                              onClick={() =>
                                document.getElementById("coverInput").click()
                              }
                            >
                              Chọn ảnh bìa
                            </Button>
                          </>
                        ) : (
                          <div className="relative mt-2">
                            <img
                              src={URL.createObjectURL(coverFile)}
                              alt="Ảnh bìa"
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveCover}
                              className="absolute top-2 right-2 bg-white border border-gray-300 rounded-full p-1 hover:bg-red-100 transition"
                              title="Xoá ảnh"
                            >
                              <X className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Requirements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Yêu cầu tham gia
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="requirements">
                        Yêu cầu kiến thức/kỹ năng
                      </Label>
                      <Textarea
                        id="requirements"
                        placeholder="Ví dụ: Có kiến thức cơ bản về lập trình, đam mê học hỏi công nghệ mới..."
                        className="min-h-[80px]"
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email liên hệ *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="contact@example.com"
                        value={contactEmail}
                        onChange={handleEmailChange}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Số điện thoại</Label>
                      <Input
                        id="contactPhone"
                        placeholder="0123456789"
                        value={contactPhone}
                        onChange={handlePhoneChange}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Terms */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onChange={setAcceptedTerms}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      Tôi đồng ý với các điều khoản và quy định của trường, cam
                      kết tổ chức các hoạt động tích cực và có ích *
                    </Label>
                  </div>
                </div>
                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Lưu nháp
                  </Button>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <Button
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                    onClick={handleCreateClub}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      "Tạo câu lạc bộ"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Xem trước</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {avatarFile ? (
                      <img
                        src={URL.createObjectURL(avatarFile)}
                        alt="Ảnh đại diện"
                        className="object-cover w-34 h-40"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Ảnh đại diện
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold break-words">
                      {clubName || "Tên CLB"}
                    </h3>
                    <p className="text-sm text-gray-600 break-words">
                      {shortDescription || "Mô tả ngắn sẽ hiển thị ở đây"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary">
                      {categories.find((c) => c.value === categoryId)?.label ||
                        "Danh mục"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Gợi ý
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Tên câu lạc bộ</p>
                    <p className="text-gray-600">
                      Chọn tên ngắn gọn, dễ nhớ và thể hiện rõ mục đích
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Mô tả chi tiết</p>
                    <p className="text-gray-600">
                      Nêu rõ mục tiêu, hoạt động và lợi ích khi tham gia
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Lịch hoạt động</p>
                    <p className="text-gray-600">
                      Chọn thời gian phù hợp với đa số học sinh
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Quy định
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-700">
                <p>• Phải có kế hoạch hoạt động cụ thể và báo cáo định kỳ</p>
                <p>• Tuân thủ các quy định của nhà trường</p>
                <p>• Hoạt động phải có tính giáo dục và tích cực</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function CreateClubRequestPage() {
  const [tab, setTab] = useState("create");
  return (
    <div className="max-w-5xl mx-auto py-8">
      <Tabs value={tab} onValueChange={setTab} defaultValue="create">

        <TabsContent value="create">
          <CreateClub />
        </TabsContent>
      </Tabs>
    </div>
  );
}
