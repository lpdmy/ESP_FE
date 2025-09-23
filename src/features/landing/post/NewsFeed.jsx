import React, { useState } from 'react';
import PostCard from '../components/PostCard';
import CreatePostInput from './CreatePostInput';
import CreatePostModal from './CreatePostModal';
import UpdatePostModal from './UpdatePostModal';
import DeletePostModal from './DeletePostModal';
import { useSelector } from 'react-redux';

// Import mock data
const postsData = [
  {
    "id": 1,
    "user": {
      "name": "Trần Văn Nam",
      "avatar": "/placeholder.svg?height=40&width=40"
    },
    "content": "Hôm nay có buổi thực hành thí nghiệm Hóa học rất thú vị! Các bạn có thích môn Hóa không? 🧪⚗️",
    "images": [
      "/Picturemockdata/DSC03778.jpg",
      "/Picturemockdata/DSC04766.jpg",
      "/Picturemockdata/IMG_1492.jpg"
    ],
    "hashtags": ["HóaHọc", "ThíNghiệm", "FPT", "HọcTập"],
    "album": "Thí nghiệm Hóa học",
    "privacy": "public",
    "createdBy": 28, 
    "likes": 24,
    "comments": [
      {
        "user": "Lê Thị Hoa",
        "text": "Mình cũng rất thích môn Hóa! Thí nghiệm nào vậy bạn?"
      },
      {
        "user": "Phạm Minh Tuấn",
        "text": "Trông hay quá, mình cũng muốn tham gia 😍"
      }
    ]
  },
  {
    "id": 2,
    "user": {
      "name": "Lê Thị Mai",
      "avatar": "/placeholder.svg?height=40&width=40"
    },
    "content": "Cuối tuần vui vẻ cùng bạn bè tại công viên! Thời tiết đẹp quá 🌞🌳",
    "image": "/Picturemockdata/DSC03778.jpg",
    "hashtags": ["CuốiTuần", "BạnBè", "CôngViên", "VuiVẻ"],
    "album": "Kỷ niệm cuối tuần",
    "privacy": "friends",
    "createdBy": 2,
    "likes": 18,
    "comments": [
      {
        "user": "Nguyễn Văn Đức",
        "text": "Nhóm mình vui quá! Lần sau rủ mình nha 😊"
      }
    ]
  },
  {
    "id": 3,
    "user": {
      "name": "Hoàng Minh Khôi",
      "avatar": "/placeholder.svg?height=40&width=40"
    },
    "content": "Vừa hoàn thành dự án lập trình web đầu tiên! Cảm ơn thầy cô và các bạn đã hỗ trợ 💻✨",
    "images": [
      "/Picturemockdata/DSC04766.jpg",
      "/Picturemockdata/IMG_1492.jpg"
    ],
    "hashtags": ["LậpTrình", "WebDevelopment", "DựÁn", "FPT"],
    "album": "Dự án cuối kỳ",
    "privacy": "public",
    "createdBy": 1, 
    "likes": 32,
    "comments": [
      {
        "user": "Nguyễn Minh Anh",
        "text": "Chúc mừng bạn! Dự án trông rất chuyên nghiệp 👏"
      },
      {
        "user": "Trần Thị Lan",
        "text": "Bạn có thể chia sẻ kinh nghiệm học lập trình không?"
      }
    ]
  },
  {
    "id": 4,
    "user": {
      "name": "Nguyễn Thị Linh",
      "avatar": "/placeholder.svg?height=40&width=40"
    },
    "content": "Chuyến du lịch Đà Lạt tuyệt vời! Cảnh đẹp và không khí trong lành quá 🌸🏔️",
    "images": [
      "/Picturemockdata/DSC03778.jpg",
      "/Picturemockdata/DSC04766.jpg"
    ],
    "gif": "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
    "video": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "hashtags": ["ĐàLạt", "DuLịch", "CảnhĐẹp", "NghỉDưỡng"],
    "album": "Kỷ niệm Đà Lạt",
    "privacy": "public",
    "createdBy": 3, 
    "likes": 45,
    "comments": [
      {
        "user": "Phạm Văn Hùng",
        "text": "Ảnh đẹp quá! Mình cũng muốn đi Đà Lạt 😍"
      },
      {
        "user": "Lê Thị Thu",
        "text": "Bạn đi vào mùa nào vậy? Thời tiết có lạnh không?"
      }
    ]
  },
  {
    "id": 5,
    "user": {
      "name": "Võ Minh Tuấn",
      "avatar": "/placeholder.svg?height=40&width=40"
    },
    "content": "Buổi học nhóm tại thư viện rất hiệu quả! Cùng nhau ôn tập cho kỳ thi sắp tới 📚✏️",
    "image": "/Picturemockdata/IMG_1492.jpg",
    "hashtags": ["HọcNhóm", "ThưViện", "ÔnTập", "KỳThi"],
    "album": "Học tập",
    "privacy": "private",
    "createdBy": 1, 
    "likes": 12,
    "comments": [
      {
        "user": "Trần Văn Đạt",
        "text": "Nhóm mình cũng đang ôn tập, có thể học chung không?"
      }
    ]
  },
  {
    "id": 6,
    "user": {
      "name": "Phạm Thị Hương",
      "avatar": "/placeholder.svg?height=40&width=40"
    },
    "content": "Tham gia cuộc thi văn nghệ của trường! Cảm ơn mọi người đã ủng hộ 🎤🎭",
    "images": [
      "/Picturemockdata/DSC03778.jpg"
    ],
    "gif": "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "hashtags": ["VănNghệ", "CuộcThi", "BiểuDiễn", "FPT"],
    "album": "Cuộc thi văn nghệ",
    "privacy": "public",
    "createdBy": 28, // ID của người tạo bài đăng
    "likes": 28,
    "comments": [
      {
        "user": "Nguyễn Văn An",
        "text": "Chúc mừng bạn! Biểu diễn rất hay 👏"
      },
      {
        "user": "Lê Thị Nga",
        "text": "Bạn hát hay quá! Có video không?"
      }
    ]
  },
  {
    "id": 7,
    "user": {
      "name": "Lê Văn Hoàng",
      "avatar": "/placeholder.svg?height=40&width=40"
    },
    "content": "Hôm nay học lập trình game rất vui! Tạo được nhân vật đầu tiên rồi 🎮💻",
    "gif": "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
    "hashtags": ["GameDev", "LậpTrình", "Unity", "HọcTập"],
    "album": "Dự án game",
    "privacy": "friends",
    "createdBy": 5, // ID của người tạo bài đăng
    "likes": 36,
    "comments": [
      {
        "user": "Trần Minh Đức",
        "text": "Game trông hay quá! Bạn dùng engine gì vậy?"
      },
      {
        "user": "Nguyễn Thị Mai",
        "text": "Mình cũng muốn học lập trình game! Có thể chia sẻ tài liệu không?"
      }
    ]
  },
  {
    "id": 8,
    "user": {
      "name": "Trần Thị Hoa",
      "avatar": "/placeholder.svg?height=40&width=40"
    },
    "content": "Buổi thuyết trình dự án cuối kỳ! Cảm ơn thầy cô và các bạn đã lắng nghe 📊🎯",
    "images": [
      "/Picturemockdata/IMG_1492.jpg"
    ],
    "videos": [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    ],
    "hashtags": ["ThuyếtTrình", "DựÁn", "CuốiKỳ", "FPT"],
    "album": "Thuyết trình cuối kỳ",
    "privacy": "public",
    "createdBy": 6, // ID của người tạo bài đăng
    "likes": 52,
    "comments": [
      {
        "user": "Nguyễn Văn An",
        "text": "Thuyết trình rất hay! Chúc mừng bạn 👏"
      },
      {
        "user": "Lê Minh Tuấn",
        "text": "Dự án của bạn rất ấn tượng! Có thể chia sẻ source code không?"
      }
    ]
  }
];

