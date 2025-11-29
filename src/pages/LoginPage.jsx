import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../assets/css/auth.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm hash password bằng SHA-256
  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      alert("❌ Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);

    try {
      // Kiểm tra user trong database
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !user) {
        alert("❌ Tên đăng nhập không tồn tại!");
        setLoading(false);
        return;
      }

      // Kiểm tra tài khoản có bị khóa không
      if (!user.is_active) {
        alert("❌ Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên!");
        setLoading(false);
        return;
      }

      // Hash password nhập vào và so sánh với database
      const passwordHash = await hashPassword(password);

      if (user.password_hash !== passwordHash) {
        alert("❌ Mật khẩu không đúng!");
        setLoading(false);
        return;
      }

      // Cập nhật last_login
      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", user.id);

      // Đăng nhập thành công - Lưu thông tin user
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        phone: user.phone,
        loyalty_points: user.loyalty_points,
        membership_tier: user.membership_tier,
        role: user.role, // Lấy role từ database thay vì hardcode
        avatar_url: user.avatar_url,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // Thông báo theo role
      let message = "";
      if (user.role === "admin") {
        message = `🎉 Chào mừng Quản trị viên ${user.fullname}!`;
      } else if (user.role === "staff") {
        message = `🎉 Chào mừng Nhân viên ${user.fullname}!`;
      } else {
        message = `🎉 Chào mừng ${user.fullname}! 
        
🏆 Hạng thành viên: ${getMembershipLabel(user.membership_tier)}
💎 Điểm thưởng: ${user.loyalty_points} điểm`;
      }

      alert(message);

      // Chuyển hướng theo role
      const from = location.state?.from?.pathname;

      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "staff") {
        navigate("/staff/dashboard", { replace: true });
      } else {
        navigate(from || "/", { replace: true });
      }
    } catch (err) {
      console.error("Lỗi:", err);
      alert("❌ Đã xảy ra lỗi. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Helper function: Lấy tên hạng thành viên
  const getMembershipLabel = (tier) => {
    const labels = {
      bronze: "Đồng 🥉",
      silver: "Bạc 🥈",
      gold: "Vàng 🥇",
      platinum: "Bạch Kim 💎",
    };
    return labels[tier] || tier;
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Side - Brand */}
        <div className="auth-brand">
          <div className="brand-content">
            <div className="brand-icon">
              <i className="fas fa-film"></i>
            </div>
            <h1 className="brand-title">CINEMA BOOKING</h1>
            <p className="brand-subtitle">Trải nghiệm điện ảnh đỉnh cao</p>

            <div className="brand-features">
              <div className="feature-item">
                <i className="fas fa-check-circle feature-icon"></i>
                <span>Đặt vé nhanh chóng</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle feature-icon"></i>
                <span>Chọn ghế tự do</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle feature-icon"></i>
                <span>Thanh toán đa dạng</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle feature-icon"></i>
                <span>Ưu đãi hấp dẫn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h2>Đăng nhập</h2>
              <p>Chào mừng bạn trở lại!</p>
            </div>

            {location.state?.message && (
              <div className="alert alert-info">
                <i className="fas fa-info-circle"></i>
                {location.state.message}
              </div>
            )}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">
                  <i className="fas fa-user label-icon"></i>
                  Tên đăng nhập
                </label>
                <div className="input-wrapper">
                  <i className="fas fa-user input-icon"></i>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập..."
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <i className="fas fa-lock label-icon"></i>
                  Mật khẩu
                </label>
                <div className="input-wrapper">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <i
                      className={
                        showPassword ? "fas fa-eye-slash" : "fas fa-eye"
                      }
                    ></i>
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="forgot-link">
                  Quên mật khẩu?
                </a>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <i className="fas fa-arrow-right arrow"></i>
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <span>hoặc đăng nhập với</span>
            </div>

            <div className="social-login">
              <button className="social-btn google" type="button">
                <i className="fab fa-google"></i>
                <span>Google</span>
              </button>
              <button className="social-btn facebook" type="button">
                <i className="fab fa-facebook-f"></i>
                <span>Facebook</span>
              </button>
            </div>

            <div className="register-link">
              <p>
                Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
              </p>
            </div>

            <div className="demo-accounts">
              <p className="demo-title">
                <i className="fas fa-info-circle"></i>
                Tài khoản demo
              </p>
              <div className="demo-list">
                <div className="demo-item">
                  <i className="fas fa-user-shield"></i>
                  <span>
                    <strong>Admin:</strong> admin / 123456
                  </span>
                </div>
                <div className="demo-item">
                  <i className="fas fa-briefcase"></i>
                  <span>
                    <strong>Staff:</strong> staff01 / 123456
                  </span>
                </div>
                <div className="demo-item">
                  <i className="fas fa-user"></i>
                  <span>
                    <strong>User:</strong> dhgia1 / 123456
                  </span>
                </div>
              </div>
              <small
                style={{
                  display: "block",
                  marginTop: "0.5rem",
                  color: "#999",
                  fontSize: "0.85rem",
                }}
              >
                💡 Sử dụng các tài khoản trên để test hệ thống
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
