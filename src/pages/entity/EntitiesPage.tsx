import { useMemo, useState } from "react";
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
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import {
  useCreateEntity,
  useDeleteEntity,
  useEntities,
  useUpdateEntity,
} from "../../hooks/useEntities";
import { CreateEntityPayload, Entity } from "../../types";
import { primaryIconClass } from "../../common";

const { Title, Text } = Typography;

type EntityFormValues = {
  entity_name: string;
  entity_type?: string;
  description?: string;
  is_active: boolean;
};

export function EntitiesPage() {
  const { data, isLoading } = useEntities();
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();
  const deleteEntity = useDeleteEntity();

  const [form] = Form.useForm<EntityFormValues>();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);

  const entities: Entity[] = useMemo(() => {
    return data?.entities || data || [];
  }, [data]);

  const isSubmitting = createEntity.isPending || updateEntity.isPending;

  const openCreateModal = () => {
    setEditingEntity(null);
    form.resetFields();
    form.setFieldsValue({
      entity_type: "company",
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (entity: Entity) => {
    setEditingEntity(entity);

    form.setFieldsValue({
      entity_name: entity.entity_name,
      entity_type: entity.entity_type || "company",
      description: entity.description,
      is_active: entity.is_active,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEntity(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload: CreateEntityPayload = {
        entity_name: values.entity_name.trim(),
        entity_type: values.entity_type?.trim() || "",
        description: values.description?.trim() || "",
        is_active: values.is_active,
      };

      if (editingEntity) {
        updateEntity.mutate(
          {
            entityId: editingEntity.id,
            payload,
          },
          {
            onSuccess: () => {
              message.success("Entity updated successfully");
              closeModal();
            },
            onError: (error: any) => {
              message.error(
                error?.response?.data?.error ||
                  error?.response?.data?.message ||
                  "Entity update failed",
              );
            },
          },
        );

        return;
      }

      createEntity.mutate(payload, {
        onSuccess: () => {
          message.success("Entity created successfully");
          closeModal();
        },
        onError: (error: any) => {
          message.error(
            error?.response?.data?.error ||
              error?.response?.data?.message ||
              "Entity creation failed",
          );
        },
      });
    } catch {
      // AntD will show validation errors
    }
  };

  const handleDelete = (entityId: number) => {
    deleteEntity.mutate(entityId, {
      onSuccess: () => {
        message.success("Entity deleted successfully");
      },
      onError: (error: any) => {
        message.error(
          error?.response?.data?.error ||
            error?.response?.data?.message ||
            "Entity delete failed",
        );
      },
    });
  };

  const columns = [
    {
      title: "Entity",
      dataIndex: "entity_name",
      key: "entity_name",
      render: (value: string) => (
        <Space>
          <ApartmentOutlined className={primaryIconClass} />
          <Text strong>{value}</Text>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "entity_type",
      key: "entity_type",
      render: (value: string) => (
        <Space>
          <Text>{value}</Text>
        </Space>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (value: string) => (
        <Space>
          <Text>{value}</Text>
        </Space>
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
      width: 200,
      render: (_: unknown, record: Entity) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete entity?"
            description="This will delete/deactivate this entity."
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteEntity.isPending}
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
        <Text type="secondary">entities</Text>

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
              Entity Management
            </Title>
            <Text type="secondary">
              Create entities and use them to organize departments, users, and
              training flows.
            </Text>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Create entity
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={entities}
        pagination={{
          pageSize: 10,
        }}
      />

      <Modal
        open={modalOpen}
        title={editingEntity ? "Edit Entity" : "Create Entity"}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingEntity ? "Update" : "Create"}
        confirmLoading={isSubmitting}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            entity_type: "company",
            is_active: true,
          }}
        >
          <Form.Item
            label="Entity name"
            name="entity_name"
            rules={[
              {
                required: true,
                message: "Entity name is required",
              },
              {
                min: 2,
                message: "Entity name must be at least 2 characters",
              },
            ]}
          >
            <Input placeholder="Example: TripXL Holidays Private Limited" />
          </Form.Item>

          <Form.Item
            label="Entity type"
            name="entity_type"
            rules={[
              {
                required: true,
                message: "Entity type is required",
              },
            ]}
          >
            <Select
              placeholder="Select entity type"
              options={[
                {
                  label: "Company",
                  value: "company",
                },
                {
                  label: "Branch",
                  value: "branch",
                },
                {
                  label: "Partner",
                  value: "partner",
                },
                {
                  label: "Vendor",
                  value: "vendor",
                },
                {
                  label: "Franchise",
                  value: "franchise",
                },
              ]}
            />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Example: Main company entity"
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
