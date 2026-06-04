import { Button, Drawer, Form, Select, Space, Switch, message } from "antd";
import { useState } from "react";
import { DataTable } from "../../components/common/DataTable";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import { useRoles } from "../../hooks/useRoles";
import { useCourses } from "../../hooks/useCourses";
import {
  useCreateTrainingMapping,
  useTrainingMappings,
} from "../../hooks/useTrainingMappings";
import { findCourse, findRole } from "../../utils/lookup";
export function TrainingMappingsPage() {
  const { data, isLoading } = useTrainingMappings();
  const { data: roles } = useRoles();
  const { data: courses } = useCourses();
  const create = useCreateTrainingMapping();
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageHeader
        title="Training Mapping"
        subtitle="Map courses to roles for automatic assignment."
        actions={
          <Button type="primary" onClick={() => setOpen(true)}>
            Create mapping
          </Button>
        }
      />
      <DataTable
        loading={isLoading}
        dataSource={data}
        columns={[
          {
            title: "Role",
            render: (_, r) => findRole(roles, r.role_id)?.role_name,
          },
          {
            title: "Course",
            render: (_, r) => findCourse(courses, r.course_id)?.course_title,
          },
          {
            title: "Mandatory",
            render: (_, r) => <StatusTag value={r.is_mandatory} />,
          },
          { title: "Trigger", dataIndex: "assignment_trigger" },
          {
            title: "Active",
            render: (_, r) => <StatusTag value={r.active_flag} />,
          },
        ]}
      />
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Create mapping"
        width={520}
      >
        <Form
          layout="vertical"
          onFinish={(v) =>
            create.mutate(v, {
              onSuccess: () => {
                message.success("Mapping created");
                setOpen(false);
              },
            })
          }
        >
          <Form.Item name="role_id" label="Role" rules={[{ required: true }]}>
            <Select
              options={roles?.map((r) => ({
                label: r.role_name,
                value: r.role_id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="course_id"
            label="Course"
            rules={[{ required: true }]}
          >
            <Select
              options={courses?.map((c) => ({
                label: c.course_title,
                value: c.course_id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="assignment_trigger"
            label="Trigger"
            initialValue="on_joining"
          >
            <Select
              options={[
                { label: "On joining", value: "on_joining" },
                { label: "Role change", value: "role_change" },
                { label: "Manual", value: "manual" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="is_mandatory"
            label="Mandatory"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="active_flag"
            label="Active"
            valuePropName="checked"
            initialValue
          >
            <Switch />
          </Form.Item>
          <Space>
            <Button htmlType="submit" type="primary">
              Save
            </Button>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}
