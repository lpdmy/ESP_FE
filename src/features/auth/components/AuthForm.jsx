import { useState, useEffect } from "react"
import { Button } from "@/common/components/ui/button"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Eye, EyeOff, User, Mail, Lock, GraduationCap, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuthApi } from "@/features/auth/hooks/useAuthApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/user/userSlice";
import { setPoints } from "@/store/star-point/pointSlice";
import { ROUTES } from "@/common/constants/routes"
import { ROLE } from "@/common/constants/roles"
import { starPointService } from "@/features/admin/services/starpoint.service"
import { setPermissions } from "@/store/permission/permissionSlice"
import { jwtDecode } from "jwt-decode"
import { initGlobalNotification } from "@/common/signalr/useGlobalNotification"
import { addNotification } from "@/store/notification/notificationSlice"

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // loading state riêng cho login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
const PERMISSION_ROUTE_MAP = {
  VIEW_REPORT: "/admin",
  MANAGE_USER: "/admin/users",
  MANAGE_ACTIVITIES: "/admin/activities",
  MANAGE_CLUBS: "/admin/clubs",
  MANAGE_CLASSES: "/admin/classes",
  MANAGE_REWARDS: "/admin/rewards",
  MANAGE_STAFF: "/admin/staff",
  MANAGE_ANNOUNCEMENTS: "/admin/system-news-and-notices",
  MODERATE_CONTENT: "/admin/moderation",
};
  //TO DO: Delete example test API call
  const { test, loading, error, login, getMe } = useAuthApi();
  const [testResult, setTestResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setIsLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    try {
      // 1. Gọi login BE
      const result = await login({ username: loginEmail, password: loginPassword });
      const tokenModel = result?.data;
      if (tokenModel?.accessToken) {
        const accessToken = tokenModel.accessToken;
        const refreshToken = tokenModel.refreshToken;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // 2. Decode token để lấy thông tin cần cho điều hướng ngay lập tức
        const decoded = jwtDecode(accessToken);
        const permissions = decoded.Permission || [];
        const userIdFromToken = decoded.Id || decoded.id || decoded.sub;
        const roleFromTokenRaw = decoded.UserRole || decoded.userRole || decoded.role;
        const roleFromToken =
          typeof roleFromTokenRaw === "string"
            ? roleFromTokenRaw.toUpperCase()
            : roleFromTokenRaw;

        // Lưu permissions và user tối thiểu ngay để menu / ProtectedRoute hoạt động đúng
        dispatch(setPermissions(permissions));
        dispatch(
          setUser({
            id: userIdFromToken,
            role: roleFromToken,
            permissions,
          })
        );

        // 3. Điều hướng ngay lập tức dựa trên role + permissions trong token
        if (roleFromToken === ROLE.ADMIN || roleFromToken === "ADMIN") {
          navigate(ROUTES.ADMIN.MAIN);
        } else if (roleFromToken === ROLE.STAFF || roleFromToken === "STAFF") {
          const firstAllowedRoute = Object.entries(PERMISSION_ROUTE_MAP).find(
            ([perm]) => permissions.includes(perm)
          )?.[1];
          if (firstAllowedRoute) {
            navigate(firstAllowedRoute);
          } else {
            navigate(ROUTES.ADMIN.MAIN);
          }
        } else if (roleFromToken === ROLE.TEACHER || roleFromToken === "TEACHER") {
          navigate("/my-classes");
        } else {
          navigate(ROUTES.LANDING.HOME);
        }

        // 4. Các call phụ (GetMe, điểm, SignalR) chạy nền để không chặn UX
        Promise.allSettled([
          getMe().then((resultUser) => {
            if (resultUser?.data) {
              dispatch(setUser(resultUser.data));
              // Nếu BE trả về id, có thể dùng id này cho star point
              const uid = resultUser.data.id ?? userIdFromToken;
              if (uid) {
                return starPointService
                  .getUserPoints(uid)
                  .then((resp) => {
                    dispatch(setPoints(resp.data.points ?? 0));
                  })
                  .catch(() => {});
              }
            }
          }),
        ])
          .catch(() => {})
          .finally(() => {
            if (userIdFromToken) {
              initGlobalNotification(userIdFromToken, dispatch);
            }
          });
      }
    } catch (err) {
      setLoginError(err.message || "Đăng nhập thất bại");
    }
    setIsLoading(false);
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <div className="flex items-center justify-center p-4">
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

      <div className="w-[550px] max-w-md relative z-10">
        {/* Header */}
        <div className="text-center my-5">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-12 h-12 text-orange-500 mr-3" />
            <h1 className="text-3xl font-bold gradient-text">EduSphere</h1>
          </div>
          <p className="text-gray-600">Nền tảng kết nối học sinh THPT FPT School</p>
        </div>
        <div className="text-center mb-3 text-sm text-gray-500">
          <Link
            to={ROUTES.ONBOARDING.ONBOARDING}
            className="inline-flex items-center text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4 mr-1" />
            Xem giới thiệu
          </Link>
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
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@email.com"
                        className="pl-10 focus:ring-2 focus:ring-orange-500 border-gray-200"
                        required
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
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
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
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
                    <Link to={ROUTES.AUTH.FORGETPASSWORD} className="text-orange-600 hover:text-orange-700">
                      Quên mật khẩu?
                    </Link>
                  </div>

                  {loginError && (
                    <div className="text-red-500 text-sm text-center">{loginError}</div>
                  )}

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
                        placeholder="Họ và tên"
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
                        placeholder="your.email@email.com"
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
          <p>© 2025 EduSphere - Nền tảng học tập THPT FPT School</p>
        </div>
      </div>
    </div>
  )
}
