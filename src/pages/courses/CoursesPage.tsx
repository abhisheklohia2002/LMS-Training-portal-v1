import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Tag,
  message,
} from "antd";
import { useState } from "react";
import { DataTable } from "../../components/common/DataTable";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import { useCreateCourse, useCourses } from "../../hooks/useCourses";
import { CourseDetail } from "../../components/course-management/CourseDetail";

export function CoursesPage() {
  const { data, isLoading } = useCourses();
  const create = useCreateCourse();
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageHeader
        title="Course Management"
        subtitle="Create courses and manage modules, assessments and certificates."
        actions={
          <Button type="primary" onClick={() => setOpen(true)}>
            Create course
          </Button>
        }
      />
      <DataTable
        loading={isLoading}
        dataSource={data}
        expandable={{
          expandedRowRender: (r) => <CourseDetail courseId={r.course_id} />,
        }}
        columns={[
          { title: "Course", dataIndex: "course_title" },
          {
            title: "Type",
            dataIndex: "course_type",
            render: (v) => <Tag>{v}</Tag>,
          },
          {
            title: "Status",
            render: (_, r) => <StatusTag value={r.is_active} />,
          },
        ]}
      />
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Create course"
        width={520}
      >
        <Form
          layout="vertical"
          onFinish={(v) =>
            create.mutate(v, {
              onSuccess: () => {
                message.success("Course created");
                setOpen(false);
              },
            })
          }
        >
          <Form.Item
            name="course_title"
            label="Course title"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="course_description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="course_type" label="Type" initialValue="mandatory">
            <Select
              options={[
                { label: "Mandatory", value: "mandatory" },
                { label: "Role based", value: "role_based" },
              ]}
            />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}
