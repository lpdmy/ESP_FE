import { useEffect, useState } from "react";
import { X, Edit3, Save } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Checkbox } from "@/common/components/ui/checkbox";
import { useStaffApi } from "@/features/admin/hooks/useStaffApi";
import { useToast } from "@/common/hooks/useToast";
export default function StaffDetailModal({
  employee,
  permissionsList,
  open,
  onClose,
}) {
  const { updateStaff } = useStaffApi();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(employee || {});
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (employee) {
      setFormData(employee);
      setSelectedPermissions(employee.permissions || []);
    }
  }, [employee]);
  const mapLabelsToIds = (labels, permissionsList) => {
    return permissionsList
      .filter((perm) => labels.includes(perm.label))
      .map((perm) => perm.id);
  };
  if (!employee || !open) return null;

  const permissionNames =
    employee?.permissions?.map((code) => {
      const match = permissionsList.find((p) => p.label === code);
      return match?.name || code;
    }) || [];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (id) => {
    const permissionIds = mapLabelsToIds(selectedPermissions, permissionsList);

    const updatedData = {
      ...formData,
      permission: permissionIds,
      id: id,
    };
    try {
      await updateStaff(updatedData);
      toast.updateStaffSuccess();
    } catch (err) {
      if (err.statusCode == 400) {
        toast.showError(err.messsage);
      } else {
        toast.updateStaffFail();
      }
    } finally {
      setIsEditing(false);
      setIsSaving(false);
    }
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
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Đóng"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
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
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <Edit3 className="w-4 h-4" /> Chỉnh sửa
              </Button>
            )}
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
            <p className="text-sm text-gray-500 font-medium ">Email:</p>
            {isEditing ? (
              <Input
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            ) : (
              <p className="text-base font-semibold text-gray-900">
                {employee.email}
              </p>
            )}
          </div>
          <div className="col-span-2">
            {isEditing && (
              <>
                <p className="text-sm text-gray-500 font-medium">
                  Mật khẩu mới:
                </p>
                <Input
                  type="password"
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Nhập mật khẩu mới (nếu muốn đổi)"
                />
                <p className="text-xs text-gray-400 italic mt-1">
                  Để trống nếu không muốn thay đổi mật khẩu
                </p>
              </>
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
            {isEditing ? (
              <div className="grid gap-2">
                <Label>Chọn quyền nhân viên</Label>
                <div className="grid grid-cols-2 gap-3 max-h-70 overflow-y-auto">
                  {permissionsList.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-2"
                    >
                      <Checkbox
                        id={permission.id}
                        checked={
                          !!selectedPermissions.includes(permission.label)
                        } // ép kiểu boolean
                        onChange={(isChecked) => {
                          if (isChecked) {
                            setSelectedPermissions([
                              ...selectedPermissions,
                              permission.label,
                            ]);
                          } else {
                            setSelectedPermissions(
                              selectedPermissions.filter(
                                (p) => p !== permission.label
                              )
                            );
                          }
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium"
                        >
                          {permission.name}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : permissionNames.length > 0 ? (
              <div className=" flex-wrap gap-2">
                <p className="text-sm text-gray-500 font-medium mb-2">
                  Quyền được cấp:
                </p>
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
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(employee); // hủy chỉnh sửa
                }}
                variant="outline"
                className="border-gray-300"
              >
                Hủy
              </Button>

              <Button
                onClick={() => handleSave(employee.id)}
                disabled={isSaving}
                className="border border-green-500 text-green-600 hover:bg-green-50"
              >
                <Save />
                {isSaving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
