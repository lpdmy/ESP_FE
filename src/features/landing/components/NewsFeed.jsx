import { Plus, Image, Video, Smile } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { Card } from "@/common/components/ui/card"
import { Input } from "@/common/components/ui/input"
import PostCard from "./PostCard"

export default function NewsFeed() {
  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm border border-orange-100">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
                      <div className="flex-1">
              <textarea
                placeholder="Chia sẻ hoạt động học tập, nghệ thuật của bạn..."
                className="w-full p-3 mt-3 border border-gray-200 rounded-md text-base resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
              />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                  <Image className="h-4 w-4 mr-2" />
                  Ảnh
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50">
                  <Smile className="h-4 w-4 mr-2" />
                  Cảm xúc
                </Button>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 border-0 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Đăng bài
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts */}
      <PostCard
        author="Trần Thị B"
        class="12A2"
        time="2 giờ trước"
        content="Vừa hoàn thành tác phẩm vẽ tranh cho cuộc thi 'Màu sắc tuổi trẻ' 🎨 Mong mọi người ủng hộ em nhé!"
        image="/Picturemockdata/DSC04766.jpg"
        likes={24}
        comments={8}
        shares={3}
        isVerified={true}
        contestEntry={true}
      />

      <PostCard
        author="Lê Văn C"
        class="11A3"
        time="4 giờ trước"
        content="Workshop 'Lập trình Blockchain' hôm nay thật bổ ích! Cảm ơn thầy cô và các bạn đã tham gia 🚀 #BlockchainEducation #FPTSchool"
        likes={18}
        comments={12}
        shares={5}
        isVerified={true}
      />

      <PostCard
        author="Phạm Thị D"
        class="12A1"
        time="1 ngày trước"
        content="Chúc mừng đội văn nghệ lớp mình đã giành giải nhất cuộc thi 'Tài năng trẻ FPT' 🏆 Cảm ơn sự ủng hộ của mọi người!"
        image="/Picturemockdata/DSC03778.jpg"
        likes={45}
        comments={20}
        shares={8}
        isVerified={true}
      />

      <PostCard
        author="Hoàng Văn E"
        class="10A4"
        time="2 ngày trước"
        content="Tác phẩm nhiếp ảnh 'Góc nhìn tuổi trẻ' của em tham gia cuộc thi nhiếp ảnh năm nay. Mọi người cho em ý kiến nhé! 📸"
        image="/Picturemockdata/IMG_1492.jpg"
        likes={32}
        comments={15}
        shares={6}
        isVerified={true}
        contestEntry={true}
      />
    </div>
  )
}
