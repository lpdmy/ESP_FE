import { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { BarChart3, ChevronDown } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import * as echarts from "echarts";

const CHART_COLORS = [
  "#4A90E2",
  "#7ED321",
  "#F5A623",
  "#50E3C2",
  "#BD10E0",
  "#9013FE",
  "#B8E986",
  "#D0021B",
];

const TOP_CLASSES_OPTIONS = [
  { value: "top10", label: "Top 10" },
  { value: "top20", label: "Top 20" },
  { value: "top30", label: "Top 30" },
  { value: "all", label: "Tất cả" },
];

export const ClassDistributionChart = ({ scoreDistribution, onChartReady }) => {
  const [topClasses, setTopClasses] = useState("top20");
  const [showTopClassesDropdown, setShowTopClassesDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTopClassesDropdown(false);
      }
    };
    if (showTopClassesDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTopClassesDropdown]);

  if (
    !scoreDistribution ||
    !scoreDistribution.classScorePoints ||
    scoreDistribution.classScorePoints.length === 0
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Phân bố điểm theo lớp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Không có dữ liệu phân bố điểm
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedClassPoints = scoreDistribution.classScorePoints
    .slice()
    .sort((a, b) => b.totalScoreInYear - a.totalScoreInYear);
  
  let classPoints = sortedClassPoints;
  if (topClasses === "top10") {
    classPoints = sortedClassPoints.slice(0, 10);
  } else if (topClasses === "top20") {
    classPoints = sortedClassPoints.slice(0, 20);
  } else if (topClasses === "top30") {
    classPoints = sortedClassPoints.slice(0, 30);
  }

  const classCodes = classPoints.map((cp) => cp.classCode);
  const scores = classPoints.map((cp) => cp.totalScoreInYear);

  const option = {
    textStyle: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    title: {
      text: "Top 20 lớp theo tổng điểm năm học",
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
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        const param = params[0];
        return `<strong>${param.axisValue}</strong><br/>Tổng điểm: ${param.value.toLocaleString("vi-VN")}`;
      },
    },
    grid: {
      left: "15%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      name: "Tổng điểm",
      nameTextStyle: {
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
      axisLabel: {
        formatter: "{value}",
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
    yAxis: {
      type: "category",
      data: classCodes,
      axisLabel: {
        fontSize: 11,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
    series: [
      {
        name: "Tổng điểm",
        type: "bar",
        data: scores.map((score, idx) => ({
          value: score,
          itemStyle: {
            color:
              idx < 3
                ? CHART_COLORS[idx % CHART_COLORS.length]
                : CHART_COLORS[(idx + 3) % CHART_COLORS.length],
          },
        })),
        label: {
          show: true,
          position: "right",
          formatter: "{c}",
          fontSize: 10,
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      },
    ],
  };

  const selectedTopLabel = TOP_CLASSES_OPTIONS.find(opt => opt.value === topClasses)?.label || "Top 20";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Phân bố điểm theo lớp
          </CardTitle>
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTopClassesDropdown(!showTopClassesDropdown)}
              className="h-9 border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              {selectedTopLabel}
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showTopClassesDropdown ? 'rotate-180' : ''}`} />
            </Button>
            {showTopClassesDropdown && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                {TOP_CLASSES_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTopClasses(option.value);
                      setShowTopClassesDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      topClasses === option.value
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
          style={{ height: "500px", width: "100%" }}
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

