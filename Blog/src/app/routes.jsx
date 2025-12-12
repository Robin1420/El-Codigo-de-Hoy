import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/home";
import DashboardHome from "../pages/dashboard";
import PostsPage from "../pages/dashboard/posts";
import CategoriesPage from "../pages/dashboard/categories";
import TagsPage from "../pages/dashboard/tags";
import PagesPage from "../pages/dashboard/pages";
import PortfolioPage from "../pages/dashboard/portfolio";
import UsersPage from "../pages/dashboard/users";
import { ProtectedRoute } from "./ProtectedRoute";
import DashboardLayout from "../components/dashboard/DashboardLayout";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<HomePage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="posts" element={<PostsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="tags" element={<TagsPage />} />
        <Route path="pages" element={<PagesPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
