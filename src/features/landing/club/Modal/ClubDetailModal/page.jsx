"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/common/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/common/components/ui/avatar";

export default function ClubDetailModal({ isOpen, onClose, club }) {
  if (!isOpen || !club) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Overlay mờ nền */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      ></div>

      {/* Modal nội dung */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="
            relative max-h-[90vh] overflow-y-auto 
            bg-white rounded-2xl shadow-2xl border border-gray-200 
            w-full max-w-3xl animate-in fade-in zoom-in-95
          "
        >
          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Cover section */}
          {club.coverUrl && (
            <div className="relative w-full h-52">
              <img
                src={club.coverUrl}
                alt="Cover"
                className="w-full h-full object-cover rounded-t-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-t-2xl"></div>
            </div>
          )}

          {/* Header */}
          <div className="p-6 pb-2 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">
              Thông tin câu lạc bộ
            </h2>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Avatar + Basic info */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border border-gray-200 shadow-sm">
                <AvatarImage src={club.avatarUrl} alt={club.name} />
                <AvatarFallback>
                  {club.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {club.name}
                </h2>
                <p className="text-gray-500 text-sm">
                  {club.shortDescription || "Không có mô tả ngắn."}
                </p>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <div>
                <span className="font-medium text-gray-700">Danh mục:</span>{" "}
                <span className="text-gray-800">
                  {club.categoryName || "Chưa có"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Yêu cầu kỹ năng:
                </span>{" "}
                <span className="text-gray-800">
                  {club.requirements || "Không có yêu cầu"}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="font-medium text-gray-700">
                  Mô tả chi tiết:
                </span>
                <p className="text-gray-800 mt-1 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                  {club.description || "Không có mô tả."}
                </p>
              </div>

              <div>
                <span className="font-medium text-gray-700">Email liên hệ:</span>{" "}
                <span className="text-gray-800">
                  {club.contactEmail || "Không có"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Số điện thoại:</span>{" "}
                <span className="text-gray-800">
                  {club.contactPhone || "Không có"}
                </span>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

            {/* Mentor + President */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Cố vấn:</span>{" "}
                <span className="text-gray-900 font-semibold">
                  {club.mentorName || "Chưa có cố vấn"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Chủ tịch:</span>{" "}
                <span className="text-gray-900 font-semibold">
                  {club.presidentName || "Chưa có chủ tịch"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
            <Button variant="outline" onClick={onClose} className="text-gray-700">
              <X className="w-4 h-4 mr-2" /> Đóng
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
