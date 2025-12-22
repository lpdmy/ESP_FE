import ReactECharts from "echarts-for-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Users } from "lucide-react";
import * as echarts from "echarts";

export const ParticipationChart = ({ overview, onChartReady }) => {
  if (!overview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tỷ lệ tham gia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Không có dữ liệu tổng quan
          </div>
        </CardContent>
      </Card>
    );
  }

  const classesWithScore = overview.totalClasses - overview.classesWithZeroScore;
  const studentsWithScore = overview.totalStudents - overview.studentsWithZeroScore;

  const option = {
    textStyle: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    title: {
      text: "Tỷ lệ lớp và học sinh có điểm",
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
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((param) => {
          result += `${param.marker} ${param.seriesName}: ${param.value} (${(
            (param.value / (param.axisValue === "Lớp" ? overview.totalClasses : overview.totalStudents)) *
            100
          ).toFixed(1)}%)<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ["Có điểm", "Không có điểm"],
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
      data: ["Lớp", "Học sinh"],
      axisLabel: {
        fontSize: 12,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
    yAxis: {
      type: "value",
      name: "Số lượng",
      nameTextStyle: {
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
      axisLabel: {
        formatter: "{value}",
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
    series: [
      {
        name: "Có điểm",
        type: "bar",
        stack: "total",
        data: [classesWithScore, studentsWithScore],
        itemStyle: {
          color: "#7ED321",
        },
        label: {
          show: true,
          position: "inside",
          formatter: "{c}",
          fontSize: 11,
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      },
      {
        name: "Không có điểm",
        type: "bar",
        stack: "total",
        data: [overview.classesWithZeroScore, overview.studentsWithZeroScore],
        itemStyle: {
          color: "#E5E7EB",
        },
        label: {
          show: true,
          position: "inside",
          formatter: "{c}",
          fontSize: 11,
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Tỷ lệ tham gia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts
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

