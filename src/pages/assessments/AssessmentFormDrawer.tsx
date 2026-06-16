import { useEffect } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  message,
} from "antd";

import { useAssessmentRules } from "../../hooks/useAssessmentRules";
import {
  useCreateAssessment,
  useUpdateAssessment,
} from "../../hooks/useAssessments";

type AssessmentFormDrawerProps = {
  open: boolean;
  onClose: () => void;
  courseId: number;
  modules: any[];
  editingAssessment?: any | null;
};

export function AssessmentFormDrawer({
  open,
  onClose,
  courseId,
  modules,
  editingAssessment,
}: AssessmentFormDrawerProps) {
  const [form] = Form.useForm();

  const { data: assessmentRules = [], isLoading: rulesLoading } =
    useAssessmentRules();

  const createAssessment = useCreateAssessment();
  const updateAssessment = useUpdateAssessment();

  const isEditMode = Boolean(editingAssessment);

  useEffect(() => {
    if (!open) return;

    form.resetFields();

    if (editingAssessment) {
      form.setFieldsValue({
        course_id: editingAssessment.course_id,
        module_id: editingAssessment.module_id,
        assessment_title: editingAssessment.assessment_title,
        assessment_type: editingAssessment.assessment_type,
        max_score: editingAssessment.max_score,
        passing_score: editingAssessment.passing_score,
        rule_id: editingAssessment.rule_id,
        is_active: editingAssessment.is_active,
      });
    } else {
      form.setFieldsValue({
        course_id: courseId,
        assessment_type: "quiz",
        max_score: 10,
        passing_score: 7,
        rule_id: undefined,
        is_active: true,
      });
    }
  }, [open, editingAssessment, courseId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload:any = {
        course_id: Number(values.course_id),
        module_id: values.module_id ? Number(values.module_id) : null,
        assessment_title: values.assessment_title,
        assessment_type: values.assessment_type,
        max_score: Number(values.max_score),
        passing_score: Number(values.passing_score),
        rule_id: values.rule_id ? Number(values.rule_id) : null,
        is_active: values.is_active ?? true,
      };

      if (isEditMode) {
        await updateAssessment.mutateAsync({
          id: editingAssessment.assessment_id,
          payload,
        });

        message.success("Assessment updated successfully");
      } else {
        await createAssessment.mutateAsync(payload);

        message.success("Assessment created successfully");
      }

      form.resetFields();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Drawer
      title={isEditMode ? "Edit Assessment" : "Create Assessment"}
      open={open}
      onClose={onClose}
      width={560}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>

          <Button
            type="primary"
            loading={createAssessment.isPending || updateAssessment.isPending}
            onClick={handleSubmit}
          >
            Save
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="course_id" hidden>
          <InputNumber />
        </Form.Item>

        <Form.Item
          label="Module"
          name="module_id"
          rules={[
            {
              required: true,
              message: "Please select module",
            },
          ]}
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
          label="Assessment Title"
          name="assessment_title"
          rules={[
            {
              required: true,
              message: "Assessment title is required",
            },
          ]}
        >
          <Input placeholder="Example: Array Quiz" />
        </Form.Item>

        <Form.Item
          label="Assessment Type"
          name="assessment_type"
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
          label="Max Score"
          name="max_score"
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
          label="Assessment Passing Score"
          name="passing_score"
          rules={[
            {
              required: true,
              message: "Passing score is required",
            },
          ]}
          tooltip="Fallback passing score. If a rule is selected, rule passing score will be used by backend."
        >
          <InputNumber min={0} className="w-full" />
        </Form.Item>

        <Form.Item
          label="Assessment Rule"
          name="rule_id"
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
              label: `${rule.max_attempts} attempts | Passing ${rule.passing_score} | Retake ${
                rule.retake_allowed ? "Allowed" : "Not allowed"
              } | ${rule.evaluation_method}`,
              value: rule.assessment_rule_id,
            }))}
          />
        </Form.Item>

        <Form.Item label="Active" name="is_active" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Drawer>
  );
}