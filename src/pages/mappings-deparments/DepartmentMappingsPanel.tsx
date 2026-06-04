import { Button, Form, Select, Space, Switch, Table, Tag, message } from "antd";
import { useMemo } from "react";

import { useDepartments } from "../../hooks/useDepartments";
import { useCourses } from "../../hooks/useCourses";
import {
  useCreateDepartmentTrainingMapping,
  useDepartmentTrainingMappings,
} from "../../hooks/useDepartmentTrainingMappings";

type Department = {
  id: number;
  department_name: string;
  name?: string;
};

type Course = {
  course_id?: number;
  id?: number;
  course_title: string;
};

export function DepartmentMappingsPanel() {
  const [form] = Form.useForm();

  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartments();
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: mappingsData, isLoading: mappingsLoading } =
    useDepartmentTrainingMappings();

  const createMapping = useCreateDepartmentTrainingMapping();

  const departments: Department[] = useMemo(() => {
    if (Array.isArray(departmentsData)) return departmentsData;
    if (Array.isArray((departmentsData as any)?.departments)) {
      return (departmentsData as any).departments;
    }
    if (Array.isArray((departmentsData as any)?.data)) {
      return (departmentsData as any).data;
    }
    return [];
  }, [departmentsData]);

  const courses: Course[] = useMemo(() => {
    if (Array.isArray(coursesData)) return coursesData;
    if (Array.isArray((coursesData as any)?.courses)) {
      return (coursesData as any).courses;
    }
    if (Array.isArray((coursesData as any)?.data)) {
      return (coursesData as any).data;
    }
    return [];
  }, [coursesData]);

  const mappings = useMemo(() => {
    if (Array.isArray(mappingsData)) return mappingsData;
    if (Array.isArray((mappingsData as any)?.mappings)) {
      return (mappingsData as any).mappings;
    }
    if (Array.isArray((mappingsData as any)?.data)) {
      return (mappingsData as any).data;
    }
    return [];
  }, [mappingsData]);

  const handleCreate = (values: any) => {
    const payload = {
      department_id: values.department_id,
      course_id: values.course_id,
      is_mandatory: values.is_mandatory ?? true,
      assignment_trigger: values.assignment_trigger || "manual",
      active_flag: values.active_flag ?? true,
      created_by_user_id: 1,
    };

    createMapping.mutate(payload, {
      onSuccess: () => {
        message.success("Department mapping created");
        form.resetFields();
      },
      onError: (error: any) => {
        message.error(
          error?.response?.data?.error || "Department mapping failed",
        );
      },
    });
  };

  const getDepartmentName = (record: any) => {
    return (
      record.department?.department_name ||
      record.department?.name ||
      departments.find((d) => d.id === record.department_id)?.department_name ||
      departments.find((d) => d.id === record.department_id)?.name ||
      "-"
    );
  };

  const getCourseName = (record: any) => {
    return (
      record.course?.course_title ||
      courses.find(
        (c) => (c.course_id || c.id) === record.course_id,
      )?.course_title ||
      "-"
    );
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreate}
        initialValues={{
          is_mandatory: true,
          active_flag: true,
          assignment_trigger: "manual",
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
            options={departments.map((d) => ({
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
            options={courses.map((c) => ({
              label: c.course_title,
              value: c.course_id || c.id,
            }))}
          />
        </Form.Item>

        <Form.Item name="assignment_trigger" label="Trigger">
          <Select
            options={[
              { label: "Manual", value: "manual" },
              { label: "On Joining", value: "on_joining" },
              { label: "Scheduled", value: "scheduled" },
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

        <Form.Item name="active_flag" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label=" ">
          <Button
            htmlType="submit"
            type="primary"
            loading={createMapping.isPending}
          >
            Create mapping
          </Button>
        </Form.Item>
      </Form>

      <Table
        rowKey="id"
        loading={mappingsLoading}
        dataSource={mappings}
        columns={[
          {
            title: "Department",
            render: (_: unknown, record: any) => getDepartmentName(record),
          },
          {
            title: "Course",
            render: (_: unknown, record: any) => getCourseName(record),
          },
          {
            title: "Mandatory",
            dataIndex: "is_mandatory",
            render: (value: boolean) =>
              value ? <Tag color="blue">YES</Tag> : <Tag>NO</Tag>,
          },
          {
            title: "Trigger",
            dataIndex: "assignment_trigger",
          },
          {
            title: "Active",
            dataIndex: "active_flag",
            render: (value: boolean) =>
              value ? <Tag color="green">ACTIVE</Tag> : <Tag color="red">INACTIVE</Tag>,
          },
        ]}
      />
    </div>
  );
}