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
import {
  useCertifications,
  useCreateCertification,
} from "../../hooks/useCertifications";
import {
  useCertificationRules,
  useUpdateCertificationRule,
  useDeleteCertificationRule,
} from "../../hooks/useCertificationRules";

type Props = {
  courseId: number;
};

export function CourseCertificationTab({ courseId }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form] = Form.useForm();

  const { data: rules = [] } = useCertificationRules();
  const { data: certifications = [], isLoading } = useCertifications();

  const createCertification = useCreateCertification();
  const updateCertification = useUpdateCertificationRule();
  const deleteCertification = useDeleteCertificationRule();

  const courseCertifications = certifications.filter(
    (certification: any) => certification.course_id === courseId,
  );

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
      course_id: courseId,
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
      <div className="mb-3 flex justify-end">
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Create certification
        </Button>
      </div>

      <Table
        rowKey="certification_id"
        loading={isLoading}
        dataSource={courseCertifications}
        columns={[
          {
            title: "Certification",
            dataIndex: "certification_name",
          },
          {
            title: "Validity",
            dataIndex: "validity_days",
            render: (days) => `${days} days`,
          },
          {
            title: "Status",
            dataIndex: "is_active",
            render: (value) =>
              value ? (
                <Tag color="green">Active</Tag>
              ) : (
                <Tag color="red">Inactive</Tag>
              ),
          },
          {
            title: "Actions",
            render: (_, record: any) => (
              <Space>
                <Button type="link" onClick={() => openEdit(record)}>
                  Edit
                </Button>

                <Button
                  type="link"
                  danger
                  onClick={() =>
                    deleteCertification.mutate(record.certification_id, {
                      onSuccess: () =>
                        message.success("Certification deleted"),
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
        title={editing ? "Edit certification" : "Create certification"}
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
              loading={
                createCertification.isPending || updateCertification.isPending
              }
            >
              Save
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Certification name"
            name="certification_name"
            rules={[
              { required: true, message: "Certification name is required" },
            ]}
          >
            <Input placeholder="Safety Training Certificate" />
          </Form.Item>

          <Form.Item
            label="Validity days"
            name="validity_days"
            rules={[{ required: true, message: "Validity days is required" }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item label="Certification rule" name="rule_id">
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