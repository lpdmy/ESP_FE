import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
import {
    Eye,
    EyeOff,
    ArrowLeft,
    Lock,
    GraduationCap,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { useAuthApi } from "@/features/auth/hooks/useAuthApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/user/userSlice";
import { ROUTES } from "@/common/constants/routes";
import { toast } from "react-toastify";
import { ROLE } from "@/common/constants/roles";
import { initGlobalNotification } from "@/common/signalr/useGlobalNotification";
import { addNotification } from "@/store/notification/notificationSlice";

export default function ResetPasswordForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { oneTimeLogin, changePasswordOtl, getMe, loading } = useAuthApi();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [token, setToken] = useState("");
    const [fullName, setFullName] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenParam = params.get("token");
        if (tokenParam) setToken(tokenParam);
    }, [location.search]);

    useEffect(() => {
        if (!token) return;

        const fetchFullName = async () => {
            try {
                const result = await oneTimeLogin(token);
                setFullName(result.data || "");
            } catch (err) {
                navigate(ROUTES.AUTH.LOGIN);
                toast.error(err.message || "Có lỗi xảy ra");
            }
        };
        fetchFullName();
    }, [token, oneTimeLogin]);

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
            const result = await changePasswordOtl({
                token,
                newPassword: password,
            });
            if (result?.data?.accessToken) {
                localStorage.setItem("token", result.data.accessToken);
                localStorage.setItem("refreshToken", result.data.refreshToken);
                const resultUser = await getMe();
                
                initGlobalNotification(resultUser?.data.id);
                
                dispatch(setUser(resultUser?.data));
                if (resultUser?.data.role == ROLE.ADMIN) {
                    navigate(ROUTES.ADMIN.USER_MANAGEMENT);
                } else {
                    navigate(ROUTES.LANDING.HOME);
                }
            }
            setIsSuccess(true);
        } catch (err) {
            toast.error(err.message || "Có lỗi xảy ra");
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center p-4 relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full opacity-20 float-animation"></div>
                    <div
                        className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-300 to-yellow-300 rounded-full opacity-15 float-animation"
                        style={{ animationDelay: "1s" }}
                    ></div>
                </div>
                <div className="w-full max-w-md relative z-10 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <GraduationCap className="w-12 h-12 text-orange-500 mr-3" />
                        <h1 className="text-3xl font-bold gradient-text">
                            EduSphere
                        </h1>
                    </div>
                    <Card className="glass hover-lift card-shine text-center">
                        <CardHeader>
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-800">
                                Đổi mật khẩu thành công!
                            </CardTitle>
                            <CardDescription>
                                Chào {fullName || "người dùng"}, mật khẩu của
                                bạn đã được cập nhật. Bạn có thể đăng nhập với
                                mật khẩu mới.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to={ROUTES.AUTH.LOGIN}>
                                <Button className="w-full btn-primary h-12 text-lg font-semibold">
                                    Đăng nhập ngay
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center p-4 relative">
            {/* Background floating circles */}
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
                <div className="text-center mb-8">
                    <Link
                        to={ROUTES.AUTH.LOGIN}
                        className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Chào mừng,{" "}
                        {fullName || "người dùng"}!
                    </Link>
                    <div className="flex items-center justify-center mb-4">
                        <GraduationCap className="w-12 h-12 text-orange-500 mr-3" />
                        <h1 className="text-3xl font-bold gradient-text">
                            EduSphere
                        </h1>
                    </div>
                    <p className="text-gray-600">Đặt lại mật khẩu của bạn</p>
                </div>

                <Card className="glass hover-lift card-shine">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-gray-800">
                            Đặt lại mật khẩu
                        </CardTitle>
                        <CardDescription>
                            Nhập mật khẩu mới cho tài khoản của bạn
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
                            <div className="space-y-2">
                                <Label htmlFor="new-password">
                                    Mật khẩu mới
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="new-password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                                        className="pl-10 pr-10 focus:ring-2 focus:ring-orange-500 border-gray-200"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-new-password">
                                    Xác nhận mật khẩu mới
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="confirm-new-password"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Nhập lại mật khẩu mới"
                                        className="pl-10 pr-10 focus:ring-2 focus:ring-orange-500 border-gray-200"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full btn-primary h-12 text-lg font-semibold"
                                disabled={
                                    loading || !password || !confirmPassword
                                }
                            >
                                {loading
                                    ? "Đang cập nhật..."
                                    : "Cập nhật mật khẩu"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
