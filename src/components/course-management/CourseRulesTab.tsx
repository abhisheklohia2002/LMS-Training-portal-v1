import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";

import { StatusTag } from "../common/StatusTag";

import {
  useAssignmentRules,
  useCreateAssignmentRule,
  useUpdateAssignmentRule,
  useDeleteAssignmentRule,
} from "../../hooks/useAssignmentRules";

import {
  useAssessmentRules,
  useCreateAssessmentRule,
  useUpdateAssessmentRule,
  useDeleteAssessmentRule,
} from "../../hooks/useAssessmentRules";

import {
  useCertificationRules,
  useCreateCertificationRule,
  useUpdateCertificationRule,
  useDeleteCertificationRule,
} from "../../hooks/useCertificationRules";

import { useRoles } from "../../hooks/useRoles";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";
import Text from "antd/es/typography/Text";

type RuleTab = "assignment" | "assessment" | "certification";

type Props = {
  courseId: number;
};

type EditingState = {
  type: RuleTab;
  record: any | null;
} | null;

export function CourseRulesTab({ courseId }: Props) {
  const [activeTab, setActiveTab] = useState<RuleTab>("assessment");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EditingState>(null);
  const [form] = Form.useForm();
  const { isDarkMode } = useThemeMode();

  const ui = {
    text: isDarkMode ? "text-[#EAF0F7]" : "text-slate-900",
    actionButton: isDarkMode
      ? "border-[#253249] bg-[#111C2E] text-[#EAF0F7]"
      : "",
  };
  const { data: roles = [] } = useRoles();

  // const assignmentRulesQuery = useAssignmentRules();
  const assessmentRulesQuery = useAssessmentRules(courseId);
  const courseAssessmentRules = assessmentRulesQuery.data ?? [];

  const createAssignmentRule = useCreateAssignmentRule();
  const updateAssignmentRule = useUpdateAssignmentRule();
  const deleteAssignmentRule = useDeleteAssignmentRule();

  const createAssessmentRule = useCreateAssessmentRule();
  const updateAssessmentRule = useUpdateAssessmentRule();
  const deleteAssessmentRule = useDeleteAssessmentRule();

  const createCertificationRule = useCreateCertificationRule();
  const updateCertificationRule = useUpdateCertificationRule();
  const deleteCertificationRule = useDeleteCertificationRule();
  const certificationRulesQuery = useCertificationRules(courseId);
  console.log(certificationRulesQuery, "certificationRulesQuery");
  const courseCertificationRules = certificationRulesQuery.data ?? [];

  const roleOptions = roles.map((role: any) => ({
    label: role.role_name,
    value: role.role_id,
  }));

  const buttonText = useMemo(() => {
    if (activeTab === "assignment") return "Create Assignment Rule";
    if (activeTab === "assessment") return "Create Assessment Rule";
    return "Create Certification Rule";
  }, [activeTab]);

  const openCreateDrawer = () => {
    setEditing({
      type: activeTab,
      record: null,
    });

    form.resetFields();

    if (activeTab === "assessment") {
      form.setFieldsValue({
        max_attempts: 3,
        passing_score: 70,
        retake_allowed: true,
        evaluation_method: "score",
      });
    }

    if (activeTab === "certification") {
      form.setFieldsValue({
        issue_on_course_completion: true,
        minimum_score_required: 70,
        validity_days: 365,
        renewal_required: true,
      });
    }

    setDrawerOpen(true);
  };

  const openEditDrawer = (type: RuleTab, record: any) => {
    setEditing({
      type,
      record,
    });

    form.resetFields();

    if (type === "assessment") {
      form.setFieldsValue({
        max_attempts: record.max_attempts ?? record.MaxAttempts,
        passing_score: record.passing_score ?? record.PassingScore,
        retake_allowed: record.retake_allowed ?? record.RetakeAllowed,
        evaluation_method: record.evaluation_method ?? record.EvaluationMethod,
      });
    }

    if (type === "certification") {
      form.setFieldsValue({
        issue_on_course_completion:
          record.issue_on_course_completion ?? record.IssueOnCourseCompletion,
        minimum_score_required:
          record.minimum_score_required ?? record.MinimumScoreRequired,
        validity_days: record.validity_days ?? record.ValidityDays,
        renewal_required: record.renewal_required ?? record.RenewalRequired,
      });
    }

    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!editing) return;

      if (editing.type === "assessment") {
        const assessmentPayload = {
          max_attempts: Number(values.max_attempts),
          passing_score: Number(values.passing_score),
          retake_allowed: Boolean(values.retake_allowed),
          evaluation_method: values.evaluation_method,
        };

        if (editing.record) {
          const assessmentRuleId =
            editing.record.assessment_rule_id ??
            editing.record.AssessmentRuleID ??
            editing.record.id ??
            editing.record.ID;

          await updateAssessmentRule.mutateAsync({
            id: assessmentRuleId,
            payload: assessmentPayload,
          });

          message.success("Assessment rule updated");
        } else {
          await createAssessmentRule.mutateAsync({
            courseId,
            payload: assessmentPayload,
          });

          message.success("Assessment rule created");
        }
      }

      if (editing.type === "certification") {
        const certificationPayload = {
          issue_on_course_completion: Boolean(
            values.issue_on_course_completion,
          ),
          minimum_score_required: Number(values.minimum_score_required),
          validity_days: Number(values.validity_days),
          renewal_required: Boolean(values.renewal_required),
        };

        if (editing.record) {
          const certificationRuleId =
            editing.record.certification_rule_id ??
            editing.record.CertificationRuleID ??
            editing.record.id ??
            editing.record.ID;

          await updateCertificationRule.mutateAsync({
            id: certificationRuleId,
            payload: certificationPayload,
          });

          message.success("Certification rule updated");
        } else {
          await createCertificationRule.mutateAsync({
            courseId,
            payload: certificationPayload,
          });

          message.success("Certification rule created");
        }
      }

      closeDrawer();
    } catch (error) {
      console.error(error);
    }
  };

  const assessmentColumns = [
    {
      title: "Max Attempts",
      render: (_: any, record: any) => (
        <Text className={ui.text}>
          {record.max_attempts ?? record.MaxAttempts ?? "-"}
        </Text>
      ),
    },
    {
      title: "Passing Score",
      render: (_: any, record: any) => (
        <Text className={ui.text}>
          {record.passing_score ?? record.PassingScore ?? "-"}
        </Text>
      ),
    },
    {
      title: "Retake Allowed",
      render: (_: any, record: any) => {
        const allowed = record.retake_allowed ?? record.RetakeAllowed;

        return allowed ? (
          <Tag color="green">Allowed</Tag>
        ) : (
          <Tag color="red">Not Allowed</Tag>
        );
      },
    },
    {
      title: "Evaluation",
      render: (_: any, record: any) => (
        <Tag>{record.evaluation_method ?? record.EvaluationMethod ?? "-"}</Tag>
      ),
    },
    {
      title: "Actions",
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            onClick={() => openEditDrawer("assessment", record)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete assessment rule?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() =>
              deleteAssessmentRule.mutate(
                record.assessment_rule_id ??
                  record.AssessmentRuleID ??
                  record.id,
                {
                  onSuccess: () => message.success("Assessment rule deleted"),
                },
              )
            }
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const certificationColumns: ColumnsType<any> = [
    {
      title: "Issue On Completion",
      render: (_: any, record: any) => {
        const value =
          record.issue_on_course_completion ?? record.IssueOnCourseCompletion;

        return value ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>;
      },
    },
    {
      title: "Minimum Score",
      render: (_: any, record: any) => (
        <Text className={ui.text}>
          {record.minimum_score_required ?? record.MinimumScoreRequired ?? "-"}
        </Text>
      ),
    },
    {
      title: "Validity Days",
      render: (_: any, record: any) => (
        <Text className={ui.text}>
          {record.validity_days ?? record.ValidityDays ?? "-"}
        </Text>
      ),
    },
    {
      title: "Renewal",
      render: (_: any, record: any) => {
        const value = record.renewal_required ?? record.RenewalRequired;

        return value ? (
          <Tag color="blue">Required</Tag>
        ) : (
          <Tag>Not Required</Tag>
        );
      },
    },
    {
      title: "Actions",
      width: 160,
      render: (_: any, record: any) => {
        const id =
          record.certification_rule_id ??
          record.CertificationRuleID ??
          record.id ??
          record.ID;

        return (
          <Space>
            <Button
              type="link"
              onClick={() => openEditDrawer("certification", record)}
            >
              Edit
            </Button>

            <Popconfirm
              title="Delete certification rule?"
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() =>
                deleteCertificationRule.mutate(id, {
                  onSuccess: () =>
                    message.success("Certification rule deleted"),
                  onError: (error: any) => {
                    message.error(
                      error?.response?.data?.error ||
                        "Failed to delete certification rule",
                    );
                  },
                })
              }
            >
              <Button type="link" danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const isSubmitting =
    createAssignmentRule.isPending ||
    updateAssignmentRule.isPending ||
    createAssessmentRule.isPending ||
    updateAssessmentRule.isPending ||
    createCertificationRule.isPending ||
    updateCertificationRule.isPending;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <Alert
          className="flex-1"
          type="info"
          showIcon
          message="These rules apply only to this course."
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateDrawer}
        >
          {buttonText}
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as RuleTab)}
        items={[
          //   {
          //     key: "assignment",
          //     label: "Assignment Rule",
          //     children: (
          //       <Table
          //         rowKey="assignment_rule_id"
          //         columns={assignmentColumns}
          //         dataSource={courseAssignmentRules}
          //         loading={assignmentRulesQuery.isLoading}
          //       />
          //     ),
          //   },
          {
            key: "assessment",
            label: "Assessment Rule",
            children: (
              <Table
                rowKey="assessment_rule_id"
                columns={assessmentColumns}
                dataSource={courseAssessmentRules}
                loading={assessmentRulesQuery.isLoading}
              />
            ),
          },
          {
            key: "certification",
            label: "Certification Rule",
            children: (
              <Table
                rowKey={(record) =>
                  record.certification_rule_id ??
                  record.CertificationRuleID ??
                  record.id ??
                  record.ID
                }
                columns={certificationColumns}
                dataSource={courseCertificationRules}
                loading={certificationRulesQuery.isLoading}
              />
            ),
          },
        ]}
      />

      <Drawer
        title={
          editing?.record
            ? `Edit ${getRuleLabel(editing.type)}`
            : `Create ${getRuleLabel(editing?.type ?? activeTab)}`
        }
        open={drawerOpen}
        onClose={closeDrawer}
        width={520}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={closeDrawer}>Cancel</Button>
            <Button
              type="primary"
              loading={isSubmitting}
              onClick={handleSubmit}
            >
              Save
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          {editing?.type === "assignment" && (
            <>
              <Form.Item
                label="Rule Name"
                name="rule_name"
                rules={[{ required: true, message: "Rule name is required" }]}
              >
                <Input placeholder="Assign on joining" />
              </Form.Item>

              <Form.Item
                label="Trigger Event"
                name="trigger_event"
                rules={[
                  { required: true, message: "Trigger event is required" },
                ]}
              >
                <Select
                  placeholder="Select trigger"
                  options={[
                    { label: "On Joining", value: "on_joining" },
                    { label: "Role Change", value: "role_change" },
                    { label: "Manual", value: "manual" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Role"
                name="role_id"
                rules={[{ required: true, message: "Role is required" }]}
              >
                <Select
                  showSearch
                  placeholder="Select role"
                  optionFilterProp="label"
                  options={roleOptions}
                />
              </Form.Item>

              <Form.Item
                label="Due Days"
                name="due_days"
                rules={[{ required: true, message: "Due days is required" }]}
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>

              <Form.Item
                label="Active"
                name="is_active"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          )}

          {editing?.type === "assessment" && (
            <>
              <Form.Item
                label="Max Attempts"
                name="max_attempts"
                rules={[
                  { required: true, message: "Max attempts is required" },
                ]}
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>

              <Form.Item
                label="Passing Score"
                name="passing_score"
                rules={[
                  { required: true, message: "Passing score is required" },
                ]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>

              <Form.Item
                label="Retake Allowed"
                name="retake_allowed"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Evaluation Method"
                name="evaluation_method"
                rules={[
                  { required: true, message: "Evaluation method is required" },
                ]}
              >
                <Select
                  options={[
                    { label: "Score", value: "score" },
                    { label: "Manual", value: "manual" },
                    { label: "Auto", value: "auto" },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {editing?.type === "certification" && (
            <>
              <Form.Item
                label="Issue On Course Completion"
                name="issue_on_course_completion"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Minimum Score Required"
                name="minimum_score_required"
                rules={[
                  { required: true, message: "Minimum score is required" },
                ]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>

              <Form.Item
                label="Validity Days"
                name="validity_days"
                rules={[
                  { required: true, message: "Validity days is required" },
                ]}
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>

              <Form.Item
                label="Renewal Required"
                name="renewal_required"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          )}
        </Form>
      </Drawer>
    </>
  );
}

function getRuleLabel(type: RuleTab) {
  if (type === "assignment") return "Assignment Rule";
  if (type === "assessment") return "Assessment Rule";
  return "Certification Rule";
}
