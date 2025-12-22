import ReactECharts from "echarts-for-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { PieChart } from "lucide-react";
import * as echarts from "echarts";

export const ScoreConcentrationChart = ({ scoreDistribution, onChartReady }) => {
  if (!scoreDistribution) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Mức độ tập trung điểm
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

  const topPercentage = scoreDistribution.topClassPercentageThreshold;
  const topShare = scoreDistribution.topClassesScoreSharePercentage;
  const remainingShare = scoreDistribution.remainingClassesScoreSharePercentage;

  const option = {
    textStyle: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    title: {
      text: `Tỷ lệ điểm tập trung (Top ${topPercentage}% lớp)`,
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
        return `${params.name}<br/>${params.value}% tổng điểm`;
      },
    },
    legend: {
      bottom: 0,
      left: "center",
      textStyle: {
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
    series: [
      {
        name: "Phân bố điểm",
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
          formatter: "{b}: {c}%",
          fontSize: 12,
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        data: [
          {
            value: topShare.toFixed(1),
            name: `Top ${topPercentage}% lớp`,
            itemStyle: {
              color: "#4A90E2",
            },
          },
          {
            value: remainingShare.toFixed(1),
            name: "Phần còn lại",
            itemStyle: {
              color: "#E5E7EB",
            },
          },
        ],
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Mức độ tập trung điểm
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
        <div className="mt-4 text-sm text-gray-600 text-center">
          {topShare > 60 ? (
            <span className="text-orange-600 font-medium">
              ⚠️ Điểm đang tập trung vào số ít lớp ({topShare.toFixed(1)}%)
            </span>
          ) : (
            <span className="text-green-600">
              ✓ Phân bố điểm khá đều giữa các lớp
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

