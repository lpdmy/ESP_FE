"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  Save,
  List,
} from "lucide-react";
import { ROUTES } from "@/common/constants/routes";

export default function CreateActivityLanding() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState(null);

  const methods = [
    {
      id: "new",
      title: "Tạo hoạt động mới",
      subtitle: "Bắt đầu từ đầu",
      icon: FileText,
      description: "Tạo hoạt động mới với form đầy đủ tính năng, có thể lưu làm mẫu",
      features: [
        "Form wizard 5 bước với thanh tiến độ",
        "Lưu làm mẫu để tái sử dụng",
        "Validation thông minh",
        "Preview trước khi lưu",
      ],
      color: "blue",
      action: () => navigate(`${ROUTES.ADMIN.CREATE_ACTIVITY}?fromLanding=true`),
    },
    {
      id: "templates",
      title: "Sử dụng mẫu",
      subtitle: "Tạo từ mẫu có sẵn",
      icon: Save,
      description: "Chọn mẫu hoạt động đã lưu để tạo hoạt động mới nhanh chóng",
      features: [
        "Danh sách tất cả mẫu",
        "Tìm kiếm và lọc theo loại",
        "Áp dụng mẫu và chỉnh sửa",
        "Xem số lần sử dụng",
      ],
      color: "purple",
      action: () => navigate(`${ROUTES.ADMIN.CREATE_ACTIVITY}?mode=template`),
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        button: "bg-blue-600 hover:bg-blue-700",
        icon: "text-blue-600",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
        button: "bg-purple-600 hover:bg-purple-700",
        icon: "text-purple-600",
      },
    };
    return colors[color] || colors.blue;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Tạo Hoạt Động Mới
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chọn phương thức tạo hoạt động phù hợp với nhu cầu của bạn. 
            Mỗi phương thức được tối ưu hóa để tiết kiệm thời gian và công sức.
          </p>
        </div>

        {/* Methods Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {methods.map((method) => {
            const colors = getColorClasses(method.color);
            const Icon = method.icon;

            return (
              <Card
                key={method.id}
                className={`${colors.bg} ${colors.border} border-2 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2`}
                onClick={method.action || (() => setSelectedMethod(method.id))}
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`${colors.bg} p-4 rounded-lg`}>
                      <Icon className={`w-8 h-8 ${colors.icon}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className={`${colors.text} text-xl mb-1`}>
                        {method.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{method.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{method.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {method.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className={`w-4 h-4 ${colors.icon} mt-0.5 flex-shrink-0`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${colors.button} text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (method.action) {
                        method.action();
                      } else {
                      setSelectedMethod(method.id);
                      }
                    }}
                  >
                    {method.id === "new" 
                      ? "Tạo mới" 
                      : method.id === "templates" 
                      ? "Chọn mẫu" 
                      : "Chọn phương thức này"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">5 phút</p>
                  <p className="text-sm text-gray-600">Thời gian trung bình</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">90%</p>
                  <p className="text-sm text-gray-600">Giảm thời gian nhập liệu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Save className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">Tái sử dụng</p>
                  <p className="text-sm text-gray-600">Lưu mẫu</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

