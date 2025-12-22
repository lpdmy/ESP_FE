import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Award, Users } from "lucide-react";
import { WeeklyTrendChart } from "./charts/WeeklyTrendChart";
import { ClassDistributionChart } from "./charts/ClassDistributionChart";
import { ScoreConcentrationChart } from "./charts/ScoreConcentrationChart";
import { ParticipationChart } from "./charts/ParticipationChart";
import { ActivityTypeChart } from "./charts/ActivityTypeChart";

export const StatisticsPreview = ({ reportData, requestConfig, loading, onChartImagesReady }) => {
  const [chartImages, setChartImages] = useState({});

  useEffect(() => {
    // Notify parent when chart images are ready
    if (onChartImagesReady && Object.keys(chartImages).length > 0) {
      onChartImagesReady(chartImages);
    }
  }, [chartImages, onChartImagesReady]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="text-center py-8">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-orange-500 border-t-transparent"></div>
            <div className="space-y-2">
              <p className="text-base font-medium text-gray-700">
                Đang phân tích dữ liệu năm học...
              </p>
              <p className="text-sm text-gray-500">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          </div>
        </div>
        
        {/* Loading Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="h-96">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-100 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700">
            Chưa có dữ liệu
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Chọn năm học và nhấn "Xem trước" để xem báo cáo thống kê chi tiết
          </p>
        </div>
      </div>
    );
  }

  const { overview, classes, students, weeklyTrends, scoreDistribution, activityTypeStatistics } = reportData;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Charts Section */}
      {requestConfig?.includeWeeklyTrendCharts && (
        <WeeklyTrendChart 
          weeklyTrends={weeklyTrends}
          onChartReady={(base64) => {
            setChartImages(prev => ({ ...prev, weeklyTrendChart: base64 }));
          }}
        />
      )}

      {requestConfig?.includeDistributionCharts && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClassDistributionChart 
              scoreDistribution={scoreDistribution}
              onChartReady={(base64) => {
                setChartImages(prev => ({ ...prev, classDistributionChart: base64 }));
              }}
            />
            <ScoreConcentrationChart 
              scoreDistribution={scoreDistribution}
              onChartReady={(base64) => {
                setChartImages(prev => ({ ...prev, scoreConcentrationChart: base64 }));
              }}
            />
          </div>
          <ParticipationChart 
            overview={overview}
            onChartReady={(base64) => {
              setChartImages(prev => ({ ...prev, participationChart: base64 }));
            }}
          />
        </>
      )}

      {/* Activity Type Chart */}
      {activityTypeStatistics && activityTypeStatistics.length > 0 && (
        <ActivityTypeChart 
          activityTypeStatistics={activityTypeStatistics}
          onChartReady={(base64) => {
            setChartImages(prev => ({ ...prev, activityTypeChart: base64 }));
          }}
        />
      )}

      {/* Class Reward Table */}
      {requestConfig?.includeClassRewardTable && classes && classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Bảng điểm theo lớp (Khen thưởng)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Hạng</th>
                    <th className="text-left p-2 font-semibold">Lớp</th>
                    <th className="text-left p-2 font-semibold">GVCN</th>
                    <th className="text-right p-2 font-semibold">Số HS</th>
                    <th className="text-right p-2 font-semibold">Tổng điểm</th>
                    <th className="text-right p-2 font-semibold">TB/HS</th>
                    <th className="text-right p-2 font-semibold">% tổng điểm</th>
                    <th className="text-right p-2 font-semibold">Số hoạt động</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls, idx) => {
                    const isTop5 = cls.rankByScore <= 5;
                    return (
                    <tr
                      key={cls.classId}
                      className={`border-b hover:bg-gray-50 ${
                        isTop5 ? "bg-yellow-50 border-l-4 border-yellow-400" : ""
                      }`}
                    >
                      <td className="p-2">
                        <span className="font-semibold">{cls.rankByScore}</span>
                      </td>
                      <td className="p-2 font-medium">{cls.classCode}</td>
                      <td className="p-2 text-sm text-gray-600">
                        {cls.homeroomTeacherName}
                      </td>
                      <td className="p-2 text-right">{cls.studentCount}</td>
                      <td className="p-2 text-right font-semibold">
                        {cls.totalScoreInYear.toLocaleString("vi-VN")}
                      </td>
                      <td className="p-2 text-right">
                        {cls.averageScorePerStudent.toFixed(1)}
                      </td>
                      <td className="p-2 text-right text-sm text-gray-600">
                        {cls.scoreShareOfSchoolTotal.toFixed(1)}%
                      </td>
                      <td className="p-2 text-right">{cls.activityCountInYear}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Reward Table */}
      {requestConfig?.includeStudentRewardTable && students && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bảng điểm theo học sinh (Khen thưởng)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Mã HS</th>
                    <th className="text-left p-2 font-semibold">Họ tên</th>
                    <th className="text-left p-2 font-semibold">Lớp</th>
                    <th className="text-right p-2 font-semibold">Tổng điểm</th>
                    <th className="text-right p-2 font-semibold">Số hoạt động</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Get top 5 students by activity count
                    const top5StudentsByActivity = [...students]
                      .sort((a, b) => b.activityCountInYear - a.activityCountInYear)
                      .slice(0, 5)
                      .map(s => s.studentId);
                    
                    return students.slice(0, 100).map((student) => {
                      const isTop5 = top5StudentsByActivity.includes(student.studentId);
                      return (
                        <tr
                          key={student.studentId}
                          className={`border-b hover:bg-gray-50 ${
                            isTop5 ? "bg-green-50 border-l-4 border-green-400" : ""
                          }`}
                        >
                          <td className="p-2">{student.studentCode}</td>
                          <td className="p-2 font-medium">{student.studentFullName}</td>
                          <td className="p-2 text-sm text-gray-600">{student.classCode}</td>
                          <td className="p-2 text-right font-semibold">
                            {student.totalScoreInYear.toLocaleString("vi-VN")}
                          </td>
                          <td className="p-2 text-right">{student.activityCountInYear}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
              {students.length > 100 && (
                <div className="text-sm text-gray-500 mt-4 text-center">
                  Hiển thị 100/{students.length} học sinh đầu tiên. 
                  Xuất Excel để xem đầy đủ.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