export default function NewsFeed() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState(postsData);
  const user = useSelector((state) => state.user.user);
  const currentUserId = user?.userId || user?.id || 1; 

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setIsUpdateModalOpen(true);
  };

  const handleDeletePost = (post) => {
    setSelectedPost(post);
    setIsDeleteModalOpen(true);
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
    setIsUpdateModalOpen(false);
    setSelectedPost(null);
  };

  const handleConfirmDelete = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    setIsDeleteModalOpen(false);
    setSelectedPost(null);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedPost(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedPost(null);
  };

  // 5. Render
  return (
    <div className="space-y-6">
      <CreatePostInput 
        onOpenModal={handleOpenModal}
      />

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />

      <UpdatePostModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        post={selectedPost}
        onUpdate={handleUpdatePost}
      />

      <DeletePostModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        post={selectedPost}
        onDelete={handleConfirmDelete}
      />

      {/* Posts */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          author={post.user.name}
          class="12A2" // Có thể thêm class vào mock data sau
          time="2 giờ trước" // Có thể thêm time vào mock data sau
          content={post.content}
          image={post.image}
          images={post.images}
          gif={post.gif}
          video={post.video}
          videos={post.videos}
          hashtags={post.hashtags}
          album={post.album}
          privacy={post.privacy}
          likes={post.likes}
          comments={post.comments?.length || 0}
          shares={Math.floor(Math.random() * 10)} // Random shares vì chưa có trong mock data
          isVerified={Math.random() > 0.5} // Random verified status
          contestEntry={Math.random() > 0.7} // Random contest entry
          createdBy={post.createdBy} // ID của người tạo bài đăng
          currentUserId={currentUserId} // ID của người dùng hiện tại
          onEdit={() => handleEditPost(post)}
          onDelete={() => handleDeletePost(post)}
        />
      ))}
    </div>
  );
}
