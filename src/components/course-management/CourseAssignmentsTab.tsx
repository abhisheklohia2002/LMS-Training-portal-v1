import { useState } from "react";
import { Button, DatePicker, Drawer, Form, Select, Space, message } from "antd";
import dayjs from "dayjs";
import { DataTable } from "../../components/common/DataTable";
import { StatusTag } from "../../components/common/StatusTag";
import {
  useCreateTrainingAssignment,
  useTrainingAssignments,
} from "../../hooks/useTrainingAssignments";
import { useUsers } from "../../hooks/useUsers";
import { findUser } from "../../utils/lookup";

type Props = {
  courseId: number;
};

export function CourseAssignmentsTab({ courseId }: Props) {
  const { data: assignments = [], isLoading } = useTrainingAssignments();
  const { data: users = [] } = useUsers();
  const createAssignment = useCreateTrainingAssignment();

  const [open, setOpen] = useState(false);

  const courseAssignments = assignments.filter(
    (assignment: any) => assignment.course_id === courseId,
  );

  const learnerOptions = users.map((user: any) => ({
    label: `${user.full_name || "Unknown User"} (${user.email})`,
    value: user.user_id,
  }));

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button type="primary" onClick={() => setOpen(true)}>
          Assign user
        </Button>
      </div>

      <DataTable
        loading={isLoading}
        dataSource={courseAssignments}
        columns={[
          {
            title: "Learner",
            render: (_, record: any) =>
              findUser(users, record.user_id)?.full_name ?? record.user_id,
          },
          {
            title: "Source",
            dataIndex: "assignment_source",
          },
          {
            title: "Due date",
            dataIndex: "due_date",
          },
          {
            title: "Status",
            render: (_, record: any) => <StatusTag value={record.status} />,
          },
        ]}
      />

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Assign user to course"
        width={520}
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            createAssignment.mutate(
              {
                user_id: Number(values.user_id),
                course_id: courseId,
                assigned_by_user_id: Number(values.assigned_by_user_id),
                assignment_source: "manual",
                is_mandatory: true,
                due_date: values.due_date?.toISOString(),
              },
              {
                onSuccess: () => {
                  message.success("User assigned to course");
                  setOpen(false);
                },
                onError: (error: any) => {
                  message.error(
                    error?.response?.data?.error ||
                      "Failed to assign user to course",
                  );
                },
              },
            );
          }}
        >
          <Form.Item
            name="user_id"
            label="Learner"
            rules={[{ required: true, message: "Please select learner" }]}
          >
            <Select
              showSearch
              placeholder="Select learner"
              optionFilterProp="label"
              options={learnerOptions}
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
              options={learnerOptions}
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
            <Button
              type="primary"
              htmlType="submit"
              loading={createAssignment.isPending}
            >
              Assign
            </Button>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}