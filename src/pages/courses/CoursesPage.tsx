import {
  Button,
  Drawer,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Upload,
  message,
} from "antd";
import {
  ClockCircleOutlined,
  EditOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import type { UploadFile } from "antd/es/upload/interface";

import { DataTable } from "../../components/common/DataTable";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import {
  useCreateCourse,
  useCourses,
  useUpdateCourse,
} from "../../hooks/useCourses";
import { CourseDetail } from "../../components/course-management/CourseDetail";
import { iconClass, primaryIconClass } from "../../common";
import Text from "antd/es/typography/Text";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";

function formatDuration(minutes?: number) {
  if (!minutes) return "0 min";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

function getFileFromUpload(fileList?: UploadFile[]) {
  return fileList?.[0]?.originFileObj;
}

function buildCourseFormData(values: any) {
  const formData = new FormData();

  if (values.course_title !== undefined) {
    formData.append("course_title", values.course_title || "");
  }

  if (values.course_description !== undefined) {
    formData.append("course_description", values.course_description || "");
  }

  if (values.course_type !== undefined) {
    formData.append("course_type", values.course_type || "");
  }

  if (values.total_duration_minutes !== undefined) {
    formData.append(
      "total_duration_minutes",
      String(values.total_duration_minutes),
    );
  }

  if (values.is_active !== undefined) {
    formData.append("is_active", String(values.is_active));
  }

  const thumbnailFile = getFileFromUpload(values.thumbnail);

  if (thumbnailFile) {
    formData.append("thumbnail", thumbnailFile);
  }

  return formData;
}

export function CoursesPage() {
  const { data, isLoading } = useCourses();
  const create = useCreateCourse();
  const update = useUpdateCourse();

  const { isDarkMode } = useThemeMode();

  const ui = {
    expandedRow: isDarkMode
      ? "rounded-xl border border-[#253249] bg-[#0F172A] p-4"
      : "rounded-xl border border-slate-200 bg-slate-50 p-4",

    thumbnailBox: isDarkMode
      ? "relative inline-block h-[50px] w-[80px] overflow-hidden rounded-lg bg-[#162238]"
      : "relative inline-block h-[50px] w-[80px] overflow-hidden rounded-lg bg-slate-100",

    previewBg: isDarkMode ? "#0B1220" : "#f5f5f5",

    text: isDarkMode ? "text-[#EAF0F7]" : "text-slate-900",

    editButton: isDarkMode
      ? "border-[#253249] bg-[#111C2E] text-[#EAF0F7]"
      : "",
  };

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

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
      thumbnail: course.thumbnail_url
        ? [
            {
              uid: "-1",
              name: "thumbnail",
              status: "done",
              url: course.thumbnail_url,
            },
          ]
        : [],
    });

    setEditOpen(true);
  };

  const closeCreateDrawer = () => {
    setCreateOpen(false);
    createForm.resetFields();
  };

  const closeEditDrawer = () => {
    setEditOpen(false);
    setSelectedCourse(null);
    editForm.resetFields();
  };

  const validateThumbnailBeforeUpload = (file: File) => {
    const isValidImage =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp";

    if (!isValidImage) {
      message.error("Thumbnail must be JPG, PNG, or WEBP");
      return Upload.LIST_IGNORE;
    }

    const isLessThan5MB = file.size / 1024 / 1024 < 5;

    if (!isLessThan5MB) {
      message.error("Thumbnail size must be less than 5MB");
      return Upload.LIST_IGNORE;
    }

    return false;
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

      <Table
        className={[
          "course-table-theme",
          isDarkMode ? "course-table-theme-dark" : "course-table-theme-light",
        ].join(" ")}
        loading={isLoading}
        dataSource={data}
        expandable={{
          expandedRowRender: (r: any) => (
            <div className={ui.expandedRow}>
              <CourseDetail courseId={r.course_id} />
            </div>
          ),
        }}
        columns={[
          {
            title: "Thumbnail",
            dataIndex: "thumbnail_url",
            width: 120,
            render: (thumbnailUrl: string) => {
              if (!thumbnailUrl) {
                return <Text type="secondary">-</Text>;
              }

              return (
                <div className={ui.thumbnailBox}>
                  <Image
                    src={thumbnailUrl}
                    alt="Course thumbnail"
                    width={80}
                    height={50}
                    className="block rounded-lg object-cover"
                    preview={false}
                  />

                  <Button
                    size="small"
                    shape="circle"
                    icon={<EyeOutlined className={primaryIconClass} />}
                    onClick={() => {
                      setPreviewImage(thumbnailUrl);
                      setPreviewOpen(true);
                    }}
                    className="absolute right-1 top-1 flex h-6 w-6 min-w-6 items-center justify-center border-none bg-white/90 p-0 shadow dark:bg-[#0F172A]/90"
                  />
                </div>
              );
            },
          },
          {
            title: "Course",
            dataIndex: "course_title",
            render: (value: string) => (
              <Text className={ui.text}>{value || "-"}</Text>
            ),
          },
          {
            title: "Type",
            dataIndex: "course_type",
            render: (value: string) => <Tag color="blue">{value || "-"}</Tag>,
          },
          {
            title: "Duration",
            dataIndex: "total_duration_minutes",
            render: (value: number) => (
              <Tooltip title={`${value || 0} minutes`}>
                <Tag icon={<ClockCircleOutlined className={iconClass} />}>
                  {formatDuration(value)}
                </Tag>
              </Tooltip>
            ),
          },
          {
            title: "Status",
            render: (_: unknown, record: any) => (
              <StatusTag value={record.is_active} />
            ),
          },
          {
            title: "Action",
            width: 120,
            render: (_: unknown, record: any) => (
              <Button
                icon={<EditOutlined className={iconClass} />}
                size="small"
                onClick={() => handleEdit(record)}
                className={ui.editButton}
              >
                Edit
              </Button>
            ),
          },
        ]}
      />

      <Modal
        open={previewOpen}
        footer={null}
        title="Course thumbnail"
        width={520}
        centered
        onCancel={() => {
          setPreviewOpen(false);
          setPreviewImage("");
        }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            overflow: "hidden",
            borderRadius: 12,
            background: ui.previewBg,
          }}
        >
          <Image
            src={previewImage}
            alt="Course thumbnail preview"
            width="100%"
            height="100%"
            style={{
              objectFit: "cover",
            }}
            preview={false}
          />
        </div>
      </Modal>

      <Drawer
        open={createOpen}
        onClose={closeCreateDrawer}
        title="Create course"
        width={520}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={(values) => {
            const formData = buildCourseFormData(values);

            create.mutate(formData, {
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
            });
          }}
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
                {
                  label: "Mandatory",
                  value: "mandatory",
                },
                {
                  label: "Role based",
                  value: "role_based",
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="total_duration_minutes"
            label="Total duration"
            rules={[
              {
                required: true,
                message: "Total duration is required",
              },
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

          <Form.Item
            name="thumbnail"
            label="Thumbnail"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
          >
            <Upload
              beforeUpload={validateThumbnailBeforeUpload}
              maxCount={1}
              accept="image/png,image/jpeg,image/webp"
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
            </Upload>
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" loading={create.isPending}>
              Save
            </Button>

            <Button onClick={closeCreateDrawer}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>

      <Drawer
        open={editOpen}
        onClose={closeEditDrawer}
        title="Edit course"
        width={520}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={(values) => {
            if (!selectedCourse?.course_id) {
              message.error("Course id missing");
              return;
            }

            const formData = buildCourseFormData(values);

            update.mutate(
              {
                id: selectedCourse.course_id,
                payload: formData,
              },
              {
                onSuccess: () => {
                  message.success("Course updated");
                  closeEditDrawer();
                },
                onError: (err: any) => {
                  message.error(
                    err?.response?.data?.error || "Failed to update course",
                  );
                },
              },
            );
          }}
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
                {
                  label: "Mandatory",
                  value: "mandatory",
                },
                {
                  label: "Role based",
                  value: "role_based",
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="total_duration_minutes"
            label="Total duration"
            rules={[
              {
                required: true,
                message: "Total duration is required",
              },
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
                {
                  label: "Active",
                  value: true,
                },
                {
                  label: "Inactive",
                  value: false,
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="thumbnail"
            label="Thumbnail"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
          >
            <Upload
              beforeUpload={validateThumbnailBeforeUpload}
              maxCount={1}
              accept="image/png,image/jpeg,image/webp"
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
            </Upload>
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" loading={update.isPending}>
              Update
            </Button>

            <Button onClick={closeEditDrawer}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}
