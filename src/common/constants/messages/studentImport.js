export const STUDENT_IMPORT_MESSAGES = {
  SUCCESS: {
    IMPORT_SUCCESS: "Import học sinh thành công",
    VALIDATION_SUCCESS: "Validation dữ liệu thành công",
    TEMPLATE_DOWNLOADED: "Tải template thành công",
    STUDENT_CREATED: "Tạo học sinh thành công",
    STUDENT_UPDATED: "Cập nhật học sinh thành công"
  },
  ERROR: {
    IMPORT_FAILED: "Import học sinh thất bại",
    VALIDATION_FAILED: "Validation dữ liệu thất bại",
    TEMPLATE_DOWNLOAD_FAILED: "Tải template thất bại",
    STUDENT_CREATE_FAILED: "Tạo học sinh thất bại",
    STUDENT_UPDATE_FAILED: "Cập nhật học sinh thất bại",
    STUDENT_ALREADY_EXISTS: "Học sinh đã tồn tại trong hệ thống",
    STUDENT_NOT_FOUND: "Học sinh không tồn tại",
    INVALID_FILE_FORMAT: "Định dạng file không hợp lệ",
    FILE_TOO_LARGE: "File quá lớn (tối đa 10MB)",
    EMPTY_FILE: "File trống hoặc không hợp lệ",
    REQUIRED_FIELDS_NOT_MAPPED: "Các trường bắt buộc chưa được mapping",
    REQUIRED_FIELDS_EMPTY: "Các trường bắt buộc không được để trống",
    INVALID_EMAIL_FORMAT: "Email không hợp lệ",
    INVALID_PHONE_FORMAT: "Số điện thoại không hợp lệ",
    INVALID_STUDENT_ID_FORMAT: "Mã học sinh không hợp lệ",
    INVALID_DATE_FORMAT: "Ngày sinh không hợp lệ",
    NETWORK_ERROR: "Lỗi kết nối mạng",
    UNKNOWN_ERROR: "Có lỗi xảy ra, vui lòng thử lại"
  },
  VALIDATION: {
    STUDENTS_REQUIRED: "Danh sách học sinh không được để trống",
    MAPPING_REQUIRED: "Mapping trường không được để trống",
    HEADERS_REQUIRED: "Headers không được để trống",
    INVALID_IMPORT_MODE: "Chế độ import phải là insert, upsert hoặc skip",
    STUDENT_ID_REQUIRED: "Mã học sinh là bắt buộc",
    FIRST_NAME_REQUIRED: "Tên là bắt buộc",
    LAST_NAME_REQUIRED: "Họ là bắt buộc",
    EMAIL_REQUIRED: "Email là bắt buộc",
    FIELD_NOT_MAPPED: "Trường bắt buộc chưa được mapping",
    FIELD_EMPTY: "Trường bắt buộc không được để trống"
  },
  INFO: {
    UPLOAD_FILE: "Tải lên file CSV chứa dữ liệu học sinh",
    MAPPING_FIELDS: "Mapping các trường dữ liệu với hệ thống",
    PREVIEW_DATA: "Xem trước dữ liệu trước khi import",
    SELECT_IMPORT_MODE: "Chọn chế độ import",
    PROCESSING: "Đang xử lý dữ liệu...",
    COMPLETED: "Hoàn thành import",
    DOWNLOAD_ERRORS: "Tải xuống file lỗi"
  }
};
