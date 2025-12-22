import { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { BarChart3 } from "lucide-react";
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

export const ActivityTypeChart = ({ activityTypeStatistics, onChartReady }) => {
  const chartRef = useRef(null);

  if (!activityTypeStatistics || activityTypeStatistics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Thống kê loại hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Không có dữ liệu loại hoạt động
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use SubType (which already contains Vietnamese name) as the display name
  const chartData = activityTypeStatistics.map((item, index) => ({
    name: item.subType || item.activityType || "Không xác định",
    value: item.count,
    score: item.totalScore,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const option = {
    textStyle: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    title: {
      text: "Phân bố loại hoạt động",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: "#1F2937",
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        return `<strong>${params.name}</strong><br/>Số lượng: ${params.value}<br/>Tổng điểm: ${params.data.score.toLocaleString("vi-VN")}`;
      },
    },
    legend: {
      orient: "vertical",
      left: "left",
      top: "middle",
      textStyle: {
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
    series: [
      {
        name: "Loại hoạt động",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: function (params) {
            return `${params.name}\n${params.value} hoạt động`;
          },
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        data: chartData.map((item) => ({
          value: item.value,
          name: item.name,
          score: item.score,
          itemStyle: {
            color: item.color,
          },
        })),
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Thống kê loại hoạt động
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: "500px", width: "100%" }}
          opts={{ renderer: "canvas" }}
          onChartReady={(chart) => {
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

