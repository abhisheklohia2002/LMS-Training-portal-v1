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

import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";

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

type RuleTab = "assignment" | "assessment" | "certification";

type EditingState =
  | {
      type: RuleTab;
      record: any | null;
    }
  | null;

export function RulesPage() {
  const [activeTab, setActiveTab] = useState<RuleTab>("assignment");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EditingState>(null);
  const [form] = Form.useForm();

  const { data: roles = [] } = useRoles();

  const assignmentRulesQuery = useAssignmentRules();
  const assessmentRulesQuery = useAssessmentRules();
  const certificationRulesQuery = useCertificationRules();

  const createAssignmentRule = useCreateAssignmentRule();
  const updateAssignmentRule = useUpdateAssignmentRule();
  const deleteAssignmentRule = useDeleteAssignmentRule();

  const createAssessmentRule = useCreateAssessmentRule();
  const updateAssessmentRule = useUpdateAssessmentRule();
  const deleteAssessmentRule = useDeleteAssessmentRule();

  const createCertificationRule = useCreateCertificationRule();
  const updateCertificationRule = useUpdateCertificationRule();
  const deleteCertificationRule = useDeleteCertificationRule();

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

    if (activeTab === "assignment") {
      form.setFieldsValue({
        is_active: true,
      });
    }

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
    form.setFieldsValue(record);
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

      if (editing.type === "assignment") {
        if (editing.record) {
          await updateAssignmentRule.mutateAsync({
            id: editing.record.assignment_rule_id,
            payload: values,
          });
          message.success("Assignment rule updated");
        } else {
          await createAssignmentRule.mutateAsync(values);
          message.success("Assignment rule created");
        }
      }

      if (editing.type === "assessment") {
        if (editing.record) {
          await updateAssessmentRule.mutateAsync({
            id: editing.record.assessment_rule_id,
            payload: values,
          });
          message.success("Assessment rule updated");
        } else {
          await createAssessmentRule.mutateAsync(values);
          message.success("Assessment rule created");
        }
      }

      if (editing.type === "certification") {
        if (editing.record) {
          await updateCertificationRule.mutateAsync({
            id: editing.record.certification_rule_id,
            payload: values,
          });
          message.success("Certification rule updated");
        } else {
          await createCertificationRule.mutateAsync(values);
          message.success("Certification rule created");
        }
      }

      closeDrawer();
    } catch (error) {
      // AntD validation errors come here too; no need to show ugly messages for those.
      console.error(error);
    }
  };

  const assignmentColumns: ColumnsType<any> = [
    {
      title: "Rule",
      dataIndex: "rule_name",
      key: "rule_name",
    },
    {
      title: "Trigger",
      dataIndex: "trigger_event",
      key: "trigger_event",
    },
    {
      title: "Role",
      dataIndex: "role_id",
      key: "role_id",
      render: (roleId: number) => {
        const role = roles.find((r: any) => r.role_id === roleId);
        return role?.role_name ?? roleId;
      },
    },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (value: boolean) => <StatusTag value={String(value).toUpperCase()} />,
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEditDrawer("assignment", record)}>
            Edit
          </Button>

          <Popconfirm
            title="Delete assignment rule?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() =>
              deleteAssignmentRule.mutate(record.assignment_rule_id, {
                onSuccess: () => message.success("Assignment rule deleted"),
              })
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

  const assessmentColumns: ColumnsType<any> = [
    {
      title: "Max Attempts",
      dataIndex: "max_attempts",
      key: "max_attempts",
    },
    {
      title: "Passing Score",
      dataIndex: "passing_score",
      key: "passing_score",
    },
    {
      title: "Retake Allowed",
      dataIndex: "retake_allowed",
      key: "retake_allowed",
      render: (value: boolean) =>
        value ? <Tag color="green">Allowed</Tag> : <Tag color="red">Not allowed</Tag>,
    },
    {
      title: "Evaluation",
      dataIndex: "evaluation_method",
      key: "evaluation_method",
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEditDrawer("assessment", record)}>
            Edit
          </Button>

          <Popconfirm
            title="Delete assessment rule?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() =>
              deleteAssessmentRule.mutate(record.assessment_rule_id, {
                onSuccess: () => message.success("Assessment rule deleted"),
              })
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
      title: "Issue on completion",
      dataIndex: "issue_on_course_completion",
      key: "issue_on_course_completion",
      render: (value: boolean) =>
        value ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>,
    },
    {
      title: "Minimum score",
      dataIndex: "minimum_score_required",
      key: "minimum_score_required",
    },
    {
      title: "Validity days",
      dataIndex: "validity_days",
      key: "validity_days",
    },
    {
      title: "Renewal",
      dataIndex: "renewal_required",
      key: "renewal_required",
      render: (value: boolean) =>
        value ? <Tag color="blue">Required</Tag> : <Tag>Not required</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEditDrawer("certification", record)}>
            Edit
          </Button>

          <Popconfirm
            title="Delete certification rule?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() =>
              deleteCertificationRule.mutate(record.certification_rule_id, {
                onSuccess: () => message.success("Certification rule deleted"),
              })
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

  const isSubmitting =
    createAssignmentRule.isPending ||
    updateAssignmentRule.isPending ||
    createAssessmentRule.isPending ||
    updateAssessmentRule.isPending ||
    createCertificationRule.isPending ||
    updateCertificationRule.isPending;

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Rules Management"
          subtitle="Assignment, assessment and certification policies."
        />

        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDrawer}>
          {buttonText}
        </Button>
      </div>

      <Alert
        className="mb-6"
        type="info"
        showIcon
        message="Rules explain how training assignments, retakes and certificate issuance behave."
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as RuleTab)}
        items={[
          {
            key: "assignment",
            label: "Assignment Rules",
            children: (
              <Table
                rowKey="assignment_rule_id"
                columns={assignmentColumns}
                dataSource={assignmentRulesQuery.data ?? []}
                loading={assignmentRulesQuery.isLoading}
              />
            ),
          },
          {
            key: "assessment",
            label: "Assessment Rules",
            children: (
              <Table
                rowKey="assessment_rule_id"
                columns={assessmentColumns}
                dataSource={assessmentRulesQuery.data ?? []}
                loading={assessmentRulesQuery.isLoading}
              />
            ),
          },
          {
            key: "certification",
            label: "Certification Rules",
            children: (
              <Table
                rowKey="certification_rule_id"
                columns={certificationColumns}
                dataSource={certificationRulesQuery.data ?? []}
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
            <Button type="primary" loading={isSubmitting} onClick={handleSubmit}>
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
                rules={[{ required: true, message: "Trigger event is required" }]}
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
                <Select placeholder="Select role" options={roleOptions} />
              </Form.Item>

              <Form.Item label="Active" name="is_active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </>
          )}

          {editing?.type === "assessment" && (
            <>
              <Form.Item
                label="Max Attempts"
                name="max_attempts"
                rules={[{ required: true, message: "Max attempts is required" }]}
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>

              <Form.Item
                label="Passing Score"
                name="passing_score"
                rules={[{ required: true, message: "Passing score is required" }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>

              <Form.Item label="Retake Allowed" name="retake_allowed" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item
                label="Evaluation Method"
                name="evaluation_method"
                rules={[{ required: true, message: "Evaluation method is required" }]}
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
                rules={[{ required: true, message: "Minimum score is required" }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>

              <Form.Item
                label="Validity Days"
                name="validity_days"
                rules={[{ required: true, message: "Validity days is required" }]}
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>

              <Form.Item label="Renewal Required" name="renewal_required" valuePropName="checked">
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