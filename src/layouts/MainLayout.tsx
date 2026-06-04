import {
  BellOutlined,
  BookOutlined,
  BuildOutlined,
  DashboardOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Breadcrumb, Dropdown, Input, Layout, Menu } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { canManageLms } from "../utils/access";
import { useLogout, useMe } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
const { Header, Sider, Content } = Layout;
export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: me } = useMe();
  const { data: notes } = useNotifications();
  const unread = notes?.filter((n) => !n.read_status).length ?? 0;
  const selectedKey = "/" + location.pathname.split("/")[1];
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
            key: "/courses",
            icon: <BookOutlined />,
            label: <Link to="/courses">Courses</Link>,
          },
          {
            key: "/users",
            icon: <TeamOutlined />,
            label: <Link to="/users">Users</Link>,
          },
         
          {
            key: "/roles",
            icon: <UserOutlined />,
            label: <Link to="/roles">Roles</Link>,
          },
           {
            key: "/departments",
            icon: <BuildOutlined />,
            label: <Link to="/departments">Departments</Link>,
           
          },
          {
            key: "/department-mappings",
            icon: <TeamOutlined />,
            label: <Link to="/department-mappings">Department Mappings</Link>,
          },
           {
            key:"/department-assignments",
            icon: <FileTextOutlined />,
            label: <Link to="/department-assignments">Department Assignments</Link>,
          },
          {
            key: "/mappings",
            icon: <FileTextOutlined />,
            label: <Link to="/mappings">Mappings</Link>,
          },
          {
            key: "/assignments",
            icon: <FileTextOutlined />,
            label: <Link to="/assignments">Assignments</Link>,
          },
          {
            key: "/assessments",
            icon: <FileProtectOutlined />,
            label: <Link to="/assessments">Assessments</Link>,
          },
         
          {
            key: "/certifications",
            icon: <SafetyCertificateOutlined />,
            label: <Link to="/certifications">Certifications</Link>,
          },
          {
            key: "/rules",
            icon: <SettingOutlined />,
            label: <Link to="/rules">Rules</Link>,
          },
          {
            key: "/notifications",
            icon: <BellOutlined />,
            label: <Link to="/notifications">Notifications</Link>,
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
  return (
    <Layout className="h-screen overflow-hidden">
      <Sider
        breakpoint="lg"
        collapsedWidth={0}
        width={270}
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
