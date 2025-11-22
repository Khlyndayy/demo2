import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import "../assets/css/admin.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentBookings();
  }, []);

  const fetchStats = async () => {
    try {
      // Tổng số phim
      const { count: moviesCount } = await supabase
        .from("movies")
        .select("*", { count: "exact", head: true });

      // Tổng số đặt vé
      const { count: bookingsCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true });

      // Tổng doanh thu
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("total_amount")
        .eq("payment_status", "paid");

      const totalRevenue =
        bookingsData?.reduce((sum, b) => sum + parseFloat(b.total_amount), 0) ||
        0;

      // Đặt vé hôm nay
      const today = new Date().toISOString().split("T")[0];
      const { count: todayCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .gte("booking_date", today);

      setStats({
        totalMovies: moviesCount || 0,
        totalBookings: bookingsCount || 0,
        totalRevenue,
        todayBookings: todayCount || 0,
      });
    } catch (err) {
      console.error("Lỗi:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          showtime:showtimes(
            *,
            movie:movies(title),
            room:rooms(name, cinema:cinemas(name))
          )
        `
        )
        .order("booking_date", { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentBookings(data || []);
    } catch (err) {
      console.error("Lỗi:", err.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: "Chờ", class: "badge-warning" },
      paid: { text: "Đã thanh toán", class: "badge-success" },
      cancelled: { text: "Đã hủy", class: "badge-danger" },
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>⚙️ Trang quản trị</h1>
        <p>Quản lý hệ thống rạp chiếu phim</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">🎬</div>
          <div className="stat-info">
            <h3>{stats.totalMovies}</h3>
            <p>Tổng số phim</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">🎫</div>
          <div className="stat-info">
            <h3>{stats.totalBookings}</h3>
            <p>Tổng đặt vé</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{formatPrice(stats.totalRevenue)}</h3>
            <p>Tổng doanh thu</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.todayBookings}</h3>
            <p>Đặt vé hôm nay</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quản lý nhanh</h2>
        <div className="actions-grid">
          <Link to="/admin/movies" className="action-card">
            <div className="action-icon">🎬</div>
            <h3>Quản lý phim</h3>
            <p>Thêm, sửa, xóa phim</p>
          </Link>

          <Link to="/admin/showtimes" className="action-card">
            <div className="action-icon">📅</div>
            <h3>Quản lý lịch chiếu</h3>
            <p>Tạo và quản lý suất chiếu</p>
          </Link>

          <Link to="/admin/bookings" className="action-card">
            <div className="action-icon">🎫</div>
            <h3>Quản lý đặt vé</h3>
            <p>Xem và quản lý vé đã đặt</p>
          </Link>

          <Link to="/admin/cinemas" className="action-card">
            <div className="action-icon">🏢</div>
            <h3>Quản lý rạp</h3>
            <p>Quản lý rạp và phòng chiếu</p>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="recent-section">
        <h2>Đặt vé gần đây</h2>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đặt vé</th>
                <th>Phim</th>
                <th>Rạp</th>
                <th>Khách hàng</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => {
                const status = getStatusBadge(booking.payment_status);
                return (
                  <tr key={booking.id}>
                    <td>
                      <strong>{booking.booking_code}</strong>
                    </td>
                    <td>{booking.showtime?.movie?.title}</td>
                    <td>
                      {booking.showtime?.room?.cinema?.name}
                      <br />
                      <small>{booking.showtime?.room?.name}</small>
                    </td>
                    <td>
                      {booking.customer_name}
                      <br />
                      <small>{booking.customer_phone}</small>
                    </td>
                    <td>
                      <strong>{formatPrice(booking.total_amount)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${status.class}`}>
                        {status.text}
                      </span>
                    </td>
                    <td>
                      {new Date(booking.booking_date).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
