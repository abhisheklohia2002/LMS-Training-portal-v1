import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Radio,
  Select,
  Space,
  Tag,
  Upload,
  message,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { DataTable } from "../common/DataTable";
import {
  useAssessmentQuestions,
  useBulkUploadAssessmentQuestions,
  useCreateAssessmentQuestion,
  useDeleteAssessmentQuestion,
} from "../../hooks/useAssessmentQuestions";

type Assessment = {
  assessment_id: number;
  assessment_title?: string;
};

type QuestionOptionFormValue = {
  option_text: string;
  is_correct?: boolean;
};

type QuestionFormValue = {
  question_text: string;
  question_type: "single_choice" | "multiple_choice" | "true_false" | "text";
  marks: number;
  sequence_no: number;
  is_active?: boolean;
  options?: QuestionOptionFormValue[];
};

type Props = {
  assessment: Assessment;
};

export function QuestionsTab({ assessment }: Props) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<QuestionFormValue>();

  const questionType = Form.useWatch("question_type", form) || "single_choice";

  const { data: questions = [], isLoading } = useAssessmentQuestions(
    assessment.assessment_id,
  );

  const bulkUploadQuestions = useBulkUploadAssessmentQuestions();
  const createQuestion = useCreateAssessmentQuestion();
  const deleteQuestion = useDeleteAssessmentQuestion();

  const defaultOptions = useMemo(() => {
    if (questionType === "true_false") {
      return [
        { option_text: "True", is_correct: true },
        { option_text: "False", is_correct: false },
      ];
    }

    return [
      { option_text: "", is_correct: true },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ];
  }, [questionType]);

  const openCreate = () => {
    form.resetFields();

    form.setFieldsValue({
      question_type: "single_choice",
      marks: 10,
      sequence_no: questions.length + 1,
      is_active: true,
      options: [
        { option_text: "", is_correct: true },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
    });

    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
    form.resetFields();
  };

  const validateCorrectOptions = (values: QuestionFormValue) => {
    if (values.question_type === "text") {
      return true;
    }

    const options = values.options ?? [];
    const correctOptions = options.filter((option) => option.is_correct);

    if (values.question_type === "single_choice") {
      return correctOptions.length === 1;
    }

    if (values.question_type === "true_false") {
      return correctOptions.length === 1;
    }

    if (values.question_type === "multiple_choice") {
      return correctOptions.length >= 1;
    }

    return true;
  };

  const saveQuestion = (values: QuestionFormValue) => {
    const cleanedOptions =
      values.question_type === "text"
        ? []
        : (values.options ?? []).filter((option) =>
            option.option_text?.trim(),
          );

    const payload = {
      ...values,
      assessment_id: assessment.assessment_id,
      marks: Number(values.marks),
      sequence_no: Number(values.sequence_no),
      options: cleanedOptions,
    };

    if (!validateCorrectOptions(payload)) {
      message.error(
        values.question_type === "multiple_choice"
          ? "Please mark at least one correct option"
          : "Please mark exactly one correct option",
      );
      return;
    }

    createQuestion.mutate(payload, {
      onSuccess: () => {
        message.success("Question created");
        closeDrawer();
      },
      onError: (error) => {
        message.error(
          error instanceof Error ? error.message : "Failed to create question",
        );
      },
    });
  };

  return (
    <Card
      size="small"
      title={`Questions${assessment.assessment_title ? ` - ${assessment.assessment_title}` : ""}`}
      extra={
        <Space>
          <Upload
            accept=".xlsx"
            showUploadList={false}
            beforeUpload={(file) => {
              bulkUploadQuestions.mutate(
                {
                  assessmentId: assessment.assessment_id,
                  file,
                },
                {
                  onSuccess: (response) => {
                    if (response?.success === false) {
                      message.error(
                        `Upload failed: ${response.invalid_rows} invalid rows`,
                      );
                      console.table(response.errors);
                      return;
                    }

                    message.success("Questions uploaded successfully");
                  },
                  onError: (error) => {
                    message.error(
                      error instanceof Error
                        ? error.message
                        : "Failed to upload questions",
                    );
                  },
                },
              );

              return false;
            }}
          >
            <Button
              icon={<UploadOutlined />}
              loading={bulkUploadQuestions.isPending}
            >
              Upload XLS
            </Button>
          </Upload>

          <Button icon={<PlusOutlined />} type="primary" onClick={openCreate}>
            Add question
          </Button>
        </Space>
      }
    >
      <DataTable
        loading={isLoading}
        dataSource={questions}
        rowKey="question_id"
        columns={[
          {
            title: "Seq",
            dataIndex: "sequence_no",
            width: 80,
          },
          {
            title: "Question",
            dataIndex: "question_text",
          },
          {
            title: "Type",
            render: (_, question: any) => <Tag>{question.question_type}</Tag>,
          },
          {
            title: "Marks",
            dataIndex: "marks",
            width: 90,
          },
          {
            title: "Options",
            render: (_, question: any) =>
              question.question_type === "text"
                ? "Text answer"
                : question.options
                    ?.map((option: any) => option.option_text)
                    .join(", ") || "-",
          },
          {
            title: "Correct",
            render: (_, question: any) =>
              question.options
                ?.filter((option: any) => option.is_correct)
                .map((option: any) => option.option_text)
                .join(", ") || "-",
          },
          {
            title: "Action",
            width: 100,
            render: (_, question: any) => (
              <Popconfirm
                title="Delete this question?"
                okText="Delete"
                okButtonProps={{ danger: true }}
                onConfirm={() =>
                  deleteQuestion.mutate(
                    {
                      id: question.question_id,
                      assessmentId: assessment.assessment_id,
                    },
                    {
                      onSuccess: () => {
                        message.success("Question deleted");
                      },
                      onError: (error) => {
                        message.error(
                          error instanceof Error
                            ? error.message
                            : "Failed to delete question",
                        );
                      },
                    },
                  )
                }
              >
                <Button danger size="small" icon={<DeleteOutlined />} />
              </Popconfirm>
            ),
          },
        ]}
      />

      <Drawer
        open={open}
        onClose={closeDrawer}
        title="Add quiz question"
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={saveQuestion}>
          <Form.Item
            name="question_text"
            label="Question"
            rules={[{ required: true, message: "Question is required" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <div className="grid gap-4 md:grid-cols-3">
            <Form.Item
              name="question_type"
              label="Type"
              rules={[{ required: true, message: "Question type is required" }]}
            >
              <Select
                onChange={(value) => {
                  form.setFieldValue("question_type", value);

                  if (value === "text") {
                    form.setFieldValue("options", []);
                    return;
                  }

                  if (value === "true_false") {
                    form.setFieldValue("options", [
                      { option_text: "True", is_correct: true },
                      { option_text: "False", is_correct: false },
                    ]);
                    return;
                  }

                  form.setFieldValue("options", defaultOptions);
                }}
                options={[
                  { label: "Single choice", value: "single_choice" },
                  { label: "Multiple choice", value: "multiple_choice" },
                  { label: "True / False", value: "true_false" },
                  { label: "Text", value: "text" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="marks"
              label="Marks"
              rules={[{ required: true, message: "Marks are required" }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>

            <Form.Item
              name="sequence_no"
              label="Sequence"
              rules={[{ required: true, message: "Sequence is required" }]}
            >
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>

          {questionType !== "text" && (
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Options</div>

                    <Button
                      size="small"
                      onClick={() =>
                        add({
                          option_text: "",
                          is_correct: false,
                        })
                      }
                    >
                      Add option
                    </Button>
                  </div>

                  {fields.map((field) => (
                    <div
                      key={field.key}
                      className="grid items-center gap-2 md:grid-cols-[1fr_140px_80px]"
                    >
                      <Form.Item
                        {...field}
                        name={[field.name, "option_text"]}
                        rules={[
                          { required: true, message: "Option is required" },
                        ]}
                        className="mb-0"
                      >
                        <Input placeholder="Option text" />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, "is_correct"]}
                        valuePropName="checked"
                        className="mb-0"
                      >
                        {questionType === "multiple_choice" ? (
                          <Checkbox>Correct</Checkbox>
                        ) : (
                          <Radio
                            onChange={() => {
                              const currentOptions =
                                form.getFieldValue("options") ?? [];

                              const updatedOptions = currentOptions.map(
                                (option: any, index: number) => ({
                                  ...option,
                                  is_correct: index === field.name,
                                }),
                              );

                              form.setFieldValue("options", updatedOptions);
                            }}
                          >
                            Correct
                          </Radio>
                        )}
                      </Form.Item>

                      <Button danger onClick={() => remove(field.name)}>
                        Remove
                      </Button>
                    </div>
                  ))}

                  <div className="text-xs text-slate-500">
                    For single choice / true-false, mark exactly one option
                    correct. For multiple choice, mark all correct answers.
                  </div>
                </div>
              )}
            </Form.List>
          )}

          <Space className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={createQuestion.isPending}
            >
              Save question
            </Button>

            <Button onClick={closeDrawer}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>
    </Card>
  );
}