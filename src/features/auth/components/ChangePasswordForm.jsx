import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Lock,
  GraduationCap,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { LoadingOverlay } from "@/common/components/ui/loading";
import { useAuthApi } from "@/features/auth/hooks/useAuthApi";
import { ROUTES } from "@/common/constants/routes";

export default function ChangePasswordForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { oneTimeLogin, changePasswordOtl, changePassword, getMe, loading } = useAuthApi();

  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [token, setToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");
    if (tokenParam) setToken(tokenParam);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    try {
      const result = await changePassword({ 
        oldPassword: oldPassword, 
        newPassword: password,
        confirmPassword: confirmPassword
      });
      
      if (result?.data) {
        toast.success("Đổi mật khẩu thành công!");
        setIsSuccess(true);
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi đổi mật khẩu");
      toast.error(err.message || "Có lỗi xảy ra khi đổi mật khẩu");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white relative">
        <BackgroundCircles />
          <Link
            href="/"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Link>
        <div className="flex items-center justify-center p-4 pt-24 relative z-10">
          <div className="w-full max-w-md text-center">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="w-12 h-12 text-orange-500 mr-3" />
              <h1 className="text-3xl font-bold gradient-text">EduSphere</h1>
            </div>
            <Card className="glass hover-lift card-shine">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Đổi mật khẩu thành công!
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay
        isLoading={loading}
        text="Đang đổi mật khẩu..."
        variant="primary"
      />
      <div>
        <BackgroundCircles />
        <div className="flex items-center justify-center p-4 pt-4 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4 transition-colors"
            >
            </Link>
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="w-12 h-12 text-orange-500 mr-3" />
              <h1 className="text-3xl font-bold gradient-text">EduSphere</h1>
            </div>
            <p className="text-gray-600">Thay đổi mật khẩu của bạn</p>
          </div>

          <Card className="glass hover-lift card-shine">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Thay đổi  mật khẩu
              </CardTitle>
              <CardDescription>
                Thay đổi mật khẩu mới cho tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordField
                  id="old-password"
                  label="Mật khẩu cũ"
                  value={oldPassword}
                  onChange={setOldPassword}
                  show={showOldPassword}
                  setShow={setShowOldPassword}
                />
                <PasswordField
                  id="new-password"
                  label="Mật khẩu mới"
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  setShow={setShowPassword}
                />
                <PasswordField
                  id="confirm-new-password"
                  label="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                />

                <Button
                  type="submit"
                  className="w-full btn-primary h-12 text-lg font-semibold"
                  disabled={loading || !password || !confirmPassword || !oldPassword}
                >
                  {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </>
  );
}

/* ---------- Components phụ ---------- */
function BackgroundCircles() {
  return (
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
  );
}

function PasswordField({ id, label, value, onChange, show, setShow }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
          className="pl-10 pr-10 focus:ring-2 focus:ring-orange-500 border-gray-200"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
