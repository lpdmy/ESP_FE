import { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { TrendingUp, ChevronDown } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import * as echarts from "echarts";

const CHART_COLORS = {
  activity: "#4A90E2",
  score: "#7ED321",
  students: "#F5A623",
};

const TIME_RANGE_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "last4", label: "4 tuần gần nhất" },
  { value: "last8", label: "8 tuần gần nhất" },
  { value: "last12", label: "12 tuần gần nhất" },
];

export const WeeklyTrendChart = ({ weeklyTrends, onChartReady }) => {
  const [timeRange, setTimeRange] = useState("all");
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTimeRangeDropdown(false);
      }
    };
    if (showTimeRangeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTimeRangeDropdown]);

  if (!weeklyTrends || !weeklyTrends.weeks || weeklyTrends.weeks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Xu hướng hoạt động theo tuần
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Không có dữ liệu xu hướng theo tuần
          </div>
        </CardContent>
      </Card>
    );
  }

  const allWeeks = weeklyTrends.weeks;
  
  // Filter weeks based on time range
  let filteredWeeks = allWeeks;
  if (timeRange === "last4") {
    filteredWeeks = allWeeks.slice(-4);
  } else if (timeRange === "last8") {
    filteredWeeks = allWeeks.slice(-8);
  } else if (timeRange === "last12") {
    filteredWeeks = allWeeks.slice(-12);
  }
  
  const weeks = filteredWeeks;
  const weekLabels = weeks.map((w) => {
    const startDate = new Date(w.weekStartDate).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    const endDate = new Date(w.weekEndDate).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    return `Tuần ${w.weekIndex} (${startDate} - ${endDate})`;
  });

  const option = {
    textStyle: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    title: {
      text: "Xu hướng hoạt động và điểm theo tuần",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: "#1F2937",
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((param) => {
          result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ["Số hoạt động", "Tổng điểm", "Học sinh tham gia"],
      bottom: 0,
      textStyle: {
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: weekLabels,
      axisLabel: {
        rotate: 45,
        fontSize: 11,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
    yAxis: [
      {
        type: "value",
        name: "Số hoạt động",
        position: "left",
        nameTextStyle: {
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        axisLabel: {
          formatter: "{value}",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      },
      {
        type: "value",
        name: "Điểm / Học sinh",
        position: "right",
        nameTextStyle: {
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        axisLabel: {
          formatter: "{value}",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      },
    ],
    series: [
      {
        name: "Số hoạt động",
        type: "line",
        yAxisIndex: 0,
        data: weeks.map((w) => w.activityCount),
        itemStyle: {
          color: CHART_COLORS.activity,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(74, 144, 226, 0.3)" },
              { offset: 1, color: "rgba(74, 144, 226, 0.05)" },
            ],
          },
        },
      },
      {
        name: "Tổng điểm",
        type: "line",
        yAxisIndex: 1,
        data: weeks.map((w) => w.totalScoreInWeek),
        itemStyle: {
          color: CHART_COLORS.score,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(126, 211, 33, 0.3)" },
              { offset: 1, color: "rgba(126, 211, 33, 0.05)" },
            ],
          },
        },
      },
      {
        name: "Học sinh tham gia",
        type: "line",
        yAxisIndex: 1,
        data: weeks.map((w) => w.participatedStudentCount),
        itemStyle: {
          color: CHART_COLORS.students,
        },
        lineStyle: {
          type: "dashed",
        },
      },
    ],
    brush: {
      toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
      xAxisIndex: 0,
      brushType: 'lineX',
      brushStyle: {
        borderWidth: 1,
        borderColor: '#999',
        fill: 'rgba(74, 144, 226, 0.1)',
      },
      outOfBrush: {
        colorAlpha: 0.1,
      },
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 100,
        height: 20,
        bottom: 10,
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23.1h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        handleStyle: {
          color: '#4A90E2',
        },
        textStyle: {
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      },
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 100,
      },
    ],
  };

  const selectedRangeLabel = TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange)?.label || "Tất cả";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Xu hướng hoạt động theo tuần
          </CardTitle>
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
              className="h-9 border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              {selectedRangeLabel}
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showTimeRangeDropdown ? 'rotate-180' : ''}`} />
            </Button>
            {showTimeRangeDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                {TIME_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTimeRange(option.value);
                      setShowTimeRangeDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      timeRange === option.value
                        ? "bg-orange-50 font-semibold text-orange-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: "400px", width: "100%" }}
          opts={{ renderer: "canvas" }}
          onChartReady={(chart) => {
            // Export chart as PNG when ready
            setTimeout(() => {
              try {
                const base64 = chart.getDataURL({
                  type: "png",
                  pixelRatio: 2,
                  backgroundColor: "#fff",
                });
                if (onChartReady) {
                  onChartReady(base64);
                }
              } catch (error) {
                console.error("Error exporting chart:", error);
              }
            }, 1000);
          }}
        />
      </CardContent>
    </Card>
  );
};

