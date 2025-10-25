import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/common/components/ui/dialog";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Button } from "@/common/components/ui/button";
import { Checkbox } from "@/common/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { X } from "lucide-react";
import { useStaffApi } from "@/features/admin/hooks/useStaffApi";
import { useToast } from "@/common/hooks/useToast";
// Schema xác thực dữ liệu
const schema = yup.object().shape({
  email: yup
    .string()
    .required("Email là bắt buộc")
    .email("Email không đúng định dạng"),
  firstName: yup
    .string()
    .required("Họ là bắt buộc")
    .max(100, "Tối đa 100 ký tự"),
  lastName: yup.string().max(100, "Tối đa 100 ký tự").nullable(),
  phoneNumber: yup
    .string()
    .nullable()
    .matches(
      /^(0|\+84)([0-9]{9})$/,
      "SĐT phải bắt đầu bằng 0 hoặc +84 và gồm đúng 10 số"
    ),
  password: yup.string().required("Mật khẩu là bắt buộc"),
});

export default function CreateEmployeeModal({ permissions,onCreated }) {
  const {createStaff} = useStaffApi()
  const [open, setOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const toast =useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const handlePermissionToggle = (id, checked) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, id]);
    } else {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== id));
    }
  };

  const onSubmit = async (data) => {
  const fullData = {
    ...data,
    permission: selectedPermissions,
  };
  // Nếu chưa chọn quyền, cảnh báo nhẹ
  if (selectedPermissions.length === 0) {
    return;
  }
  try {
    const res = await createStaff(fullData); 
    console.log(fullData)
    console.log(fullData.permissions)
    setOpen(false);
    toast.createStaffSuccess()
    onCreated?.();
  } catch (err) {
    if (err.statusCode==400) {
      toast.showError(err.message)
    } else {
      toast.createStaffFail()
    }
  }
};
useEffect
  return (
    <>
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white p-5"
        onClick={() => setOpen(true)}
      >
        Tạo nhân viên
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Tạo nhân viên mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để thêm nhân viên vào hệ thống
            </DialogDescription>
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              aria-label="Đóng"
              type="button"
            >
              <X/>
            </button>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid gap-1">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-1">
              <Label htmlFor="firstName">Họ *</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && (
                <p className="text-red-600 text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="grid gap-1">
              <Label htmlFor="lastName">Tên</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-red-600 text-sm">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="grid gap-1">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input id="phoneNumber" {...register("phoneNumber")} />
              {errors.phoneNumber && (
                <p className="text-red-600 text-sm">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="grid gap-1">
              <Label htmlFor="password">Mật khẩu *</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-red-600 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Quyền hạn */}
            <div className="grid gap-2">
              <Label>Chọn quyền nhân viên</Label>
              <div className="grid grid-cols-2 gap-3 max-h-70 overflow-y-auto">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start space-x-2"
                  >
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={(isChecked) => {
                        if (isChecked) {
                          setSelectedPermissions([
                            ...selectedPermissions,
                            permission.id,
                          ]);
                        } else {
                          setSelectedPermissions(
                            selectedPermissions.filter(
                              (p) => p !== permission.id
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

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" type="submit">
                Tạo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
