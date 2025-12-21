# Hướng dẫn Setup Import Activities Feature

## Cài đặt Package

Để sử dụng tính năng import activities, cần cài đặt package `xlsx`:

```bash
npm install xlsx
```

## Tính năng

1. **Ánh xạ cột linh hoạt**: Người dùng có thể đặt tên cột tùy ý, hệ thống sẽ tự động hoặc thủ công ánh xạ
2. **Hỗ trợ 4 loại activity**:
   - SportsFestival (Hội thao)
   - CreativeContest (Cuộc thi sáng tạo)
   - SeminarWorkshop (Hội thảo / Workshop)
   - Other (Khác)
3. **Form điền thông tin bổ sung**: Sau khi import, người dùng điền các field không thể import (ảnh, quy định, settings)
4. **Preview và validation**: Xem trước và kiểm tra dữ liệu trước khi tạo

## Flow

1. Upload file Excel/CSV
2. Ánh xạ cột (tự động hoặc thủ công)
3. Preview dữ liệu đã parse
4. Điền thông tin bổ sung cho từng activity
5. Review và xác nhận
6. Navigate đến CreateActivity để tạo từng activity

## Template Excel

File template bao gồm:
- Các cột common cho tất cả loại activity
- Các cột riêng cho từng loại (SportsFestival, CreativeContest, SeminarWorkshop)
- Ví dụ dữ liệu mẫu

