import { useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "../../hooks/useDepartments";
import { CreateDepartmentPayload, Department } from "../../types";



const { Title, Text } = Typography;

type DepartmentFormValues = {
  department_name: string;
  description?: string;
  is_active: boolean;
};

export function DepartmentsPage() {
  const { data, isLoading } = useDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const [form] = Form.useForm<DepartmentFormValues>();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);

  const departments: Department[] = useMemo(() => {
    return data?.departments || data || [];
  }, [data]);

  const isSubmitting =
    createDepartment.isPending || updateDepartment.isPending;

  const openCreateModal = () => {
    setEditingDepartment(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (department: Department) => {
    setEditingDepartment(department);

    form.setFieldsValue({
      department_name: department.department_name,
      description: department.description,
      is_active: department.is_active,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDepartment(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload: CreateDepartmentPayload = {
        department_name: values.department_name.trim(),
        description: values.description?.trim() || "",
        is_active: values.is_active,
      };

      if (editingDepartment) {
        updateDepartment.mutate(
          {
            departmentId: editingDepartment.id,
            payload,
          },
          {
            onSuccess: () => {
              message.success("Department updated successfully");
              closeModal();
            },
            onError: (error: any) => {
              message.error(
                error?.response?.data?.error || "Department update failed",
              );
            },
          },
        );

        return;
      }

      createDepartment.mutate(payload, {
        onSuccess: () => {
          message.success("Department created successfully");
          closeModal();
        },
        onError: (error: any) => {
          message.error(
            error?.response?.data?.error || "Department creation failed",
          );
        },
      });
    } catch {
      // AntD will show validation errors
    }
  };

  const handleDelete = (departmentId: number) => {
    deleteDepartment.mutate(departmentId, {
      onSuccess: () => {
        message.success("Department deleted successfully");
      },
      onError: (error: any) => {
        message.error(
          error?.response?.data?.error || "Department delete failed",
        );
      },
    });
  };

  const columns = [
    {
      title: "Department",
      dataIndex: "department_name",
      key: "department_name",
      render: (value: string) => (
        <Space>
          <TeamOutlined />
          <Text strong>{value}</Text>
        </Space>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (value: string) => value || "-",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="green">ACTIVE</Tag>
        ) : (
          <Tag color="red">INACTIVE</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: unknown, record: Department) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete department?"
            description="This will delete/deactivate this department."
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteDepartment.isPending}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Text type="secondary">departments</Text>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Department Management
            </Title>
            <Text type="secondary">
              Create departments and use them for department-wise trainings and
              exams.
            </Text>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Create department
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={departments}
        pagination={{
          pageSize: 10,
        }}
      />

      <Modal
        open={modalOpen}
        title={editingDepartment ? "Edit Department" : "Create Department"}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingDepartment ? "Update" : "Create"}
        confirmLoading={isSubmitting}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            is_active: true,
          }}
        >
          <Form.Item
            label="Department name"
            name="department_name"
            rules={[
              {
                required: true,
                message: "Department name is required",
              },
              {
                min: 2,
                message: "Department name must be at least 2 characters",
              },
            ]}
          >
            <Input placeholder="Example: Sales" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Example: Sales and business development department"
            />
          </Form.Item>

          <Form.Item label="Active" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}