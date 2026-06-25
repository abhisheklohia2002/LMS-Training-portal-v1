  import { useState } from "react";
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
  import { DataTable } from "../common/DataTable";
  import { StatusTag } from "../common/StatusTag";
  import { ModulePdfCell } from "../modulePdfCell/ModulePdfCell";
  import {
    useCreateModule,
    useModules,
    useUpdateModule,
  } from "../../hooks/useModules";

  type Props = {
    courseId: number;
  };

  function formatDuration(minutes?: number) {
    if (!minutes) return "0 min";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  }

  export function CourseModulesTab({ courseId }: Props) {
    const { data: modules = [] } = useModules(courseId);
    const createModule = useCreateModule();
    const updateModule = useUpdateModule();

    const [moduleOpen, setModuleOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState<any>(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const handleEdit = (record: any) => {
      setSelectedModule(record);

      editForm.setFieldsValue({
        course_id: courseId,
        module_title: record.module_title,
        module_description: record.module_description,
        sequence_no: record.sequence_no,
        duration_minutes: record.duration_minutes,
        due_days: record.due_days,
        is_active: record.is_active,
      });

      setEditOpen(true);
    };

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
    { title: "Seq", dataIndex: "sequence_no", width: 70 },
    {
      title: "Title",
      dataIndex: "module_title",
      width: 120,
      render: (value: string) => (
        <Tooltip title={value}>
          <span
            style={{
              display: "inline-block",
              maxWidth: 80,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              verticalAlign: "middle",
            }}
          >
            {value || "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration_minutes",
      width: 120,
      render: (v: number) => (
        <Tooltip title={`${v || 0} minutes`}>
          <Tag icon={<ClockCircleOutlined />}>{formatDuration(v)}</Tag>
        </Tooltip>
      ),
    },
    { title: "Due days", dataIndex: "due_days", width: 90 },
    {
      title: "Active",
      width: 100,
      render: (_: any, record: any) => (
        <StatusTag value={record.is_active} />
      ),
    },
    {
      title: "PDF / Thumbnail / Video",
      width: 380,
      render: (_: any, record: any) => (
        <ModulePdfCell
          moduleId={record.module_id}
          moduleTitle={record.module_title}
          courseId={courseId}
        />
      ),
    },
    {
      title: "Action",
      width: 100,
      align: "center",
      render: (_: any, record: any) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>
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
            form={createForm}
            layout="vertical"
            initialValues={{
              course_id: courseId,
              is_active: true,
              due_days: 2,
              duration_minutes: 60,
            }}
            onFinish={(values) =>
              createModule.mutate(
                {
                  ...values,
                  course_id: courseId,
                  sequence_no: Number(values.sequence_no),
                  duration_minutes: Number(values.duration_minutes),
                  due_days: Number(values.due_days),
                },
                {
                  onSuccess: () => {
                    message.success("Module created");
                    createForm.resetFields();
                    setModuleOpen(false);
                  },
                  onError: (err: any) => {
                    message.error(
                      err?.response?.data?.error || "Failed to create module",
                    );
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
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="sequence_no"
              label="Sequence no"
              rules={[
                { required: true, message: "Sequence no is required" },
                {
                  type: "number",
                  min: 1,
                  message: "Sequence no must be greater than 0",
                },
              ]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="duration_minutes"
              label="Duration"
              rules={[
                { required: true, message: "Duration is required" },
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
                placeholder="Example: 100"
              />
            </Form.Item>

            <Form.Item name="due_days" label="Due days">
              <InputNumber min={0} style={{ width: "100%" }} />
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

        <Drawer
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title="Edit module"
          width={520}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={(values) =>
              updateModule.mutate(
                {
                  id: selectedModule.module_id,
                  payload: {
                    ...values,
                    course_id: courseId,
                    sequence_no: Number(values.sequence_no),
                    duration_minutes: Number(values.duration_minutes),
                    due_days: Number(values.due_days),
                  },
                },
                {
                  onSuccess: () => {
                    message.success("Module updated");
                    setEditOpen(false);
                    setSelectedModule(null);
                  },
                  onError: (err: any) => {
                    message.error(
                      err?.response?.data?.error || "Failed to update module",
                    );
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
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="sequence_no"
              label="Sequence no"
              rules={[
                { required: true, message: "Sequence no is required" },
                {
                  type: "number",
                  min: 1,
                  message: "Sequence no must be greater than 0",
                },
              ]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="duration_minutes"
              label="Duration"
              rules={[
                { required: true, message: "Duration is required" },
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
                placeholder="Example: 100"
              />
            </Form.Item>

            <Form.Item name="due_days" label="Due days">
              <InputNumber min={0} style={{ width: "100%" }} />
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
                loading={updateModule.isPending}
              >
                Update module
              </Button>
              <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            </Space>
          </Form>
        </Drawer>
      </>
    );
  }
