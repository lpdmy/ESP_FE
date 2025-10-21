"use client";
import { XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Textarea } from "@/common/components/ui/textarea";
import { Label } from "@/common/components/ui/label";
import { SimpleSelect } from "@/common/components/ui/select";
import { useClubApi } from "@/features/landing/club/hooks/useClubApi";
import { useToast } from "@/common/hooks/useToast";
export default function CreateClubDialog({
  open,
  onClose,
  onSubmit,
}) {
  const { getClubCategory } = useClubApi();
  const toast = useToast();
  const [categoryId, setCategoryId] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const handleCategoryClub = async () => {
    try {
      const response = await getClubCategory();
      const data = response.data;
      setCategories(data);
      console.log(data);
    } catch (error) {
      console.log(error);
      toast.loadClubCategoryFail();
    }
  };
  useEffect(() => {
    handleCategoryClub()
  }, []);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Tạo Câu Lạc Bộ
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 p-2 transition"
            aria-label="Đóng"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </DialogHeader>

        <form
          className="space-y-6 mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            onSubmit?.(data);
          }}
        >
          {/* --- Thông tin cơ bản --- */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Tên CLB *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Ví dụ: CLB Lập trình..."
                />
              </div>
              <div>
                <Label htmlFor="category">Danh mục *</Label>
                <SimpleSelect
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value);
                    setCategoryId(Number(value));
                  }}
                  options={categories.map(cat => ({
    label: cat.name,
    value: cat.id,
  }))}
                  placeholder="Chọn danh mục"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="shortDesc">Mô tả ngắn *</Label>
              <Input
                id="shortDesc"
                name="shortDesc"
                required
                placeholder="Mô tả ngắn gọn (tối đa 100 ký tự)"
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="detailDesc">Mô tả chi tiết *</Label>
              <Textarea
                id="detailDesc"
                name="detailDesc"
                required
                placeholder="Mục tiêu, hoạt động, lợi ích..."
                rows={4}
              />
            </div>
          </section>

          {/* --- Hình ảnh --- */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Hình ảnh</h3>
            <div className="space-y-4">
              <div>
                <Label>Ảnh đại diện *</Label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  required
                  className="block w-full text-sm mt-2"
                />
              </div>
              <div>
                <Label>Ảnh bìa</Label>
                <input
                  type="file"
                  name="cover"
                  accept="image/*"
                  className="block w-full text-sm mt-2"
                />
              </div>
            </div>
          </section>
          {/* --- Thông tin liên hệ --- */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Thông tin liên hệ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Email liên hệ *</Label>
                <Input
                  type="email"
                  name="email"
                  required
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <Label>Số điện thoại *</Label>
                <Input
                  type="tel"
                  name="phone"
                  required
                  placeholder="0123456789"
                />
              </div>
            </div>
          </section>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Lưu nháp
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Tạo CLB
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
