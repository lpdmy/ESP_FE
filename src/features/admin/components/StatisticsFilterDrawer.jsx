import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Switch } from "@/common/components/ui/switch";
import { Label } from "@/common/components/ui/label";
import { Input } from "@/common/components/ui/input";
import { Badge } from "@/common/components/ui/badge";
import {
  Calendar,
  FileText,
  Users,
  BarChart3,
  PieChart,
  Settings,
  X,
  RotateCcw,
  Check,
  Clock,
  Table,
  TrendingUp,
  Layers
} from "lucide-react";

export const StatisticsFilterDrawer = ({
  open,
  onOpenChange,
  onApply,
  onReset,
  academicYear,
  academicYearObj,
  // Filter states
  useCustomDateRange,
  setUseCustomDateRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  includeClassRewardTable,
  setIncludeClassRewardTable,
  includeStudentRewardTable,
  setIncludeStudentRewardTable,
  includeWeeklyTrendCharts,
  setIncludeWeeklyTrendCharts,
  includeDistributionCharts,
  setIncludeDistributionCharts,
  includeAllClasses,
  setIncludeAllClasses,
  includeAllStudents,
  setIncludeAllStudents,
}) => {
  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (useCustomDateRange && (startDate || endDate)) count++;
    if (includeClassRewardTable) count++;
    if (includeStudentRewardTable) count++;
    if (includeWeeklyTrendCharts) count++;
    if (includeDistributionCharts) count++;
    if (includeAllClasses) count++;
    if (includeAllStudents) count++;
    return count;
  }, [
    useCustomDateRange,
    startDate,
    endDate,
    includeClassRewardTable,
    includeStudentRewardTable,
    includeWeeklyTrendCharts,
    includeDistributionCharts,
    includeAllClasses,
    includeAllStudents,
  ]);

  // Calculate preview summary
  const previewSummary = useMemo(() => {
    const charts = [
      includeWeeklyTrendCharts && "Biểu đồ xu hướng",
      includeDistributionCharts && "Biểu đồ phân bố",
    ].filter(Boolean).length;
    
    const tables = [
      includeClassRewardTable && "Bảng điểm lớp",
      includeStudentRewardTable && "Bảng điểm học sinh",
    ].filter(Boolean).length;

    return { charts, tables };
  }, [
    includeWeeklyTrendCharts,
    includeDistributionCharts,
    includeClassRewardTable,
    includeStudentRewardTable,
  ]);

  const handleReset = () => {
    setUseCustomDateRange(false);
    setStartDate("");
    setEndDate("");
    setIncludeClassRewardTable(true);
    setIncludeStudentRewardTable(true);
    setIncludeWeeklyTrendCharts(true);
    setIncludeDistributionCharts(true);
    setIncludeAllClasses(true);
    setIncludeAllStudents(true);
    onReset?.();
  };

  const handleApply = () => {
    onApply?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed right-0 top-0 h-full w-full max-w-md translate-x-0 translate-y-0 rounded-none border-l shadow-xl sm:rounded-l-lg">
        <div className="flex h-full flex-col">
          {/* Header */}
          <DialogHeader className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Bộ lọc báo cáo
                  </DialogTitle>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Tùy chỉnh nội dung báo cáo
                  </p>
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <Badge className="bg-blue-600 text-white px-2.5 py-1">
                  {activeFiltersCount} bộ lọc
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-8">
              {/* Preview Summary */}
              {previewSummary.charts > 0 || previewSummary.tables > 0 ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Báo cáo sẽ gồm:
                      </p>
                      <p className="text-sm text-blue-700">
                        {previewSummary.charts > 0 && `${previewSummary.charts} biểu đồ`}
                        {previewSummary.charts > 0 && previewSummary.tables > 0 && ", "}
                        {previewSummary.tables > 0 && `${previewSummary.tables} bảng`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Section 1: Thời gian */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Thời gian
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <Label htmlFor="useCustomDateRange" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Khoảng thời gian tùy chỉnh
                        </Label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Chọn khoảng thời gian cụ thể
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="useCustomDateRange"
                      checked={useCustomDateRange}
                      onCheckedChange={setUseCustomDateRange}
                    />
                  </div>

                  {useCustomDateRange && academicYearObj && (
                    <div className="space-y-3 pl-4 border-l-2 border-blue-200 animate-in slide-in-from-left-2 fade-in duration-200">
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                          Từ ngày
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={academicYearObj.startDate ? new Date(academicYearObj.startDate).toISOString().split('T')[0] : undefined}
                          max={academicYearObj.endDate ? new Date(academicYearObj.endDate).toISOString().split('T')[0] : undefined}
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                          Đến ngày
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate || (academicYearObj.startDate ? new Date(academicYearObj.startDate).toISOString().split('T')[0] : undefined)}
                          max={academicYearObj.endDate ? new Date(academicYearObj.endDate).toISOString().split('T')[0] : undefined}
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      {academicYearObj && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          Năm học: {new Date(academicYearObj.startDate).toLocaleDateString("vi-VN")} - {new Date(academicYearObj.endDate).toLocaleDateString("vi-VN")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Nội dung báo cáo */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Nội dung báo cáo
                  </h3>
                </div>

                <div className="space-y-2">
                  <FilterOption
                    id="includeClassRewardTable"
                    icon={<Table className="h-5 w-5" />}
                    title="Bảng điểm theo lớp"
                    description="Hiển thị điểm số và xếp hạng của từng lớp"
                    checked={includeClassRewardTable}
                    onCheckedChange={setIncludeClassRewardTable}
                  />
                  <FilterOption
                    id="includeStudentRewardTable"
                    icon={<Users className="h-5 w-5" />}
                    title="Bảng điểm theo học sinh"
                    description="Hiển thị điểm số và hoạt động của từng học sinh"
                    checked={includeStudentRewardTable}
                    onCheckedChange={setIncludeStudentRewardTable}
                  />
                  <FilterOption
                    id="includeWeeklyTrendCharts"
                    icon={<TrendingUp className="h-5 w-5" />}
                    title="Biểu đồ xu hướng theo tuần"
                    description="Phân tích xu hướng hoạt động theo từng tuần"
                    checked={includeWeeklyTrendCharts}
                    onCheckedChange={setIncludeWeeklyTrendCharts}
                  />
                  <FilterOption
                    id="includeDistributionCharts"
                    icon={<PieChart className="h-5 w-5" />}
                    title="Biểu đồ phân bố điểm"
                    description="Phân tích phân bố điểm số giữa các lớp"
                    checked={includeDistributionCharts}
                    onCheckedChange={setIncludeDistributionCharts}
                  />
                </div>
              </div>

              {/* Section 3: Tùy chọn hiển thị */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Tùy chọn hiển thị
                  </h3>
                </div>

                <div className="space-y-2">
                  <FilterOption
                    id="includeAllClasses"
                    icon={<BarChart3 className="h-5 w-5" />}
                    title="Bao gồm tất cả lớp"
                    description="Hiển thị cả các lớp không có điểm"
                    checked={includeAllClasses}
                    onCheckedChange={setIncludeAllClasses}
                  />
                  <FilterOption
                    id="includeAllStudents"
                    icon={<Users className="h-5 w-5" />}
                    title="Bao gồm tất cả học sinh"
                    description="Hiển thị cả các học sinh không có điểm"
                    checked={includeAllStudents}
                    onCheckedChange={setIncludeAllStudents}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="border-t bg-white px-6 py-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Đặt lại
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
              >
                <Check className="h-4 w-4 mr-2" />
                Áp dụng
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Filter Option Component
const FilterOption = ({ id, icon, title, description, checked, onCheckedChange }) => {
  return (
    <div
      className={`group relative rounded-lg border p-4 transition-all duration-200 ${
        checked
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
              checked ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
            }`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <Label
              htmlFor={id}
              className={`text-sm font-medium cursor-pointer block ${
                checked ? "text-blue-900" : "text-gray-700"
              }`}
            >
              {title}
            </Label>
            {description && (
              <p className={`text-xs mt-1 ${
                checked ? "text-blue-700" : "text-gray-500"
              }`}>
                {description}
              </p>
            )}
          </div>
        </div>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="mt-1"
        />
      </div>
      {checked && (
        <div className="absolute top-2 right-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
            <Check className="h-3 w-3 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

