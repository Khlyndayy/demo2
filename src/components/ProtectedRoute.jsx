// Sửa ngày 4/11/2025 vì fix lỗi không truy cập được trang quản trị Admin

import React from "react";
import { Navigate } from "react-router-dom";

// ✅ Component bảo vệ route
const ProtectedRoute = ({ children, roleRequired }) => {
  // Lấy dữ liệu user từ localStorage
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  // Nếu chưa đăng nhập → chuyển về trang đăng nhập
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: "⚠️ Vui lòng đăng nhập để tiếp tục!" }}
      />
    );
  }

  // Nếu route yêu cầu quyền admin → kiểm tra username
  if (roleRequired === "admin" && user.username !== "admin") {
    alert("❌ Bạn không có quyền truy cập trang quản trị!");
    return <Navigate to="/" replace />;
  }

  // Nếu hợp lệ → render nội dung bên trong
  return children;
};

export default ProtectedRoute;
