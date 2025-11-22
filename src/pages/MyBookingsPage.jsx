import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../assets/css/mybookings.css";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          showtime:showtimes(
            *,
            movie:movies(*),
            room:rooms(*, cinema:cinemas(*))
          ),
          booking_details(*, seat:seats(*))
        `
        )
        .order("booking_date", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error("Lỗi:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      fetchBookings();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          showtime:showtimes(
            *,
            movie:movies(*),
            room:rooms(*, cinema:cinemas(*))
          ),
          booking_details(*, seat:seats(*))
        `
        )
        .eq("booking_code", searchCode.toUpperCase());

      if (error) throw error;
      setBookings(data || []);

      if (data.length === 0) {
        alert("Không tìm thấy vé với mã này!");
      }
    } catch (err) {
      console.error("Lỗi:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Bạn có chắc muốn hủy vé này?")) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ payment_status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;
      alert("Đã hủy vé thành công!");
      fetchBookings();
    } catch (err) {
      console.error("Lỗi:", err.message);
      alert("Có lỗi xảy ra khi hủy vé!");
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
      pending: { text: "Chờ thanh toán", class: "status-pending" },
      paid: { text: "Đã thanh toán", class: "status-paid" },
      cancelled: { text: "Đã hủy", class: "status-cancelled" },
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
    <div className="my-bookings-page">
      <div className="container">
        <div className="page-header">
          <h1>🎫 Vé của tôi</h1>
          <p>Quản lý và tra cứu vé đã đặt</p>
        </div>

        {/* Search */}
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Nhập mã đặt vé (VD: BK123ABC)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="btn-search" onClick={handleSearch}>
              🔍 Tìm kiếm
            </button>
            {searchCode && (
              <button
                className="btn-clear"
                onClick={() => {
                  setSearchCode("");
                  fetchBookings();
                }}
              >
                ✕ Xóa
              </button>
            )}
          </div>
        </div>

        {/* Bookings List */}
        <div className="bookings-list">
          {bookings.length === 0 ? (
            <div className="no-bookings">
              <div className="empty-icon">🎬</div>
              <h3>Chưa có vé nào</h3>
              <p>Bạn chưa đặt vé nào hoặc không tìm thấy vé với mã đã nhập</p>
              <button className="btn-primary" onClick={() => navigate("/")}>
                Đặt vé ngay
              </button>
            </div>
          ) : (
            bookings.map((booking) => {
              const status = getStatusBadge(booking.payment_status);
              const seats = booking.booking_details
                .map((bd) => `${bd.seat.seat_row}${bd.seat.seat_number}`)
                .join(", ");

              return (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-code">
                      <span className="label">Mã đặt vé:</span>
                      <strong>{booking.booking_code}</strong>
                    </div>
                    <span className={`status-badge ${status.class}`}>
                      {status.text}
                    </span>
                  </div>

                  <div className="booking-content">
                    <div className="movie-info">
                      <img
                        src={booking.showtime.movie.poster_url}
                        alt={booking.showtime.movie.title}
                        className="movie-poster-small"
                      />
                      <div className="movie-details">
                        <h3>{booking.showtime.movie.title}</h3>
                        <p className="cinema-name">
                          🎬 {booking.showtime.room.cinema.name}
                        </p>
                        <p className="room-name">
                          {booking.showtime.room.name} (
                          {booking.showtime.room.room_type})
                        </p>
                        <p className="showtime-info">
                          📅{" "}
                          {new Date(
                            booking.showtime.show_date
                          ).toLocaleDateString("vi-VN")}
                          {" • "}
                          🕐 {booking.showtime.show_time.substring(0, 5)}
                        </p>
                      </div>
                    </div>

                    <div className="booking-info">
                      <div className="info-row">
                        <span className="label">Khách hàng:</span>
                        <strong>{booking.customer_name}</strong>
                      </div>
                      <div className="info-row">
                        <span className="label">Số điện thoại:</span>
                        <strong>{booking.customer_phone}</strong>
                      </div>
                      {booking.customer_email && (
                        <div className="info-row">
                          <span className="label">Email:</span>
                          <strong>{booking.customer_email}</strong>
                        </div>
                      )}
                      <div className="info-row">
                        <span className="label">Ghế:</span>
                        <strong>{seats}</strong>
                      </div>
                      <div className="info-row total">
                        <span className="label">Tổng tiền:</span>
                        <strong className="price">
                          {formatPrice(booking.total_amount)}
                        </strong>
                      </div>
                      <div className="info-row">
                        <span className="label">Ngày đặt:</span>
                        <span>
                          {new Date(booking.booking_date).toLocaleString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-actions">
                    {booking.payment_status === "pending" && (
                      <>
                        <button
                          className="btn-cancel"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Hủy vé
                        </button>
                        <button className="btn-pay">Thanh toán ngay</button>
                      </>
                    )}
                    {booking.payment_status === "paid" && (
                      <button className="btn-print">🖨️ In vé</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
