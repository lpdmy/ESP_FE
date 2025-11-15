import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { Button } from "@/common/components/ui/button";
import { useClubApi } from "../hooks/useClubApi";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/common/utils/upload";
import { useToast } from "@/common/hooks/useToast";
import { SimpleSelect } from "@/common/components/ui/select";
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

export default function ClubBasicInfoForm({ clubInfo }) {
  const { updateClub } = useClubApi();
  const [avatarUrl, setAvatarUrl] = useState(clubInfo?.avatarUrl || "");
  const [coverUrl, setCoverUrl] = useState(clubInfo?.coverUrl || "");

  const [clubName, setClubName] = useState(clubInfo?.name || "");
  const [shortDescription, setShortDescription] = useState(
    clubInfo?.shortDescription || ""
  );
  const [presidentUserId, setPresidentUserId] = useState(
    clubInfo?.presidentUserId || 0
  );
  const [id, SetId] = useState(clubInfo?.id);
  const [description, setDescription] = useState(clubInfo?.description || "");
  const [category, setCategory] = useState(clubInfo?.categoryId || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [categoryId, setCategoryId] = useState(clubInfo?.categoryId || 0);
  const [coverFile, setCoverFile] = useState(null);
  const [requirements, setRequirements] = useState(
    clubInfo?.requirements || ""
  );
  const [allowAutoJoin, setAllowAutoJoin] = useState(
    clubInfo?.allowAutoJoin || false
  );
  const [contactEmail, setContactEmail] = useState(
    clubInfo?.contactEmail || ""
  );
  const [contactPhone, setContactPhone] = useState(
    clubInfo?.contactPhone || ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl(""); // ✅ Xóa link cũ
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };
  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverUrl(""); // ✅ Xóa link cũ
    if (coverInputRef.current) coverInputRef.current.value = "";
  };
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const toast = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const avatarUrl = avatarFile ? await uploadImage(avatarFile) : "";
      const coverUrl = coverFile ? await uploadImage(coverFile) : "";
      const payload = {
        id,
        presidentUserId,
        name: clubName,
        shortDescription,
        description,
        categoryId,
        avatarUrl,
        coverUrl,
        requirements,
        allowAutoJoin,
        contactEmail,
        contactPhone,
      };
      await updateClub(payload);
      toast.showSuccess("Cập nhật câu lạc bộ thành công!");
    } catch (e) {
      toast.showError("Có lỗi xảy ra khi cập nhật câu lạc bộ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cơ bản</CardTitle>
        <p className="text-sm text-gray-600">
          Điền thông tin chi tiết về CLB của bạn
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Tên CLB *</Label>
          <Input
            placeholder="VD: CLB Lập trình, CLB Toán nâng cao..."
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Mô tả ngắn *</Label>
          <Input
            placeholder="Tối đa 100 ký tự"
            maxLength={100}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Mô tả chi tiết *</Label>
          <Textarea
            className="min-h-[120px]"
            placeholder="Mô tả chi tiết về mục tiêu, hoạt động..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Danh mục *</Label>
          <SimpleSelect
            value={category}
            onValueChange={(value) => {
              setCategory(value);
              setCategoryId(Number(value));
            }}
            options={categories}
            placeholder="Chọn danh mục"
          />
        </div>

        {/* Avatar */}
        <div className="space-y-4">
          <Label>Ảnh đại diện *</Label>
          <input
            type="file"
            accept="image/*"
            ref={avatarInputRef}
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <div className="border border-dashed p-4 rounded-lg text-center">
            <div className="relative w-32 h-32 mx-auto">
              {avatarFile || avatarUrl ? (
                <>
                  <img
                    src={
                      avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl
                    }
                    alt="Ảnh đại diện"
                    className="rounded-lg w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveAvatar()}
                    className="absolute top-0 right-0 bg-white rounded-full p-1 shadow"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Kéo thả hoặc chọn ảnh
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    Chọn ảnh
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Cover */}
        <div className="space-y-4">
          <Label>Ảnh bìa (tuỳ chọn)</Label>
          <input
            type="file"
            accept="image/*"
            ref={coverInputRef}
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <div className="border border-dashed p-4 rounded-lg text-center">
            <div className="relative w-full h-40 mx-auto">
              {coverFile || coverUrl ? (
                <>
                  <img
                    src={coverFile ? URL.createObjectURL(coverFile) : coverUrl}
                    alt="Ảnh bìa"
                    className="rounded-lg w-full h-40 object-cover"
                  />
                  <button
                    onClick={handleRemoveCover}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Ảnh bìa trang chi tiết
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    Chọn ảnh bìa
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <Label>Yêu cầu kiến thức/kỹ năng</Label>
          <Textarea
            placeholder="VD: Có kiến thức cơ bản về lập trình..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email liên hệ *</Label>
            <Input
              type="email"
              placeholder="contact@example.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Số điện thoại</Label>
            <Input
              placeholder="0123456789"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button
            className="flex-1 btn-primary flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              "Cập nhật"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
