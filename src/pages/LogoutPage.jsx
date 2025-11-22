import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/auth.css";

const LogoutPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Xóa thông tin user trong localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.removeItem("user");

    // Đếm ngược
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/login", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="auth-container logout-container">
      <div className="logout-card">
        <div className="logout-icon">
          <div className="icon-circle">
            <i className="fas fa-sign-out-alt"></i>
          </div>
          <div className="success-checkmark">
            <i className="fas fa-check"></i>
          </div>
        </div>

        <h2 className="logout-title">Đăng xuất thành công!</h2>
        <p className="logout-message">
          Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
        </p>

        <div className="logout-info">
          <div className="info-item">
            <i className="fas fa-shield-alt"></i>
            <span>Phiên đăng nhập đã được kết thúc an toàn</span>
          </div>
          <div className="info-item">
            <i className="fas fa-lock"></i>
            <span>Dữ liệu của bạn đã được bảo mật</span>
          </div>
        </div>

        <div className="countdown-section">
          <div className="countdown-circle">
            <svg className="countdown-svg" viewBox="0 0 100 100">
              <circle className="countdown-bg" cx="50" cy="50" r="45"></circle>
              <circle
                className="countdown-progress"
                cx="50"
                cy="50"
                r="45"
                style={{
                  strokeDashoffset: `calc(283 - (283 * ${countdown}) / 3)`,
                }}
              ></circle>
            </svg>
            <div className="countdown-number">{countdown}</div>
          </div>
          <p className="countdown-text">
            Đang chuyển hướng đến trang đăng nhập...
          </p>
        </div>

        <div className="logout-actions">
          <button
            className="btn-primary"
            onClick={() => navigate("/login", { replace: true })}
          >
            <i className="fas fa-sign-in-alt"></i>
            <span>Đăng nhập lại</span>
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate("/", { replace: true })}
          >
            <i className="fas fa-home"></i>
            <span>Về trang chủ</span>
          </button>
        </div>

        <div className="logout-footer">
          <p>
            <i className="fas fa-question-circle"></i>
            Có thắc mắc? <a href="#">Liên hệ hỗ trợ</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
