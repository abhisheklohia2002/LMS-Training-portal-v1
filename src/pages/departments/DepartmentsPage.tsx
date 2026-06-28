import { useMemo, useRef, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
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
  UploadOutlined,
} from "@ant-design/icons";
import { useEntities } from "../../hooks/useEntities";
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "../../hooks/useDepartments";
import { CreateDepartmentPayload, Department, Entity } from "../../types";
import { useBulkUploadUsersToDepartment } from "../../hooks/useDepartmentTrainingMappings";
import { primaryIconClass } from "../../common";

const { Title, Text } = Typography;

type DepartmentFormValues = {
  department_name: string;
  description?: string;
  is_active: boolean;
  entity_id: number;
};

export function DepartmentsPage() {
  const { data, isLoading } = useDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const bulkUploadUsersToDepartment = useBulkUploadUsersToDepartment();

  const { data: entityData, isLoading: isEntitiesLoading } = useEntities();

  const [form] = Form.useForm<DepartmentFormValues>();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );

  const [selectedUploadDepartment, setSelectedUploadDepartment] =
    useState<Department | null>(null);

  const departments: Department[] = useMemo(() => {
    return data?.departments || data || [];
  }, [data]);

  const entities: Entity[] = useMemo(() => {
    if (Array.isArray(entityData)) return entityData;
    if (Array.isArray(entityData?.entities)) return entityData.entities;
    if (Array.isArray(entityData?.data)) return entityData.data;

    return [];
  }, [entityData]);

  const isSubmitting = createDepartment.isPending || updateDepartment.isPending;

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
      entity_id: department.entity_id,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDepartment(null);
    form.resetFields();
  };

  const openUserUpload = (department: Department) => {
    setSelectedUploadDepartment(department);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleUserFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!selectedUploadDepartment) {
      message.error("Please select department first");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      message.error("Only .xlsx files are allowed");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    bulkUploadUsersToDepartment.mutate(
      {
        departmentId: selectedUploadDepartment.id,
        file,
      },
      {
        onSuccess: (response: any) => {
          message.success(
            `Upload completed. Success: ${
              response?.success_count || 0
            }, Failed: ${response?.failed_count || 0}`,
          );

          if (response?.errors?.length) {
            console.table(response.errors);
          }

          setSelectedUploadDepartment(null);

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
        onError: (error: any) => {
          message.error(
            error?.response?.data?.error ||
              error?.response?.data?.message ||
              "User upload failed",
          );

          setSelectedUploadDepartment(null);

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      },
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload: CreateDepartmentPayload = {
        department_name: values.department_name.trim(),
        description: values.description?.trim() || "",
        is_active: values.is_active,
        entity_id: values.entity_id,
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
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (value: number) => <Text strong>{value}</Text>,
    },
    {
      title: "Department",
      dataIndex: "department_name",
      key: "department_name",
      render: (value: string) => (
        <Space>
          <TeamOutlined className={primaryIconClass} />
          <Text strong>{value}</Text>
        </Space>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (value: string) => (
        <Text type={value ? undefined : "secondary"}>{value || "-"}</Text>
      ),
    },
    {
      title: "Entity",
      dataIndex: "entity",
      key: "entity",
      render: (_: unknown, record: Department) => (
        <Text>{record.entity?.entity_name || record.entity_id || "-"}</Text>
      ),
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
      width: 340,
      render: (_: unknown, record: Department) => (
        <Space wrap>
          <Button
            size="small"
            icon={<UploadOutlined />}
            loading={
              bulkUploadUsersToDepartment.isPending &&
              selectedUploadDepartment?.id === record.id
            }
            onClick={() => openUserUpload(record)}
          >
            Upload Users
          </Button>

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

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        hidden
        onChange={handleUserFileUpload}
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
            label="Entity"
            name="entity_id"
            rules={[
              {
                required: true,
                message: "Entity is required",
              },
            ]}
          >
            <Select
              showSearch
              loading={isEntitiesLoading}
              placeholder="Select entity"
              optionFilterProp="label"
              options={entities
                .filter((entity: Entity) => entity.is_active)
                .map((entity: Entity) => ({
                  label: entity.entity_name,
                  value: entity.id,
                }))}
            />
          </Form.Item>

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
