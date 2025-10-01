/**
 * Student fields configuration and auto-matching utilities
 */

/**
 * System fields definition for student import
 */
export const SYSTEM_FIELDS = [
  {
    id: 'studentId',
    label: 'Mã học sinh',
    required: true,
    type: 'text',
    description: 'Mã định danh duy nhất của học sinh'
  },
  {
    id: 'firstName',
    label: 'Tên',
    required: true,
    type: 'text',
    description: 'Tên của học sinh'
  },
  {
    id: 'lastName',
    label: 'Họ',
    required: true,
    type: 'text',
    description: 'Họ của học sinh'
  },
  {
    id: 'email',
    label: 'Email',
    required: true,
    type: 'email',
    description: 'Địa chỉ email của học sinh'
  },
  {
    id: 'phone',
    label: 'Số điện thoại',
    required: true,
    type: 'tel',
    description: 'Số điện thoại liên hệ'
  },
  {
    id: 'dateOfBirth',
    label: 'Ngày sinh',
    required: true,
    type: 'date',
    description: 'Ngày tháng năm sinh'
  },
  {
    id: 'enrollmentYear',
    label: 'Năm nhập học',
    required: true,
    type: 'number',
    description: 'Năm nhập học của học sinh'
  },
  {
    id: 'grade',
    label: 'Khối',
    required: true,
    type: 'text',
    description: 'Khối lớp học'
  },
  {
    id: 'class',
    label: 'Lớp',
    required: false,
    type: 'text',
    description: 'Lớp học hiện tại (không bắt buộc)'
  }
];

/**
 * Auto-match CSV headers with system fields
 * @param {string[]} csvHeaders - Array of CSV column headers
 * @returns {Object} - Mapping object { csvHeader: fieldId }
 */
export const autoMatchFields = (csvHeaders) => {
  const mapping = {};
  
  // Define matching patterns for each field
  const fieldPatterns = {
    studentId: [
      'ma_hoc_sinh', 'student_id', 'mahs', 'id', 'ma_hs', 'studentid',
      'mã học sinh', 'mã hs', 'mahs', 'id học sinh'
    ],
    firstName: [
      'ten', 'first_name', 'ho_ten', 'ten_goi', 'firstname',
      'tên', 'tên gọi', 'tên riêng'
    ],
    lastName: [
      'ho', 'last_name', 'ho_ten', 'ho_dem', 'lastname',
      'họ', 'họ đệm', 'họ tên'
    ],
    email: [
      'email', 'e_mail', 'mail', 'thu_dien_tu',
      'email học sinh', 'thư điện tử'
    ],
    phone: [
      'phone', 'sdt', 'so_dien_thoai', 'dien_thoai', 'mobile',
      'số điện thoại', 'điện thoại', 'sdt học sinh'
    ],
    dateOfBirth: [
      'ngay_sinh', 'birthday', 'date_of_birth', 'ngay_thang_nam_sinh',
      'ngày sinh', 'sinh nhật', 'ngày tháng năm sinh'
    ],
    enrollmentYear: [
      'nam_nhap_hoc', 'enrollment_year', 'nam_hoc', 'year',
      'năm nhập học', 'năm học', 'niên khóa'
    ],
    grade: [
      'khoi', 'grade', 'khoi_lop', 'cap_hoc',
      'khối', 'khối lớp', 'cấp học'
    ],
    class: [
      'lop', 'class', 'lop_hoc', 'ten_lop',
      'lớp', 'lớp học', 'tên lớp'
    ]
  };

  // Match each CSV header with system fields
  csvHeaders.forEach(csvHeader => {
    const normalizedHeader = csvHeader.toLowerCase().trim();
    
    // Find matching field
    for (const [fieldId, patterns] of Object.entries(fieldPatterns)) {
      const isMatch = patterns.some(pattern => 
        normalizedHeader.includes(pattern.toLowerCase()) ||
        pattern.toLowerCase().includes(normalizedHeader)
      );
      
      if (isMatch) {
        mapping[csvHeader] = fieldId;
        break;
      }
    }
  });

  return mapping;
};

/**
 * Get field by ID
 * @param {string} fieldId - Field ID
 * @returns {Object|null} - Field object or null
 */
export const getFieldById = (fieldId) => {
  return SYSTEM_FIELDS.find(field => field.id === fieldId) || null;
};

/**
 * Get required fields
 * @returns {Array} - Array of required fields
 */
export const getRequiredFields = () => {
  return SYSTEM_FIELDS.filter(field => field.required);
};

/**
 * Get optional fields
 * @returns {Array} - Array of optional fields
 */
export const getOptionalFields = () => {
  return SYSTEM_FIELDS.filter(field => !field.required);
};
