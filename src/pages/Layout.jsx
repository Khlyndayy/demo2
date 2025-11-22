// @ts-ignore
import "../assets/css/main.css";
// @ts-ignore
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Layout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="cinema-layout">
      <header className="cinema-header">
        <div className="header-container">
          <div className="logo-section">
            <Link to="/" className="logo">
              🎬 CINEMA BOOKING
            </Link>
          </div>

          <nav className="main-nav">
            <Link to="/" className="nav-link">
              Trang chủ
            </Link>
            <Link to="/#phim-dang-chieu" className="nav-link">
              Phim đang chiếu
            </Link>
            <Link to="/my-bookings" className="nav-link">
              Vé của tôi
            </Link>
            {user?.username === "admin" && (
              <Link to="/admin" className="nav-link admin-link">
                ⚙️ Quản trị
              </Link>
            )}
          </nav>

          <div className="user-section">
            {user ? (
              <>
                <span className="username">👤 {user.username}</span>
                <button className="btn-logout" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-login">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="cinema-footer">
        <div className="footer-container">
          <div className="footer-section">
            <h4>Về chúng tôi</h4>
            <p>Hệ thống rạp chiếu phim hàng đầu Việt Nam</p>
          </div>
          <div className="footer-section">
            <h4>Liên hệ</h4>
            <p>📞 1900-xxxx</p>
            <p>📧 support@cinema.vn</p>
          </div>
          <div className="footer-section">
            <h4>Theo dõi</h4>
            <p>Facebook | Instagram | YouTube</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Cinema Booking System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
