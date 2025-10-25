import { useEffect, useState } from "react";
import { X, Edit3, Save } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Input } from "@/common/components/ui/input";

export default function StaffDetailModal({
  employee,
  permissionsList,
  open,
  onClose,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(employee || {});

  useEffect(() => {
    if (employee) setFormData(employee);
  }, [employee]);

  if (!employee || !open) return null;

  const permissionNames =
    employee?.permissions?.map((code) => {
      const match = permissionsList.find((p) => p.label === code);
      return match?.name || code;
    }) || [];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Dữ liệu đã chỉnh sửa:", formData);
    // TODO: Gọi API cập nhật thông tin ở đây
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {isEditing
                  ? "Chỉnh sửa thông tin nhân viên"
                  : "Thông tin nhân viên"}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditing
                  ? "Bạn có thể chỉnh sửa các trường thông tin của nhân viên bên dưới"
                  : "Dưới đây là thông tin chi tiết của nhân viên"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing((prev) => !prev)}
              className={`flex items-center gap-2 ${
                isEditing
                  ? "border-green-500 text-green-600 hover:bg-green-50"
                  : "border-blue-500 text-blue-600 hover:bg-blue-50"
              }`}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" /> Lưu
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> Chỉnh sửa
                </>
              )}
            </Button>
          </div>
        </div>
        {/* Nội dung */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
          <div>
            <p className="text-sm text-gray-500 font-medium">Họ:</p>
            {isEditing ? (
              <Input
                value={formData.firstName || ""}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            ) : (
              <p className="text-base font-semibold text-gray-900">
                {employee.firstName || "—"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 font-medium">Tên:</p>
            {isEditing ? (
              <Input
                value={formData.lastName || ""}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            ) : (
              <p className="text-base font-semibold text-gray-900">
                {employee.lastName || "—"}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <p className="text-sm text-gray-500 font-medium">Email:</p>
            {isEditing ? (
              <Input
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            ) : (
              <p className="text-base font-semibold text-gray-900">
                {employee.email}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 font-medium">Số điện thoại:</p>
            {isEditing ? (
              <Input
                value={formData.phoneNumber || ""}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />
            ) : (
              <p className="text-base font-semibold text-gray-900">
                {employee.phoneNumber || "Chưa có"}
              </p>
            )}
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500 font-medium mb-2">
              Quyền được cấp:
            </p>
            {permissionNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {permissionNames.map((name, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium px-2.5 py-1 rounded-lg"
                  >
                    {name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Chưa được cấp quyền
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-8 border-t border-gray-100 pt-4 gap-3">
          {isEditing && (
            <Button
              onClick={() => {
                setIsEditing(false);
                setFormData(employee); // hủy
              }}
              variant="outline"
              className="border-gray-300"
            >
              Hủy
            </Button>
          )}
          <Button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
