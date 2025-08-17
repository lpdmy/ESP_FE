"use client"

import { BellOutlined, SearchOutlined, UserOutlined, MenuOutlined, CalendarOutlined, TrophyOutlined, StarOutlined } from "@ant-design/icons"
import { Button, Badge, Avatar, Input } from "antd"

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">EduSephia</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <Input
            placeholder="Tìm kiếm bạn bè, sự kiện, cuộc thi..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="h-12 text-base"
            size="large"
          />
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center space-x-6">
          <Button type="text" className="flex items-center space-x-2 hover:bg-orange-50">
            <CalendarOutlined className="text-lg" />
            <span>Sự kiện</span>
          </Button>
          
          <Button type="text" className="flex items-center space-x-2 hover:bg-orange-50">
            <TrophyOutlined className="text-lg" />
            <span>Cuộc thi</span>
          </Button>
          
          <Button type="text" className="flex items-center space-x-2 hover:bg-orange-50">
            <StarOutlined className="text-lg" />
            <span>Xếp hạng</span>
          </Button>

          {/* Notification */}
          <Badge count={1} className="bg-red-500">
            <Button type="text" icon={<BellOutlined className="text-xl" />} />
          </Badge>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <Avatar size={40} className="bg-orange-500">
              <span className="text-white font-bold">A</span>
            </Avatar>
            <span className="font-medium text-gray-800">Nguyễn Văn A</span>
          </div>

          {/* Share Button */}
          <Button 
            type="primary" 
            className="bg-gradient-to-r from-orange-500 to-orange-600 border-0 h-10 px-6 font-medium"
          >
            Share
          </Button>
        </div>
      </div>
    </header>
  )
}
