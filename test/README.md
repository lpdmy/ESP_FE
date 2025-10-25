# Test Files cho Student Import

Thư mục này chứa các file CSV mẫu để test tính năng import học sinh.

## Danh sách file test:

### 1. `student-sample.csv`
- **Mô tả**: File CSV với dữ liệu hợp lệ để test import thành công
- **Nội dung**: 100 học sinh với đầy đủ thông tin (khối 10, 11, 12)
- **Mục đích**: Test import thành công và pagination preview

### 2. `student-template.csv` 
- **Mô tả**: File template đơn giản với 3 học sinh
- **Nội dung**: Dữ liệu cơ bản, đủ các trường bắt buộc
- **Mục đích**: Template để người dùng tham khảo

### 3. `student-invalid.csv`
- **Mô tả**: File CSV với dữ liệu không hợp lệ để test validation
- **Nội dung**: 
  - Email không hợp lệ
  - Tên trống
  - Họ trống  
  - Mã học sinh trống
  - Số điện thoại không hợp lệ
  - Ngày sinh không hợp lệ
- **Mục đích**: Test validation và error handling

### 4. `student-duplicate.csv`
- **Mô tả**: File CSV với dữ liệu trùng lặp để test duplicate handling
- **Nội dung**:
  - Mã học sinh HS001 trùng lặp
  - Email trùng lặp
- **Mục đích**: Test các chế độ import (insert, upsert)

### 5. `student-sample-100.csv`
- **Mô tả**: File backup với 100 học sinh (tương tự student-sample.csv)
- **Nội dung**: 100 học sinh với đầy đủ thông tin
- **Mục đích**: Backup file cho testing

### 6. `student-duplicate-test.csv`
- **Mô tả**: File test với 5 học sinh trùng để test logic skip
- **Nội dung**: 5 học sinh với mã HS001 và email trùng
- **Mục đích**: Test chế độ "Chỉ thêm mới" với học sinh đã tồn tại

## Tính năng mới:

### Pagination Preview
- Preview table hiện hỗ trợ phân trang với 10 items mỗi trang
- Điều hướng giữa các trang bằng nút "Trước", "Sau" và số trang
- Hiển thị thông tin "Hiển thị X-Y / Z dòng"

### Large Dataset Support
- File `student-sample.csv` chứa 100 học sinh để test pagination
- Dữ liệu trải đều các khối 10, 11, 12 và nhiều lớp khác nhau

## Cách sử dụng:

1. Upload file CSV vào trang Import Students
2. Kiểm tra auto-mapping của các trường
3. Xem preview với pagination (nếu có nhiều dòng)
4. Chọn chế độ import phù hợp
5. Theo dõi kết quả import và xử lý lỗi

## Lưu ý:

- Tất cả file sử dụng header tiếng Việt để test auto-mapping
- Định dạng ngày: YYYY-MM-DD
- Email phải hợp lệ
- Số điện thoại: 10-11 số
- Năm nhập học: 2000-2030
- Preview table hỗ trợ phân trang cho file lớn
