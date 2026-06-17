import { Button, Card, Form, Input, Select, message } from "antd";
import { PageHeader } from "../../components/common/PageHeader";
import { useCreateNotification } from "../../hooks/useNotifications";

type CreateNotificationForm = {
  notification_type: string;
  title?: string;
  message: string;
  target_audience: string;
};

export function AdminCreateNotificationPage() {
  const [form] = Form.useForm<CreateNotificationForm>();
  const createNotification = useCreateNotification();

  const onFinish = (values: CreateNotificationForm) => {
    createNotification.mutate(values, {
      onSuccess: () => {
        message.success("Notification sent successfully");
        form.resetFields();
      },
      onError: () => {
        message.error("Failed to send notification");
      },
    });
  };

  return (
    <>
      <PageHeader
        title="Create Notification"
        subtitle="Send announcements and alerts to users."
      />

      <Card className="rounded-2xl bg-white">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            notification_type: "announcement",
            target_audience: "all",
          }}
        >
          <Form.Item
            name="notification_type"
            label="Notification Type"
            rules={[{ required: true, message: "Notification type is required" }]}
          >
            <Select
              options={[
                { label: "Announcement", value: "announcement" },
                { label: "Training", value: "training" },
                { label: "Certificate", value: "certificate" },
                { label: "Assessment", value: "assessment" },
                { label: "Due Date", value: "due_date" },
              ]}
            />
          </Form.Item>

          <Form.Item name="title" label="Title">
            <Input placeholder="Example: New training assigned" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: "Message is required" }]}
          >
            <Input.TextArea rows={4} placeholder="Write notification message..." />
          </Form.Item>

          <Form.Item
            name="target_audience"
            label="Target Audience"
            rules={[{ required: true, message: "Target audience is required" }]}
          >
            <Select
              options={[
                { label: "All Users", value: "all" },
                { label: "Specific Users", value: "user" },
              ]}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={createNotification.isPending}
          >
            Send Notification
          </Button>
        </Form>
      </Card>
    </>
  );
}