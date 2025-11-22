import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../assets/css/moviedetail.css";

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setMovie(data);
    } catch (err) {
      console.error("Lỗi:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    navigate(`/showtime/${id}`);
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
        <button onClick={() => navigate("/")}>Quay lại trang chủ</button>
      </div>
    );
  }

  return (
    <div className="movie-detail-page">
      {/* Hero Section */}
      <div
        className="movie-hero"
        style={{ backgroundImage: `url(${movie.poster_url})` }}
      >
        <div className="movie-hero-overlay">
          <div className="container">
            <div className="movie-hero-content">
              <div className="movie-poster-large">
                <img src={movie.poster_url} alt={movie.title} />
              </div>
              <div className="movie-info-main">
                <h1 className="movie-title-large">{movie.title}</h1>

                <div className="movie-meta-row">
                  <span className="meta-item">
                    <strong>Thể loại:</strong> {movie.genre}
                  </span>
                  <span className="meta-item">
                    <strong>Thời lượng:</strong> {movie.duration} phút
                  </span>
                  <span className="meta-item age-badge">
                    {movie.age_rating}
                  </span>
                </div>

                <div className="movie-rating-large">
                  <span className="rating-score">⭐ {movie.rating}/10</span>
                  <span className="rating-label">Đánh giá</span>
                </div>

                <div className="movie-actions">
                  <button className="btn-primary" onClick={handleBooking}>
                    🎫 Đặt vé ngay
                  </button>
                  {movie.trailer_url && (
                    <button
                      className="btn-secondary"
                      onClick={() => window.open(movie.trailer_url, "_blank")}
                    >
                      ▶ Xem trailer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="movie-details-section">
        <div className="container">
          <div className="details-grid">
            {/* Thông tin chi tiết */}
            <div className="details-main">
              <h2 className="section-heading">Nội dung phim</h2>
              <p className="movie-description">{movie.description}</p>

              <div className="movie-info-grid">
                <div className="info-item">
                  <strong>Đạo diễn:</strong>
                  <span>{movie.director}</span>
                </div>
                <div className="info-item">
                  <strong>Diễn viên:</strong>
                  <span>{movie.cast}</span>
                </div>
                <div className="info-item">
                  <strong>Ngày khởi chiếu:</strong>
                  <span>
                    {new Date(movie.release_date).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="info-item">
                  <strong>Trạng thái:</strong>
                  <span className={`status-badge ${movie.status}`}>
                    {movie.status === "showing" ? "Đang chiếu" : "Sắp chiếu"}
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="details-sidebar">
              <div className="sidebar-card">
                <h3>Thông tin phim</h3>
                <ul className="info-list">
                  <li>
                    <span>Thể loại:</span>
                    <strong>{movie.genre}</strong>
                  </li>
                  <li>
                    <span>Thời lượng:</span>
                    <strong>{movie.duration} phút</strong>
                  </li>
                  <li>
                    <span>Độ tuổi:</span>
                    <strong>{movie.age_rating}</strong>
                  </li>
                  <li>
                    <span>Đánh giá:</span>
                    <strong>⭐ {movie.rating}/10</strong>
                  </li>
                </ul>
                <button className="btn-booking-sidebar" onClick={handleBooking}>
                  Đặt vé ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
