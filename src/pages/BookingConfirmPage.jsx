import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../assets/css/bookingconfirm.css";

const BookingConfirmPage = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("bookingData");
    if (!data) {
      navigate("/");
      return;
    }
    setBookingData(JSON.parse(data));

    // Auto-fill nếu đã đăng nhập
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setCustomerInfo((prev) => ({
        ...prev,
        name: userData.username,
      }));
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const generateBookingCode = () => {
    return (
      "BK" +
      Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).substring(2, 5).toUpperCase()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerInfo.name || !customerInfo.phone) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setSubmitting(true);

    try {
      const bookingCode = generateBookingCode();

      // 1. Tạo booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert([
          {
            showtime_id: bookingData.showtime.id,
            customer_name: customerInfo.name,
            customer_email: customerInfo.email || null,
            customer_phone: customerInfo.phone,
            total_amount: bookingData.totalAmount,
            booking_code: bookingCode,
            payment_status: "pending",
          },
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 2. Tạo booking details cho từng ghế
      const bookingDetails = bookingData.selectedSeats.map((seat) => ({
        booking_id: booking.id,
        seat_id: seat.id,
        price: getSeatPrice(seat.seat_type),
      }));

      const { error: detailsError } = await supabase
        .from("booking_details")
        .insert(bookingDetails);

      if (detailsError) throw detailsError;

      // 3. Cập nhật số ghế trống
      const { error: updateError } = await supabase
        .from("showtimes")
        .update({
          available_seats:
            bookingData.showtime.available_seats -
            bookingData.selectedSeats.length,
        })
        .eq("id", bookingData.showtime.id);

      if (updateError) throw updateError;

      // Xóa session storage
      sessionStorage.removeItem("bookingData");

      // Chuyển đến trang thành công
      navigate("/booking-success", {
        state: {
          bookingCode,
          customerInfo,
          bookingData,
        },
      });
    } catch (err) {
      console.error("Lỗi khi đặt vé:", err.message);
      alert("Có lỗi xảy ra khi đặt vé. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const getSeatPrice = (seatType) => {
    const basePrice = bookingData?.showtime?.price || 0;
    if (seatType === "vip") return basePrice * 1.5;
    if (seatType === "couple") return basePrice * 2;
    return basePrice;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (!bookingData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const { showtime, selectedSeats, totalAmount } = bookingData;

  return (
    <div className="booking-confirm-page">
      <div className="container">
        <div className="confirm-header">
          <h1>Xác nhận đặt vé</h1>
          <p>Vui lòng kiểm tra thông tin trước khi thanh toán</p>
        </div>

        <div className="confirm-content">
          {/* Booking Details */}
          <div className="booking-details-card">
            <h2>Thông tin đặt vé</h2>

            <div className="detail-section">
              <h3>🎬 Phim</h3>
              <div className="movie-summary">
                <img
                  src={showtime.movie.poster_url}
                  alt={showtime.movie.title}
                />
                <div>
                  <h4>{showtime.movie.title}</h4>
                  <p>
                    {showtime.movie.genre} • {showtime.movie.duration} phút •{" "}
                    {showtime.movie.age_rating}
                  </p>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>📍 Rạp & Suất chiếu</h3>
              <p>
                <strong>{showtime.room.cinema.name}</strong>
              </p>
              <p>
                {showtime.room.name} ({showtime.room.room_type})
              </p>
              <p>
                {new Date(showtime.show_date).toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
              <p>
                Giờ chiếu: <strong>{showtime.show_time.substring(0, 5)}</strong>
              </p>
            </div>

            <div className="detail-section">
              <h3>💺 Ghế đã chọn</h3>
              <div className="seats-summary">
                {selectedSeats.map((seat) => (
                  <div key={seat.id} className="seat-item">
                    <span className="seat-label">
                      {seat.seat_row}
                      {seat.seat_number}
                    </span>
                    <span className="seat-type">({seat.seat_type})</span>
                    <span className="seat-price">
                      {formatPrice(getSeatPrice(seat.seat_type))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-section total-section">
              <div className="total-row">
                <span>Tổng số ghế:</span>
                <strong>{selectedSeats.length}</strong>
              </div>
              <div className="total-row highlight">
                <span>Tổng tiền:</span>
                <strong className="total-price">
                  {formatPrice(totalAmount)}
                </strong>
              </div>
            </div>
          </div>

          {/* Customer Info Form */}
          <div className="customer-info-card">
            <h2>Thông tin khách hàng</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">
                  Họ và tên <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Số điện thoại <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  placeholder="0xxxxxxxxx"
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                />
                <small>Vé sẽ được gửi qua email nếu bạn cung cấp</small>
              </div>

              <div className="payment-method">
                <h3>Phương thức thanh toán</h3>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      defaultChecked
                    />
                    <span>💵 Tiền mặt tại quầy</span>
                  </label>
                  <label className="payment-option">
                    <input type="radio" name="payment" value="momo" />
                    <span>📱 MoMo</span>
                  </label>
                  <label className="payment-option">
                    <input type="radio" name="payment" value="banking" />
                    <span>🏦 Chuyển khoản</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận đặt vé"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmPage;
