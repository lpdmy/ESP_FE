import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export const useSystemNewsAndNoticesModal = () => {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [urgentNewsAndNotices, setUrgentNewsAndNotices] = useState([]);
   const [currentNewsAndNoticeIndex, setCurrentNewsAndNoticeIndex] = useState(0);
   const user = useSelector((state) => state.user.user);

   // Mock data - sẽ thay thế bằng API call
   const mockUrgentNewsAndNotices = [
      {
         id: "1",
         title: "Thông báo khẩn cấp: Lịch nghỉ Tết",
         type: "urgent",
         content: `<h1>Thông báo khẩn cấp: Lịch nghỉ Tết</h1>
<p>Lịch nghỉ Tết Nguyên Đán 2025 sẽ từ ngày <strong>25/01 đến 05/02/2025</strong>. Tất cả học sinh vui lòng lưu ý.</p>

<h2>Lịch trình cụ thể:</h2>
<p><strong>Ngày bắt đầu nghỉ:</strong> 25/01/2025</p>
<p><strong>Ngày đi học lại:</strong> 06/02/2025</p>

<h3>Lưu ý quan trọng:</h3>
<p>1. Học sinh cần hoàn thành bài tập trước khi nghỉ</p>
<p>2. Chuẩn bị đầy đủ sách vở cho học kỳ mới</p>
<p>3. <u>Không được nghỉ học trái phép</u></p>

<hr>

<p><em>Chúc các em có kỳ nghỉ Tết vui vẻ và an toàn!</em></p>`,
         isUrgent: true,
         createdDate: "19/10/2024",
         expiryDate: "31/12/2024",
         files: [],
      },
      {
         id: "2",
         title: "Lịch thi cuối kỳ 1",
         type: "exam",
         content: `<h1>Lịch thi cuối kỳ 1</h1>
<p>Lịch thi cuối kỳ 1 sẽ diễn ra từ ngày <strong>15/11 đến 30/11/2024</strong>. Các em vui lòng chuẩn bị tốt cho kỳ thi này.</p>

<h2>Chi tiết lịch thi:</h2>
<p><strong>Ngày 15/11:</strong> Toán, Lý</p>
<p><strong>Ngày 16/11:</strong> Hóa, Sinh</p>
<p><strong>Ngày 17/11:</strong> Văn, Sử</p>
<p><strong>Ngày 18/11:</strong> Địa, GDCD</p>

<h3>Các em học sinh cần:</h3>
<p>1. Chuẩn bị đầy đủ dụng cụ học tập</p>
<p>2. Có mặt tại phòng thi trước <u>15 phút</u></p>
<p>3. Tuân thủ quy định thi cử</p>

<hr>

<p><em>Chúc các em thi tốt!</em></p>`,
         isUrgent: false,
         createdDate: "20/10/2024",
         expiryDate: "15/11/2024",
         files: [{ name: "Lich_thi_cuoi_ky_1.pdf", size: 2048000 }],
      },
   ];

   useEffect(() => {
      const checkForNewNewsAndNotices = async () => {
         if (!user) return;

         try {
            // TODO: Thay thế bằng API call thực tế để lấy thông báo chưa đọc
            // const response = await api.getUnreadSystemNewsAndNotices(user.id);
            // const unreadNewsAndNotices = response.data;

            // Tạm thời sử dụng mock data
            const unreadNewsAndNotices = mockUrgentNewsAndNotices.filter(newsAndNotice => {
               // Kiểm tra xem user đã xem thông báo này chưa
               const viewedKey = `newsAndNotice_${newsAndNotice.id}_viewed`;
               return !localStorage.getItem(viewedKey);
            });

            if (unreadNewsAndNotices.length > 0) {
               setUrgentNewsAndNotices(unreadNewsAndNotices);
               setIsModalOpen(true);
            }
         } catch (error) {
            console.error('Error checking for new news and notices:', error);
         }
      };

      // Chỉ kiểm tra khi user login lần đầu
      const hasCheckedToday = localStorage.getItem('hasCheckedNewsAndNoticesToday');
      const today = new Date().toDateString();

      if (hasCheckedToday !== today) {
         checkForNewNewsAndNotices();
         localStorage.setItem('hasCheckedNewsAndNoticesToday', today);
      }
   }, [user]);

   const handleMarkAsViewed = (newsAndNoticeId) => {
      // Đánh dấu thông báo đã được xem
      localStorage.setItem(`newsAndNotice_${newsAndNoticeId}_viewed`, 'true');

      // TODO: Gọi API để đánh dấu đã xem
      // await api.markNewsAndNoticeAsViewed(user.id, newsAndNoticeId);
   };

   const handleNext = () => {
      if (currentNewsAndNoticeIndex < urgentNewsAndNotices.length - 1) {
         setCurrentNewsAndNoticeIndex(currentNewsAndNoticeIndex + 1);
      } else {
         // Đã xem hết, đóng modal
         setIsModalOpen(false);
         setCurrentNewsAndNoticeIndex(0);
      }
   };

   const handleClose = () => {
      setIsModalOpen(false);
      setCurrentNewsAndNoticeIndex(0);
   };

   const currentNewsAndNotice = urgentNewsAndNotices[currentNewsAndNoticeIndex];

   return {
      isModalOpen,
      currentNewsAndNotice,
      currentNewsAndNoticeIndex,
      totalNewsAndNotices: urgentNewsAndNotices.length,
      handleMarkAsViewed,
      handleNext,
      handleClose,
   };
};
