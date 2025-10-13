import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/common/components/ui/radio-group';
import { SimpleSelect } from '@/common/components/ui/select';
import { Progress } from '@/common/components/ui/progress';
import { LoadingOverlay, LoadingButton } from '@/common/components/ui/loading';
import { useToast } from '@/common/hooks/useToast';
import { useStudentImportApi } from '@/features/admin/hooks/useStudentImportApi';
import { STUDENT_IMPORT_MESSAGES } from '@/common/constants/messages';
import { parseCSV, validateRow, generateErrorCSV } from '@/lib/csv-parser';
import { autoMatchFields, SYSTEM_FIELDS } from '@/lib/student-fields';
import {
  ArrowLeft,
  UploadIcon,
  FileSpreadsheet,
  Users,
  Upload,
  FileText,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  ArrowUpDown,
} from 'lucide-react';
import AdminPageLayout from '@/features/admin/components/AdminPageLayout';

const ImportStudents = () => {
  const navigate = useNavigate();
  const [csvData, setCSVData] = useState(null);
  const [mapping, setMapping] = useState({});
  const [importMode, setImportMode] = useState('insert');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const toast = useToast();
  const {
    isImporting,
    progress,
    importResult,
    importStudents,
    downloadTemplate,
    resetProgress,
    setImportResult
  } = useStudentImportApi();

  // CSV Upload handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      processFile(file);
    } else {
      toast.showError('Vui lòng chọn file CSV hợp lệ');
    }
  }, [toast]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const processFile = (file) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      try {
        const parsed = parseCSV(content);
          setCSVData(parsed);

        const autoMapping = autoMatchFields(parsed.headers);
        setMapping(autoMapping);

        // Reset previous results
        setImportResult(null);
        resetProgress();
        
      } catch (error) {
        toast.showError('Lỗi khi đọc file CSV: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setCSVData(null);
    setMapping({});
    setImportResult(null);
    setCurrentPage(1);
    resetProgress();
  };

  const handleMappingChange = (csvHeader, systemField) => {
    setMapping((prev) => ({
      ...prev,
      [csvHeader]: systemField,
    }));
  };

  const handleImport = async () => {
    if (!csvData) return;

    const requiredFieldIds = SYSTEM_FIELDS.filter((f) => f.required).map((f) => f.id);
    const allRequiredMapped = requiredFieldIds.every((fieldId) => 
      Object.values(mapping).includes(fieldId)
    );

    if (!allRequiredMapped) {
      toast.showError(STUDENT_IMPORT_MESSAGES.VALIDATION.REQUIRED_FIELDS_NOT_MAPPED);
      return;
    }

    try {
      // Prepare import data
      const importData = {
        students: csvData.rows,
        mapping,
        importMode,
        headers: csvData.headers
      };

      // Import with progress tracking
      const response = await importStudents(importData);

      if (response.statusCode === 200 && response.data) {
        setImportResult(response.data);
        
        // Hiển thị toast dựa trên kết quả
        const { success, failed, total, Success, Failed, Total } = response.data;
        
        // Handle cả camelCase và PascalCase từ backend
        const successCount = success || Success || 0;
        const failedCount = failed || Failed || 0;
        const totalCount = total || Total || 0;
        
        if (successCount > 0 && failedCount === 0) {
          const skippedCount = totalCount - successCount;
          if (skippedCount > 0 && importMode === 'insert') {
            toast.showSuccess(`Import thành công ${successCount} học sinh mới, ${skippedCount} học sinh đã tồn tại được bỏ qua`);
          } else {
            toast.showSuccess(`Import thành công ${successCount} học sinh`);
          }
        } else if (successCount > 0 && failedCount > 0) {
          toast.showSuccess(`Import hoàn tất: ${successCount}/${totalCount} học sinh thành công, ${failedCount} học sinh thất bại`);
        } else if (successCount === 0 && failedCount > 0) {
          toast.showError(`Import thất bại: ${failedCount} học sinh không thể import`);
        } else if (successCount === 0 && failedCount === 0 && totalCount > 0) {
          if (importMode === 'insert') {
            toast.showSuccess(`Tất cả ${totalCount} học sinh đã tồn tại trong hệ thống, không cần thêm mới`);
          } else {
            toast.showError('Không có dữ liệu được xử lý');
          }
        } else {
          // Không có dữ liệu
          toast.showError('Không có dữ liệu để import');
        }
      } else {
        throw new Error(response.message || STUDENT_IMPORT_MESSAGES.ERROR.IMPORT_FAILED);
      }
    } catch (error) {
      toast.showError(error.message || STUDENT_IMPORT_MESSAGES.ERROR.IMPORT_FAILED);
      // Không set importResult ở đây vì có thể đã có một số thành công trước khi lỗi
      // Để response từ API xử lý kết quả
    }
  };

  const handleDownloadErrors = () => {
    if (!importResult || !csvData) return;

    const errorCSV = generateErrorCSV(importResult.errors, csvData.headers);
    const blob = new Blob([errorCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-errors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const canImport = csvData && Object.keys(mapping).length > 0 && !isImporting;

  // Preview data calculations with pagination
  const totalPages = csvData ? Math.ceil(csvData.rows.length / itemsPerPage) : 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const previewRows = csvData ? csvData.rows.slice(startIndex, endIndex) : [];
  
  const requiredFieldIds = SYSTEM_FIELDS.filter((f) => f.required).map((f) => f.id);
  const mappedFields = SYSTEM_FIELDS.filter((field) => 
    Object.values(mapping).includes(field.id)
  );
  const rowValidations = previewRows.map((row) => 
    validateRow(row, mapping, requiredFieldIds)
  );
  const totalErrors = rowValidations.filter((v) => !v.valid).length;

  // Field mapping calculations
  const requiredFields = SYSTEM_FIELDS.filter((f) => f.required);
  const mappedRequiredFields = requiredFields.filter((field) => 
    Object.values(mapping).includes(field.id)
  );

  // Create options for select components
  const fieldOptions = [
    { value: '-- Bỏ qua --', label: '-- Bỏ qua --' },
    ...SYSTEM_FIELDS.map((field) => ({
      value: field.id,
      label: `${field.label}${field.required ? ' *' : ''}`
    }))
  ];


  return (
    <div className="space-y-6">
      <LoadingOverlay isLoading={isImporting} text="Đang import dữ liệu..." />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900">Import Học Sinh</h1>
          <p className="text-gray-600 mt-1">Upload file CSV và ánh xạ dữ liệu để import danh sách học sinh vào hệ thống</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Button 
            variant="outline" 
            className="!border-blue-600 !text-blue-600 hover:!bg-blue-50 !bg-transparent"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <Button 
            onClick={() => downloadTemplate()}
            className="!bg-green-600 hover:!bg-green-700 !text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Tải mẫu Excel
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Upload File CSV</CardTitle>
          <CardDescription>Chọn file CSV chứa dữ liệu học sinh cần import</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">File dữ liệu</h3>
              {selectedFile && (
                <Button variant="ghost" size="sm" onClick={clearFile} className="self-start">
                  <X className="h-4 w-4 mr-1" />
                  Xóa file
                </Button>
              )}
            </div>

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                <p className="text-base font-medium mb-2">Kéo thả file CSV vào đây hoặc click để chọn</p>
                <p className="text-sm text-gray-500 mb-4">Hỗ trợ file .csv với dung lượng tối đa 10MB</p>
                <label htmlFor="csv-upload">
                  <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                    <span>Chọn file CSV</span>
                  </Button>
                </label>
                <input 
                  id="csv-upload" 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={handleFileSelect} 
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Field Mapping Section */}
      {csvData && (
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="text-xl font-semibold">Mapping Trường Dữ Liệu</CardTitle>
                <CardDescription>Ánh xạ các cột trong file CSV với các trường trong hệ thống</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>
                  {mappedRequiredFields.length}/{requiredFields.length} trường bắt buộc
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">

              <div className="space-y-3">
                {csvData.headers.map((header) => (
                  <div key={header} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border min-w-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{header}</p>
                      <p className="text-xs text-gray-500">Cột trong CSV</p>
                    </div>

                    <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />

                    <div className="flex-1 min-w-0 max-w-xs">
                      <SimpleSelect
                        value={mapping[header] || '-- Bỏ qua --'}
                        onValueChange={(value) => handleMappingChange(header, value)}
                        options={fieldOptions}
                        placeholder="Chọn trường hệ thống"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {mappedRequiredFields.length < requiredFields.length && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">
                    Cảnh báo: Các trường bắt buộc chưa được ánh xạ
                  </p>
                  <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                    {requiredFields
                      .filter((field) => !Object.values(mapping).includes(field.id))
                      .map((field) => (
                        <li key={field.id}>{field.label}</li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview Section */}
      {csvData && Object.keys(mapping).length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="text-xl font-semibold">Preview Dữ Liệu</CardTitle>
                <CardDescription>Xem trước dữ liệu trước khi import</CardDescription>
              </div>
              <div className="text-sm text-gray-600 flex-shrink-0">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, csvData.rows.length)} / {csvData.rows.length} dòng
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">

              {totalErrors > 0 && (
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Phát hiện {totalErrors} dòng có lỗi</p>
                    <p className="text-sm text-red-700 mt-1">
                      Các dòng thiếu trường bắt buộc sẽ được highlight màu đỏ
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-md border overflow-x-auto" style={{ borderColor: '#e5e7eb' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ minWidth: '600px' }}>
                    <thead>
                      <tr className="border-b bg-gray-50" style={{ borderBottomColor: '#e5e7eb' }}>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">STT</th>
                        {mappedFields.map((field) => (
                          <th key={field.id} className="px-4 py-3 text-left font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, index) => {
                        const validation = rowValidations[index];
                        const hasError = !validation.valid;

                        return (
                          <tr key={index} className={`border-b ${hasError ? 'bg-red-50' : 'hover:bg-gray-50'}`} style={{ borderBottomColor: '#e5e7eb' }}>
                            <td className="px-4 py-3">{startIndex + index + 1}</td>
                            {mappedFields.map((field) => {
                              const csvHeader = Object.keys(mapping).find((key) => mapping[key] === field.id);
                              const value = csvHeader ? row[csvHeader] : '';
                              const isMissing = field.required && !value;

                              return (
                                <td
                                  key={field.id}
                                  className={`px-4 py-3 ${isMissing ? 'text-red-600 font-medium' : ''}`}
                                >
                                  {value || <span className="text-gray-400 italic">Trống</span>}
                                </td>
                              );
                            })}
                            <td className="px-4 py-3">
                              {hasError ? (
                                <div className="inline-flex items-center gap-1 text-red-600 text-xs">
                                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                  <div className="max-w-32">
                                    {validation.errors.length > 0 ? (
                                      <div className="text-xs">
                                        {validation.errors[0]}
                                        {validation.errors.length > 1 && (
                                          <span className="block text-red-500">+{validation.errors.length - 1} lỗi khác</span>
                                        )}
                                      </div>
                                    ) : (
                                      "Thiếu trường"
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-green-600 text-xs">✓ Hợp lệ</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Trang {currentPage} / {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = currentPage <= 3 ? i + 1 : 
                                       currentPage >= totalPages - 2 ? totalPages - 4 + i :
                                       currentPage - 2 + i;
                        
                        if (pageNum < 1 || pageNum > totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={pageNum === currentPage ? 
                              "bg-blue-500 text-white" : 
                              "bg-transparent"
                            }
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Options */}
      {csvData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Tùy Chọn Import</CardTitle>
            <CardDescription>Chọn cách xử lý dữ liệu khi import</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={importMode} onValueChange={setImportMode}>
              <RadioGroupItem value="insert">
                <div className="font-medium">Chỉ thêm mới</div>
                <div className="text-sm text-gray-600 mt-1">
                  Chỉ thêm các học sinh mới. Bỏ qua nếu mã học sinh đã tồn tại.
                </div>
              </RadioGroupItem>

              <RadioGroupItem value="upsert">
                <div className="font-medium">Thêm mới và cập nhật</div>
                <div className="text-sm text-gray-600 mt-1">
                  Thêm học sinh mới và cập nhật thông tin nếu mã học sinh đã tồn tại.
                </div>
              </RadioGroupItem>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Import Progress */}
      {(isImporting || importResult) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Tiến Trình Import</CardTitle>
            <CardDescription>Kết quả quá trình import dữ liệu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isImporting && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Đang xử lý...</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-600 text-center">Vui lòng đợi, đang import dữ liệu học sinh</p>
                </div>
              )}

              {importResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                      <div className="text-2xl font-bold text-cyan-600">{importResult.total || importResult.Total || 0}</div>
                      <div className="text-sm text-cyan-700 mt-1">Tổng số dòng</div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div className="text-2xl font-bold text-green-600">{importResult.success || importResult.Success || 0}</div>
                      </div>
                      <div className="text-sm text-green-700 mt-1">Thành công</div>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <div className="text-2xl font-bold text-red-600">{importResult.failed || importResult.Failed || 0}</div>
                      </div>
                      <div className="text-sm text-red-700 mt-1">Thất bại</div>
                    </div>
                  </div>

                  {(importResult.failed || importResult.Failed || 0) > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 mb-2">
                        Có {importResult.failed || importResult.Failed || 0} dòng không thể import
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadErrors}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Tải xuống file lỗi
                      </Button>
                    </div>
                  )}

                  {importResult.success === importResult.total && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        ✓ Import thành công tất cả {importResult.total} học sinh!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      {canImport && (
        <div className="flex justify-end">
          <LoadingButton
            size="lg"
            onClick={handleImport}
            loading={isImporting}
            loadingText="Đang import..."
            className="!bg-blue-600 hover:!bg-blue-700 !text-white flex items-center"
          >
            <UploadIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            Bắt đầu Import
          </LoadingButton>
        </div>
      )}
    </div>
  );
};

const ImportStudentsPage = () => {
  return (
    <AdminPageLayout>
      <ImportStudents />
    </AdminPageLayout>
  );
};

export default ImportStudentsPage;
