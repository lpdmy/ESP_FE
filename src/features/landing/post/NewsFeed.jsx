import React, { useState } from 'react';
import PostCard from '../components/PostCard';
import CreatePostInput from './CreatePostInput';
import CreatePostModal from './CreatePostModal';

export default function NewsFeed() {
  // 1. State declarations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userName = "Nguyễn Văn A"; // This would come from user context in a real app

  // 4. Event handlers
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 5. Render
  return (
    <div className="space-y-6">
      <CreatePostInput 
        userName={userName}
        userAvatar="A"
        onOpenModal={handleOpenModal}
      />

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        userName={userName} 
        userAvatar="A" 
      />

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
  );
}
