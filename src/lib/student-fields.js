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
  const usedFields = new Set();
  
  // Tên tiếng Việt ưu tiên cho auto match
  const vietnameseFieldNames = {
    studentId: ['mã học sinh', 'mã hs', 'mahs', 'ma_hs', 'studentid', 'student_id', 'id'],
    firstName: ['tên', 'ten', 'firstname', 'first_name', 'ho_ten', 'hoten'],
    lastName: ['họ', 'ho', 'lastname', 'last_name', 'ho_ten', 'hoten'],
    email: ['email', 'e_mail', 'mail'],
    phone: ['số điện thoại', 'số dt', 'sdt', 'phone', 'phone_number', 'dienthoai'],
    dateOfBirth: ['ngày sinh', 'ngay sinh', 'dateofbirth', 'date_of_birth', 'birthday', 'birth_date'],
    enrollmentYear: ['năm nhập học', 'nam nhap hoc', 'enrollmentyear', 'enrollment_year', 'namnhap', 'năm nhập'],
    grade: ['khối', 'khoi', 'grade', 'lop', 'lớp'],
    class: ['lớp', 'lop', 'class', 'phong', 'phòng']
  };

  // Match each CSV header with system fields
  csvHeaders.forEach(csvHeader => {
    const normalizedHeader = csvHeader.toLowerCase().trim();
    let bestMatch = null;
    let bestScore = 0;
    
    // Tìm kiếm theo tên tiếng Việt trước
    Object.entries(vietnameseFieldNames).forEach(([fieldId, names]) => {
      if (usedFields.has(fieldId)) return;
      
      names.forEach(name => {
        // Tìm kiếm chính xác hoặc chứa từ khóa
        if (normalizedHeader === name.toLowerCase() || 
            normalizedHeader.includes(name.toLowerCase()) || 
            name.toLowerCase().includes(normalizedHeader)) {
          const score = Math.min(normalizedHeader.length, name.length) / Math.max(normalizedHeader.length, name.length);
          if (score > bestScore) {
            bestScore = score;
            bestMatch = fieldId;
          }
        }
      });
    });
    
    if (bestMatch && bestScore > 0.3) {
      mapping[csvHeader] = bestMatch;
      usedFields.add(bestMatch);
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
