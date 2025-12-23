import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Save,
} from "lucide-react";
import { ROUTES } from "@/common/constants/routes";

export default function CreateActivityLanding() {
  const navigate = useNavigate();

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
      action: () => navigate(`${ROUTES.ADMIN.CREATE_ACTIVITY}?mode=template`),
    },
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tạo Hoạt Động Mới
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chọn phương thức tạo hoạt động phù hợp với nhu cầu của bạn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {methods.map((method) => {
            const Icon = method.icon;

            return (
              <Card
                key={method.id}
                className="bg-blue-50 border-2 border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={method.action}
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-blue-700 text-xl mb-1">
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
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      method.action();
                    }}
                  >
                    {method.id === "new" ? "Tạo mới" : "Chọn mẫu"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

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
                <div className="bg-blue-100 p-3 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
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
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Save className="w-6 h-6 text-blue-600" />
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

