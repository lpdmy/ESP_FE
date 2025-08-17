import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Trang trước khi đăng nhập */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
  

        {/* Trang admin */}
        <Route path="/admin" element={<Admin />} />

        {/* Dashboard sau khi đăng nhập */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

// Placeholder components
const LandingPage = () => <div>Trang chủ</div>;
const Signup = () => <div>Trang đăng ký</div>;
const Dashboard = () => <div>Dashboard</div>;
const Admin = () => <div>Trang quản trị viên</div>;
