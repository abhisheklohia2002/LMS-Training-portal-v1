import {
  BellOutlined,
  BookOutlined,
  BuildOutlined,
  DashboardOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  NotificationOutlined,
  ReadOutlined,
  TeamOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
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
  Switch,
} from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useThemeMode } from "../context/ThemeProvider/ThemeProvider";
import { useEffect, useMemo, useState } from "react";
import { canManageLms } from "../utils/access";
import { useLogout, useMe } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";

const { Header, Sider, Content } = Layout;

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { isDarkMode, toggleTheme } = useThemeMode();

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const logout = useLogout();
  const { data: me } = useMe();
  const { data: notes } = useNotifications();

  const unread = notes?.filter((n) => !n.read_status).length ?? 0;

  const selectedKey = location.pathname;

  const role = me?.role?.role_name || localStorage.getItem("lms_role") || "";
  const isManagerOrAdmin = canManageLms(role);

  const sidebarBg = isDarkMode ? "#07111F" : "#FFFFFF";
  const sidebarHeaderBg = isDarkMode ? "#0F172A" : "#F8FAFC";
  const sidebarBorder = isDarkMode ? "rgba(255,255,255,0.1)" : "#E2E8F0";
  const logoBoxBg = isDarkMode ? "#FFFFFF" : "#F1F5F9";
  const portalText = isDarkMode ? "#CBD5E1" : "#64748B";

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
                key: "/departments/list",
                label: <Link to="/departments">Department List</Link>,
              },
              {
                key: "/departments/assignments",
                label: (
                  <Link to="/departments/assignments">
                    Department Assignments
                  </Link>
                ),
              },
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
            icon: <NotificationOutlined />,
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

  const normalizedSelectedKey = useMemo(() => {
    if (location.pathname === "/departments") {
      return "/departments/list";
    }

    if (location.pathname.startsWith("/departments/assignments")) {
      return "/departments/assignments";
    }

    return location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.startsWith("/departments")) {
      setOpenKeys(["/departments"]);
    } else {
      setOpenKeys([]);
    }
  }, [location.pathname]);

  return (
    <Layout className="h-screen overflow-hidden">
      <Sider
        breakpoint="lg"
        collapsedWidth={0}
        width={270}
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        trigger={null}
        style={{
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
        }}
        className="h-screen overflow-y-auto"
      >
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{
            background: sidebarHeaderBg,
            borderBottom: `1px solid ${sidebarBorder}`,
          }}
        >
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl shadow-md"
            style={{ background: logoBoxBg }}
          >
            <img
              src="/images/idea.png"
              alt="TripXL"
              className="h-7 w-auto object-contain"
            />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-xl font-extrabold tracking-wide">
              <span className="text-teal-500">Trip</span>
              <span className="text-orange-400">XL</span>
            </span>
            <span
              className="text-xs font-medium uppercase tracking-[0.22em]"
              style={{ color: portalText }}
            >
              LMS Portal
            </span>
          </div>
        </div>

        <Menu
          theme={isDarkMode ? "dark" : "light"}
          mode="inline"
          selectedKeys={[normalizedSelectedKey]}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
          items={items}
          className={isDarkMode ? "dark-sidebar-menu" : "light-sidebar-menu"}
          style={{
            background: sidebarBg,
            borderInlineEnd: "none",
            paddingTop: 12,
          }}
        />
      </Sider>

      <Layout className="h-screen overflow-hidden">
        <Header
          className="grid h-16 grid-cols-[auto_1fr_auto] items-center border-b px-5"
          style={{
            background: isDarkMode ? "#0F172A" : "#FFFFFF",
            borderColor: isDarkMode ? "#253249" : "#E2E8F0",
          }}
        >
          {/* Left */}
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>

          {/* Center */}
          <div className="flex justify-center">
            <Input.Search
              placeholder="Search courses, users, certificates"
              className="w-full max-w-xl"
              allowClear
            />
          </div>

          {/* Right */}
          <div className="flex items-center justify-end gap-5">
            <Switch
              checked={isDarkMode}
              onChange={toggleTheme}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
            />

            <Badge count={unread}>
              <BellOutlined
                className="cursor-pointer text-xl"
                onClick={() => navigate("/notifications")}
              />
            </Badge>

            <Dropdown
              menu={{
                items: [
                  {
                    key: "profile",
                    label: me?.user?.full_name || "User",
                  },
                  {
                    key: "role",
                    label: `Role: ${role || "N/A"}`,
                  },
                  {
                    type: "divider",
                  },
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
                {me?.user?.full_name?.[0] ?? "U"}
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
