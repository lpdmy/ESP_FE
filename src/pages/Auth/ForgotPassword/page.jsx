import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, GraduationCap, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setIsEmailSent(true)
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
          <a
            href="/auth/login"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại đăng nhập
          </a>
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-12 h-12 text-orange-500 mr-3"/>
            <h1 className="text-3xl font-bold gradient-text">EduSphere</h1>
          </div>
          <p className="text-gray-600">Nền tảng kết nối học sinh THPT FPT School</p>
        </div>

        {/* Forgot Password Card */}
        <Card className="glass hover-lift card-shine overflow-hidden">
          {!isEmailSent ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800">Quên mật khẩu</CardTitle>
                <CardDescription>Nhập email của bạn để nhận liên kết đặt lại mật khẩu</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Email hoặc tên đăng nhập</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="your.email@fpt.edu.vn"
                        className="pl-10 focus:ring-2 focus:ring-orange-500 border-gray-200"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full btn-primary h-12 text-lg font-semibold" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Đang gửi...
                      </div>
                    ) : (
                      "Gửi liên kết đặt lại mật khẩu"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Nhớ lại mật khẩu?{" "}
                    <a href="/auth" className="text-orange-600 hover:text-orange-700 font-semibold transition-colors">
                      Đăng nhập ngay
                    </a>
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">Email đã được gửi!</CardTitle>
                <CardDescription>Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    <strong>Email:</strong> {email}
                  </p>
                  <p className="text-green-700 text-sm mt-2">Vui lòng kiểm tra hộp thư đến và thư mục spam của bạn</p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setIsEmailSent(false)}
                    variant="outline"
                    className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    Gửi lại email
                  </Button>

                  <a href="/auth" className="block">
                    <Button className="w-full btn-primary">Quay lại đăng nhập</Button>
                  </a>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 EduShpere - Nền tảng học tập THPT FPT School</p>
        </div>
      </div>
    </div>
  )
}
