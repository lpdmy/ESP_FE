import { useState, useEffect } from "react";
import { Card, CardContent } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { CustomSelect } from "@/common/components/ui/CustomSelect";
import { Switch } from "@/common/components/ui/switch";
import { Label } from "@/common/components/ui/label";
import { Input } from "@/common/components/ui/input";
import { AcademicYearService } from "@/services/academicyear.service";
import { Filter, FileText, FileSpreadsheet, ChevronDown, ChevronUp, Calendar, Table, Users, TrendingUp, PieChart, Layers, Clock } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";

export const StatisticsFilterPanel = ({ 
  onFilterChange, 
  onExportPDF, 
  onExportExcel,
  loading = false 
}) => {
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedAcademicYearObj, setSelectedAcademicYearObj] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [includeClassRewardTable, setIncludeClassRewardTable] = useState(true);
  const [includeStudentRewardTable, setIncludeStudentRewardTable] = useState(true);
  const [includeWeeklyTrendCharts, setIncludeWeeklyTrendCharts] = useState(true);
  const [includeDistributionCharts, setIncludeDistributionCharts] = useState(true);
  const [includeAllClasses, setIncludeAllClasses] = useState(true);
  const [includeAllStudents, setIncludeAllStudents] = useState(true);

  // Calculate active filters count for badge
  const activeFiltersCount = (() => {
    let count = 0;
    if (useCustomDateRange && (startDate || endDate)) count++;
    if (includeClassRewardTable) count++;
    if (includeStudentRewardTable) count++;
    if (includeWeeklyTrendCharts) count++;
    if (includeDistributionCharts) count++;
    if (includeAllClasses) count++;
    if (includeAllStudents) count++;
    return count;
  })();

  // Calculate preview summary
  const previewSummary = (() => {
    const charts = [
      includeWeeklyTrendCharts && "Biểu đồ xu hướng",
      includeDistributionCharts && "Biểu đồ phân bố",
    ].filter(Boolean).length;
    
    const tables = [
      includeClassRewardTable && "Bảng điểm lớp",
      includeStudentRewardTable && "Bảng điểm học sinh",
    ].filter(Boolean).length;

    return { charts, tables };
  })();

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await AcademicYearService.getAll(token);
      const data = response?.data || response || [];
      if (data.length > 0) {
        setAcademicYears(data);
        const currentYear = data.find(ay => ay.isCurrent) || data[0];
        setSelectedAcademicYear(currentYear.name);
        setSelectedAcademicYearObj(currentYear);
      }
    } catch (error) {
      console.error("Error loading academic years:", error);
    }
  };

  const buildRequest = () => ({
    academicYear: selectedAcademicYear,
    startDate: useCustomDateRange && startDate ? new Date(startDate).toISOString() : null,
    endDate: useCustomDateRange && endDate ? new Date(endDate + "T23:59:59").toISOString() : null,
    includeClassRewardTable,
    includeStudentRewardTable,
    includeWeeklyTrendCharts,
    includeDistributionCharts,
    includeAllClasses,
    includeAllStudents,
  });

  const handleApplyFilter = () => {
    if (!selectedAcademicYear) {
      return;
    }
    onFilterChange(buildRequest());
  };

  const handleResetFilters = () => {
    setUseCustomDateRange(false);
    setStartDate("");
    setEndDate("");
    setIncludeClassRewardTable(true);
    setIncludeStudentRewardTable(true);
    setIncludeWeeklyTrendCharts(true);
    setIncludeDistributionCharts(true);
    setIncludeAllClasses(true);
    setIncludeAllStudents(true);
  };

  const handleExportPDF = () => {
    if (!selectedAcademicYear) {
      return;
    }
    onExportPDF(buildRequest());
  };

  const handleExportExcel = () => {
    if (!selectedAcademicYear) {
      return;
    }
    onExportExcel(buildRequest());
  };

  return (
    <div className="space-y-4">
      {/* Top Row: Year Selection and Actions */}
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="academicYear" className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 block">
                Năm học *
              </Label>
              <CustomSelect
                value={selectedAcademicYear}
                onValueChange={(value) => {
                  setSelectedAcademicYear(value);
                  const yearObj = academicYears.find(ay => ay.name === value);
                  setSelectedAcademicYearObj(yearObj);
                  if (yearObj && !useCustomDateRange) {
                    setStartDate("");
                    setEndDate("");
                  }
                }}
                options={academicYears.map(ay => ({
                  value: ay.name,
                  label: ay.name
                }))}
                placeholder="Chọn năm học"
                className="h-12"
              />
            </div>
            
            <Button 
              onClick={handleApplyFilter} 
              disabled={!selectedAcademicYear || loading}
              className="h-12 px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl whitespace-nowrap font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang tải...
                </span>
              ) : (
                "Xem trước"
              )}
            </Button>

            <Button 
              onClick={handleExportPDF} 
              disabled={!selectedAcademicYear || loading}
              variant="outline"
              className="h-12 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>

            <Button 
              onClick={handleExportExcel} 
              disabled={!selectedAcademicYear || loading}
              variant="outline"
              className="h-12 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-xl font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>

            <Button
              type="button"
              variant="outline"
              className="relative h-12 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 text-blue-600 px-1.5 py-0.5 text-xs min-w-[20px]">
                  {activeFiltersCount}
                </Badge>
              )}
              {showAdvancedFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Panel - Horizontal Layout */}
      {showAdvancedFilters && (
        <Card className="bg-white shadow-lg border border-gray-200 animate-in slide-in-from-top-2 fade-in duration-300">
          <CardContent className="py-6">
            {/* Preview Summary */}
            {(previewSummary.charts > 0 || previewSummary.tables > 0) && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
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
            )}

            {/* Filters in Horizontal Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Section 1: Thời gian */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Thời gian
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
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
                      className={useCustomDateRange ? "bg-blue-500 focus-visible:ring-blue-500" : "bg-gray-200"}
                    />
                  </div>

                  {useCustomDateRange && selectedAcademicYearObj && (
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
                          min={selectedAcademicYearObj.startDate ? new Date(selectedAcademicYearObj.startDate).toISOString().split('T')[0] : undefined}
                          max={selectedAcademicYearObj.endDate ? new Date(selectedAcademicYearObj.endDate).toISOString().split('T')[0] : undefined}
                          className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                          min={startDate || (selectedAcademicYearObj.startDate ? new Date(selectedAcademicYearObj.startDate).toISOString().split('T')[0] : undefined)}
                          max={selectedAcademicYearObj.endDate ? new Date(selectedAcademicYearObj.endDate).toISOString().split('T')[0] : undefined}
                          className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Nội dung báo cáo */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Nội dung báo cáo
                  </h3>
                </div>

                <div className="space-y-2">
                  <FilterOptionHorizontal
                    id="includeClassRewardTable"
                    icon={<Table className="h-5 w-5" />}
                    title="Bảng điểm theo lớp"
                    description="Hiển thị điểm số và xếp hạng của từng lớp"
                    checked={includeClassRewardTable}
                    onCheckedChange={setIncludeClassRewardTable}
                  />
                  <FilterOptionHorizontal
                    id="includeStudentRewardTable"
                    icon={<Users className="h-5 w-5" />}
                    title="Bảng điểm theo học sinh"
                    description="Hiển thị điểm số và hoạt động của từng học sinh"
                    checked={includeStudentRewardTable}
                    onCheckedChange={setIncludeStudentRewardTable}
                  />
                  <FilterOptionHorizontal
                    id="includeWeeklyTrendCharts"
                    icon={<TrendingUp className="h-5 w-5" />}
                    title="Biểu đồ xu hướng theo tuần"
                    description="Phân tích xu hướng hoạt động theo từng tuần"
                    checked={includeWeeklyTrendCharts}
                    onCheckedChange={setIncludeWeeklyTrendCharts}
                  />
                  <FilterOptionHorizontal
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
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Tùy chọn hiển thị
                  </h3>
                </div>

                <div className="space-y-2">
                  <FilterOptionHorizontal
                    id="includeAllClasses"
                    icon={<Table className="h-5 w-5" />}
                    title="Bao gồm tất cả lớp"
                    description="Hiển thị cả các lớp không có điểm"
                    checked={includeAllClasses}
                    onCheckedChange={setIncludeAllClasses}
                  />
                  <FilterOptionHorizontal
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

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Đặt lại
              </Button>
              <Button
                onClick={handleApplyFilter}
                className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
              >
                Áp dụng
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Filter Option Component for Horizontal Layout
const FilterOptionHorizontal = ({ id, icon, title, description, checked, onCheckedChange }) => {
  return (
    <div
      className={`group relative rounded-lg border p-3 transition-all duration-200 ${
        checked
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors flex-shrink-0 ${
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
              <p className={`text-xs mt-0.5 ${
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
          className={`flex-shrink-0 ${checked ? "bg-blue-500 focus-visible:ring-blue-500" : "bg-gray-200"}`}
        />
      </div>
    </div>
  );
};

