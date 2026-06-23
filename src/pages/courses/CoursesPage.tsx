import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  Tooltip,
  message,
} from "antd";
import { ClockCircleOutlined, EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import { DataTable } from "../../components/common/DataTable";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import {
  useCreateCourse,
  useCourses,
  useUpdateCourse,
} from "../../hooks/useCourses";
import { CourseDetail } from "../../components/course-management/CourseDetail";

function formatDuration(minutes?: number) {
  if (!minutes) return "0 min";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

export function CoursesPage() {
  const { data, isLoading } = useCourses();
  const create = useCreateCourse();
  const update = useUpdateCourse();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const handleEdit = (course: any) => {
    setSelectedCourse(course);

    editForm.setFieldsValue({
      course_title: course.course_title,
      course_description: course.course_description,
      course_type: course.course_type,
      total_duration_minutes: course.total_duration_minutes,
      is_active: course.is_active,
    });

    setEditOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Course Management"
        subtitle="Create courses and manage modules, assessments and certificates."
        actions={
          <Button type="primary" onClick={() => setCreateOpen(true)}>
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
          {
            title: "Course",
            dataIndex: "course_title",
          },
          {
            title: "Type",
            dataIndex: "course_type",
            render: (v) => <Tag>{v}</Tag>,
          },
          {
            title: "Duration",
            dataIndex: "total_duration_minutes",
            render: (v) => (
              <Tooltip title={`${v || 0} minutes`}>
                <Tag icon={<ClockCircleOutlined />}>{formatDuration(v)}</Tag>
              </Tooltip>
            ),
          },
          {
            title: "Status",
            render: (_, r) => <StatusTag value={r.is_active} />,
          },
          {
            title: "Action",
            render: (_, r) => (
              <Button
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(r)}
              >
                Edit
              </Button>
            ),
          },
        ]}
      />

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create course"
        width={520}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={(v) =>
            create.mutate(v, {
              onSuccess: () => {
                message.success("Course created");
                createForm.resetFields();
                setCreateOpen(false);
              },
              onError: (err: any) => {
                message.error(
                  err?.response?.data?.error || "Failed to create course",
                );
              },
            })
          }
        >
          <Form.Item
            name="course_title"
            label="Course title"
            rules={[{ required: true, message: "Course title is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="course_description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="course_type"
            label="Type"
            initialValue="mandatory"
            rules={[{ required: true, message: "Course type is required" }]}
          >
            <Select
              options={[
                { label: "Mandatory", value: "mandatory" },
                { label: "Role based", value: "role_based" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="total_duration_minutes"
            label="Total duration"
            rules={[
              { required: true, message: "Total duration is required" },
              {
                type: "number",
                min: 1,
                message: "Duration must be greater than 0",
              },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              addonBefore={<ClockCircleOutlined />}
              addonAfter="minutes"
              placeholder="Example: 300"
            />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" loading={create.isPending}>
              Save
            </Button>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>

      <Drawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit course"
        width={520}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={(v) =>
            update.mutate(
              {
                id: selectedCourse.course_id,
                payload: v,
              },
              {
                onSuccess: () => {
                  message.success("Course updated");
                  setEditOpen(false);
                  setSelectedCourse(null);
                },
                onError: (err: any) => {
                  message.error(
                    err?.response?.data?.error || "Failed to update course",
                  );
                },
              },
            )
          }
        >
          <Form.Item
            name="course_title"
            label="Course title"
            rules={[{ required: true, message: "Course title is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="course_description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="course_type"
            label="Type"
            rules={[{ required: true, message: "Course type is required" }]}
          >
            <Select
              options={[
                { label: "Mandatory", value: "mandatory" },
                { label: "Role based", value: "role_based" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="total_duration_minutes"
            label="Total duration"
            rules={[
              { required: true, message: "Total duration is required" },
              {
                type: "number",
                min: 1,
                message: "Duration must be greater than 0",
              },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              addonBefore={<ClockCircleOutlined />}
              addonAfter="minutes"
              placeholder="Example: 300"
            />
          </Form.Item>

          <Form.Item name="is_active" label="Status">
            <Select
              options={[
                { label: "Active", value: true },
                { label: "Inactive", value: false },
              ]}
            />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" loading={update.isPending}>
              Update
            </Button>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}
