import { Button, Card, Form, Input, Space, Table, message } from "antd";
import { useState } from "react";
import { DataTable } from "../../components/common/DataTable";
import { FormDrawer } from "../../components/common/FormDrawer";
import { PageHeader } from "../../components/common/PageHeader";
import { useCreateRole, useRoles } from "../../hooks/useRoles";
import { useTrainingMappings } from "../../hooks/useTrainingMappings";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";
import Text from "antd/es/typography/Text";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
export function RolesPage() {
  const { isDarkMode } = useThemeMode();

  const ui = {
  text: isDarkMode ? "text-[#EAF0F7]" : "text-slate-900",

  actionButton: isDarkMode
    ? "border-[#253249] bg-[#111C2E] text-[#EAF0F7] hover:!border-[#22C7B8] hover:!text-[#22C7B8]"
    : "border-slate-300 bg-white text-slate-700 hover:!border-[#109B9C] hover:!text-[#109B9C]",

  expandButton: isDarkMode
    ? "border-[#253249] bg-[#111C2E] text-[#EAF0F7] hover:!border-[#22C7B8] hover:!text-[#22C7B8]"
    : "border-slate-300 bg-white text-slate-700 hover:!border-[#109B9C] hover:!text-[#109B9C]",

  expandedCard: isDarkMode
    ? "border-[#253249] bg-[#0F172A] text-[#EAF0F7]"
    : "border-slate-200 bg-slate-50 text-slate-900",
};
  const { data, isLoading } = useRoles();
  const { data: mappings } = useTrainingMappings();
  const create = useCreateRole();
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageHeader
        title="Role Management"
        subtitle="Roles drive mapped courses and learner assignments."
        actions={
          <Button type="primary" onClick={() => setOpen(true)}>
            Create role
          </Button>
        }
      />
     <Table
  loading={isLoading}
  dataSource={data}
  rowKey="role_id"
  expandable={{
    expandedRowRender: (r) => (
      <Card size="small" className={ui.expandedCard}>
        <Text className={ui.text}>
          Mapped courses:{" "}
          {mappings?.filter((m) => m.role_id === r.role_id).length ?? 0}
        </Text>
      </Card>
    ),

    expandIcon: ({ expanded, onExpand, record }) => (
      <Button
        size="small"
        // type={expanded ? "primary" : "default"}
        icon={expanded ? <MinusOutlined /> : <PlusOutlined />}
        onClick={(event) => onExpand(record, event)}
        className={ui.expandButton}
      />
    ),
  }}
  columns={[
    {
      title: "Role",
      dataIndex: "role_name",
      render: (text: string) => (
        <Text className={ui.text}>{text || "-"}</Text>
      ),
    },
    {
      title: "Type",
      dataIndex: "role_type",
      render: (text: string) => (
        <Text className={ui.text}>{text || "-"}</Text>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (text: string) => (
        <Text className={ui.text}>{text || "-"}</Text>
      ),
    },
  ]}
/>
      <FormDrawer
        title="Create role"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Form
          layout="vertical"
          onFinish={(v) =>
            create.mutate(v, {
              onSuccess: () => {
                message.success("Role created");
                setOpen(false);
              },
            })
          }
        >
          <Form.Item
            name="role_name"
            label="Role name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role_type"
            label="Role type"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </FormDrawer>
    </>
  );
}
