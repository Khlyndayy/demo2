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

  const getSeatPrice = (seatType) => {
    const basePrice = showtime?.price || 0;
    if (seatType === "vip") return basePrice * 1.5;
    if (seatType === "couple") return basePrice * 2;
    return basePrice;
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

    // Lưu thông tin vào sessionStorage để dùng ở trang confirm
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

                    return (
                      <button
                        key={seat.id}
                        className={`seat ${seat.seat_type} ${
                          isBooked ? "booked" : ""
                        } ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isBooked}
                        title={`${row}${seat.seat_number} - ${seat.seat_type}`}
                      >
                        {seat.seat_number}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="seat-legend">
            <div className="legend-item">
              <span className="legend-seat normal"></span>
              <span>Ghế thường</span>
            </div>
            <div className="legend-item">
              <span className="legend-seat vip"></span>
              <span>Ghế VIP</span>
            </div>
            <div className="legend-item">
              <span className="legend-seat couple"></span>
              <span>Ghế đôi</span>
            </div>
            <div className="legend-item">
              <span className="legend-seat selected"></span>
              <span>Đang chọn</span>
            </div>
            <div className="legend-item">
              <span className="legend-seat booked"></span>
              <span>Đã đặt</span>
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
                    <span key={seat.id} className="seat-tag">
                      {seat.seat_row}
                      {seat.seat_number}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="price-info">
              <div className="price-row">
                <span>Tổng số ghế:</span>
                <strong>{selectedSeats.length}</strong>
              </div>
              <div className="price-row total">
                <span>Tổng tiền:</span>
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
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
