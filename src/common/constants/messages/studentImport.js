export const STUDENT_IMPORT_MESSAGES = {
  SUCCESS: {
    IMPORT_SUCCESS: "Import học sinh thành công",
    VALIDATION_SUCCESS: "Validation dữ liệu thành công",
    TEMPLATE_DOWNLOADED: "Tải template thành công",
    STUDENT_CREATED: "Tạo học sinh thành công",
    STUDENT_UPDATED: "Cập nhật học sinh thành công"
  },
  ERROR: {
      // --- Nhóm: Lỗi hệ thống / chung ---
    UNKNOWN_ERROR: "Có lỗi xảy ra, vui lòng thử lại.",
    NETWORK_ERROR: "Lỗi kết nối mạng, vui lòng kiểm tra đường truyền.",

    // --- Nhóm: Lỗi file import ---
    INVALID_FILE_FORMAT: "Định dạng tệp không hợp lệ (chỉ hỗ trợ .xlsx hoặc .csv).",
    FILE_TOO_LARGE: "Dung lượng tệp quá lớn (tối đa 10MB).",
    EMPTY_FILE: "Tệp trống hoặc không chứa dữ liệu hợp lệ.",

    // --- Nhóm: Lỗi mapping / dữ liệu ---
    REQUIRED_FIELDS_NOT_MAPPED: "Các trường bắt buộc chưa được ánh xạ.",
    REQUIRED_FIELDS_EMPTY: "Các trường bắt buộc không được để trống.",
    INVALID_EMAIL_FORMAT: "Định dạng email không hợp lệ.",
    INVALID_PHONE_FORMAT: "Định dạng số điện thoại không hợp lệ.",
    INVALID_STUDENT_ID_FORMAT: "Định dạng mã học sinh không hợp lệ.",
    INVALID_DATE_FORMAT: "Định dạng ngày sinh không hợp lệ.",

    // --- Nhóm: Lỗi xử lý dữ liệu học sinh ---
    STUDENT_ALREADY_EXISTS: "Học sinh đã tồn tại trong hệ thống.",
    STUDENT_NOT_FOUND: "Không tìm thấy học sinh trong hệ thống.",
    STUDENT_CREATE_FAILED: "Không thể tạo mới học sinh.",
    STUDENT_UPDATE_FAILED: "Không thể cập nhật học sinh.",

    // --- Nhóm: Lỗi quy trình import ---
    IMPORT_FAILED: "Quá trình import học sinh thất bại.",
    VALIDATION_FAILED: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại tệp import.",
    TEMPLATE_DOWNLOAD_FAILED: "Không thể tải xuống file template import."
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
