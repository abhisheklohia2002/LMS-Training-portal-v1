import { useState } from "react";
import { Button, Drawer, Form, Input, Select, Space, message } from "antd";
import { DataTable } from "../common/DataTable";
import { StatusTag } from "../common/StatusTag";
import { ModulePdfCell } from "../modulePdfCell/ModulePdfCell";
import { useCreateModule, useModules } from "../../hooks/useModules";

type Props = {
  courseId: number;
};

export function CourseModulesTab({ courseId }: Props) {
  const { data: modules = [] } = useModules(courseId);
  const createModule = useCreateModule();

  const [moduleOpen, setModuleOpen] = useState(false);

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button type="primary" onClick={() => setModuleOpen(true)}>
          Add module
        </Button>
      </div>

      <DataTable
        dataSource={modules}
        columns={[
          { title: "Seq", dataIndex: "sequence_no" },
          { title: "Title", dataIndex: "module_title" },
          { title: "Due days", dataIndex: "due_days" },
          {
            title: "Active",
            render: (_, record: any) => <StatusTag value={record.is_active} />,
          },
          {
            title: "PDF / Thumbnail / Video",
            render: (_: any, record: any) => (
              <ModulePdfCell
                moduleId={record.module_id}
                moduleTitle={record.module_title}
                courseId={courseId}
              />
            ),
          },
        ]}
      />

      <Drawer
        open={moduleOpen}
        onClose={() => setModuleOpen(false)}
        title="Add module"
        width={520}
      >
        <Form
          layout="vertical"
          initialValues={{
            course_id: courseId,
            is_active: true,
            due_days: 2,
          }}
          onFinish={(values) =>
            createModule.mutate(
              {
                ...values,
                course_id: courseId,
                sequence_no: Number(values.sequence_no),
                due_days: Number(values.due_days),
              },
              {
                onSuccess: () => {
                  message.success("Module created");
                  setModuleOpen(false);
                },
              },
            )
          }
        >
          <Form.Item
            name="module_title"
            label="Module title"
            rules={[{ required: true, message: "Module title is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="module_description" label="Description">
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="sequence_no"
            label="Sequence no"
            rules={[{ required: true, message: "Sequence no is required" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item name="due_days" label="Due days">
            <Input type="number" />
          </Form.Item>

          <Form.Item name="is_active" label="Active">
            <Select
              options={[
                { label: "Active", value: true },
                { label: "Inactive", value: false },
              ]}
            />
          </Form.Item>

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={createModule.isPending}
            >
              Save module
            </Button>
            <Button onClick={() => setModuleOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}