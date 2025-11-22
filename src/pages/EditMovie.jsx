import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import "../assets/css/admin.css";

const EditMovie = () => {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();

  const [movie, setMovie] = useState({
    title: "",
    description: "",
    poster_url: "",
    trailer_url: "",
    duration: "",
    release_date: "",
    director: "",
    cast: "",
    genre: "",
    rating: "",
    age_rating: "P",
    status: "showing",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchMovie();
    }
  }, [id, isNew]);

  const fetchMovie = async () => {
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setMovie(data || {});
    } catch (err) {
      console.error("Lỗi:", err.message);
      alert("Không tìm thấy phim!");
      navigate("/admin/movies");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovie((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate
      if (!movie.title || !movie.duration || !movie.release_date) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
      }

      if (isNew) {
        // Thêm mới
        const { error } = await supabase.from("movies").insert([movie]);

        if (error) throw error;
        alert("✅ Đã thêm phim thành công!");
      } else {
        // Cập nhật
        const { error } = await supabase
          .from("movies")
          .update(movie)
          .eq("id", id);

        if (error) throw error;
        alert("✅ Đã cập nhật phim thành công!");
      }

      navigate("/admin/movies");
    } catch (err) {
      console.error("Lỗi:", err.message);
      alert("❌ Lỗi: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>{isNew ? "➕ Thêm phim mới" : "✏️ Chỉnh sửa phim"}</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid">
            {/* Cột trái */}
            <div className="form-column">
              <div className="form-group">
                <label>
                  Tên phim <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={movie.title}
                  onChange={handleChange}
                  placeholder="Nhập tên phim..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={movie.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Nhập mô tả phim..."
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Thời lượng (phút) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={movie.duration}
                    onChange={handleChange}
                    placeholder="120"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Đánh giá (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    name="rating"
                    value={movie.rating}
                    onChange={handleChange}
                    placeholder="8.5"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thể loại</label>
                  <select
                    name="genre"
                    value={movie.genre}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn thể loại --</option>
                    <option value="Hành động">Hành động</option>
                    <option value="Hài">Hài</option>
                    <option value="Tình cảm">Tình cảm</option>
                    <option value="Kinh dị">Kinh dị</option>
                    <option value="Khoa học viễn tưởng">
                      Khoa học viễn tưởng
                    </option>
                    <option value="Hoạt hình">Hoạt hình</option>
                    <option value="Tâm lý">Tâm lý</option>
                    <option value="Phiêu lưu">Phiêu lưu</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Độ tuổi</label>
                  <select
                    name="age_rating"
                    value={movie.age_rating}
                    onChange={handleChange}
                  >
                    <option value="P">P - Phổ thông</option>
                    <option value="K">K - Dưới 13 tuổi với phụ huynh</option>
                    <option value="T13">T13 - Từ 13 tuổi</option>
                    <option value="T16">T16 - Từ 16 tuổi</option>
                    <option value="T18">T18 - Từ 18 tuổi</option>
                    <option value="C">C - Cấm chiếu</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Đạo diễn</label>
                <input
                  type="text"
                  name="director"
                  value={movie.director}
                  onChange={handleChange}
                  placeholder="Tên đạo diễn..."
                />
              </div>

              <div className="form-group">
                <label>Diễn viên</label>
                <input
                  type="text"
                  name="cast"
                  value={movie.cast}
                  onChange={handleChange}
                  placeholder="Diễn viên 1, Diễn viên 2, ..."
                />
              </div>
            </div>

            {/* Cột phải */}
            <div className="form-column">
              <div className="form-group">
                <label>URL Poster</label>
                <input
                  type="url"
                  name="poster_url"
                  value={movie.poster_url}
                  onChange={handleChange}
                  placeholder="https://example.com/poster.jpg"
                />
                {movie.poster_url && (
                  <div className="image-preview">
                    <img src={movie.poster_url} alt="Poster preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>URL Trailer</label>
                <input
                  type="url"
                  name="trailer_url"
                  value={movie.trailer_url}
                  onChange={handleChange}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="form-group">
                <label>
                  Ngày phát hành <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="release_date"
                  value={movie.release_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={movie.status}
                  onChange={handleChange}
                >
                  <option value="showing">Đang chiếu</option>
                  <option value="coming_soon">Sắp chiếu</option>
                  <option value="ended">Đã kết thúc</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/admin/movies")}
              disabled={submitting}
            >
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting
                ? "Đang xử lý..."
                : isNew
                ? "Thêm phim"
                : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMovie;
