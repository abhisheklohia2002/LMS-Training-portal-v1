import { Button, Drawer, Form, Input, Select, Space, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";

import { DataTable } from "../../components/common/DataTable";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";

import { useCreateUser, useUpdateUser, useUsers } from "../../hooks/useUsers";
import { useRoles } from "../../hooks/useRoles";
import { useDepartments } from "../../hooks/useDepartments";

import { findRole } from "../../utils/lookup";

type Role = {
  role_id?: number;
  id?: number;
  role_name: string;
};

type Department = {
  id: number;
  department_name: string;
};

type User = {
  id?: number;
  user_id?: number;
  full_name: string;
  name?: string;
  email: string;
  employee_code?: string;
  role_id: number;
  department_id?: number;
  department?: Department;
  status: string;
};

type UserFormValues = {
  full_name: string;
  email: string;
  password?: string;
  employee_code?: string;
  role_id: number;
  department_id?: number;
  status: string;
};

export function UsersPage() {
  const { data, isLoading } = useUsers();
  const { data: roles } = useRoles();
  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartments();

  const create = useCreateUser();
  const update = useUpdateUser();

  const [form] = Form.useForm<UserFormValues>();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const users: User[] = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any)?.data)) return (data as any).data;
    if (Array.isArray((data as any)?.users)) return (data as any).users;
    return [];
  }, [data]);

  const departments = useMemo(() => {
    if (Array.isArray(departmentsData)) return departmentsData;
    if (Array.isArray((departmentsData as any)?.data))
      return (departmentsData as any).data;
    if (Array.isArray((departmentsData as any)?.departments))
      return (departmentsData as any).departments;
    return [];
  }, [departmentsData]);

  const isEditMode = !!editingUser;

  const openCreateDrawer = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      status: "active",
    });
    setOpen(true);
  };

  const openEditDrawer = (user: User) => {
    setEditingUser(user);

    form.setFieldsValue({
      full_name: user.full_name || user.name || "",
      email: user.email,
      password: "",
      employee_code: user.employee_code || "",
      role_id: user.role_id,
      department_id: user.department_id || user.department?.id,
      status: user.status || "active",
    });

    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const getUserId = (user: User) => {
    return user.id || user.user_id;
  };

  const handleSubmit = (values: UserFormValues) => {
    const payload: any = {
      full_name: values.full_name?.trim(),
      name: values.full_name?.trim(), // keeps old backend compatible
      email: values.email?.trim(),
      employee_code: values.employee_code?.trim() || "",
      role_id: values.role_id,
      department_id: values.department_id,
      status: values.status || "active",
    };

    if (!isEditMode) {
      payload.password = values.password;
    }

    if (isEditMode && editingUser) {
      const userId = getUserId(editingUser);

      if (!userId) {
        message.error("User id missing");
        return;
      }

      update.mutate(
        {
          id: userId,
          payload,
        },
        {
          onSuccess: () => {
            message.success("User updated");
            closeDrawer();
          },
          onError: (error: any) => {
            message.error(error?.response?.data?.error || "User update failed");
          },
        },
      );

      return;
    }

    create.mutate(payload, {
      onSuccess: () => {
        message.success("User created");
        closeDrawer();
      },
      onError: (error: any) => {
        message.error(error?.response?.data?.error || "User creation failed");
      },
    });
  };

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Search, create and manage learners, managers and admins."
        actions={
          <Button type="primary" onClick={openCreateDrawer}>
            Create user
          </Button>
        }
      />

      <DataTable
        loading={isLoading}
        dataSource={users}
        columns={[
          {
            title: "Name",
            render: (_: unknown, r: User) => r.full_name || r.name || "-",
          },
          {
            title: "Email",
            dataIndex: "email",
          },
          {
            title: "Employee Code",
            dataIndex: "employee_code",
          },
          {
            title: "Role",
            render: (_: unknown, r: User) =>
              findRole(roles, r.role_id)?.role_name || "-",
          },
          {
            title: "Department",
            render: (_: unknown, r: any) => {
              return r.department?.department_name || r.department?.name || "-";
            },
          },
          {
            title: "Status",
            render: (_: unknown, r: User) => <StatusTag value={r.status} />,
          },
          {
            title: "Actions",
            render: (_: unknown, r: User) => (
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEditDrawer(r)}
              >
                Edit
              </Button>
            ),
          },
        ]}
      />

      <Drawer
        open={open}
        onClose={closeDrawer}
        title={isEditMode ? "Edit user" : "Create user"}
        width={480}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="full_name"
            label="Full name"
            rules={[
              {
                required: true,
                message: "Full name is required",
              },
            ]}
          >
            <Input placeholder="Example: David Kumar" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "Email is required",
              },
              {
                type: "email",
                message: "Enter a valid email",
              },
            ]}
          >
            <Input placeholder="Example: david@test.com" />
          </Form.Item>

          {!isEditMode && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Password is required",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters",
                },
              ]}
            >
              <Input.Password placeholder="Minimum 6 characters" />
            </Form.Item>
          )}

          <Form.Item name="employee_code" label="Employee code">
            <Input placeholder="Example: EMP001" />
          </Form.Item>

          <Form.Item
            name="role_id"
            label="Role"
            rules={[
              {
                required: true,
                message: "Role is required",
              },
            ]}
          >
            <Select
              placeholder="Select role"
              options={roles?.map((r: Role) => ({
                label: r.role_name,
                value: r.role_id || r.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="department_id"
            label="Department"
            rules={[
              {
                required: true,
                message: "Department is required",
              },
            ]}
          >
            <Select
              placeholder="Select department"
              loading={departmentsLoading}
              options={departments.map((d: any) => ({
                label: d.department_name,
                value: d.id,
              }))}
            />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="active">
            <Select
              options={[
                {
                  label: "Active",
                  value: "active",
                },
                {
                  label: "Inactive",
                  value: "inactive",
                },
              ]}
            />
          </Form.Item>

          <Space>
            <Button
              htmlType="submit"
              type="primary"
              loading={create.isPending || update.isPending}
            >
              {isEditMode ? "Update" : "Save"}
            </Button>

            <Button onClick={closeDrawer}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}
