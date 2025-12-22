import { useState, useEffect } from "react";
import { Card, CardContent } from "@/common/components/ui/card";
import { School, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const QuickInsightCards = ({ overview, academicYear, loading }) => {
  const [animatedValues, setAnimatedValues] = useState({
    totalClasses: 0,
    totalStudents: 0,
    averageScore: 0,
  });

  useEffect(() => {
    if (overview && !loading) {
      // Animate count up
      const duration = 1000; // 1 second
      const steps = 60;
      const stepDuration = duration / steps;

      const animate = (key, targetValue) => {
        let currentStep = 0;
        const increment = targetValue / steps;

        const timer = setInterval(() => {
          currentStep++;
          const currentValue = Math.min(increment * currentStep, targetValue);
          
          setAnimatedValues((prev) => ({
            ...prev,
            [key]: currentValue,
          }));

          if (currentStep >= steps) {
            clearInterval(timer);
            setAnimatedValues((prev) => ({
              ...prev,
              [key]: targetValue,
            }));
          }
        }, stepDuration);
      };

      animate("totalClasses", overview.totalClasses || 0);
      animate("totalStudents", overview.totalStudents || 0);
      animate("averageScore", overview.averageScorePerStudent || 0);
    } else {
      setAnimatedValues({
        totalClasses: 0,
        totalStudents: 0,
        averageScore: 0,
      });
    }
  }, [overview, loading]);

  // Show cards even when loading or when overview is available
  if (!overview && !loading && !academicYear) {
    return null;
  }

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return Math.round(num).toLocaleString("vi-VN");
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-500";
  };

  // Mock trend data (in real app, compare with previous year)
  const trendData = {
    classes: 0, // Would be calculated from previous year
    students: 0,
    averageScore: 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Classes Card */}
      <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Tổng số lớp
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? (
                  <span className="inline-block w-16 h-8 bg-gray-200 animate-pulse rounded" />
                ) : (
                  formatNumber(animatedValues.totalClasses)
                )}
              </h3>
              {academicYear && (
                <p className="text-xs text-gray-500">Năm học {academicYear}</p>
              )}
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <School className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          {trendData.classes !== 0 && (
            <div className={`flex items-center gap-1 mt-3 text-sm ${getTrendColor(trendData.classes)}`}>
              {getTrendIcon(trendData.classes)}
              <span>{Math.abs(trendData.classes)}% so với năm trước</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Students Card */}
      <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Tổng học sinh
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? (
                  <span className="inline-block w-20 h-8 bg-gray-200 animate-pulse rounded" />
                ) : (
                  formatNumber(animatedValues.totalStudents)
                )}
              </h3>
              {academicYear && (
                <p className="text-xs text-gray-500">Năm học {academicYear}</p>
              )}
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          {trendData.students !== 0 && (
            <div className={`flex items-center gap-1 mt-3 text-sm ${getTrendColor(trendData.students)}`}>
              {getTrendIcon(trendData.students)}
              <span>{Math.abs(trendData.students)}% so với năm trước</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Average Score Card */}
      <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Điểm trung bình
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? (
                  <span className="inline-block w-16 h-8 bg-gray-200 animate-pulse rounded" />
                ) : (
                  animatedValues.averageScore.toFixed(1)
                )}
              </h3>
              {academicYear && (
                <p className="text-xs text-gray-500">Điểm/học sinh</p>
              )}
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          {trendData.averageScore !== 0 && (
            <div className={`flex items-center gap-1 mt-3 text-sm ${getTrendColor(trendData.averageScore)}`}>
              {getTrendIcon(trendData.averageScore)}
              <span>{Math.abs(trendData.averageScore)}% so với năm trước</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total School Score Card */}
      <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Tổng điểm toàn trường
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? (
                  <span className="inline-block w-24 h-8 bg-gray-200 animate-pulse rounded" />
                ) : (
                  formatNumber(overview?.totalSchoolScore || 0)
                )}
              </h3>
              {academicYear && (
                <p className="text-xs text-gray-500">Tổng tích lũy</p>
              )}
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

