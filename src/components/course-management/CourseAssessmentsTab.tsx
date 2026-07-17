import { useState } from "react";
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  message,
} from "antd";
import { EditOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { DataTable } from "../../components/common/DataTable";
import { StatusTag } from "../../components/common/StatusTag";
import {
  useAssessmentRules,
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
} from "../../hooks/useAssessments";
import { useModules } from "../../hooks/useModules";
import { useAssessmentAttempts } from "../../hooks/useAssessmentAttempts";
import { useUsers } from "../../hooks/useUsers";
import { findUser } from "../../utils/lookup";
import { QuestionsTab } from "../assessments/QuestionsTab";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";
import Text from "antd/es/typography/Text";

type Props = {
  courseId: number;
};

export function CourseAssessmentsTab({ courseId }: Props) {
  const { isDarkMode } = useThemeMode();

  const ui = {
    text: isDarkMode ? "text-[#EAF0F7]" : "text-slate-900",

    topBar: isDarkMode
      ? "mb-3 flex justify-end rounded-xl border border-[#253249] bg-[#111C2E] p-3"
      : "mb-3 flex justify-end rounded-xl border border-slate-200 bg-white p-3",

    expandedRow: isDarkMode
      ? "rounded-xl border border-[#253249] bg-[#0F172A] p-4"
      : "rounded-xl border border-slate-200 bg-slate-50 p-4",

    card: isDarkMode
      ? "border-[#253249] bg-[#111C2E] text-[#EAF0F7]"
      : "border-slate-200 bg-white text-slate-900",

    actionButton: isDarkMode
      ? "border-[#253249] bg-[#111C2E] text-[#EAF0F7] hover:!border-[#22C7B8] hover:!text-[#22C7B8]"
      : "border-slate-300 bg-white text-slate-700 hover:!border-[#109B9C] hover:!text-[#109B9C]",

    expandButton: isDarkMode
      ? "border-[#253249] bg-[#111C2E] text-[#EAF0F7] hover:!border-[#22C7B8] hover:!text-[#22C7B8]"
      : "border-slate-300 bg-white text-slate-700 hover:!border-[#109B9C] hover:!text-[#109B9C]",
  };

  const { data: assessments = [], isLoading } = useAssessments();
  const { data: modules = [] } = useModules(courseId);
  const { data: attempts = [] } = useAssessmentAttempts();
  const users = useUsers(1,100);

  const { data: assessmentRules = [], isLoading: rulesLoading } =
    useAssessmentRules();

  const createAssessment = useCreateAssessment();
  const updateAssessment = useUpdateAssessment();

  const [open, setOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any | null>(null);
  const [form] = Form.useForm();

  const courseAssessments = assessments.filter(
    (assessment: any) => Number(assessment.course_id) === Number(courseId),
  );

  const openCreate = () => {
    setEditingAssessment(null);
    form.resetFields();
    form.setFieldsValue({
      assessment_type: "quiz",
      max_score: 100,
      passing_score: 70,
      is_active: true,
    });
    setOpen(true);
  };

  const openEdit = (assessment: any) => {
    setEditingAssessment(assessment);
    form.resetFields();
    form.setFieldsValue({
      module_id: assessment.module_id,
      assessment_title: assessment.assessment_title,
      assessment_type: assessment.assessment_type,
      max_score: assessment.max_score,
      passing_score: assessment.passing_score,
      rule_id: assessment.rule_id,
      is_active: assessment.is_active,
    });
    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
    setEditingAssessment(null);
    form.resetFields();
  };

  const handleSubmit = (values: any) => {
    const payload = {
      ...values,
      course_id: courseId,
      module_id: values.module_id ? Number(values.module_id) : null,
      max_score: Number(values.max_score),
      passing_score: Number(values.passing_score),
      rule_id: values.rule_id ? Number(values.rule_id) : null,
    };

    if (editingAssessment) {
      updateAssessment.mutate(
        {
          id: editingAssessment.assessment_id,
          payload,
        },
        {
          onSuccess: () => {
            message.success("Assessment updated");
            closeDrawer();
          },
        },
      );
      return;
    }

    createAssessment.mutate(payload, {
      onSuccess: () => {
        message.success("Assessment created");
        closeDrawer();
      },
    });
  };

  return (
    <>
      <div className={ui.topBar}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Create assessment
        </Button>
      </div>

      <Table
        loading={isLoading}
        dataSource={courseAssessments}
        rowKey="assessment_id"
        expandable={{
          expandedRowRender: (assessment: any) => (
            <div className={ui.expandedRow}>
              <Tabs
                className={
                  isDarkMode ? "course-tabs-dark" : "course-tabs-light"
                }
                items={[
                  {
                    key: "questions",
                    label: "Questions",
                    children: <QuestionsTab assessment={assessment} />,
                  },
                  {
                    key: "attempts",
                    label: "Attempts",
                    children: (
                      <Card title="Attempts" className={ui.card}>
                        <Table
                          rowKey={(attempt: any) =>
                            `${attempt.assessment_id}-${attempt.user_id}-${attempt.attempt_no}`
                          }
                          dataSource={attempts.filter(
                            (attempt: any) =>
                              attempt.assessment_id ===
                              assessment.assessment_id,
                          )}
                          columns={[
                            {
                              title: "User",
                              render: (_: unknown, attempt: any) => (
                                <Text className={ui.text}>
                                  {findUser([], attempt.user_id)
                                    ?.full_name ?? attempt.user_id}
                                </Text>
                              ),
                            },
                            {
                              title: "Attempt",
                              dataIndex: "attempt_no",
                              render: (value: string) => (
                                <Text className={ui.text}>{value}</Text>
                              ),
                            },
                            {
                              title: "Score",
                              dataIndex: "score_obtained",
                              render: (value: string) => (
                                <Text className={ui.text}>{value}</Text>
                              ),
                            },
                            {
                              title: "Result",
                              render: (_: unknown, attempt: any) => (
                                <StatusTag value={attempt.result_status} />
                              ),
                            },
                          ]}
                        />
                      </Card>
                    ),
                  },
                ]}
              />
            </div>
          ),

          expandIcon: ({ expanded, onExpand, record }) => (
            <Button
              size="small"
              // type={expanded ? "primary" : "default"}
              icon={expanded ? <MinusOutlined /> : <PlusOutlined />}
              onClick={(event) => onExpand(record, event)}
              className={ui.expandButton}
            />
          ),
        }}
        columns={[
          {
            title: "Assessment",
            dataIndex: "assessment_title",
            render: (text: string) => <Text className={ui.text}>{text}</Text>,
          },
          {
            title: "Module",
            render: (_: unknown, record: any) => (
              <Text className={ui.text}>
                {modules.find(
                  (module: any) =>
                    Number(module.module_id) === Number(record.module_id),
                )?.module_title ?? "-"}
              </Text>
            ),
          },
          {
            title: "Passing",
            render: (_: unknown, record: any) => (
              <Text className={ui.text}>
                {record.rule?.passing_score ?? record.passing_score}
              </Text>
            ),
          },
          {
            title: "Attempts",
            render: (_: unknown, record: any) => (
              <Text className={ui.text}>{record.rule?.max_attempts ?? 1}</Text>
            ),
          },
          {
            title: "Retake",
            render: (_: unknown, record: any) =>
              record.rule?.retake_allowed ? (
                <Tag color="green">Allowed</Tag>
              ) : (
                <Tag color="red">Not allowed</Tag>
              ),
          },
          {
            title: "Active",
            render: (_: unknown, record: any) => (
              <StatusTag value={record.is_active} />
            ),
          },
          {
            title: "Action",
            width: 120,
            render: (_: unknown, record: any) => (
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEdit(record)}
                className={ui.actionButton}
              >
                Edit
              </Button>
            ),
          },
        ]}
      />

      <Drawer
        open={open}
        onClose={closeDrawer}
        title={editingAssessment ? "Edit assessment" : "Create assessment"}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="module_id"
            label="Module"
            rules={[{ required: true, message: "Please select module" }]}
          >
            <Select
              placeholder="Select module"
              options={modules.map((module: any) => ({
                label: module.module_title,
                value: module.module_id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="assessment_title"
            label="Assessment title"
            rules={[
              {
                required: true,
                message: "Assessment title is required",
              },
            ]}
          >
            <Input placeholder="Example: Safety Quiz" />
          </Form.Item>

          <Form.Item
            name="assessment_type"
            label="Type"
            rules={[
              {
                required: true,
                message: "Assessment type is required",
              },
            ]}
          >
            <Select
              options={[
                { label: "Quiz", value: "quiz" },
                { label: "Assignment", value: "assignment" },
                { label: "Final Test", value: "final_test" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="max_score"
            label="Max score"
            rules={[
              {
                required: true,
                message: "Max score is required",
              },
            ]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            name="passing_score"
            label="Fallback passing score"
            rules={[
              {
                required: true,
                message: "Passing score is required",
              },
            ]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item
            name="rule_id"
            label="Assessment rule"
            rules={[
              {
                required: true,
                message: "Please select assessment rule",
              },
            ]}
          >
            <Select
              loading={rulesLoading}
              placeholder="Select assessment rule"
              options={assessmentRules.map((rule: any) => ({
                label: `${rule.max_attempts} attempts | Passing ${
                  rule.passing_score
                } | Retake ${
                  rule.retake_allowed ? "Allowed" : "Not allowed"
                } | ${rule.evaluation_method}`,
                value: rule.assessment_rule_id,
              }))}
            />
          </Form.Item>

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={createAssessment.isPending || updateAssessment.isPending}
            >
              Save
            </Button>

            <Button onClick={closeDrawer}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>
    </>
  );
}
