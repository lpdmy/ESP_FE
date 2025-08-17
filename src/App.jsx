import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/page";
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Trang trước khi đăng nhập */}
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}


