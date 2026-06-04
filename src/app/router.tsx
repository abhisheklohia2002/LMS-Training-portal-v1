import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { MainLayout } from "../layouts/MainLayout";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { LoginPage } from "../pages/auth/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { UsersPage } from "../pages/users/UsersPage";
import { RolesPage } from "../pages/roles/RolesPage";
import { CoursesPage } from "../pages/courses/CoursesPage";
import { TrainingMappingsPage } from "../pages/mappings/TrainingMappingsPage";
import { TrainingAssignmentsPage } from "../pages/assignments/TrainingAssignmentsPage";
import { MyTrainingsPage } from "../pages/learning/MyTrainingsPage";
import { AssessmentsPage } from "../pages/assessments/AssessmentsPage";
import { RulesPage } from "../pages/rules/RulesPage";
import { CertificationsPage } from "../pages/certifications/CertificationsPage";
import { NotificationsPage } from "../pages/notifications/NotificationsPage";
import { ReportsPage } from "../pages/reports/ReportsPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { DepartmentsPage } from "../pages/departments/DepartmentsPage";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/learning", element: <MyTrainingsPage /> },
          {
            element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
            children: [{ path: "/courses", element: <CoursesPage /> }],
          },
          {
            element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
            children: [{ path: "/users", element: <UsersPage /> }],
          },
          {
            element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
            children: [{ path: "/roles", element: <RolesPage /> }],
          },
           {
            element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
            children: [{ path: "/departments", element: <DepartmentsPage /> }],
          },
          {
            element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
            children: [
              { path: "/mappings", element: <TrainingMappingsPage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
            children: [
              { path: "/assignments", element: <TrainingAssignmentsPage /> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
            children: [{ path: "/assessments", element: <AssessmentsPage /> }],
          },
          {
            element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
            children: [{ path: "/rules", element: <RulesPage /> }],
          },
          {
            element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
            children: [
              { path: "/certifications", element: <CertificationsPage /> },
            ],
          },
          { path: "/notifications", element: <NotificationsPage /> },
          {
            element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
            children: [{ path: "/reports", element: <ReportsPage /> }],
          },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
