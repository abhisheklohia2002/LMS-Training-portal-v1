import {
  Button,
  DatePicker,
  Form,
  Select,
  Switch,
  message,
  Table,
  Tag,
  Space,
  Breadcrumb,
} from "antd";
import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";

import { useCourses } from "../../hooks/useCourses";
import {
  useAssignCourseToDepartment,
  useDepartmentAssignments,
} from "../../hooks/useDepartmentAssignments";
import Text from "antd/es/typography/Text";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";
import { PageHeader } from "../../components/common/PageHeader";
import { useEntities } from "../../hooks/useEntities";
import { Entity } from "../../types";
import { useDepartmentsByEntity } from "../../hooks/useDepartmentsByEntity";
// import { useDepartmentsByEntity } from "../../hooks/useDepartmentsByEntity";

export function DepartmentAssignmentPanel() {
  const [form] = Form.useForm();
  const { isDarkMode } = useThemeMode();

  const selectedEntityId = Form.useWatch("entity_id", form);

  const { data: entityData, isLoading: isEntitiesLoading } = useEntities();

  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartmentsByEntity(selectedEntityId);

  const { data: coursesData, isLoading: coursesLoading } = useCourses();

  const assignCourse = useAssignCourseToDepartment();

  const { data: assignmentsData, isLoading: assignmentsLoading } =
    useDepartmentAssignments();

  const ui = {
    breadcrumb: isDarkMode ? "text-slate-400" : "text-slate-500",
  };

  useEffect(() => {
    form.setFieldValue("department_id", undefined);
  }, [selectedEntityId, form]);

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

  const entities: Entity[] = useMemo(() => {
    if (Array.isArray(entityData)) return entityData;
    if (Array.isArray(entityData?.entities)) return entityData.entities;
    if (Array.isArray(entityData?.data)) return entityData.data;
    return [];
  }, [entityData]);

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
      // entity_id: Number(values.entity_id),
      department_id: Number(values.department_id),
      course_id: Number(values.course_id),
      assigned_by_user_id: 1,
      is_mandatory: values.is_mandatory ?? true,
      due_date: values.due_date
        ? dayjs(values.due_date).toISOString()
        : undefined,
    };

    assignCourse.mutate(payload, {
      onSuccess: () => {
        message.success("Course assigned to department");
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
            { title: "Dashboard" },
            { title: "Learning" },
            { title: "Department Assignment" },
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
          label="Entity"
          name="entity_id"
          rules={[{ required: true, message: "Entity is required" }]}
        >
          <Select
            showSearch
            loading={isEntitiesLoading}
            placeholder="Select entity"
            optionFilterProp="label"
            options={entities
              .filter((entity: Entity) => entity.is_active)
              .map((entity: Entity) => ({
                label: entity.entity_name,
                value: entity.id,
              }))}
          />
        </Form.Item>

        <Form.Item
          name="department_id"
          label="Department"
          rules={[{ required: true, message: "Department is required" }]}
        >
          <Select
            showSearch
            disabled={!selectedEntityId}
            placeholder={
              selectedEntityId ? "Select department" : "Select entity first"
            }
            loading={departmentsLoading}
            optionFilterProp="label"
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
            showSearch
            placeholder="Select course"
            loading={coursesLoading}
            optionFilterProp="label"
            options={courses.map((c: any) => ({
              label: c.course_title,
              value: c.course_id || c.id,
            }))}
          />
        </Form.Item>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 16,
            alignItems: "end",
          }}
        >
          <Form.Item
            name="due_date"
            label="Due date"
            style={{ marginBottom: 0 }}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="is_mandatory"
            label="Mandatory"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Switch />
          </Form.Item>
        </div>

        <Form.Item label=" " style={{ marginBottom: 0 }}>
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
