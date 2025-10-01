# Import Students Page

## Tổng quan
Trang Import Students cho phép admin import danh sách học sinh từ file CSV vào hệ thống một cách nhanh chóng và dễ dàng.

## Tính năng chính

### 1. Upload File CSV
- **Drag & Drop**: Kéo thả file CSV trực tiếp vào vùng upload
- **File Selection**: Click để chọn file từ máy tính
- **Validation**: Kiểm tra định dạng file (.csv) và kích thước (tối đa 10MB)
- **Auto Parse**: Tự động parse file CSV và hiển thị preview

### 2. Field Mapping
- **Auto-matching**: Tự động mapping các cột CSV với trường hệ thống
- **Manual Mapping**: Cho phép chỉnh sửa mapping thủ công
- **Required Fields**: Highlight các trường bắt buộc
- **Field Validation**: Kiểm tra email, phone, student ID format

### 3. Data Preview
- **Table View**: Hiển thị dữ liệu dạng bảng
- **Error Highlighting**: Highlight các dòng có lỗi
- **Validation Status**: Hiển thị trạng thái hợp lệ của từng dòng
- **Limited Preview**: Chỉ hiển thị 10 dòng đầu để tối ưu performance

### 4. Import Options
- **Insert Only**: Chỉ thêm học sinh mới, bỏ qua nếu trùng mã
- **Upsert**: Thêm mới và cập nhật nếu trùng mã
- **Skip Duplicates**: Bỏ qua tất cả dòng trùng mã

### 5. Progress Tracking
- **Real-time Progress**: Hiển thị tiến trình import real-time
- **Status Updates**: Cập nhật trạng thái xử lý
- **Error Handling**: Xử lý và hiển thị lỗi chi tiết

### 6. Results & Error Management
- **Success Statistics**: Thống kê số lượng thành công/thất bại
- **Error Download**: Tải xuống file CSV chứa các dòng lỗi
- **Detailed Errors**: Hiển thị chi tiết lỗi cho từng dòng

## Cấu trúc File

```
src/pages/Admin/ImportStudentsPage.jsx    # Component chính
src/lib/csv-parser.js                     # CSV parsing utilities
src/lib/student-fields.js                 # Field definitions & auto-matching
src/features/admin/services/student-import.service.js  # API service
src/common/components/ui/radio-group.jsx  # Radio group component
src/common/components/ui/progress.jsx     # Progress bar component
```

## Dependencies

### UI Components
- `@/common/components/ui/button` - Button component
- `@/common/components/ui/card` - Card layout
- `@/common/components/ui/label` - Form labels
- `@/common/components/ui/select` - Select dropdown
- `@/common/components/ui/loading` - Loading states
- `@/common/hooks/useToast` - Toast notifications

### Utilities
- `@/lib/csv-parser` - CSV parsing functions
- `@/lib/student-fields` - Student field definitions
- `@/common/utils/executeApiCall` - API call wrapper

### Icons
- `lucide-react` - Icon library

## API Endpoints

### Import Students
```
POST /api/admin/students/import
Content-Type: application/json
Authorization: Bearer <token>

{
  "students": [...],      // Array of student data
  "mapping": {...},       // Field mapping
  "importMode": "insert", // insert|upsert|skip
  "headers": [...]        // CSV headers
}
```

### Validate Students
```
POST /api/admin/students/validate
Content-Type: application/json
Authorization: Bearer <token>

{
  "students": [...],
  "mapping": {...}
}
```

### Download Template
```
GET /api/admin/students/template
Authorization: Bearer <token>
```

## Field Definitions

### Required Fields
- `studentId` - Mã học sinh (unique identifier)
- `firstName` - Tên
- `lastName` - Họ  
- `email` - Email

### Optional Fields
- `phone` - Số điện thoại
- `dateOfBirth` - Ngày sinh
- `gender` - Giới tính
- `address` - Địa chỉ
- `class` - Lớp
- `grade` - Khối
- `parentName` - Tên phụ huynh
- `parentPhone` - SĐT phụ huynh
- `parentEmail` - Email phụ huynh
- `notes` - Ghi chú

## Auto-matching Patterns

Hệ thống tự động nhận diện các pattern sau:

### Student ID
- `ma_hoc_sinh`, `student_id`, `mahs`, `id`, `ma_hs`
- `mã học sinh`, `mã hs`, `mahs`

### Name Fields
- `ten`, `first_name`, `ho_ten`, `ten_goi`
- `tên`, `tên gọi`, `tên riêng`
- `ho`, `last_name`, `ho_dem`
- `họ`, `họ đệm`, `họ tên`

### Contact Info
- `email`, `e_mail`, `mail`, `thu_dien_tu`
- `phone`, `sdt`, `so_dien_thoai`, `dien_thoai`
- `số điện thoại`, `điện thoại`

## Validation Rules

### Email
- Format: `user@domain.com`
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Phone
- Format: 10+ digits with optional country code
- Regex: `/^[\+]?[0-9\s\-\(\)]{10,}$/`

### Student ID
- Format: Alphanumeric, minimum 3 characters
- Regex: `/^[A-Za-z0-9]{3,}$/`

## Error Handling

### File Upload Errors
- Invalid file type (not CSV)
- File too large (>10MB)
- Empty file
- Malformed CSV

### Validation Errors
- Missing required fields
- Invalid field formats
- Duplicate student IDs

### Import Errors
- Network errors
- Server validation failures
- Database constraint violations

## Usage Examples

### Basic Import Flow
1. Navigate to `/admin/import-students`
2. Upload CSV file via drag & drop or file picker
3. Review and adjust field mapping
4. Preview data and check for errors
5. Select import mode (insert/upsert/skip)
6. Click "Bắt đầu Import"
7. Monitor progress and review results

### Error Recovery
1. Download error CSV if import fails
2. Fix data issues in CSV file
3. Re-upload corrected file
4. Re-run import process

## Performance Considerations

- **Preview Limit**: Only shows first 10 rows for performance
- **Batch Processing**: Processes data in batches on server
- **Progress Updates**: Real-time progress tracking
- **Memory Management**: Efficient CSV parsing and data handling

## Security

- **Authentication**: Requires admin role
- **File Validation**: Strict file type and size validation
- **Data Sanitization**: Input sanitization and validation
- **Error Logging**: Comprehensive error logging for debugging

## Troubleshooting

### Common Issues

1. **File not uploading**
   - Check file format (.csv only)
   - Verify file size (<10MB)
   - Ensure file is not corrupted

2. **Mapping not working**
   - Check CSV headers match expected patterns
   - Verify required fields are mapped
   - Review auto-matching suggestions

3. **Import failures**
   - Check network connection
   - Verify authentication token
   - Review server logs for detailed errors

4. **Data validation errors**
   - Ensure required fields have values
   - Check email/phone format
   - Verify student ID uniqueness

## Future Enhancements

- [ ] Excel file support (.xlsx)
- [ ] Bulk field mapping presets
- [ ] Import history and rollback
- [ ] Advanced validation rules
- [ ] Template customization
- [ ] Scheduled imports
- [ ] Email notifications
