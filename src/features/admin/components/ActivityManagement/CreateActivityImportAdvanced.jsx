"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Label } from "@/common/components/ui/label";
import { Input } from "@/common/components/ui/input";
import { Badge } from "@/common/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Map,
  Eye,
  Edit,
  Save,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  FileText,
  Image as ImageIcon,
  Calendar,
  Users,
  Settings,
} from "lucide-react";
import { toast } from "react-toastify";
// Note: Install xlsx package: npm install xlsx
// Uncomment after installing:
// import * as XLSX from "xlsx";

// Temporary: Use a simple CSV parser until xlsx is installed
const parseCSV = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { headers: [], data: [] };
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    return values;
  });
  
  return { headers, data };
};
import { ROUTES } from "@/common/constants/routes";

// Activity subTypes
const SUB_TYPES = [
  { value: "SportsFestival", label: "Hội thao" },
  { value: "CreativeContest", label: "Cuộc thi sáng tạo" },
  { value: "SeminarWorkshop", label: "Hội thảo / Workshop" },
  { value: "Other", label: "Khác" },
];

// Field definitions for each subType
const FIELD_DEFINITIONS = {
  // Common fields for all types
  common: [
    { key: "title", label: "Tên hoạt động", required: true, examples: ["Hội thao mùa xuân", "Cuộc thi vẽ tranh"] },
    { key: "description", label: "Mô tả", required: true, examples: ["Mô tả chi tiết về hoạt động"] },
    { key: "category", label: "Loại", required: true, examples: ["1", "2", "activity", "event"], map: { "1": 1, "2": 2, "activity": 1, "event": 2 } },
    { key: "subType", label: "Phân loại", required: true, examples: ["SportsFestival", "CreativeContest", "SeminarWorkshop", "Other", "Hội thao", "Cuộc thi sáng tạo", "Hội thảo"], map: { "SportsFestival": "SportsFestival", "CreativeContest": "CreativeContest", "SeminarWorkshop": "SeminarWorkshop", "Other": "Other", "Hội thao": "SportsFestival", "Cuộc thi sáng tạo": "CreativeContest", "Hội thảo": "SeminarWorkshop", "Workshop": "SeminarWorkshop" } },
    { key: "location", label: "Địa điểm", required: true, examples: ["Hội trường A", "Sân vận động"] },
    { key: "organizer", label: "Đơn vị tổ chức", required: true, examples: ["Phòng Đào tạo", "Đoàn Thanh niên"] },
    { key: "startDate", label: "Ngày bắt đầu", required: true, examples: ["2024-12-20", "20/12/2024"] },
    { key: "startTime", label: "Giờ bắt đầu", required: false, examples: ["08:00", "8:00 AM"] },
    { key: "endDate", label: "Ngày kết thúc", required: true, examples: ["2024-12-20", "20/12/2024"] },
    { key: "endTime", label: "Giờ kết thúc", required: false, examples: ["17:00", "5:00 PM"] },
    { key: "registerDate", label: "Ngày mở đăng ký", required: true, examples: ["2024-12-15", "15/12/2024"] },
    { key: "endRegisterDate", label: "Ngày đóng đăng ký", required: true, examples: ["2024-12-19", "19/12/2024"] },
    { key: "maxParticipants", label: "Số người tham gia tối đa", required: false, examples: ["100", "50"] },
  ],
  // SportsFestival specific
  SportsFestival: [
    { key: "competitionType", label: "Hình thức thi đấu", required: true, examples: ["Individual", "Team", "Mixed"], map: { "Individual": "Individual", "Team": "Team", "Mixed": "Mixed", "Cá nhân": "Individual", "Đồng đội": "Team", "Kết hợp": "Mixed" } },
    { key: "sportsCategories", label: "Danh mục thể thao (phân cách bằng dấu phẩy)", required: true, examples: ["Bóng đá, Bóng chuyền, Cầu lông"], isArray: true },
    { key: "sportsConfigurations", label: "Cấu hình môn thể thao (format: 'Tên môn: Số người tối đa, ...')", required: false, examples: ["Bóng đá: 11, Bóng chuyền: 6"], isObject: true },
  ],
  // CreativeContest specific
  CreativeContest: [
    { key: "theme", label: "Chủ đề", required: true, examples: ["Mùa xuân", "Tuổi trẻ và ước mơ"] },
    { key: "genre", label: "Loại hình sáng tạo", required: false, examples: ["Vẽ tranh", "Sáng tác văn học", "Nhiếp ảnh"] },
    { key: "paperSize", label: "Kích thước / Độ dài", required: false, examples: ["A4", "A3", "500-1000 từ"] },
    { key: "drawingMedium", label: "Chất liệu / Thể loại", required: false, examples: ["Màu nước", "Chì màu", "Truyện ngắn", "Thơ"] },
    { key: "timeLimit", label: "Thời gian làm bài", required: false, examples: ["90 phút", "2 giờ", "Tự do"] },
    { key: "submissionFormat", label: "Format nộp bài", required: false, examples: ["JPG, PNG, PDF", "File số", "Bản giấy"] },
    { key: "submissionDeadline", label: "Hạn cuối nộp bài (YYYY-MM-DD HH:MM)", required: false, examples: ["2024-12-25 23:59", "25/12/2024 23:59"] },
    { key: "problemText", label: "Đề bài (Text)", required: false, examples: ["Vẽ tranh về chủ đề mùa xuân"] },
    { key: "problemFileUrl", label: "File đề bài (URL)", required: false, examples: ["https://example.com/de-bai.pdf"] },
    { key: "wordLimit", label: "Giới hạn số từ", required: false, examples: ["500-1000", "Tối đa 2000 từ"] },
    { key: "writingFormat", label: "Định dạng viết", required: false, examples: ["Truyện ngắn", "Thơ", "Tiểu luận"] },
  ],
  // SeminarWorkshop specific
  SeminarWorkshop: [
    { key: "speakers", label: "Diễn giả (format: 'Tên|Chức danh|Tiểu sử|URL ảnh, ...')", required: false, examples: ["Nguyễn Văn A|Giáo sư|Tiểu sử...|URL, Trần Thị B|Tiến sĩ|...|URL"], isArray: true, isObject: true },
    { key: "programItems", label: "Chương trình (format: 'Giờ|Tiêu đề|Mô tả, ...')", required: false, examples: ["08:00|Khai mạc|Mô tả..., 09:00|Nội dung chính|..."], isArray: true, isObject: true },
  ],
};

