"use client";

import { useState, useRef } from "react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Label } from "@/common/components/ui/label";
import { ArrowLeft, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "react-toastify";
import { executeApiCall } from "@/common/utils/executeApiCall";
import { activityService } from "@/features/activities/services/activity.service";

export default function CreateActivityImport({ onBack }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const fileInputRef = useRef(null);

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
      setValidationResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    // Create sample Excel/CSV template
    const templateData = [
      [
        "Tên hoạt động",
        "Loại hoạt động",
        "Ngày bắt đầu",
        "Giờ bắt đầu",
        "Ngày kết thúc",
        "Giờ kết thúc",
        "Địa điểm",
        "Đơn vị tổ chức",
        "Mô tả",
        "Số người tham gia tối đa",
      ],
      [
        "Hội thảo Kỹ năng mềm",
        "SeminarWorkshop",
        "2024-12-20",
        "08:00",
        "2024-12-20",
        "17:00",
        "Hội trường A",
        "Phòng Đào tạo",
        "Hội thảo về kỹ năng mềm cho sinh viên",
        "100",
      ],
      [
        "Cuộc thi Vẽ tranh",
        "CreativeContest",
        "2024-12-25",
        "09:00",
        "2024-12-25",
        "12:00",
        "Phòng Mỹ thuật",
        "Đoàn Thanh niên",
        "Cuộc thi vẽ tranh chủ đề mùa xuân",
        "50",
      ],
    ];

    // Convert to CSV
    const csvContent = templateData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "mau_tao_hoat_dong.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await executeApiCall(
        activityService.importActivities.bind(activityService),
        [formData, token],
        { setLoading: setUploading, setError: () => {} }
      );

      if (response?.success && response?.data?.data) {
        setValidationResult(response.data.data);
        if (response.data.data.valid) {
          toast.success(`File hợp lệ! Có ${response.data.data.validRows} hoạt động sẽ được tạo.`);
        } else {
          toast.warn(`File có ${response.data.data.errors.length} lỗi. Vui lòng kiểm tra lại.`);
        }
      } else {
        toast.error("Không thể xử lý file. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error?.message || "Không thể tải file lên");
      setUploading(false);
    }
  };

  const handleCreateActivities = async () => {
    if (!validationResult || !validationResult.valid) {
      toast.error("Vui lòng tải file hợp lệ trước");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      const response = await executeApiCall(
        activityService.bulkCreateActivities.bind(activityService),
        [{ activities: validationResult.activities }, token],
        { setLoading: setUploading, setError: () => {} }
      );

      if (response?.success) {
        const createdCount = response?.data?.data?.length || 0;
        toast.success(`Đã tạo thành công ${createdCount} hoạt động!`);
        setTimeout(() => {
          window.location.href = "/admin/activities";
        }, 1500);
      } else {
        toast.error("Có lỗi xảy ra khi tạo hoạt động");
      }
    } catch (error) {
      console.error("Error creating activities:", error);
      toast.error(error?.message || "Có lỗi xảy ra khi tạo hoạt động");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Upload className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">Import Hoạt Động từ File</h1>
          </div>
          <p className="text-gray-600">
            Tải lên file Excel hoặc CSV để tạo nhiều hoạt động cùng lúc
          </p>
        </div>

        {/* Download Template */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              Tải mẫu file
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Tải xuống file mẫu để biết định dạng dữ liệu cần thiết
            </p>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Tải mẫu file CSV
            </Button>
          </CardContent>
        </Card>

        {/* Upload File */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tải file lên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Chọn file Excel hoặc CSV</Label>
                <div className="mt-2 flex items-center gap-4">
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
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Chọn file
                  </Button>
                  {file && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFile(null);
                          setValidationResult(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {file && (
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {uploading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-pulse" />
                      Đang tải lên và kiểm tra...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Tải lên và kiểm tra
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validation Result */}
        {validationResult && (
          <Card className={`mb-6 ${validationResult.valid ? "border-green-200" : "border-red-200"}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validationResult.valid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-green-700">File hợp lệ</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700">File có lỗi</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tổng số dòng</p>
                    <p className="text-2xl font-bold">{validationResult.totalRows}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dòng hợp lệ</p>
                    <p className="text-2xl font-bold text-green-600">
                      {validationResult.validRows}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dòng lỗi</p>
                    <p className="text-2xl font-bold text-red-600">
                      {validationResult.totalRows - validationResult.validRows}
                    </p>
                  </div>
                </div>

                {validationResult.errors.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-red-700 mb-2">Chi tiết lỗi:</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <ul className="space-y-2">
                        {validationResult.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700">
                            <span className="font-medium">Dòng {error.row}:</span> {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {validationResult.valid && validationResult.activities && (
                  <div>
                    <p className="text-sm font-semibold text-green-700 mb-2">
                      Danh sách hoạt động sẽ được tạo:
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <ul className="space-y-2">
                        {validationResult.activities.map((activity, index) => (
                          <li key={index} className="text-sm text-green-700">
                            • {activity.title} ({activity.subType})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {validationResult.valid && (
                  <Button
                    onClick={handleCreateActivities}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Tạo {validationResult.validRows} hoạt động
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Tải mẫu file để xem định dạng dữ liệu</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Điền thông tin vào file mẫu (có thể tạo nhiều hoạt động trong một file)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Tải file lên và hệ thống sẽ tự động kiểm tra dữ liệu</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Nếu có lỗi, sửa file và tải lại. Nếu hợp lệ, nhấn "Tạo hoạt động"</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

