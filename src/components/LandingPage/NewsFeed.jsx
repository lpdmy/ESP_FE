"use client"

import { PlusOutlined, PictureOutlined, VideoCameraOutlined, SmileOutlined } from "@ant-design/icons"
import { Button, Card, Input, Avatar } from "antd"

export default function NewsFeed() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="text-center py-8">
        <h1 className="text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Chào mừng đến với EduSephia
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Nền tảng kết nối học sinh THPT FPT School - Nơi chia sẻ, học hỏi và sáng tạo
        </p>
      </div>

      {/* Post Creation Box */}
      <Card className="p-6">
        <div className="flex items-start space-x-3">
          <Avatar size={48} className="bg-orange-500">
            <span className="text-white font-bold text-lg">A</span>
          </Avatar>
          <div className="flex-1">
            <Input
              placeholder="Chia sẻ hoạt động học tập, nghệ thuật của bạn..."
              className="text-base mb-4"
              size="large"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button type="text" icon={<PictureOutlined />} className="flex items-center space-x-2">
                  <span>Ảnh</span>
                </Button>
                <Button type="text" icon={<VideoCameraOutlined />} className="flex items-center space-x-2">
                  <span>Video</span>
                </Button>
                <Button type="text" icon={<SmileOutlined />} className="flex items-center space-x-2">
                  <span>Cảm xúc</span>
                </Button>
              </div>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                className="bg-gradient-to-r from-orange-500 to-orange-600 border-0 h-10 px-6 font-medium"
              >
                + Đăng bài
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Example Post */}
      <Card className="p-6">
        <div className="flex items-start space-x-3">
          <Avatar size={48} className="bg-orange-500">
            <span className="text-white font-bold text-lg">T</span>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-800">Trần Thị B</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">12A2</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">2 giờ trước</span>
            </div>
            
            <div className="mb-3">
              <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded mr-2">Blockchain</span>
              <span className="inline-block bg-purple-500 text-white text-xs px-2 py-1 rounded">Cuộc thi</span>
            </div>
            
            <p className="text-gray-800 mb-4">
              Vừa hoàn thành tác phẩm vẽ tranh cho cuộc thi 'Màu sắc tuổi trẻ' Mong mọi người ủng hộ em nhé!
            </p>
            
            {/* Image Placeholder */}
            <div className="bg-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
              <PictureOutlined className="text-4xl text-gray-400 mb-2" />
              <p className="text-gray-500">Hình ảnh</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