// Fields that cannot be imported (must be filled manually)
const MANUAL_FIELDS = [
  { key: "thumbnailUrl", label: "Ảnh đại diện", required: true, icon: ImageIcon },
  { key: "rules", label: "Quy định", required: false, icon: FileText },
  { key: "registrationSettings", label: "Cài đặt đăng ký", required: false, icon: Settings },
  { key: "starPointRewards", label: "Phần thưởng điểm sao", required: false, icon: Settings },
  { key: "gradingSettings", label: "Cài đặt chấm điểm", required: false, icon: Settings },
];

export default function CreateActivityImportAdvanced({ onBack }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [parsedActivities, setParsedActivities] = useState([]);
  const [manualFieldsData, setManualFieldsData] = useState({});
  const [editingActivityIndex, setEditingActivityIndex] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedSubType, setSelectedSubType] = useState(null);

  // Handle inline edit
  const startEdit = (activityIndex, fieldKey, currentValue) => {
    setEditingActivityIndex(activityIndex);
    setEditingField(fieldKey);
    setEditValue(currentValue || "");
  };

  const saveEdit = (activityIndex, fieldKey) => {
    const updatedActivities = [...parsedActivities];
    const activity = { ...updatedActivities[activityIndex] };
    
    let value = editValue.trim();
    
    // Parse date if it's a date field
    if (fieldKey.includes("Date")) {
      const parsed = parseDate(value);
      if (parsed) {
        value = parsed;
        // Remove date error if exists
        activity._errors = activity._errors?.filter(
          (err) => !err.includes(FIELD_DEFINITIONS.common.find((f) => f.key === fieldKey)?.label || "")
        ) || [];
      } else {
        // Add error if date is invalid
        const fieldLabel = FIELD_DEFINITIONS.common.find((f) => f.key === fieldKey)?.label || fieldKey;
        if (!activity._errors) activity._errors = [];
        if (!activity._errors.some((e) => e.includes(fieldLabel))) {
          activity._errors.push(`${fieldLabel} không hợp lệ`);
        }
      }
    }
    
    // Combine date and time if needed
    if (fieldKey === "startDate" && value) {
      const timeField = columnMapping["startTime"];
      if (timeField !== null && timeField !== undefined && rawData[activityIndex]?.[timeField]) {
        const time = parseTime(String(rawData[activityIndex][timeField]).trim());
        if (time) {
          value = combineDateTime(value, time);
        }
      }
    }
    if (fieldKey === "endDate" && value) {
      const timeField = columnMapping["endTime"];
      if (timeField !== null && timeField !== undefined && rawData[activityIndex]?.[timeField]) {
        const time = parseTime(String(rawData[activityIndex][timeField]).trim());
        if (time) {
          value = combineDateTime(value, time);
        }
      }
    }
    
    activity[fieldKey] = value;
    
    // Re-validate
    const requiredFields = FIELD_DEFINITIONS.common.filter((f) => f.required);
    activity._errors = activity._errors?.filter((err) => {
      const fieldLabel = FIELD_DEFINITIONS.common.find((f) => f.key === fieldKey)?.label || "";
      return !err.includes(fieldLabel) && !err.includes("phải >=") && !err.includes("phải <=");
    }) || [];
    
    if (!value && requiredFields.find((f) => f.key === fieldKey)) {
      const fieldLabel = FIELD_DEFINITIONS.common.find((f) => f.key === fieldKey)?.label || fieldKey;
      if (!activity._errors) activity._errors = [];
      activity._errors.push(`Thiếu ${fieldLabel}`);
    }
    
    // Re-validate dates
    const dateErrors = validateDates(activity);
    if (dateErrors.length > 0) {
      activity._errors = [...(activity._errors || []), ...dateErrors];
    }
    
    updatedActivities[activityIndex] = activity;
    setParsedActivities(updatedActivities);
    setEditingActivityIndex(null);
    setEditingField(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingActivityIndex(null);
    setEditingField(null);
    setEditValue("");
  };

  // Step 1: Upload file
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validExtensions = [".xlsx", ".xls", ".csv"];
      const fileExtension = selectedFile.name
        .substring(selectedFile.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        toast.error("Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV");
        return;
      }

      setFile(selectedFile);
      readFile(selectedFile);
    }
  };

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        
        if (fileExtension === ".csv") {
          // Parse CSV
          const text = e.target.result;
          const { headers, data } = parseCSV(text);
          
          if (headers.length === 0 || data.length === 0) {
            toast.error("File phải có ít nhất 1 dòng header và 1 dòng dữ liệu");
            return;
          }
          
          setHeaders(headers);
          // Only use first row for single activity import
          setRawData(data.length > 0 ? [data[0]] : []);
          toast.success(`Đã đọc file với ${headers.length} cột. Chỉ import hoạt động đầu tiên.`);
        } else {
          // Parse Excel - requires xlsx package
          toast.error("Vui lòng cài đặt package xlsx: npm install xlsx. Hiện tại chỉ hỗ trợ CSV.");
          // Uncomment after installing xlsx:
          /*
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });

          if (jsonData.length < 2) {
            toast.error("File phải có ít nhất 1 dòng header và 1 dòng dữ liệu");
            return;
          }

          const fileHeaders = jsonData[0].map((h) => String(h).trim()).filter((h) => h);
          const fileData = jsonData.slice(1).filter((row) => row.some((cell) => cell));

          setHeaders(fileHeaders);
          // Only use first row for single activity import
          setRawData(fileData.length > 0 ? [fileData[0]] : []);
          setStep(2);
          toast.success(`Đã đọc file với ${fileHeaders.length} cột. Chỉ import hoạt động đầu tiên.`);
          */
        }
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error("Không thể đọc file. Vui lòng kiểm tra định dạng.");
      }
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Column mapping - get fields based on selected subType
  const getAvailableFields = () => {
    if (!selectedSubType) {
      // If no subType selected, show all common fields
      return FIELD_DEFINITIONS.common;
    }
    return [
      ...FIELD_DEFINITIONS.common,
      ...(FIELD_DEFINITIONS[selectedSubType] || []),
    ];
  };
  
  // Auto-detect subType from column mapping if available
  useEffect(() => {
    if (headers.length > 0 && columnMapping.subType !== undefined && columnMapping.subType !== null) {
      const subTypeValue = rawData[0]?.[columnMapping.subType];
      if (subTypeValue && ["SportsFestival", "CreativeContest", "SeminarWorkshop", "Other"].includes(subTypeValue)) {
        setSelectedSubType(subTypeValue);
      }
    }
  }, [columnMapping, headers, rawData]);

  const handleMappingChange = (fieldKey, columnIndex) => {
    setColumnMapping((prev) => ({
      ...prev,
      [fieldKey]: columnIndex === "" ? null : parseInt(columnIndex),
    }));
  };

  const autoMapColumns = () => {
    const mapping = {};
    const allFields = [
      ...FIELD_DEFINITIONS.common,
      ...Object.values(FIELD_DEFINITIONS).flat().filter((f) => !FIELD_DEFINITIONS.common.includes(f)),
    ];

    headers.forEach((header, index) => {
      const headerLower = header.toLowerCase();
      allFields.forEach((field) => {
        const fieldLabelLower = field.label.toLowerCase();
        if (
          !mapping[field.key] &&
          (headerLower.includes(fieldLabelLower) ||
            fieldLabelLower.includes(headerLower) ||
            headerLower === field.key.toLowerCase())
        ) {
          mapping[field.key] = index;
        }
      });
    });

    setColumnMapping(mapping);
    toast.success("Đã tự động ánh xạ các cột");
  };

  const validateMapping = () => {
    const requiredFields = FIELD_DEFINITIONS.common.filter((f) => f.required);
    const missing = requiredFields.filter((f) => !columnMapping[f.key] && columnMapping[f.key] !== 0);

    if (missing.length > 0) {
      toast.error(`Thiếu ánh xạ cho: ${missing.map((f) => f.label).join(", ")}`);
      return false;
    }
    return true;
  };

  // Validate date rules
  const validateDates = (activity) => {
    const errors = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const registerDate = activity.registerDate ? new Date(activity.registerDate) : null;
    const endRegisterDate = activity.endRegisterDate ? new Date(activity.endRegisterDate) : null;
    const startDate = activity.startDate ? new Date(activity.startDate) : null;
    const endDate = activity.endDate ? new Date(activity.endDate) : null;
    
    // Ngày đăng ký >= ngày hôm nay
    if (registerDate) {
      if (registerDate < today) {
        errors.push("Ngày mở đăng ký phải >= ngày hôm nay");
      }
    }
    
    // Ngày kết thúc đăng ký >= ngày đăng ký
    if (registerDate && endRegisterDate) {
      if (endRegisterDate < registerDate) {
        errors.push("Ngày đóng đăng ký phải >= ngày mở đăng ký");
      }
    }
    
    // Ngày bắt đầu >= ngày kết thúc đăng ký
    if (endRegisterDate && startDate) {
      if (startDate < endRegisterDate) {
        errors.push("Ngày bắt đầu phải >= ngày đóng đăng ký");
      }
    }
    
    // Ngày cuối >= ngày bắt đầu
    if (startDate && endDate) {
      if (endDate < startDate) {
        errors.push("Ngày kết thúc phải >= ngày bắt đầu");
      }
    }
    
    return errors;
  };

  const parseActivities = () => {
    if (!validateMapping()) return;

    // Only parse first row (single activity import)
    const row = rawData[0];
    if (!row) {
      toast.error("File không có dữ liệu");
      return;
    }

    const activities = [(() => {
      const rowIndex = 0;
      const activity = { _rowIndex: rowIndex + 2, _errors: [] };

      // Parse common fields
      FIELD_DEFINITIONS.common.forEach((field) => {
        const colIndex = columnMapping[field.key];
        if (colIndex !== null && colIndex !== undefined && row[colIndex] !== undefined) {
          let value = String(row[colIndex]).trim();

          // Special parsing for dates
          if (field.key.includes("Date")) {
            value = parseDate(value);
            if (!value && field.required) {
              activity._errors.push(`${field.label} không hợp lệ`);
            }
          }

          // Special parsing for category
          if (field.key === "category") {
            if (field.map && field.map[value]) {
              value = field.map[value];
            } else if (value === "1" || value === "2") {
              value = parseInt(value);
            } else {
              activity._errors.push(`${field.label} phải là 1, 2, "activity" hoặc "event"`);
            }
          }

          // Special parsing for subType with mapping
          if (field.key === "subType") {
            if (field.map && field.map[value]) {
              value = field.map[value];
            }
            // Set selectedSubType if not already set
            if (!selectedSubType && ["SportsFestival", "CreativeContest", "SeminarWorkshop", "Other"].includes(value)) {
              setSelectedSubType(value);
            }
          }

          // Combine date and time
          if (field.key === "startDate" && value) {
            const timeField = columnMapping["startTime"];
            if (timeField !== null && timeField !== undefined && row[timeField]) {
              const time = parseTime(String(row[timeField]).trim());
              if (time) {
                value = combineDateTime(value, time);
              }
            }
          }
          if (field.key === "endDate" && value) {
            const timeField = columnMapping["endTime"];
            if (timeField !== null && timeField !== undefined && row[timeField]) {
              const time = parseTime(String(row[timeField]).trim());
              if (time) {
                value = combineDateTime(value, time);
              }
            }
          }

          activity[field.key] = value;
        } else if (field.required) {
          activity._errors.push(`Thiếu ${field.label}`);
        }
      });

      // Parse subType specific fields
      const subType = activity.subType || selectedSubType;
      if (subType && FIELD_DEFINITIONS[subType]) {
        FIELD_DEFINITIONS[subType].forEach((field) => {
          const colIndex = columnMapping[field.key];
          if (colIndex !== null && colIndex !== undefined && row[colIndex] !== undefined) {
            let value = String(row[colIndex]).trim();

            // Parse competitionType with mapping
            if (field.key === "competitionType" && field.map) {
              value = field.map[value] || value;
            }

            // Parse sportsCategories (array) - có thể có nhiều môn
            if (field.key === "sportsCategories" && field.isArray) {
              value = value.split(",").map((v) => v.trim()).filter((v) => v);
              // Initialize sportsConfigurations if sportsCategories exist and no configs yet
              if (value.length > 0 && !activity.sportsConfigurations) {
                activity.sportsConfigurations = value.map((sport) => ({
                  sportName: sport,
                  maxMembers: "",
                }));
              } else if (value.length > 0 && activity.sportsConfigurations) {
                // Merge với configs hiện có, thêm môn mới nếu chưa có
                const existingSports = activity.sportsConfigurations.map((cfg) => cfg.sportName);
                value.forEach((sport) => {
                  if (!existingSports.includes(sport)) {
                    activity.sportsConfigurations.push({
                      sportName: sport,
                      maxMembers: "",
                    });
                  }
                });
              }
            }

            // Parse sportsConfigurations (object array) - có thể có nhiều môn
            if (field.key === "sportsConfigurations" && field.isObject) {
              // Format: "Bóng đá: 11, Bóng chuyền: 6"
              const configs = value.split(",").map((item) => {
                const parts = item.trim().split(":");
                return {
                  sportName: parts[0]?.trim() || "",
                  maxMembers: parts[1]?.trim() || "",
                };
              }).filter((cfg) => cfg.sportName);
              
              // Merge với sportsCategories nếu có
              if (activity.sportsCategories && activity.sportsCategories.length > 0) {
                activity.sportsCategories.forEach((sport) => {
                  if (!configs.some((cfg) => cfg.sportName === sport)) {
                    configs.push({
                      sportName: sport,
                      maxMembers: "",
                    });
                  }
                });
              }
              
              value = configs;
            }

            // Parse speakers (array of objects)
            if (field.key === "speakers" && field.isArray && field.isObject) {
              // Format: "Tên|Chức danh|Tiểu sử|URL ảnh, ..."
              value = value.split(",").map((item) => {
                const parts = item.trim().split("|");
                return {
                  name: parts[0]?.trim() || "",
                  title: parts[1]?.trim() || "",
                  bio: parts[2]?.trim() || "",
                  image: parts[3]?.trim() || "",
                };
              }).filter((s) => s.name);
            }

            // Parse programItems (array of objects)
            if (field.key === "programItems" && field.isArray && field.isObject) {
              // Format: "Giờ|Tiêu đề|Mô tả, ..."
              value = value.split(",").map((item) => {
                const parts = item.trim().split("|");
                return {
                  time: parts[0]?.trim() || "",
                  title: parts[1]?.trim() || "",
                  description: parts[2]?.trim() || "",
                };
              }).filter((p) => p.time || p.title);
            }

            // Parse submissionDeadline (datetime)
            if (field.key === "submissionDeadline") {
              const parsed = parseDate(value.split(" ")[0]);
              const time = parseTime(value.split(" ")[1] || "");
              if (parsed && time) {
                value = combineDateTime(parsed, time);
              } else if (parsed) {
                value = parsed;
              }
            }

            activity[field.key] = value;
          } else if (field.required) {
            activity._errors.push(`Thiếu ${field.label}`);
          }
        });
      }

      // Validate dates
      const dateErrors = validateDates(activity);
      if (dateErrors.length > 0) {
        activity._errors = [...(activity._errors || []), ...dateErrors];
      }

      return activity;
    })()];

    setParsedActivities(activities);
    // Initialize manual fields data
    const manualData = {};
    activities.forEach((activity, index) => {
      manualData[index] = {
        thumbnailUrl: "",
        rules: [""],
        registrationSettings: null,
        starPointRewards: null,
        gradingSettings: null,
      };
    });
    setManualFieldsData(manualData);
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    // Try multiple formats
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /^(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
      /^(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format === formats[0]) {
          return dateStr; // Already YYYY-MM-DD
        } else {
          const [, d, m, y] = match;
          return `${y}-${m}-${d}`;
        }
      }
    }

    // Try Date.parse
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }

    return null;
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    // Try HH:MM format
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      const [, h, m] = match;
      return `${h.padStart(2, "0")}:${m}`;
    }
    return null;
  };

  const combineDateTime = (date, time) => {
    if (!date || !time) return date;
    return `${date}T${time}:00`;
  };

  // Manual fields
  const handleManualFieldChange = (activityIndex, fieldKey, value) => {
    setManualFieldsData((prev) => ({
      ...prev,
      [activityIndex]: {
        ...prev[activityIndex],
        [fieldKey]: value,
      },
    }));
  };

  // Review and submit
  const handleSubmit = async () => {
    // Combine parsed data with manual fields
    const finalActivities = parsedActivities.map((activity, index) => {
      const manual = manualFieldsData[index] || {};
      return {
        ...activity,
        thumbnailUrl: manual.thumbnailUrl || "",
        rules: manual.rules || [""],
        registrationSettings: manual.registrationSettings,
        starPointRewards: manual.starPointRewards,
        gradingSettings: manual.gradingSettings,
      };
    });

    // Validate all activities
    const invalidActivities = finalActivities.filter(
      (a) => a._errors && a._errors.length > 0 || !a.thumbnailUrl
    );

    if (invalidActivities.length > 0) {
      toast.error(`Có ${invalidActivities.length} hoạt động chưa hợp lệ`);
      return;
    }

    // Navigate to create page with data (only 1 activity)
    sessionStorage.setItem("importedActivities", JSON.stringify(finalActivities));
    navigate(`${ROUTES.ADMIN.CREATE_ACTIVITY}?import=true`);
    toast.success("Đã chuẩn bị hoạt động để tạo");
  };

  const downloadTemplate = (subType = null) => {
    let templateData = [];
    
    if (subType === "SportsFestival") {
      templateData = [
        [
          "Tên hoạt động",
          "Mô tả",
          "Loại (1=Activity, 2=Event)",
          "Phân loại (SportsFestival/Hội thao)",
          "Địa điểm",
          "Đơn vị tổ chức",
          "Ngày mở đăng ký (YYYY-MM-DD)",
          "Ngày đóng đăng ký (YYYY-MM-DD)",
          "Ngày bắt đầu (YYYY-MM-DD)",
          "Giờ bắt đầu (HH:MM)",
          "Ngày kết thúc (YYYY-MM-DD)",
          "Giờ kết thúc (HH:MM)",
          "Số người tham gia tối đa",
          "Hình thức thi đấu (Individual/Team/Mixed/Cá nhân/Đồng đội/Kết hợp)",
          "Danh mục thể thao (phân cách bằng dấu phẩy)",
          "Cấu hình môn thể thao (format: 'Tên môn: Số người tối đa, ...')",
        ],
        [
          "Hội thao mùa xuân",
          "Hội thao dành cho toàn trường",
          "1",
          "SportsFestival",
          "Sân vận động",
          "Phòng Thể dục",
          "2024-12-15",
          "2024-12-19",
          "2024-12-20",
          "08:00",
          "2024-12-20",
          "17:00",
          "200",
          "Team",
          "Bóng đá, Bóng chuyền, Cầu lông",
          "Bóng đá: 11, Bóng chuyền: 6, Cầu lông: 2",
        ],
      ];
    } else if (subType === "CreativeContest") {
      templateData = [
        [
          "Tên hoạt động",
          "Mô tả",
          "Loại (1=Activity, 2=Event)",
          "Phân loại (CreativeContest/Cuộc thi sáng tạo)",
          "Địa điểm",
          "Đơn vị tổ chức",
          "Ngày mở đăng ký (YYYY-MM-DD)",
          "Ngày đóng đăng ký (YYYY-MM-DD)",
          "Ngày bắt đầu (YYYY-MM-DD)",
          "Giờ bắt đầu (HH:MM)",
          "Ngày kết thúc (YYYY-MM-DD)",
          "Giờ kết thúc (HH:MM)",
          "Số người tham gia tối đa",
          "Chủ đề",
          "Loại hình sáng tạo",
          "Kích thước / Độ dài",
          "Chất liệu / Thể loại",
          "Thời gian làm bài",
          "Format nộp bài",
          "Hạn cuối nộp bài (YYYY-MM-DD HH:MM)",
          "Đề bài (Text)",
          "File đề bài (URL)",
          "Giới hạn số từ",
          "Định dạng viết",
        ],
        [
          "Cuộc thi vẽ tranh",
          "Cuộc thi vẽ tranh chủ đề mùa xuân",
          "1",
          "CreativeContest",
          "Phòng Mỹ thuật",
          "Đoàn Thanh niên",
          "2024-12-20",
          "2024-12-24",
          "2024-12-25",
          "09:00",
          "2024-12-25",
          "12:00",
          "50",
          "Mùa xuân",
          "Vẽ tranh",
          "A3",
          "Màu nước",
          "120 phút",
          "JPG, PNG, PDF",
          "2024-12-25 23:59",
          "Vẽ tranh về chủ đề mùa xuân",
          "",
          "500-1000",
          "Truyện ngắn",
        ],
      ];
    } else if (subType === "SeminarWorkshop") {
      templateData = [
        [
          "Tên hoạt động",
          "Mô tả",
          "Loại (1=Activity, 2=Event)",
          "Phân loại (SeminarWorkshop/Hội thảo/Workshop)",
          "Địa điểm",
          "Đơn vị tổ chức",
          "Ngày mở đăng ký (YYYY-MM-DD)",
          "Ngày đóng đăng ký (YYYY-MM-DD)",
          "Ngày bắt đầu (YYYY-MM-DD)",
          "Giờ bắt đầu (HH:MM)",
          "Ngày kết thúc (YYYY-MM-DD)",
          "Giờ kết thúc (HH:MM)",
          "Số người tham gia tối đa",
          "Diễn giả (format: 'Tên|Chức danh|Tiểu sử|URL ảnh, ...')",
          "Chương trình (format: 'Giờ|Tiêu đề|Mô tả, ...')",
        ],
        [
          "Hội thảo Kỹ năng mềm",
          "Hội thảo về kỹ năng mềm cho sinh viên",
          "1",
          "SeminarWorkshop",
          "Hội trường A",
          "Phòng Đào tạo",
          "2024-12-15",
          "2024-12-19",
          "2024-12-20",
          "08:00",
          "2024-12-20",
          "17:00",
          "100",
          "Nguyễn Văn A|Giáo sư|Tiểu sử diễn giả|https://example.com/avatar.jpg, Trần Thị B|Tiến sĩ|Tiểu sử...|https://example.com/avatar2.jpg",
          "08:00|Khai mạc|Mô tả khai mạc, 09:00|Nội dung chính|Mô tả nội dung, 10:00|Thảo luận|Mô tả thảo luận",
        ],
      ];
    } else {
      // Default template with all fields
      templateData = [
        [
          "Tên hoạt động",
          "Mô tả",
          "Loại (1=Activity, 2=Event)",
          "Phân loại (SportsFestival/CreativeContest/SeminarWorkshop/Other)",
          "Địa điểm",
          "Đơn vị tổ chức",
          "Ngày mở đăng ký (YYYY-MM-DD)",
          "Ngày đóng đăng ký (YYYY-MM-DD)",
          "Ngày bắt đầu (YYYY-MM-DD)",
          "Giờ bắt đầu (HH:MM)",
          "Ngày kết thúc (YYYY-MM-DD)",
          "Giờ kết thúc (HH:MM)",
          "Số người tham gia tối đa",
        ],
        [
          "Hoạt động mẫu",
          "Mô tả hoạt động",
          "1",
          "Other",
          "Địa điểm",
          "Đơn vị tổ chức",
          "2024-12-15",
          "2024-12-19",
          "2024-12-20",
          "08:00",
          "2024-12-20",
          "17:00",
          "100",
        ],
      ];
    }

    const fileName = subType 
      ? `mau_import_${subType.toLowerCase()}.csv`
      : 'mau_import_hoat_dong.csv';
    
    // For now, download as CSV until xlsx is installed
    const csvContent = templateData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Đã tải mẫu file ${subType || 'tổng quát'}`);
    
    // Uncomment after installing xlsx:
    /*
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mẫu");
    XLSX.writeFile(wb, "mau_import_hoat_dong.xlsx");
    toast.success("Đã tải mẫu file");
    */
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Upload className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">Import Hoạt Động từ File</h1>
          </div>
          <p className="text-gray-600">
            Tải lên file Excel/CSV để import 1 hoạt động. Chọn mẫu file phù hợp với loại hoạt động bạn muốn tạo.
          </p>
        </div>

        <div className="space-y-6">

        {/* Section 1: Download Template */}
        <Card>
          <CardHeader>
            <CardTitle>Tải mẫu file Excel/CSV</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Chọn loại hoạt động để tải mẫu file phù hợp:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SUB_TYPES.map((subType) => (
                <Button
                  key={subType.value}
                  variant="outline"
                  onClick={() => downloadTemplate(subType.value)}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-sm">{subType.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Upload File */}
        <Card>
          <CardHeader>
            <CardTitle>Tải file Excel/CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file">Chọn file</Label>
              <input
                ref={fileInputRef}
                type="file"
                id="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Chọn file
              </Button>
              {file && (
                <div className="mt-2 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Column Mapping */}
        {file && headers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Ánh xạ cột</span>
                <Button variant="outline" size="sm" onClick={autoMapColumns}>
                  <Map className="w-4 h-4 mr-2" />
                  Tự động ánh xạ
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* SubType selector */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Label className="text-base font-semibold mb-2 block">
                  Chọn loại hoạt động để hiển thị các trường tương ứng:
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SUB_TYPES.map((subType) => (
                    <Button
                      key={subType.value}
                      variant={selectedSubType === subType.value ? "default" : "outline"}
                      onClick={() => {
                        setSelectedSubType(subType.value);
                        // Clear subType-specific mappings when changing subType
                        const newMapping = { ...columnMapping };
                        if (FIELD_DEFINITIONS[subType.value]) {
                          FIELD_DEFINITIONS[subType.value].forEach((field) => {
                            delete newMapping[field.key];
                          });
                        }
                        setColumnMapping(newMapping);
                      }}
                      className="text-sm"
                    >
                      {subType.label}
                    </Button>
                  ))}
                </div>
                {selectedSubType && (
                  <p className="text-xs text-gray-600 mt-2">
                    Đã chọn: <strong>{SUB_TYPES.find((s) => s.value === selectedSubType)?.label}</strong>
                  </p>
                )}
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {getAvailableFields().map((field) => (
                  <div key={field.key} className="flex items-center gap-4">
                    <div className="w-48">
                      <Label>
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </Label>
                    </div>
                    <select
                      className="flex-1 border rounded px-3 py-2"
                      value={columnMapping[field.key] ?? ""}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                    >
                      <option value="">-- Chọn cột --</option>
                      {headers.map((header, index) => (
                        <option key={index} value={index}>
                          {header}
                        </option>
                      ))}
                    </select>
                    {field.examples && (
                      <span className="text-xs text-gray-500 w-32">
                        VD: {field.examples[0]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button onClick={parseActivities} className="w-full">
                  Phân tích dữ liệu
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 4: Preview */}
        {parsedActivities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Xem trước dữ liệu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {parsedActivities.map((activity, index) => (
                  <Card
                    key={index}
                    className={activity._errors?.length > 0 ? "border-red-200" : "border-green-200"}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{activity.title || `Hoạt động ${index + 1}`}</h3>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <div className="mt-2 flex gap-2 flex-wrap">
                            <Badge>{activity.subType}</Badge>
                            <Badge variant="outline">{activity.location}</Badge>
                            {activity.organizer && (
                              <Badge variant="outline" className="bg-gray-100">
                                {activity.organizer}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {activity._errors?.length > 0 && (
                          <div className="text-red-600">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      
                      {/* Display all important fields */}
                      <div className="mt-3 space-y-3">
                        {/* Common fields */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {FIELD_DEFINITIONS.common
                            .filter((f) => !["title", "description", "subType"].includes(f.key))
                            .map((field) => {
                              const value = activity[field.key];
                              const hasError = activity._errors?.some((err) => err.includes(field.label));
                              return (
                                <div
                                  key={field.key}
                                  className={`p-2 rounded border ${
                                    hasError ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-xs font-medium">{field.label}:</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startEdit(index, field.key, value || "")}
                                      className="h-6 px-2 text-xs"
                                    >
                                      <Edit className="w-3 h-3 mr-1" />
                                      {value || "Chưa có"}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>

                        {/* SportsFestival specific fields */}
                        {activity.subType === "SportsFestival" && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-sm mb-2">Thông tin Hội thao:</h4>
                            <div className="space-y-2 text-sm">
                              {activity.competitionType && (
                                <div>
                                  <span className="text-gray-600 font-medium">Hình thức thi đấu:</span>{" "}
                                  <span>{activity.competitionType}</span>
                                </div>
                              )}
                              {activity.sportsCategories && activity.sportsCategories.length > 0 && (
                                <div>
                                  <span className="text-gray-600 font-medium">Danh mục thể thao:</span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {activity.sportsCategories.map((sport, i) => (
                                      <Badge key={i} variant="outline" className="bg-white">
                                        {sport}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {activity.sportsConfigurations && activity.sportsConfigurations.length > 0 && (
                                <div>
                                  <span className="text-gray-600 font-medium">Cấu hình môn thể thao:</span>
                                  <div className="mt-1 space-y-1">
                                    {activity.sportsConfigurations.map((cfg, i) => (
                                      <div key={i} className="text-xs bg-white p-2 rounded border">
                                        <strong>{cfg.sportName}:</strong> Tối đa {cfg.maxMembers || "Chưa có"} người
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* CreativeContest specific fields */}
                        {activity.subType === "CreativeContest" && (
                          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-sm mb-2">Thông tin Cuộc thi sáng tạo:</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {activity.theme && (
                                <div>
                                  <span className="text-gray-600 font-medium">Chủ đề:</span> {activity.theme}
                                </div>
                              )}
                              {activity.genre && (
                                <div>
                                  <span className="text-gray-600 font-medium">Loại hình:</span> {activity.genre}
                                </div>
                              )}
                              {activity.paperSize && (
                                <div>
                                  <span className="text-gray-600 font-medium">Kích thước:</span> {activity.paperSize}
                                </div>
                              )}
                              {activity.drawingMedium && (
                                <div>
                                  <span className="text-gray-600 font-medium">Chất liệu:</span> {activity.drawingMedium}
                                </div>
                              )}
                              {activity.timeLimit && (
                                <div>
                                  <span className="text-gray-600 font-medium">Thời gian:</span> {activity.timeLimit}
                                </div>
                              )}
                              {activity.submissionFormat && (
                                <div>
                                  <span className="text-gray-600 font-medium">Format nộp:</span> {activity.submissionFormat}
                                </div>
                              )}
                              {activity.submissionDeadline && (
                                <div>
                                  <span className="text-gray-600 font-medium">Hạn nộp:</span> {activity.submissionDeadline}
                                </div>
                              )}
                              {activity.problemText && (
                                <div className="col-span-2">
                                  <span className="text-gray-600 font-medium">Đề bài:</span>
                                  <p className="mt-1 text-xs bg-white p-2 rounded border line-clamp-3">
                                    {activity.problemText}
                                  </p>
                                </div>
                              )}
                              {activity.wordLimit && (
                                <div>
                                  <span className="text-gray-600 font-medium">Giới hạn số từ:</span> {activity.wordLimit}
                                </div>
                              )}
                              {activity.writingFormat && (
                                <div>
                                  <span className="text-gray-600 font-medium">Định dạng viết:</span> {activity.writingFormat}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* SeminarWorkshop specific fields */}
                        {activity.subType === "SeminarWorkshop" && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-sm mb-2">Thông tin Hội thảo/Workshop:</h4>
                            {activity.speakers && activity.speakers.length > 0 && (
                              <div className="mb-3">
                                <span className="text-gray-600 font-medium text-sm">Diễn giả:</span>
                                <div className="mt-1 space-y-1">
                                  {activity.speakers.map((speaker, i) => (
                                    <div key={i} className="text-xs bg-white p-2 rounded border">
                                      <strong>{speaker.name}</strong>
                                      {speaker.title && <span className="text-gray-600"> - {speaker.title}</span>}
                                      {speaker.bio && <p className="mt-1 text-gray-500 line-clamp-2">{speaker.bio}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {activity.programItems && activity.programItems.length > 0 && (
                              <div>
                                <span className="text-gray-600 font-medium text-sm">Chương trình:</span>
                                <div className="mt-1 space-y-1">
                                  {activity.programItems.map((item, i) => (
                                    <div key={i} className="text-xs bg-white p-2 rounded border">
                                      <strong className="text-blue-600">{item.time}</strong> - {item.title}
                                      {item.description && <p className="mt-1 text-gray-500">{item.description}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {activity._errors?.length > 0 && (
                        <div className="mt-2 space-y-2">
                          <div className="text-sm font-semibold text-red-600">Lỗi:</div>
                          {activity._errors.map((err, i) => {
                            // Extract field name from error message
                            const fieldMatch = err.match(/(.+?)\s+(không hợp lệ|thiếu)/i);
                            const fieldName = fieldMatch ? fieldMatch[1].trim() : "";
                            const fieldKey = FIELD_DEFINITIONS.common.find(
                              (f) => f.label === fieldName || err.includes(f.label)
                            )?.key;
                            
                            return (
                              <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                                <span>• {err}</span>
                                {fieldKey && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const currentValue = activity[fieldKey] || "";
                                      startEdit(index, fieldKey, currentValue);
                                    }}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Sửa
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Inline edit dialog */}
                      {editingActivityIndex === index && editingField && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <Label className="text-sm font-semibold">
                            Sửa {FIELD_DEFINITIONS.common.find((f) => f.key === editingField)?.label || editingField}:
                          </Label>
                          <div className="mt-2 flex gap-2">
                            <Input
                              type={editingField.includes("Date") ? "date" : "text"}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  saveEdit(index, editingField);
                                } else if (e.key === "Escape") {
                                  cancelEdit();
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => saveEdit(index, editingField)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 5: Manual Fields */}
        {parsedActivities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Điền thông tin bổ sung</CardTitle>
            </CardHeader>
            <CardContent>
              {parsedActivities.map((activity, activityIndex) => (
                <div key={activityIndex} className="space-y-6 mb-6 pb-6 border-b last:border-0">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{activity.title}</h3>
                  </div>
                  {MANUAL_FIELDS.map((field) => (
                    <div key={field.key}>
                      <Label>
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      {field.key === "thumbnailUrl" && (
                        <Input
                          type="text"
                          placeholder="URL ảnh đại diện"
                          value={manualFieldsData[activityIndex]?.[field.key] || ""}
                          onChange={(e) =>
                            handleManualFieldChange(activityIndex, field.key, e.target.value)
                          }
                          className="mt-2"
                        />
                      )}
                      {field.key === "rules" && (
                        <div className="mt-2 space-y-2">
                          {(manualFieldsData[activityIndex]?.rules || [""]).map((rule, i) => (
                            <Input
                              key={i}
                              value={rule}
                              onChange={(e) => {
                                const newRules = [...(manualFieldsData[activityIndex]?.rules || [""])];
                                newRules[i] = e.target.value;
                                handleManualFieldChange(activityIndex, field.key, newRules);
                              }}
                              placeholder={`Quy định ${i + 1}`}
                            />
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newRules = [
                                ...(manualFieldsData[activityIndex]?.rules || [""]),
                                "",
                              ];
                              handleManualFieldChange(activityIndex, field.key, newRules);
                            }}
                          >
                            + Thêm quy định
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Section 6: Review and Submit */}
        {parsedActivities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Xác nhận và tạo hoạt động</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
                {parsedActivities.map((activity, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{activity.title}</h3>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Phân loại:</span> {activity.subType}
                        </div>
                        <div>
                          <span className="text-gray-600">Địa điểm:</span> {activity.location}
                        </div>
                        <div>
                          <span className="text-gray-600">Ngày bắt đầu:</span> {activity.startDate}
                        </div>
                        <div>
                          <span className="text-gray-600">Ảnh:</span>{" "}
                          {manualFieldsData[index]?.thumbnailUrl ? "✓" : "✗"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button 
                onClick={handleSubmit} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={
                  parsedActivities.some((a) => a._errors?.length > 0) ||
                  editingActivityIndex !== null ||
                  !parsedActivities.every((a, i) => manualFieldsData[i]?.thumbnailUrl)
                }
              >
                <Save className="w-4 h-4 mr-2" />
                Tạo hoạt động
              </Button>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}

