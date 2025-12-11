"use client";

import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/common/components/ui/avatar";
import { useClubApi } from "../../hooks/useClubApi";
export default function FindMentorModal({ isOpen, onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [pageSize,setPageSize] = useState(10)
  const [pageNumber,setPageNumber] = useState(1)
  const {getTeacher} = useClubApi()
  if (!isOpen) return null;

  // 🧠 Giả lập tìm kiếm mentor (sau có thể thay bằng API thật)
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    const role = 2;
      try{
         const response = await getTeacher(role,pageNumber,pageSize,searchTerm)
         const data = response.data.data
         setResults(data)
         console.log(data)
      }catch(err){
       console.log(err)
      }
  };

  const handleSelect = (mentor) => {
    if (onSelect) onSelect(mentor);
    onClose();
  };

 return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 pointer-events-auto border border-gray-200">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Tìm cố vấn (Mentor)
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Nhập tên cố vấn để tìm và mời vào câu lạc bộ.
        </p>

        {/* Ô tìm kiếm */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nhập tên cố vấn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            className="btn-primary flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Tìm
          </Button>
        </div>

        {/* Kết quả */}
        <div className="max-h-[300px] overflow-y-auto space-y-3">
          {results.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
              Chưa có kết quả tìm kiếm nào.
            </div>
          ) : (
            results.map((mentor) => (
              <div
                key={mentor.id}
                onClick={() => handleSelect(mentor)}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-orange-50 cursor-pointer transition"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={mentor.avatarUrl} />
                  <AvatarFallback>{mentor.fullName?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-800">
                    {`${mentor.lastName || ""} ${mentor.firstName || ""}`.trim() || "Không rõ tên"}
                  </div>
                  <div className="text-sm text-gray-500">{mentor.email}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-5">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
