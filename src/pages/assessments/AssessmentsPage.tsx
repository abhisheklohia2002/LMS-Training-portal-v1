import { Button, Card, Checkbox, Drawer, Form, Input, InputNumber, Popconfirm, Radio, Select, Space, Tabs, Tag, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { DataTable } from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusTag } from '../../components/common/StatusTag';
import { useAssessmentAttempts } from '../../hooks/useAssessmentAttempts';
import { useAssessments, useCreateAssessment } from '../../hooks/useAssessments';
import { useAssessmentQuestions, useCreateAssessmentQuestion, useDeleteAssessmentQuestion } from '../../hooks/useAssessmentQuestions';
import { useCourses } from '../../hooks/useCourses';
import { useModules } from '../../hooks/useModules';
import { useUsers } from '../../hooks/useUsers';
import type { Assessment } from '../../types';
import { findCourse, findUser } from '../../utils/lookup';

type QuestionFormValue = {
  assessment_id: number;
  question_text: string;
  question_type: string;
  marks: number;
  sequence_no: number;
  is_active?: boolean;
  options?: { option_text: string; is_correct?: boolean }[];
};

function QuestionsTab({ assessment }: { assessment: Assessment }) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<QuestionFormValue>();
  const questionType = Form.useWatch('question_type', form) || 'single_choice';
  const { data: questions = [], isLoading } = useAssessmentQuestions(assessment.assessment_id);
  const createQuestion = useCreateAssessmentQuestion();
  const deleteQuestion = useDeleteAssessmentQuestion();

  const defaultOptions = useMemo(() => {
    if (questionType === 'true_false') {
      return [
        { option_text: 'True', is_correct: true },
        { option_text: 'False', is_correct: false },
      ];
    }
    return [
      { option_text: '', is_correct: true },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
    ];
  }, [questionType]);

  const openCreate = () => {
    form.setFieldsValue({
      assessment_id: assessment.assessment_id,
      question_type: 'single_choice',
      marks: 10,
      sequence_no: questions.length + 1,
      is_active: true,
      options: [
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
        { option_text: '', is_correct: false },
      ],
    });
    setOpen(true);
  };

  const saveQuestion = (values: QuestionFormValue) => {
    const payload = {
      ...values,
      assessment_id: assessment.assessment_id,
      options: values.question_type === 'text' ? [] : (values.options ?? []).filter(o => o.option_text?.trim()),
    };
    createQuestion.mutate(payload, {
      onSuccess: () => {
        message.success('Question created');
        setOpen(false);
        form.resetFields();
      },
      onError: error => message.error(error instanceof Error ? error.message : 'Failed to create question'),
    });
  };

  return (
    <Card
      size="small"
      title="Questions"
      extra={<Button icon={<PlusOutlined />} type="primary" onClick={openCreate}>Add question</Button>}
    >
      <DataTable
        loading={isLoading}
        dataSource={questions}
        columns={[
          { title: 'Seq', dataIndex: 'sequence_no', width: 80 },
          { title: 'Question', dataIndex: 'question_text' },
          { title: 'Type', render: (_, q) => <Tag>{q.question_type}</Tag> },
          { title: 'Marks', dataIndex: 'marks', width: 90 },
          { title: 'Options', render: (_, q) => q.question_type === 'text' ? 'Text answer' : q.options.map(o => o.option_text).join(', ') },
          { title: 'Correct', render: (_, q) => q.options.filter(o => o.is_correct).map(o => o.option_text).join(', ') || '-' },
          {
            title: 'Action', width: 100, render: (_, q) => (
              <Popconfirm title="Delete this question?" onConfirm={() => deleteQuestion.mutate({ id: q.question_id, assessmentId: assessment.assessment_id })}>
                <Button danger size="small" icon={<DeleteOutlined />} />
              </Popconfirm>
            ),
          },
        ]}
      />

      <Drawer open={open} onClose={() => setOpen(false)} title="Add quiz question" width={720}>
        <Form form={form} layout="vertical" onFinish={saveQuestion}>
          <Form.Item name="question_text" label="Question" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <div className="grid gap-4 md:grid-cols-3">
            <Form.Item name="question_type" label="Type" rules={[{ required: true }]}>
              <Select
                onChange={(value) => {
                  form.setFieldValue('question_type', value);
                  form.setFieldValue('options', value === 'text' ? [] : value === 'true_false' ? [
                    { option_text: 'True', is_correct: true },
                    { option_text: 'False', is_correct: false },
                  ] : defaultOptions);
                }}
                options={[
                  { label: 'Single choice', value: 'single_choice' },
                  { label: 'Multiple choice', value: 'multiple_choice' },
                  { label: 'True / False', value: 'true_false' },
                  { label: 'Text', value: 'text' },
                ]}
              />
            </Form.Item>
            <Form.Item name="marks" label="Marks" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="sequence_no" label="Sequence" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>

          {questionType !== 'text' && (
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Options</div>
                    <Button size="small" onClick={() => add({ option_text: '', is_correct: false })}>Add option</Button>
                  </div>
                  {fields.map(field => (
                    <div key={field.key} className="grid items-center gap-2 md:grid-cols-[1fr_140px_80px]">
                      <Form.Item {...field} name={[field.name, 'option_text']} rules={[{ required: true, message: 'Option required' }]} className="mb-0">
                        <Input placeholder="Option text" />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'is_correct']} valuePropName="checked" className="mb-0">
                        {questionType === 'multiple_choice' ? <Checkbox>Correct</Checkbox> : <Radio>Correct</Radio>}
                      </Form.Item>
                      <Button danger onClick={() => remove(field.name)}>Remove</Button>
                    </div>
                  ))}
                  <div className="text-xs text-slate-500">For single choice / true-false, mark exactly one option correct. For multiple choice, mark all correct answers.</div>
                </div>
              )}
            </Form.List>
          )}

          <Space className="mt-6">
            <Button type="primary" htmlType="submit" loading={createQuestion.isPending}>Save question</Button>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>
    </Card>
  );
}

