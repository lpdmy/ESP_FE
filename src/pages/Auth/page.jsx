import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock, GraduationCap } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuthApi } from "../../hooks/useAuthApi";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  //TO DO: Delete example test API call
  const { test, loading, error } = useAuthApi();
  const [testResult, setTestResult] = useState(null);

 useEffect(() => {
    async function fetchTest() {
      try {
        const result = await test();
        setTestResult(result);
        console.log("Test API result:", result.name);
      } catch (err) {
        console.error("Test API error:", err);
      }
    }
    fetchTest();
  }, [test]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full opacity-20 float-animation"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-300 to-yellow-300 rounded-full opacity-15 float-animation"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full opacity-10 float-animation"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Link>
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-12 h-12 text-orange-500 mr-3" />
            <h1 className="text-3xl font-bold gradient-text">EduSephia</h1>
          </div>
          <p className="text-gray-600">Nền tảng kết nối học sinh THPT FPT School</p>
        </div>

        {/* Auth Card */}
        <Card className="glass hover-lift card-shine overflow-hidden">
          <div className="relative">
            {/* Login Form */}
            <div
              className={`transition-all duration-500 ease-in-out ${isLogin ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute inset-0"}`}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800">Đăng nhập</CardTitle>
                <CardDescription>Chào mừng bạn quay trở lại!</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@fpt.edu.vn"
                        className="pl-10 focus:ring-2 focus:ring-orange-500 border-gray-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        className="pl-10 pr-10 focus:ring-2 focus:ring-orange-500 border-gray-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 rounded border-gray-300" />
                      Ghi nhớ đăng nhập
                    </label>
                    <a href="#" className="text-orange-600 hover:text-orange-700">
                      Quên mật khẩu?
                    </a>
                  </div>

                  <Button type="submit" className="w-full btn-primary h-12 text-lg font-semibold" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Đang đăng nhập...
                      </div>
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Chưa có tài khoản?{" "}
                    <button
                      onClick={toggleAuthMode}
                      className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                    >
                      Đăng ký ngay
                    </button>
                  </p>
                </div>
              </CardContent>
            </div>

            {/* Register Form */}
            <div
              className={`transition-all duration-500 ease-in-out ${!isLogin ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 absolute inset-0"}`}
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800">Đăng ký</CardTitle>
                <CardDescription>Tạo tài khoản mới để tham gia cộng đồng</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        className="pl-10 focus:ring-2 focus:ring-orange-500 border-gray-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your.email@fpt.edu.vn"
                        className="pl-10 focus:ring-2 focus:ring-orange-500 border-gray-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Tối thiểu 8 ký tự"
                        className="pl-10 pr-10 focus:ring-2 focus:ring-orange-500 border-gray-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu"
                        className="pl-10 pr-10 focus:ring-2 focus:ring-orange-500 border-gray-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-sm">
                    <input type="checkbox" className="mt-1 rounded border-gray-300" required />
                    <p className="text-gray-600">
                      Tôi đồng ý với{" "}
                      <a href="#" className="text-orange-600 hover:text-orange-700">
                        Điều khoản sử dụng
                      </a>{" "}
                      và{" "}
                      <a href="#" className="text-orange-600 hover:text-orange-700">
                        Chính sách bảo mật
                      </a>
                    </p>
                  </div>

                  <Button type="submit" className="w-full btn-primary h-12 text-lg font-semibold" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Đang tạo tài khoản...
                      </div>
                    ) : (
                      "Tạo tài khoản"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Đã có tài khoản?{" "}
                    <button
                      onClick={toggleAuthMode}
                      className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                    >
                      Đăng nhập ngay
                    </button>
                  </p>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 EduSephia - Nền tảng học tập THPT FPT School</p>
        </div>
      </div>
    </div>
  )
}
