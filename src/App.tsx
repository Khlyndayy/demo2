import "./styles.css";
// @ts-ignore
import Layout from "./pages/Layout";
// @ts-ignore
import HomePage from "./pages/HomePage";
// @ts-ignore
import MovieDetailPage from "./pages/MovieDetailPage";
// @ts-ignore
import ShowtimePage from "./pages/ShowtimePage";
// @ts-ignore
import SeatSelectionPage from "./pages/SeatSelectionPage";
// @ts-ignore
import BookingConfirmPage from "./pages/BookingConfirmPage";
// @ts-ignore
import MyBookingsPage from "./pages/MyBookingsPage";
// @ts-ignore
import AdminDashboard from "./pages/AdminDashboard";
// @ts-ignore
import AdminMovies from "./pages/AdminMovies";
// @ts-ignore
import AdminShowtimes from "./pages/AdminShowtimes";
// @ts-ignore
import EditMovie from "./pages/EditMovie";
// @ts-ignore
import LoginPage from "./pages/LoginPage";
// @ts-ignore
import LogoutPage from "./pages/LogoutPage";
// @ts-ignore
import ProtectedRoute from "./components/ProtectedRoute";
// @ts-ignore
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Trang công khai */}
          <Route index element={<HomePage />} />
          <Route path="movie/:id" element={<MovieDetailPage />} />
          <Route path="showtime/:movieId" element={<ShowtimePage />} />
          <Route path="seats/:showtimeId" element={<SeatSelectionPage />} />
          <Route path="confirm" element={<BookingConfirmPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />

          {/* Đăng nhập/xuất */}
          <Route path="login" element={<LoginPage />} />
          <Route path="logout" element={<LogoutPage />} />

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/movies"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminMovies />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/movies/edit/:id"
            element={
              <ProtectedRoute roleRequired="admin">
                <EditMovie />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/showtimes"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminShowtimes />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
