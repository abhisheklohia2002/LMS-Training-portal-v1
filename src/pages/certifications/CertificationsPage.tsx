import { useState } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "../../components/common/PageHeader";
import { useCourses } from "../../hooks/useCourses";
import { useCertificationRules, useDeleteCertificationRule, useUpdateCertificationRule } from "../../hooks/useCertificationRules";
import {
  useCertifications,
  useCreateCertification,
} from "../../hooks/useCertifications";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";
import Text from "antd/es/typography/Text";


export function CertificationsPage() {
  const { isDarkMode } = useThemeMode();
  
    const ui = {
      text: isDarkMode ? "text-[#EAF0F7]" : "text-slate-900",
      actionButton: isDarkMode
        ? "border-[#253249] bg-[#111C2E] text-[#EAF0F7]"
        : "",
    };
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form] = Form.useForm();

  const { data: courses = [] } = useCourses();
  const { data: rules = [] } = useCertificationRules();
  const { data: certifications = [], isLoading } = useCertifications();

  const createCertification = useCreateCertification();
  const updateCertification = useUpdateCertificationRule();
  const deleteCertification = useDeleteCertificationRule();

  const courseOptions = courses.map((course: any) => ({
    label: course.course_title,
    value: course.course_id,
  }));

  const ruleOptions = rules.map((rule: any) => ({
    label: `Validity ${rule.validity_days} days · Min score ${rule.minimum_score_required}`,
    value: rule.certification_rule_id,
  }));

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      validity_days: 365,
      is_active: true,
    });
    setOpen(true);
  };

  const openEdit = (record: any) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue(record);
    setOpen(true);
  };

  const closeDrawer = () => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();

    const payload = {
      ...values,
      course_id: Number(values.course_id),
      validity_days: Number(values.validity_days),
      rule_id: values.rule_id ? Number(values.rule_id) : undefined,
      is_active: Boolean(values.is_active),
    };

    if (editing) {
      await updateCertification.mutateAsync({
        id: editing.certification_id,
        payload,
      });
      message.success("Certification updated");
    } else {
      await createCertification.mutateAsync(payload);
      message.success("Certification created");
    }

    closeDrawer();
  };

  return (
    <>
      <PageHeader
        title="Certifications"
        subtitle="Create course certificates and manage issued certificates."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Create Certification
          </Button>
        }
      />

      <Table
        rowKey="certification_id"
        loading={isLoading}
        dataSource={certifications}
        columns={[
          {
            title: "Certification",
            dataIndex: "certification_name",
            render:(text:string)=>(
              <Text className={ui.text}>
                {text}
              </Text>
            )
          },
          {
            title: "Course",
            render: (_, record) =>   
              {
              const course = courses.find(
                (c: any) => c.course_id === record.course_id,
              );
              return <Text className={ui.text}>
                {course?.course_title ?? record.course_id}
              </Text> 
            },
          },
          {
            title: "Validity",
            dataIndex: "validity_days",
            render: (days) => <Text className={ui.text}>{`${days} days`}</Text> ,
          },
          {
            title: "Status",
            dataIndex: "is_active",
            render: (value) =>
              value ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
          },
          {
            title: "Actions",
            render: (_, record) => (
              <Space>
                <Button type="link" onClick={() => openEdit(record)}>
                  Edit
                </Button>

                <Button
                  type="link"
                  danger
                  onClick={() =>
                    deleteCertification.mutate(record.certification_id, {
                      onSuccess: () => message.success("Certification deleted"),
                    })
                  }
                >
                  Delete
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Drawer
        title={editing ? "Edit Certification" : "Create Certification"}
        open={open}
        onClose={closeDrawer}
        width={520}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={closeDrawer}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={createCertification.isPending || updateCertification.isPending}
            >
              Save
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Course"
            name="course_id"
            rules={[{ required: true, message: "Course is required" }]}
          >
            <Select
              showSearch
              placeholder="Select course"
              optionFilterProp="label"
              options={courseOptions}
            />
          </Form.Item>

          <Form.Item
            label="Certification Name"
            name="certification_name"
            rules={[{ required: true, message: "Certification name is required" }]}
          >
            <Input placeholder="Electrical Engineer Certificate" />
          </Form.Item>

          <Form.Item
            label="Validity Days"
            name="validity_days"
            rules={[{ required: true, message: "Validity days is required" }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item label="Certification Rule" name="rule_id">
            <Select
              allowClear
              showSearch
              placeholder="Select certification rule"
              optionFilterProp="label"
              options={ruleOptions}
            />
          </Form.Item>

          <Form.Item label="Active" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}