import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus } from "lucide-react"
import { ROLE, ROLE_LABELS } from "@/common/constants/roles"
import { USER_MESSAGES } from "@/common/constants/messages/user"

export default function AddUserDialog({ open, onOpenChange, onCreateUser }) {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: ROLE.STUDENT,
  })

  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setNewUser((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" })) 
  }

  const validate = () => {
    const newErrors = {}
    if (!newUser.username) newErrors.username = USER_MESSAGES.USERNAME_REQUIRED
    if (!newUser.email) newErrors.email = USER_MESSAGES.EMAIL_REQUIRED
    else if (!/\S+@\S+\.\S+/.test(newUser.email)) newErrors.email = USER_MESSAGES.EMAIL_INVALID
    if (!newUser.firstName) newErrors.firstName = USER_MESSAGES.FIRSTNAME_REQUIRED
    if (!newUser.lastName) newErrors.lastName = USER_MESSAGES.LASTNAME_REQUIRED
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onCreateUser(newUser)
    setNewUser({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      role: ROLE.STUDENT,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm người dùng
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Thêm người dùng mới</DialogTitle>
          <DialogDescription>
            Điền thông tin bên dưới để tạo tài khoản người dùng.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Username */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              ID *
            </Label>
            <div className="col-span-3">
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="Nhập ID của người dùng"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email *
            </Label>
            <div className="col-span-3">
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Nhập email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Họ */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              Họ *
            </Label>
            <div className="col-span-3">
              <Input
                id="firstName"
                value={newUser.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="Nhập họ"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
          </div>

          {/* Tên */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Tên *
            </Label>
            <div className="col-span-3">
              <Input
                id="lastName"
                value={newUser.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Nhập tên"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Số điện thoại */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phoneNumber" className="text-right">
              SĐT
            </Label>
            <Input
              id="phoneNumber"
              value={newUser.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              className="col-span-3"
              placeholder="Nhập số điện thoại"
            />
          </div>

          {/* Role */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Vai trò
            </Label>
            <Select
              value={String(newUser.role)}
              onValueChange={(value) => handleChange("role", Number(value))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(ROLE.STUDENT)}>
                  {ROLE_LABELS[ROLE.STUDENT]}
                </SelectItem>
                <SelectItem value={String(ROLE.TEACHER)}>
                  {ROLE_LABELS[ROLE.TEACHER]}
                </SelectItem>
                <SelectItem value={String(ROLE.ADMIN)}>
                  {ROLE_LABELS[ROLE.ADMIN]}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            Tạo người dùng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
