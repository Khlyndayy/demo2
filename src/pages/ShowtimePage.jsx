import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../assets/css/showtime.css";

const ShowtimePage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [movieId]);

  const fetchData = async () => {
    try {
      // Lấy thông tin phim
      const { data: movieData, error: movieError } = await supabase
        .from("movies")
        .select("*")
        .eq("id", movieId)
        .single();

      if (movieError) throw movieError;
      setMovie(movieData);

      // Lấy lịch chiếu với thông tin rạp và phòng
      const { data: showtimeData, error: showtimeError } = await supabase
        .from("showtimes")
        .select(
          `
          *,
          room:rooms(*, cinema:cinemas(*))
        `
        )
        .eq("movie_id", movieId)
        .gte("show_date", new Date().toISOString().split("T")[0])
        .order("show_date", { ascending: true })
        .order("show_time", { ascending: true });

      if (showtimeError) throw showtimeError;
      setShowtimes(showtimeData || []);

      // Lấy danh sách ngày chiếu duy nhất
      const uniqueDates = [...new Set(showtimeData.map((st) => st.show_date))];
      if (uniqueDates.length > 0) {
        setSelectedDate(uniqueDates[0]);
      }
    } catch (err) {
      console.error("Lỗi:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Lọc suất chiếu theo ngày đã chọn
  const filteredShowtimes = showtimes.filter(
    (st) => st.show_date === selectedDate
  );

  // Nhóm suất chiếu theo rạp
  const showtimesByCinema = filteredShowtimes.reduce((acc, st) => {
    const cinemaId = st.room.cinema.id;
    if (!acc[cinemaId]) {
      acc[cinemaId] = {
        cinema: st.room.cinema,
        showtimes: [],
      };
    }
    acc[cinemaId].showtimes.push(st);
    return acc;
  }, {});

  const handleSelectShowtime = (showtimeId) => {
    navigate(`/seats/${showtimeId}`);
  };

  // Tạo danh sách ngày (7 ngày tiếp theo)
  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return "Hôm nay";

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.getTime() === tomorrow.getTime()) return "Ngày mai";

    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatTime = (timeStr) => {
    return timeStr.substring(0, 5); // HH:MM
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="error-container">
        <h2>Không tìm thấy phim!</h2>
        <button onClick={() => navigate("/")}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="showtime-page">
      <div className="container">
        {/* Header */}
        <div className="showtime-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
          <div className="movie-info-header">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="movie-thumb"
            />
            <div>
              <h1>{movie.title}</h1>
              <p>
                {movie.genre} • {movie.duration} phút • {movie.age_rating}
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="date-selector">
          <h2>Chọn ngày chiếu</h2>
          <div className="date-buttons">
            {getDates().map((date) => (
              <button
                key={date}
                className={
                  selectedDate === date ? "date-btn active" : "date-btn"
                }
                onClick={() => setSelectedDate(date)}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>

        {/* Showtimes by Cinema */}
        <div className="showtimes-container">
          {Object.keys(showtimesByCinema).length === 0 ? (
            <div className="no-showtimes">
              <p>Không có suất chiếu nào trong ngày này</p>
            </div>
          ) : (
            Object.values(showtimesByCinema).map(({ cinema, showtimes }) => (
              <div key={cinema.id} className="cinema-block">
                <div className="cinema-info">
                  <h3>🎬 {cinema.name}</h3>
                  <p className="cinema-address">📍 {cinema.address}</p>
                  <p className="cinema-facilities">🎥 {cinema.facilities}</p>
                </div>
                <div className="showtimes-grid">
                  {showtimes.map((st) => (
                    <button
                      key={st.id}
                      className="showtime-btn"
                      onClick={() => handleSelectShowtime(st.id)}
                      disabled={st.available_seats === 0}
                    >
                      <div className="showtime-time">
                        {formatTime(st.show_time)}
                      </div>
                      <div className="showtime-room">
                        {st.room.name} ({st.room.room_type})
                      </div>
                      <div className="showtime-price">
                        {formatPrice(st.price)}
                      </div>
                      <div className="showtime-seats">
                        {st.available_seats > 0
                          ? `${st.available_seats} ghế trống`
                          : "Hết vé"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowtimePage;
