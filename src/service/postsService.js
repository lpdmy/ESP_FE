import postsData from "@/mock_data/posts.json"

export const getPosts = () => {
   return new Promise((resolve) => {
      setTimeout(() => {
         const enriched = postsData.map((p, idx) => ({
            ...p,
            // Thêm thời gian hiển thị giống mock trong Figma
            time: idx === 0 ? "2 giờ trước" : idx === 1 ? "1 ngày trước" : "2 ngày trước",
            // Bổ sung lượt chia sẻ nếu thiếu
            shares: typeof p.shares === "number" ? p.shares : [8, 12, 20][idx] || 5,
            // Thêm cờ hiển thị badge
            isVerified: idx !== 1,
            contestEntry: idx !== 1
         }))
         resolve(enriched)
      }, 500)
   })
}
