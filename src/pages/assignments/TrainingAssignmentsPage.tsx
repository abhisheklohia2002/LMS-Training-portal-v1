import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Select,
  Space,
  Timeline,
  message,
} from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { DataTable } from "../../components/common/DataTable";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import { useCourses } from "../../hooks/useCourses";
import {
  useCreateTrainingAssignment,
  useTrainingAssignments,
  useUpdateAssignmentStatus,
} from "../../hooks/useTrainingAssignments";
import { useModuleProgress } from "../../hooks/useModules";
import { useUsers } from "../../hooks/useUsers";
import { findCourse, findUser } from "../../utils/lookup";
import { useRoles } from "../../hooks/useRoles";
function AssignmentTimeline({ id }: { id: number }) {
  const { data } = useModuleProgress(id);
  return (
    <Timeline
      items={
        data?.map((p) => ({
          children: `Module ${p.module_id}: ${p.status}`,
        })) ?? []
      }
    />
  );
}

export function TrainingAssignmentsPage() {
  const { data, isLoading } = useTrainingAssignments();
  const { data: users } = useUsers();
  const { data: courses } = useCourses();

  const create = useCreateTrainingAssignment();
  const update = useUpdateAssignmentStatus();
  const [open, setOpen] = useState(false);
  const { data: roles } = useRoles();

  const employeeRoleId = 3;

  const employeeUsers =
    users?.filter((u) => u.role_id === employeeRoleId) ?? [];

  const learnerOptions = employeeUsers.map((u) => ({
    label: `${u.full_name || "Unknown User"} (${u.email})`,
    value: u.user_id,
  }));

  const userOptions =
    users?.map((u) => ({
      label: `${u.full_name || "Unknown User"} (${u.email})`,
      value: u.user_id,
    })) ?? [];

  const courseOptions =
    courses?.map((c: any) => ({
      label: c.course_title,
      value: c.course_id,
    })) ?? [];

  return (
    <>
      <PageHeader
        title="Training Assignments"
        subtitle="Assign courses manually or through mappings and rules."
        actions={
          <Button type="primary" onClick={() => setOpen(true)}>
            Assign course
          </Button>
        }
      />

      <DataTable
        loading={isLoading}
        dataSource={data}
        expandable={{
          expandedRowRender: (r) => <AssignmentTimeline id={r.assignment_id} />,
        }}
        columns={[
          {
            title: "Learner",
            render: (_, r) =>
              findUser(users, r.user_id)?.full_name || r.user_id,
          },
          {
            title: "Course",
            render: (_, r) => findCourse(courses, r.course_id)?.course_title,
          },
          { title: "Source", dataIndex: "assignment_source" },
          { title: "Due date", dataIndex: "due_date" },
          { title: "Status", render: (_, r) => <StatusTag value={r.status} /> },
          {
            title: "Action",
            render: (_, r) => (
              <Space>
                <Button
                  size="small"
                  onClick={() =>
                    update.mutate({
                      id: r.assignment_id,
                      status: "in_progress",
                    })
                  }
                >
                  Start
                </Button>
                <Button
                  size="small"
                  type="primary"
                  onClick={() =>
                    update.mutate({
                      id: r.assignment_id,
                      status: "completed",
                    })
                  }
                >
                  Complete
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Assign course"
        width={520}
      >
        <Form
          layout="vertical"
          onFinish={(v) =>
            create.mutate(
              {
                ...v,
                user_id: Number(v.user_id),
                course_id: Number(v.course_id),
                assigned_by_user_id: Number(v.assigned_by_user_id),
                assignment_source: "manual",
                is_mandatory: true,
                due_date: v.due_date?.toISOString(),
              },
              {
                onSuccess: () => {
                  message.success("Assignment created");
                  setOpen(false);
                },
                onError: (error: any) => {
                  message.error(
                    error?.response?.data?.error ||
                      "Failed to create assignment",
                  );
                },
              },
            )
          }
        >
          <Form.Item
            name="user_id"
            label="Learner"
            rules={[{ required: true, message: "Please select learner" }]}
          >
            <Select
              showSearch
              placeholder="Select assigner"
              optionFilterProp="label"
              options={userOptions}
            />
          </Form.Item>

          <Form.Item
            name="course_id"
            label="Course"
            rules={[{ required: true, message: "Please select course" }]}
          >
            <Select
              showSearch
              placeholder="Select course"
              optionFilterProp="label"
              options={courseOptions}
            />
          </Form.Item>

          <Form.Item
            name="assigned_by_user_id"
            label="Assigned by"
            initialValue={1}
            rules={[{ required: true, message: "Please select assigner" }]}
          >
            <Select
              showSearch
              placeholder="Select assigner"
              optionFilterProp="label"
              options={userOptions}
            />
          </Form.Item>

          <Form.Item
            name="due_date"
            label="Due date"
            initialValue={dayjs().add(14, "day")}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" loading={create.isPending}>
              Assign
            </Button>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}
