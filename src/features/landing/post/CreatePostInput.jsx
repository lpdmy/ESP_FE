import React, { useState } from 'react';
import { Card } from '@/common/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/common/components/ui/avatar';
import { ImageIcon } from 'lucide-react';
import { useSelector } from 'react-redux';

const CreatePostInput = ({ onOpenModal }) => {
  // Get user data from Redux store
  const user = useSelector((state) => state.user.user);
  // Computed user values
  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.username || "Người dùng";
  
  const userAvatar = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.username ? user.username[0].toUpperCase() : 'U';
  return (
    <Card className="p-4 bg-gradient-to-r from-white to-orange-50/30 backdrop-blur-sm border border-orange-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center space-x-3 mb-3">
        <Avatar className="h-12 w-12 ring-2 ring-orange-200">
          <AvatarImage src={user?.avatarUrl || null} alt="Avatar" />
          <AvatarFallback className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-semibold">
            {userAvatar}
          </AvatarFallback>
        </Avatar>

        <div
          className="flex-1 bg-gray-50 hover:bg-gray-100 rounded-full px-4 py-3 cursor-pointer transition-all duration-200 hover:shadow-sm"
          onClick={onOpenModal}
        >
          <span className="text-gray-500">Bạn đang nghĩ gì, {userName.split(" ")[0]}?</span>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-6 pt-2 border-t border-gray-100">
        <div
          className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-orange-50 transition-all duration-200 hover:scale-105"
          onClick={onOpenModal}
        >
          <ImageIcon className="h-5 w-5 text-orange-600" />
          <span className="text-sm text-gray-600 font-medium">Ảnh/Video</span>
        </div>

        <div
          className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-orange-50 transition-all duration-200 hover:scale-105"
          onClick={onOpenModal}
        >
          <span className="text-lg">😊</span>
          <span className="text-sm text-gray-600 font-medium">Cảm xúc</span>
        </div>

        <div
          className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-orange-50 transition-all duration-200 hover:scale-105"
          onClick={onOpenModal}
        >
          <span className="text-lg">🎬</span>
          <span className="text-sm text-gray-600 font-medium">GIF</span>
        </div>
      </div>
    </Card>
  );
};

export default CreatePostInput;
