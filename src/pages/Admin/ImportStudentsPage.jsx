import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/common/components/ui/button';
import { Card } from '@/common/components/ui/card';
import { Label } from '@/common/components/ui/label';
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
} from 'lucide-react';

const ImportStudentsPage = () => {
  const [showImport, setShowImport] = useState(false);
  const [csvData, setCSVData] = useState(null);
  const [mapping, setMapping] = useState({});
  const [importMode, setImportMode] = useState('insert');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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

        // Auto-match fields
        const autoMapping = autoMatchFields(parsed.headers);
        setMapping(autoMapping);

        // Reset previous results
        setImportResult(null);
        resetProgress();
        
        toast.showSuccess(STUDENT_IMPORT_MESSAGES.SUCCESS.IMPORT_SUCCESS);
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
        toast.showSuccess(`${STUDENT_IMPORT_MESSAGES.SUCCESS.IMPORT_SUCCESS} ${response.data.success} học sinh`);
      } else {
        throw new Error(response.message || STUDENT_IMPORT_MESSAGES.ERROR.IMPORT_FAILED);
      }
    } catch (error) {
      toast.showError(error.message || STUDENT_IMPORT_MESSAGES.ERROR.IMPORT_FAILED);
      setImportResult({
        total: csvData.rows.length,
        success: 0,
        failed: csvData.rows.length,
        errors: [{ row: {}, errors: [error.message] }]
      });
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

  // Preview data calculations
  const previewRows = csvData ? csvData.rows.slice(0, 10) : [];
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

  if (!showImport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>

          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <div className="mb-8 p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full inline-block">
              <Users className="h-16 w-16 text-white" />
            </div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Quản Lý Học Sinh
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl">
              Import danh sách học sinh từ file Excel/CSV vào hệ thống một cách nhanh chóng và dễ dàng
            </p>

            <Button
              size="lg"
              onClick={() => setShowImport(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 text-lg px-8 py-6 h-auto"
            >
              <FileSpreadsheet className="h-6 w-6 mr-3" />
              Import Excel
            </Button>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <UploadIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Upload File</h3>
                <p className="text-sm text-gray-600">Tải lên file CSV hoặc Excel chứa dữ liệu học sinh</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <FileSpreadsheet className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Mapping Dữ Liệu</h3>
                <p className="text-sm text-gray-600">Tự động mapping các trường dữ liệu với hệ thống</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Import Nhanh</h3>
                <p className="text-sm text-gray-600">Xử lý và import hàng loạt học sinh vào hệ thống</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
      <LoadingOverlay isLoading={isImporting} text="Đang import dữ liệu..." />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => setShowImport(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <UploadIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Import Học Sinh
            </h1>
          </div>
          <p className="text-gray-600">Upload file CSV và mapping dữ liệu để import danh sách học sinh vào hệ thống</p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {/* Step 1: Upload CSV */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">1. Upload File CSV</h3>
                {selectedFile && (
                  <Button variant="ghost" size="sm" onClick={clearFile}>
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
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Kéo thả file CSV vào đây hoặc click để chọn</p>
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
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Step 2: Field Mapping */}
          {csvData && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">2. Mapping Trường Dữ Liệu</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>
                      {mappedRequiredFields.length}/{requiredFields.length} trường bắt buộc
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  Ánh xạ các cột trong file CSV với các trường trong hệ thống. Các trường có dấu{' '}
                  <span className="text-red-500">*</span> là bắt buộc.
                </div>

                <div className="space-y-3">
                  {csvData.headers.map((header) => (
                    <div key={header} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{header}</p>
                        <p className="text-xs text-gray-500">Cột trong CSV</p>
                      </div>

                      <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />

                      <div className="flex-1">
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
                      Cảnh báo: Các trường bắt buộc chưa được mapping
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
            </Card>
          )}

          {/* Step 3: Data Preview */}
          {csvData && Object.keys(mapping).length > 0 && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">3. Preview Dữ Liệu</h3>
                  <div className="text-sm text-gray-600">
                    Hiển thị {previewRows.length} / {csvData.rows.length} dòng
                  </div>
                </div>

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

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
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
                          <tr key={index} className={`border-b ${hasError ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                            <td className="px-4 py-3">{index + 1}</td>
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
                                <span className="inline-flex items-center gap-1 text-red-600 text-xs">
                                  <AlertCircle className="h-3 w-3" />
                                  Thiếu trường
                                </span>
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
            </Card>
          )}

          {/* Step 4: Import Options */}
          {csvData && (
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">4. Tùy Chọn Import</h3>

                <RadioGroup value={importMode} onValueChange={setImportMode}>
                  <RadioGroupItem value="insert">
                    <Label htmlFor="radio-insert" className="cursor-pointer flex-1">
                      <div className="font-medium">Chỉ thêm mới</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Chỉ thêm các học sinh mới. Bỏ qua nếu mã học sinh đã tồn tại.
                      </div>
                    </Label>
                  </RadioGroupItem>

                  <RadioGroupItem value="upsert">
                    <Label htmlFor="radio-upsert" className="cursor-pointer flex-1">
                      <div className="font-medium">Thêm mới và cập nhật</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Thêm học sinh mới và cập nhật thông tin nếu mã học sinh đã tồn tại.
                      </div>
                    </Label>
                  </RadioGroupItem>

                  <RadioGroupItem value="skip">
                    <Label htmlFor="radio-skip" className="cursor-pointer flex-1">
                      <div className="font-medium">Bỏ qua nếu trùng</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Bỏ qua tất cả các dòng có mã học sinh đã tồn tại trong hệ thống.
                      </div>
                    </Label>
                  </RadioGroupItem>
                </RadioGroup>
              </div>
            </Card>
          )}

          {/* Step 5: Import Progress */}
          {(isImporting || importResult) && (
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">5. Tiến Trình Import</h3>

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
                        <div className="text-2xl font-bold text-cyan-600">{importResult.total}</div>
                        <div className="text-sm text-cyan-700 mt-1">Tổng số dòng</div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                        </div>
                        <div className="text-sm text-green-700 mt-1">Thành công</div>
                      </div>

                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                        </div>
                        <div className="text-sm text-red-700 mt-1">Thất bại</div>
                      </div>
                    </div>

                    {importResult.failed > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 mb-2">
                          Có {importResult.failed} dòng không thể import
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadErrors}
                          className="mt-2 bg-transparent"
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
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90"
              >
                <UploadIcon className="h-5 w-5 mr-2" />
                Bắt đầu Import
              </LoadingButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportStudentsPage;
