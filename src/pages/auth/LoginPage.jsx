import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff, Lock, Person } from "@mui/icons-material";
import {
  authenticateUser,
  saveAuthToken,
  saveUserInfo,
} from "../../utils/mockAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Vui lòng nhập tên đăng nhập";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const authResult = authenticateUser(formData.username, formData.password);
      if (authResult.success) {
        saveAuthToken(authResult.token, formData.remember);
        saveUserInfo(authResult.user);
        alert(authResult.message);
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        alert(authResult.message);
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      alert("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoLogin = (username) => {
    setFormData({ username, password: "123456", remember: true });
    setLoading(true);
    setTimeout(() => {
      const authResult = authenticateUser(username, "123456");
      if (authResult.success) {
        saveAuthToken(authResult.token, true);
        saveUserInfo(authResult.user);
        alert(authResult.message);
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        alert(authResult.message);
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-400 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="text-center mb-6">
          <img src="/logo.svg" alt="Logo" className="w-20 h-20 mx-auto mb-3" />
          <h2 className="text-2xl font-semibold text-gray-800">POS Bahung</h2>
          <p className="text-gray-500 text-sm">Hệ thống quản lý bán hàng</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <div className={`flex items-center border rounded-md ${errors.username ? 'border-red-500' : 'border-gray-300'} focus-within:border-blue-500`}>
              <span className="px-3 text-gray-400"><Person fontSize="small" /></span>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                className="flex-1 p-2 outline-none bg-transparent"
              />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className={`flex items-center border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'} focus-within:border-blue-500`}>
              <span className="px-3 text-gray-400"><Lock fontSize="small" /></span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                className="flex-1 p-2 outline-none bg-transparent"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3 text-gray-400">
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="mr-2"
              />
              Ghi nhớ đăng nhập
            </label>
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md text-white font-semibold transition duration-200 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600 mb-2">Đăng nhập nhanh:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleAutoLogin("admin")}
              disabled={loading}
              className="py-2.5 rounded-md text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60"
            >Admin</button>
            <button
              type="button"
              onClick={() => handleAutoLogin("user")}
              disabled={loading}
              className="py-2.5 rounded-md text-white bg-green-500 hover:bg-green-600 disabled:opacity-60"
            >User</button>
            <button
              type="button"
              onClick={() => handleAutoLogin("staff")}
              disabled={loading}
              className="py-2.5 rounded-md text-white bg-purple-500 hover:bg-purple-600 disabled:opacity-60"
            >Staff</button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-700 mt-6">
          Chưa có tài khoản? <a href="/signup" className="text-blue-600 hover:underline">Đăng ký ngay</a>
        </p>
        <p className="text-center bg-red-50 text-xs text-gray-400 mt-3">
          © 2024 POS Bahung. Bản quyền thuộc về công ty TNHH Bahung.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
