import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../assets/css/seatselection.css";

const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [showtimeId]);

  const fetchData = async () => {
    try {
      // Lấy thông tin suất chiếu
      const { data: showtimeData, error: showtimeError } = await supabase
        .from("showtimes")
        .select(
          `
          *,
          movie:movies(*),
          room:rooms(*, cinema:cinemas(*))
        `
        )
        .eq("id", showtimeId)
        .single();

      if (showtimeError) throw showtimeError;
      setShowtime(showtimeData);

      // Debug log
      console.log("Showtime data loaded:", {
        id: showtimeData.id,
        base_price: showtimeData.base_price,
        vip_price: showtimeData.vip_price,
        couple_price: showtimeData.couple_price,
      });

      // Lấy tất cả ghế của phòng
      const { data: seatsData, error: seatsError } = await supabase
        .from("seats")
        .select("*")
        .eq("room_id", showtimeData.room.id)
        .order("seat_row", { ascending: true })
        .order("seat_number", { ascending: true });

      if (seatsError) throw seatsError;
      setSeats(seatsData || []);

      // Lấy ghế đã đặt
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("booking_details")
        .select(
          `
          seat_id,
          booking:bookings!inner(payment_status)
        `
        )
        .eq("booking.showtime_id", showtimeId)
        .neq("booking.payment_status", "cancelled");

      if (bookingsError) throw bookingsError;
      setBookedSeats(bookingsData.map((b) => b.seat_id));
    } catch (err) {
      console.error("Lỗi:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (bookedSeats.includes(seat.id)) return;

    setSelectedSeats((prev) => {
      if (prev.find((s) => s.id === seat.id)) {
        return prev.filter((s) => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
  };

  // Hàm tính giá ghế dựa trên loại ghế và showtime
  const getSeatPrice = (seatType) => {
    if (!showtime) return 0;

    const basePrice = showtime.base_price || 0;
    const vipPrice = showtime.vip_price || basePrice * 1.5;
    const couplePrice = showtime.couple_price || basePrice * 2;

    // Debug log
    console.log("Calculating price for:", seatType, {
      basePrice,
      vipPrice,
      couplePrice,
    });

    switch (seatType) {
      case "vip":
        return vipPrice;
      case "couple":
        return couplePrice;
      case "sweetbox":
        return couplePrice * 1.2; // Sweetbox đắt hơn couple 20%
      default:
        return basePrice;
    }
  };

  const getTotalAmount = () => {
    return selectedSeats.reduce(
      (sum, seat) => sum + getSeatPrice(seat.seat_type),
      0
    );
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ghế!");
      return;
    }

    // Lưu thông tin vào sessionStorage
    sessionStorage.setItem(
      "bookingData",
      JSON.stringify({
        showtime,
        selectedSeats,
        totalAmount: getTotalAmount(),
      })
    );

    navigate("/confirm");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Nhóm ghế theo hàng
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.seat_row]) acc[seat.seat_row] = [];
    acc[seat.seat_row].push(seat);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="error-container">
        <h2>Không tìm thấy suất chiếu!</h2>
        <button onClick={() => navigate("/")}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="seat-selection-page">
      <div className="container">
        {/* Header */}
        <div className="seat-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
          <div className="showtime-info">
            <h2>{showtime.movie.title}</h2>
            <p>
              {showtime.room.cinema.name} - {showtime.room.name} (
              {showtime.room.room_type})
            </p>
            <p>
              {new Date(showtime.show_date).toLocaleDateString("vi-VN")} -{" "}
              {showtime.show_time.substring(0, 5)}
            </p>
          </div>
        </div>

        <div className="seat-content">
          {/* Screen */}
          <div className="screen-area">
            <div className="screen">MÀN HÌNH</div>
          </div>

          {/* Seats Map */}
          <div className="seats-map">
            {Object.keys(seatsByRow).map((row) => (
              <div key={row} className="seat-row">
                <div className="row-label">{row}</div>
                <div className="seats-container">
                  {seatsByRow[row].map((seat) => {
                    const isBooked = bookedSeats.includes(seat.id);
                    const isSelected = selectedSeats.find(
                      (s) => s.id === seat.id
                    );
                    const seatPrice = getSeatPrice(seat.seat_type);

                    return (
                      <button
                        key={seat.id}
                        className={`seat ${seat.seat_type} ${
                          isBooked ? "booked" : ""
                        } ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isBooked}
                        title={`${row}${seat.seat_number} - ${
                          seat.seat_type
                        } - ${formatPrice(seatPrice)}`}
                      >
                        <span className="seat-number">{seat.seat_number}</span>
                        {!isBooked && (
                          <span className="seat-price-label">
                            {(seatPrice / 1000).toFixed(0)}k
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend with Prices */}
          <div className="seat-legend">
            <div className="legend-item">
              <span className="legend-seat normal"></span>
              <div className="legend-info">
                <span>Ghế thường</span>
                <strong>{formatPrice(showtime.base_price)}</strong>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-seat vip"></span>
              <div className="legend-info">
                <span>Ghế VIP</span>
                <strong>
                  {formatPrice(showtime.vip_price || showtime.base_price * 1.5)}
                </strong>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-seat couple"></span>
              <div className="legend-info">
                <span>Ghế đôi</span>
                <strong>
                  {formatPrice(
                    showtime.couple_price || showtime.base_price * 2
                  )}
                </strong>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-seat selected"></span>
              <div className="legend-info">
                <span>Đang chọn</span>
              </div>
            </div>
            <div className="legend-item">
              <span className="legend-seat booked"></span>
              <div className="legend-info">
                <span>Đã đặt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="booking-summary">
          <div className="summary-content">
            <div className="selected-seats-info">
              <h3>Ghế đã chọn:</h3>
              {selectedSeats.length === 0 ? (
                <p>Chưa chọn ghế nào</p>
              ) : (
                <div className="selected-seats-list">
                  {selectedSeats.map((seat) => (
                    <div key={seat.id} className="seat-tag-detail">
                      <span className="seat-tag">
                        {seat.seat_row}
                        {seat.seat_number}
                      </span>
                      <span className="seat-tag-type">({seat.seat_type})</span>
                      <span className="seat-tag-price">
                        {formatPrice(getSeatPrice(seat.seat_type))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="price-info">
              <div className="price-row">
                <span>Tổng số ghế:</span>
                <strong>{selectedSeats.length}</strong>
              </div>
              <div className="price-row">
                <span>Thành tiền:</span>
                <strong>{formatPrice(getTotalAmount())}</strong>
              </div>
              <div className="price-row total">
                <span>Tổng thanh toán:</span>
                <strong className="total-price">
                  {formatPrice(getTotalAmount())}
                </strong>
              </div>
            </div>

            <button
              className="btn-continue"
              onClick={handleContinue}
              disabled={selectedSeats.length === 0}
            >
              Tiếp tục thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
