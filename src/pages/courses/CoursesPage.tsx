import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Tabs,
  Tag,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { DataTable } from "../../components/common/DataTable";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import { useCreateCourse, useCourses } from "../../hooks/useCourses";
import { useCreateModule, useModules } from "../../hooks/useModules";
import { useAssessments } from "../../hooks/useAssessments";
import { useCertifications } from "../../hooks/useCertifications";
import { useUploadModulePdf } from "../../hooks/useuploadfile";
import ModulePdfCell from "../../components/modulePdfCell/ModulePdfCell";
function CourseDetail({ courseId }: { courseId: number }) {
  const { data: mods } = useModules(courseId);
  const { data: assessments } = useAssessments();
  const { data: certs } = useCertifications();
  const createModule = useCreateModule();
  const uploadModulePdf = useUploadModulePdf(courseId);
  const [moduleOpen, setModuleOpen] = useState(false);

  return (
    <>
      <Tabs
        items={[
          {
            key: "modules",
            label: "Modules",
            children: (
              <div>
                <div className="mb-3 flex justify-end">
                  <Button type="primary" onClick={() => setModuleOpen(true)}>
                    Add module
                  </Button>
                </div>
                <DataTable
                  dataSource={mods}
                  columns={[
                    { title: "Seq", dataIndex: "sequence_no" },
                    { title: "Title", dataIndex: "module_title" },
                    { title: "Due days", dataIndex: "due_days" },
                    {
                      title: "Active",
                      render: (_, r) => <StatusTag value={r.is_active} />,
                    },
                    {
                      title: "PDF",
                      render: (_: any, r: any) => (
                        <ModulePdfCell
                          moduleId={r.module_id}
                          moduleTitle={r.module_title}
                          courseId={courseId}
                        />
                      ),
                    },
                  ]}
                />
              </div>
            ),
          },
          {
            key: "assessments",
            label: "Assessments",
            children: (
              <DataTable
                dataSource={assessments?.filter(
                  (a) => a.course_id === courseId,
                )}
                columns={[
                  { title: "Title", dataIndex: "assessment_title" },
                  { title: "Passing", dataIndex: "passing_score" },
                ]}
              />
            ),
          },
          {
            key: "certs",
            label: "Certifications",
            children: (
              <DataTable
                dataSource={certs?.filter((c) => c.course_id === courseId)}
                columns={[
                  { title: "Name", dataIndex: "certification_name" },
                  { title: "Validity", dataIndex: "validity_days" },
                ]}
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
          initialValues={{ course_id: courseId, is_active: true }}
          onFinish={(v) =>
            createModule.mutate(
              { ...v, course_id: courseId },
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
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="module_description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="sequence_no"
            label="Sequence no"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item name="due_days" label="Due days" initialValue={2}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="is_active" label="Active" initialValue={true}>
            <Select
              options={[
                { label: "Active", value: true },
                { label: "Inactive", value: false },
              ]}
            />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Save module
            </Button>
            <Button onClick={() => setModuleOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}
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
