import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "../assets/css/admin.css";

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
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
        .order("created_at", { ascending: false });

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

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phim này?")) return;

    try {
      const { error } = await supabase.from("movies").delete().eq("id", id);

      if (error) throw error;
      alert("✅ Đã xóa phim thành công!");
      fetchMovies();
    } catch (err) {
      console.error("Lỗi:", err.message);
      alert("❌ Lỗi khi xóa phim: " + err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("movies")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      fetchMovies();
    } catch (err) {
      console.error("Lỗi:", err.message);
      alert("❌ Lỗi khi cập nhật: " + err.message);
    }
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
          <h1>🎬 Quản lý phim</h1>
          <p>Thêm, sửa, xóa phim trong hệ thống</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate("/admin/movies/edit/new")}
        >
          ➕ Thêm phim mới
        </button>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <button
          className={filter === "all" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("all")}
        >
          Tất cả ({movies.length})
        </button>
        <button
          className={filter === "showing" ? "filter-btn active" : "filter-btn"}
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
        <button
          className={filter === "ended" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("ended")}
        >
          Đã kết thúc
        </button>
      </div>

      {/* Movies Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Poster</th>
              <th>Tên phim</th>
              <th>Thể loại</th>
              <th>Thời lượng</th>
              <th>Đánh giá</th>
              <th>Trạng thái</th>
              <th>Ngày phát hành</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie.id}>
                <td>
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="movie-thumb"
                  />
                </td>
                <td>
                  <strong>{movie.title}</strong>
                  <br />
                  <small>{movie.director}</small>
                </td>
                <td>{movie.genre}</td>
                <td>{movie.duration} phút</td>
                <td>
                  <span className="rating">⭐ {movie.rating}/10</span>
                </td>
                <td>
                  <select
                    value={movie.status}
                    onChange={(e) =>
                      handleStatusChange(movie.id, e.target.value)
                    }
                    className="status-select"
                  >
                    <option value="showing">Đang chiếu</option>
                    <option value="coming_soon">Sắp chiếu</option>
                    <option value="ended">Đã kết thúc</option>
                  </select>
                </td>
                <td>
                  {new Date(movie.release_date).toLocaleDateString("vi-VN")}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/admin/movies/edit/${movie.id}`)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(movie.id)}
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

        {movies.length === 0 && (
          <div className="no-data">
            <p>Không có phim nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMovies;
