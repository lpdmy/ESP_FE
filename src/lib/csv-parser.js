/**
 * CSV Parser utilities for student import
 */

/**
 * Parse CSV content into headers and rows
 * @param {string} content - CSV content as string
 * @returns {Object} - { headers: string[], rows: Record<string, string>[] }
 */
export const parseCSV = (content) => {
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('File CSV trống hoặc không hợp lệ');
  }

  // Parse headers
  const headers = parseCSVLine(lines[0]);
  
  // Parse data rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length > 0) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
  }

  return { headers, rows };
};

/**
 * Parse a single CSV line handling quoted values
 * @param {string} line - CSV line
 * @returns {string[]} - Array of values
 */
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
};

/**
 * Validate a single row against mapping and required fields
 * @param {Object} row - Row data
 * @param {Object} mapping - Field mapping
 * @param {string[]} requiredFieldIds - Required field IDs
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validateRow = (row, mapping, requiredFieldIds) => {
  const errors = [];
  
  // Check if all required fields are mapped and have values
  requiredFieldIds.forEach(fieldId => {
    const csvHeader = Object.keys(mapping).find(key => mapping[key] === fieldId);
    if (!csvHeader) {
      errors.push(`Trường bắt buộc "${fieldId}" chưa được mapping`);
    } else if (!row[csvHeader] || row[csvHeader].trim() === '') {
      errors.push(`Trường "${fieldId}" không được để trống`);
    }
  });

  // Additional validation rules
  Object.keys(mapping).forEach(csvHeader => {
    const fieldId = mapping[csvHeader];
    const value = row[csvHeader];
    
    if (value && value.trim() !== '') {
      // Email validation
      if (fieldId === 'email' && !isValidEmail(value)) {
        errors.push(`Email không hợp lệ: ${value}`);
      }
      
      // Phone validation
      if (fieldId === 'phone' && !isValidPhone(value)) {
        errors.push(`Số điện thoại không hợp lệ: ${value}`);
      }
      
      // Student ID validation
      if (fieldId === 'studentId' && !isValidStudentId(value)) {
        errors.push(`Mã học sinh không hợp lệ: ${value}`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Generate error CSV with failed rows
 * @param {Array} errors - Array of error objects
 * @param {string[]} headers - CSV headers
 * @returns {string} - CSV content
 */
export const generateErrorCSV = (errors, headers) => {
  if (errors.length === 0) {
    return 'Không có lỗi nào';
  }

  // Create error CSV headers
  const errorHeaders = [...headers, 'Lỗi'];
  
  // Create CSV content
  let csvContent = errorHeaders.join(',') + '\n';
  
  errors.forEach(({ row, errors: rowErrors }) => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma
      return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value;
    });
    
    // Add error messages
    values.push(`"${rowErrors.join('; ')}"`);
    
    csvContent += values.join(',') + '\n';
  });
  
  return csvContent;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone to validate
 * @returns {boolean}
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate student ID format
 * @param {string} studentId - Student ID to validate
 * @returns {boolean}
 */
const isValidStudentId = (studentId) => {
  // Student ID should be alphanumeric and at least 3 characters
  const studentIdRegex = /^[A-Za-z0-9]{3,}$/;
  return studentIdRegex.test(studentId);
};