export function AssessmentsPage() {
  const { data, isLoading } = useAssessments();
  const { data: attempts } = useAssessmentAttempts();
  const { data: courses } = useCourses();
  const { data: modules } = useModules();
  const { data: users } = useUsers();
  const create = useCreateAssessment();
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Assessment Management"
        subtitle="Create real quizzes with questions, options, correct answers, and learner attempts."
        actions={<Button type="primary" onClick={() => setOpen(true)}>Create assessment</Button>}
      />
      <DataTable
        loading={isLoading}
        dataSource={data}
        expandable={{
          expandedRowRender: r => (
            <Tabs
              items={[
                {
                  key: 'questions',
                  label: 'Questions',
                  children: <QuestionsTab assessment={r} />,
                },
                {
                  key: 'attempts',
                  label: 'Attempts',
                  children: (
                    <Card title="Attempts">
                      <DataTable
                        dataSource={attempts?.filter(a => a.assessment_id === r.assessment_id)}
                        columns={[
                          { title: 'User', render: (_, a) => findUser(users, a.user_id)?.full_name },
                          { title: 'Attempt', dataIndex: 'attempt_no' },
                          { title: 'Score', dataIndex: 'score_obtained' },
                          { title: 'Result', render: (_, a) => <StatusTag value={a.result_status} /> },
                        ]}
                      />
                    </Card>
                  ),
                },
              ]}
            />
          ),
        }}
        columns={[
          { title: 'Title', dataIndex: 'assessment_title' },
          { title: 'Course', render: (_, r) => findCourse(courses, r.course_id)?.course_title },
          { title: 'Module', render: (_, r) => modules?.find(m => m.module_id === r.module_id)?.module_title },
          { title: 'Passing', dataIndex: 'passing_score' },
          { title: 'Active', render: (_, r) => <StatusTag value={r.is_active} /> },
        ]}
      />
      <Drawer open={open} onClose={() => setOpen(false)} title="Create assessment" width={520}>
        <Form
          layout="vertical"
          onFinish={v => create.mutate(v, { onSuccess: () => { message.success('Assessment created'); setOpen(false); } })}
        >
          <Form.Item name="course_id" label="Course" rules={[{ required: true }]}>
            <Select options={courses?.map(c => ({ label: c.course_title, value: c.course_id }))} />
          </Form.Item>
          <Form.Item name="module_id" label="Module">
            <Select options={modules?.map(m => ({ label: m.module_title, value: m.module_id }))} />
          </Form.Item>
          <Form.Item name="assessment_title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="assessment_type" label="Type" initialValue="quiz"><Input /></Form.Item>
          <Form.Item name="max_score" label="Max score" initialValue={100}><InputNumber className="w-full" /></Form.Item>
          <Form.Item name="passing_score" label="Passing score" initialValue={70}><InputNumber className="w-full" /></Form.Item>
          <Space><Button type="primary" htmlType="submit">Save</Button><Button onClick={() => setOpen(false)}>Cancel</Button></Space>
        </Form>
      </Drawer>
    </>
  );
}
