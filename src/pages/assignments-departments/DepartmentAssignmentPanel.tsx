import {
  Button,
  DatePicker,
  Form,
  Select,
  Switch,
  Alert,
  message,
  Table,
  Tag,
  Space,
  Breadcrumb,
} from "antd";
import { useMemo, useState } from "react";
import dayjs from "dayjs";

import { useDepartments } from "../../hooks/useDepartments";
import { useCourses } from "../../hooks/useCourses";
import {
  useAssignCourseToDepartment,
  useDepartmentAssignments,
} from "../../hooks/useDepartmentAssignments";
import Text from "antd/es/typography/Text";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";
import { PageHeader } from "../../components/common/PageHeader";

export function DepartmentAssignmentPanel() {
  const [form] = Form.useForm();
    const { isDarkMode } = useThemeMode();
  
  const [result, setResult] = useState<any>(null);
   const ui = {
       breadcrumb: isDarkMode ? "text-slate-400" : "text-slate-500",
   }
  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartments();
  const { data: coursesData, isLoading: coursesLoading } = useCourses();

  const assignCourse = useAssignCourseToDepartment();

  const { data: assignmentsData, isLoading: assignmentsLoading } =
    useDepartmentAssignments();

  const assignments = useMemo(() => {
    if (Array.isArray(assignmentsData)) return assignmentsData;
    if (Array.isArray((assignmentsData as any)?.assignments)) {
      return (assignmentsData as any).assignments;
    }
    if (Array.isArray((assignmentsData as any)?.data)) {
      return (assignmentsData as any).data;
    }
    return [];
  }, [assignmentsData]);
  const departments = useMemo(() => {
    if (Array.isArray(departmentsData)) return departmentsData;
    if (Array.isArray((departmentsData as any)?.departments)) {
      return (departmentsData as any).departments;
    }
    if (Array.isArray((departmentsData as any)?.data)) {
      return (departmentsData as any).data;
    }
    return [];
  }, [departmentsData]);

  const courses = useMemo(() => {
    if (Array.isArray(coursesData)) return coursesData;
    if (Array.isArray((coursesData as any)?.courses)) {
      return (coursesData as any).courses;
    }
    if (Array.isArray((coursesData as any)?.data)) {
      return (coursesData as any).data;
    }
    return [];
  }, [coursesData]);

  const handleSubmit = (values: any) => {
    const payload = {
      department_id: values.department_id,
      course_id: values.course_id,
      assigned_by_user_id: 1,
      is_mandatory: values.is_mandatory ?? true,
      due_date: values.due_date
        ? dayjs(values.due_date).toISOString()
        : undefined,
    };

    assignCourse.mutate(payload, {
      onSuccess: (res: any) => {
        message.success("Course assigned to department");
        setResult(res?.result || res?.data || res);
        form.resetFields();
      },
      onError: (error: any) => {
        message.error(
          error?.response?.data?.error || "Department assignment failed",
        );
      },
    });
  };

  return (
    <div>
      <div className="mb-3">
        <Breadcrumb
          className={ui.breadcrumb}
          items={[
            {
              title: "Dashboard",
            },
            {
              title: "Learning",
            },
            {
              title: "Department Assignment",
            },
          ]}
        />
      </div>
      <PageHeader
              title="Department Assignment"
              subtitle="Assign courses to specific departments."
            />
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          is_mandatory: true,
        }}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Form.Item
          name="department_id"
          label="Department"
          rules={[{ required: true, message: "Department is required" }]}
        >
          <Select
            placeholder="Select department"
            loading={departmentsLoading}
            options={departments.map((d: any) => ({
              label: d.department_name || d.name,
              value: d.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="course_id"
          label="Course"
          rules={[{ required: true, message: "Course is required" }]}
        >
          <Select
            placeholder="Select course"
            loading={coursesLoading}
            options={courses.map((c: any) => ({
              label: c.course_title,
              value: c.course_id || c.id,
            }))}
          />
        </Form.Item>

        <Form.Item name="due_date" label="Due date">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="is_mandatory"
          label="Mandatory"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item label=" ">
          <Button
            htmlType="submit"
            type="primary"
            loading={assignCourse.isPending}
          >
            Assign to Department
          </Button>
        </Form.Item>
      </Form>

      <Table
        rowKey="assignment_id"
        loading={assignmentsLoading}
        dataSource={assignments}
        columns={[
          {
            title: "Entity",
            render: (_: unknown, record: any) => (
              <Space>
                <Text>{record.department?.entity?.entity_name || "-"}</Text>
              </Space>
            ),
          },

          {
            title: "Department",
            render: (_: unknown, record: any) => (
              <Space>
                <Text>{record.department?.department_name || "-"}</Text>
              </Space>
            ),
          },
          {
            title: "User",
            render: (_: unknown, record: any) => (
              <Space>
                <Text>
                  {record.user?.name || record.user?.full_name || "-"}
                </Text>
              </Space>
            ),
          },
          {
            title: "Course",
            render: (_: unknown, record: any) => (
              <Space>
                <Text>{record.course?.course_title || "-"}</Text>
              </Space>
            ),
          },
          {
            title: "Source",
            dataIndex: "assignment_source",
            render: (_: unknown, record: any) => (
              <Space>
                <Text>{record.assignment_source || "-"}</Text>
              </Space>
            ),
          },
          {
            title: "Mandatory",
            dataIndex: "is_mandatory",
            render: (value: boolean) =>
              value ? <Tag color="blue">YES</Tag> : <Tag>NO</Tag>,
          },
          {
            title: "Status",
            dataIndex: "status",
            render: (value: string) => <Tag color="green">{value}</Tag>,
          },
        ]}
      />
    </div>
  );
}
