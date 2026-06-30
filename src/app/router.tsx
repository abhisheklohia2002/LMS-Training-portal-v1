import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { MainLayout } from "../layouts/MainLayout";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { LoginPage } from "../pages/auth/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { UsersPage } from "../pages/users/UsersPage";
import { RolesPage } from "../pages/roles/RolesPage";
import { CoursesPage } from "../pages/courses/CoursesPage";
import { MyTrainingsPage } from "../pages/learning/MyTrainingsPage";
import { NotificationsPage } from "../pages/notifications/NotificationsPage";
import { ReportsPage } from "../pages/reports/ReportsPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { DepartmentsPage } from "../pages/departments/DepartmentsPage";
import { DepartmentAssignmentPanel } from "../pages/assignments-departments/DepartmentAssignmentPanel";
import { EntitiesPage } from "../pages/entity/EntitiesPage";
import { AdminCreateNotificationPage } from "../pages/adminNotification/AdminCreateNotificationPage";

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
            children: [
              {
                path: "/departments",
                children: [
                  {
                    index: true,
                    element: <DepartmentsPage />,
                  },
                  {
                    path: "assignments",
                    element: <DepartmentAssignmentPanel />,
                  },
                ],
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
            children: [{ path: "/entity", element: <EntitiesPage /> }],
          },
          { path: "/notifications", element: <NotificationsPage /> },
          {
            element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
            children: [
              {
                path: "/admin/notifications/create",
                element: <AdminCreateNotificationPage />,
              },
            ],
          },
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
