import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/home";
import LandingPage from "../pages/landing";
import DashboardHome from "../pages/dashboard";
import PostsLayout from "../pages/dashboard/posts/layout.jsx";
import PostNewPage from "../pages/dashboard/posts/new.jsx";
import PostEditPage from "../pages/dashboard/posts/edit.jsx";
import CategoriesLayout from "../pages/dashboard/categories/layout.jsx";
import CategoryNewPage from "../pages/dashboard/categories/new.jsx";
import CategoryEditPage from "../pages/dashboard/categories/edit.jsx";
import TagsPage from "../pages/dashboard/tags";
import TagNewPage from "../pages/dashboard/tags/new.jsx";
import TagEditPage from "../pages/dashboard/tags/edit.jsx";
import PortfolioLayout from "../pages/dashboard/portfolio/layout.jsx";
import PortfolioProjectsLayout from "../pages/dashboard/portfolio/projects/layout.jsx";
import ProjectNewPage from "../pages/dashboard/portfolio/projects/new.jsx";
import ProjectEditPage from "../pages/dashboard/portfolio/projects/edit.jsx";
import PortfolioExperienceLayout from "../pages/dashboard/portfolio/experience/layout.jsx";
import ExperienceNewPage from "../pages/dashboard/portfolio/experience/new.jsx";
import ExperienceEditPage from "../pages/dashboard/portfolio/experience/edit.jsx";
import PortfolioSkillsLayout from "../pages/dashboard/portfolio/skills/layout.jsx";
import SkillNewPage from "../pages/dashboard/portfolio/skills/new.jsx";
import SkillEditPage from "../pages/dashboard/portfolio/skills/edit.jsx";
import PortfolioSocialLayout from "../pages/dashboard/portfolio/social/layout.jsx";
import SocialNewPage from "../pages/dashboard/portfolio/social/new.jsx";
import SocialEditPage from "../pages/dashboard/portfolio/social/edit.jsx";
import UsersPage from "../pages/dashboard/users";
import SettingsPage from "../pages/dashboard/settings";
import { ProtectedRoute } from "./ProtectedRoute";
import DashboardLayout from "../components/dashboard/DashboardLayout";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
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
        <Route path="tags" element={<TagsPage />}>
          <Route path="new" element={<TagNewPage />} />
          <Route path=":tagId/edit" element={<TagEditPage />} />
        </Route>
        <Route path="portfolio" element={<PortfolioLayout />}>
          <Route index element={<Navigate to="projects" replace />} />
          <Route path="projects" element={<PortfolioProjectsLayout />}>
            <Route path="new" element={<ProjectNewPage />} />
            <Route path=":projectId/edit" element={<ProjectEditPage />} />
          </Route>
          <Route path="experience" element={<PortfolioExperienceLayout />}>
            <Route path="new" element={<ExperienceNewPage />} />
            <Route path=":experienceId/edit" element={<ExperienceEditPage />} />
          </Route>
          <Route path="skills" element={<PortfolioSkillsLayout />}>
            <Route path="new" element={<SkillNewPage />} />
            <Route path=":skillId/edit" element={<SkillEditPage />} />
          </Route>
          <Route path="social" element={<PortfolioSocialLayout />}>
            <Route path="new" element={<SocialNewPage />} />
            <Route path=":socialId/edit" element={<SocialEditPage />} />
          </Route>
        </Route>
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
