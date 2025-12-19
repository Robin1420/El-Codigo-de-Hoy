import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/home";
import DashboardHome from "../pages/dashboard";
import PostsLayout from "../pages/dashboard/posts/layout.jsx";
import PostNewPage from "../pages/dashboard/posts/new.jsx";
import PostEditPage from "../pages/dashboard/posts/edit.jsx";
import CategoriesLayout from "../pages/dashboard/categories/layout.jsx";
import CategoryNewPage from "../pages/dashboard/categories/new.jsx";
import CategoryEditPage from "../pages/dashboard/categories/edit.jsx";
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
        <Route path="posts" element={<PostsLayout />}>
          <Route path="new" element={<PostNewPage />} />
          <Route path=":postId/edit" element={<PostEditPage />} />
        </Route>
        <Route path="categories" element={<CategoriesLayout />}>
          <Route path="new" element={<CategoryNewPage />} />
          <Route path=":categoryId/edit" element={<CategoryEditPage />} />
        </Route>
        <Route path="tags" element={<TagsPage />} />
        <Route path="pages" element={<PagesPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
