"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/common/components/ui/avatar";
import { useClubApi } from "../../hooks/useClubApi";
export default function MentorInvitationModal({
  isOpen,
  onClose,
  onAccept,
  onReject,
}) {
  if (!isOpen) return null;

  const [invitations, setInvitation] = useState([]);

  const { getInvitation } = useClubApi();
  const handleInvitation = async () => {
    try {
      const response = await getInvitation();
      const data = response.data.data;
      setInvitation(data);
    } catch (err) {
    }
  };
  useEffect(()=>{
    handleInvitation()
  },[])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 pointer-events-auto border border-gray-200">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Lời mời cố vấn từ câu lạc bộ
        </h2>
        <p className="text-gray-500 text-sm mb-5">
          Các CLB đã gửi lời mời bạn làm cố vấn. Bạn có thể chấp nhận hoặc từ
          chối.
        </p>

        {/* Danh sách lời mời */}
        <div className="max-h-[350px] overflow-y-auto space-y-3">
          {invitations.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
              Hiện tại bạn chưa có lời mời nào.
            </div>
          ) : (
            invitations.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between border border-gray-200 rounded-xl p-3 bg-gradient-to-br from-white to-orange-50 hover:shadow-md transition"
              >
                {/* CLB info */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={invite.clubAvatarUrl || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {invite.clubName?.[0]?.toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {invite.clubName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Mời vào ngày{" "}
                      {new Date(invite.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
                    onClick={() => onAccept(invite.id)}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Chấp nhận
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-400 hover:bg-red-50 flex items-center gap-1"
                    onClick={() => onReject(invite.id)}
                  >
                    <XCircle className="w-4 h-4" />
                    Từ chối
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
