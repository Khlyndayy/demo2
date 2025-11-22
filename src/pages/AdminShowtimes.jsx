import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../assets/css/admin.css";

const AdminShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    movie_id: "",
    room_id: "",
    show_date: "",
    show_time: "",
    price: "",
    available_seats: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách lịch chiếu
      const { data: showtimesData, error: showtimesError } = await supabase
        .from("showtimes")
        .select(
          `
          *,
          movie:movies(title, poster_url),
          room:rooms(*, cinema:cinemas(*))
        `
        )
        .order("show_date", { ascending: true })
        .order("show_time", { ascending: true });

      if (showtimesError) throw showtimesError;
      setShowtimes(showtimesData || []);

      // Lấy danh sách phim
      const { data: moviesData, error: moviesError } = await supabase
        .from("movies")
        .select("*")
        .eq("status", "showing")
        .order("title");

      if (moviesError) throw moviesError;
      setMovies(moviesData || []);

      // Lấy danh sách phòng
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("*, cinema:cinemas(*)")
        .order("cinema_id")
        .order("name");

      if (roomsError) throw roomsError;
      setRooms(roomsData || []);
    } catch (err) {
      console.error("Lỗi:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Lấy tổng số ghế của phòng
      const room = rooms.find((r) => r.id === parseInt(formData.room_id));

      const { error } = await supabase.from("showtimes").insert([
        {
          ...formData,
          available_seats: room?.total_seats || formData.available_seats,
        },
      ]);

      if (error) throw error;

      alert("✅ Đã thêm lịch chiếu thành công!");
      setShowForm(false);
      setFormData({
        movie_id: "",
        room_id: "",
        show_date: "",
        show_time: "",
        price: "",
        available_seats: "",
      });
      fetchData();
    } catch (err) {
      console.error("Lỗi:", err.message);
      alert("❌ Lỗi: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa lịch chiếu này?")) return;

    try {
      const { error } = await supabase.from("showtimes").delete().eq("id", id);

      if (error) throw error;
      alert("✅ Đã xóa lịch chiếu!");
      fetchData();
    } catch (err) {
      console.error("Lỗi:", err.message);
      alert("❌ Lỗi: " + err.message);
    }
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

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>📅 Quản lý lịch chiếu</h1>
          <p>Tạo và quản lý các suất chiếu phim</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Đóng" : "➕ Thêm lịch chiếu"}
        </button>
      </div>

      {/* Add Showtime Form */}
      {showForm && (
        <div className="form-container" style={{ marginBottom: "2rem" }}>
          <form onSubmit={handleSubmit} className="admin-form">
            <h3 style={{ marginBottom: "1.5rem" }}>Thêm lịch chiếu mới</h3>

            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label>
                    Chọn phim <span className="required">*</span>
                  </label>
                  <select
                    name="movie_id"
                    value={formData.movie_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn phim --</option>
                    {movies.map((movie) => (
                      <option key={movie.id} value={movie.id}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Chọn phòng chiếu <span className="required">*</span>
                  </label>
                  <select
                    name="room_id"
                    value={formData.room_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.cinema.name} - {room.name} ({room.room_type}) -{" "}
                        {room.total_seats} ghế
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Ngày chiếu <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      name="show_date"
                      value={formData.show_date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Giờ chiếu <span className="required">*</span>
                    </label>
                    <input
                      type="time"
                      name="show_time"
                      value={formData.show_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-column">
                <div className="form-group">
                  <label>
                    Giá vé (VNĐ) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="80000"
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div className="alert-info">
                  <p>
                    <strong>Lưu ý:</strong>
                  </p>
                  <ul>
                    <li>
                      Số ghế trống sẽ tự động lấy từ tổng số ghế của phòng
                    </li>
                    <li>
                      Giá vé có thể khác nhau tùy theo loại ghế (VIP, đôi...)
                    </li>
                    <li>Nên tạo lịch chiếu cách nhau ít nhất 30 phút</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Hủy
              </button>
              <button type="submit" className="btn-primary">
                Thêm lịch chiếu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Showtimes Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Phim</th>
              <th>Rạp & Phòng</th>
              <th>Ngày chiếu</th>
              <th>Giờ chiếu</th>
              <th>Giá vé</th>
              <th>Ghế trống</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map((showtime) => (
              <tr key={showtime.id}>
                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={showtime.movie.poster_url}
                      alt={showtime.movie.title}
                      className="movie-thumb"
                    />
                    <strong>{showtime.movie.title}</strong>
                  </div>
                </td>
                <td>
                  <strong>{showtime.room.cinema.name}</strong>
                  <br />
                  <small>
                    {showtime.room.name} ({showtime.room.room_type})
                  </small>
                </td>
                <td>
                  {new Date(showtime.show_date).toLocaleDateString("vi-VN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </td>
                <td>
                  <strong>{showtime.show_time.substring(0, 5)}</strong>
                </td>
                <td>
                  <strong>{formatPrice(showtime.price)}</strong>
                </td>
                <td>
                  <span
                    style={{
                      color:
                        showtime.available_seats > 20 ? "#28a745" : "#dc3545",
                      fontWeight: "bold",
                    }}
                  >
                    {showtime.available_seats}/{showtime.room.total_seats}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(showtime.id)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showtimes.length === 0 && (
          <div className="no-data">
            <p>Chưa có lịch chiếu nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShowtimes;
