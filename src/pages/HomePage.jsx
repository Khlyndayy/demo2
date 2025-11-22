import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../assets/css/homepage.css";

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, showing, coming_soon
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, [filter]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("movies")
        .select("*")
        .order("release_date", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMovies(data || []);
    } catch (err) {
      console.error("Lỗi:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải phim...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">Đặt vé xem phim online</h1>
          <p className="hero-subtitle">
            Trải nghiệm điện ảnh đỉnh cao tại hệ thống rạp hiện đại
          </p>
          <button
            className="btn-hero"
            onClick={() =>
              document
                .getElementById("phim-dang-chieu")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Xem phim ngay
          </button>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section" id="phim-dang-chieu">
        <div className="container">
          <div className="filter-buttons">
            <button
              className={filter === "all" ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter("all")}
            >
              Tất cả
            </button>
            <button
              className={
                filter === "showing" ? "filter-btn active" : "filter-btn"
              }
              onClick={() => setFilter("showing")}
            >
              Đang chiếu
            </button>
            <button
              className={
                filter === "coming_soon" ? "filter-btn active" : "filter-btn"
              }
              onClick={() => setFilter("coming_soon")}
            >
              Sắp chiếu
            </button>
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section className="movies-section">
        <div className="container">
          {movies.length === 0 ? (
            <div className="no-movies">
              <p>Không có phim nào</p>
            </div>
          ) : (
            <div className="movies-grid">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="movie-card"
                  onClick={() => handleMovieClick(movie.id)}
                >
                  <div className="movie-poster">
                    <img src={movie.poster_url} alt={movie.title} />
                    <div className="movie-overlay">
                      <button className="btn-play">▶ Xem trailer</button>
                    </div>
                  </div>
                  <div className="movie-info">
                    <h3 className="movie-title">{movie.title}</h3>
                    <div className="movie-meta">
                      <span className="genre">{movie.genre}</span>
                      <span className="age-rating">{movie.age_rating}</span>
                    </div>
                    <div className="movie-rating">⭐ {movie.rating}/10</div>
                    <button className="btn-booking">Đặt vé ngay</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Tại sao chọn chúng tôi?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎫</div>
              <h3>Đặt vé online</h3>
              <p>Đặt vé nhanh chóng, tiện lợi chỉ với vài thao tác</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💺</div>
              <h3>Chọn ghế tự do</h3>
              <p>Tự do lựa chọn vị trí ghế yêu thích của bạn</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Thanh toán an toàn</h3>
              <p>Đa dạng phương thức thanh toán, bảo mật tuyệt đối</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎬</div>
              <h3>Rạp hiện đại</h3>
              <p>Hệ thống rạp 4DX, IMAX với công nghệ hàng đầu</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
