import {
  BellOutlined,
  BookOutlined,
  BuildOutlined,
  DashboardOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NotificationOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Dropdown,
  Input,
  Layout,
  Menu,
} from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { canManageLms } from "../utils/access";
import { useLogout, useMe } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
const { Header, Sider, Content } = Layout;
export function MainLayout() {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("lms_theme") === "dark";
  });
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: me } = useMe();
  const { data: notes } = useNotifications();
  const unread = notes?.filter((n) => !n.read_status).length ?? 0;
  const selectedKey = location.pathname;
  const role = me?.role.role_name || localStorage.getItem("lms_role");
  const isManagerOrAdmin = canManageLms(role);
  const items = useMemo(() => {
    const base = [
      {
        key: "/",
        icon: <DashboardOutlined />,
        label: <Link to="/">Dashboard</Link>,
      },
      {
        type: "group" as const,
        label: "Learning",
        children: [
          {
            key: "/learning",
            icon: <ReadOutlined />,
            label: <Link to="/learning">My Trainings</Link>,
          },
        ],
      },
    ];
    if (!isManagerOrAdmin) {
      return [
        ...base,
        {
          type: "group" as const,
          label: "Personal",
          children: [
            {
              key: "/notifications",
              icon: <BellOutlined />,
              label: <Link to="/notifications">Notifications</Link>,
            },
          ],
        },
      ];
    }
    return [
      ...base,
      {
        type: "group" as const,
        label: "Manage",
        children: [
          {
            key: "/entity",
            icon: <BuildOutlined />,
            label: <Link to="/entity">Entity</Link>,
          },

          {
            key: "/departments",
            icon: <BuildOutlined />,
            label: "Departments",
            children: [
              {
                key: "/departments",
                label: <Link to="/departments">Department List</Link>,
              },
              {
                key: "/departments/mappings",
                label: (
                  <Link to="/departments/mappings">Department Mappings</Link>
                ),
              },
              {
                key: "/departments/assignments",
                label: (
                  <Link to="/departments/assignments">
                    Department Assignments
                  </Link>
                ),
              },
              // {
              //   key: "/departments/training-mappings",
              //   label: (
              //     <Link to="/departments/training-mappings">
              //       Training Mappings
              //     </Link>
              //   ),
              // },
            ],
          },
          {
            key: "/users",
            icon: <TeamOutlined />,
            label: <Link to="/users">Users</Link>,
          },

          {
            key: "/courses",
            icon: <BookOutlined />,
            label: <Link to="/courses">Courses</Link>,
          },

          {
            key: "/roles",
            icon: <UserOutlined />,
            label: <Link to="/roles">Roles</Link>,
          },

          {
            key: "/notifications",
            icon: <BellOutlined />,
            label: <Link to="/notifications">Notifications</Link>,
          },
          {
            key: "/admin/notifications/create",
            icon: <NotificationOutlined/>,
            label: <Link to="/admin/notifications/create">Announcements</Link>,
          },
          {
            key: "/reports",
            icon: <FileTextOutlined />,
            label: <Link to="/reports">Reports</Link>,
          },
        ],
      },
    ];
  }, [isManagerOrAdmin]);
  const getRole = (roleName: string | undefined) => {
    // if (roleName === undefined) return navigate('/login');?s
    return roleName;
  };
  useEffect(() => {
    if (location.pathname.startsWith("/departments")) {
      setOpenKeys(["/departments-group"]);
    }
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("lms_theme", isDarkMode ? "dark" : "light");

    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);
  return (
    <Layout className="h-screen overflow-hidden">
      <Sider
        breakpoint="lg"
        collapsedWidth={0}
        width={270}
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        trigger={null}
        className="!bg-slate-950 h-screen overflow-y-auto"
      >
        <div className="p-5 text-xl font-bold text-white">LMS Portal</div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items}
          className="!bg-slate-950"
        />
      </Sider>

      <Layout className="h-screen overflow-hidden">
        <Header className="flex items-center justify-between border-b border-slate-100 !bg-white px-5">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="mr-3"
          />
          <Input.Search
            placeholder="Search courses, users, certificates"
            className="max-w-md"
          />

          <div className="flex items-center gap-5">
            <Badge count={unread}>
              <BellOutlined
                className="text-xl"
                onClick={() => navigate("/notifications")}
              />
            </Badge>

            <Dropdown
              menu={{
                items: [
                  { key: "profile", label: me?.user.full_name },
                  {
                    key: "role",
                    label: `Role: ${getRole(me?.role.role_name)}`,
                  },
                  { type: "divider" },
                  {
                    key: "logout",
                    label: "Logout",
                    onClick: () =>
                      logout.mutate(undefined, {
                        onSuccess: () => navigate("/login"),
                      }),
                  },
                ],
              }}
            >
              <Avatar className="cursor-pointer bg-blue-600">
                {me?.user.full_name?.[0] ?? "U"}
              </Avatar>
            </Dropdown>
          </div>
        </Header>

        <Content className="overflow-y-auto p-4 md:p-6">
          <Breadcrumb
            className="mb-4"
            items={location.pathname
              .split("/")
              .filter(Boolean)
              .map((x) => ({ title: x }))}
          />

          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
