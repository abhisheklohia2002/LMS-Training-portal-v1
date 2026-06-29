import { Button, Card, Form, Input, Select, message } from "antd";
import { PageHeader } from "../../components/common/PageHeader";
import { useCreateNotification } from "../../hooks/useNotifications";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";

type CreateNotificationForm = {
  notification_type: string;
  title?: string;
  message: string;
  target_audience: string;
};

export function AdminCreateNotificationPage() {
  const { isDarkMode } = useThemeMode();

  const ui = {
    card: isDarkMode
      ? "rounded-2xl border border-[#253249] bg-[#111C2E] text-[#EAF0F7]"
      : "rounded-2xl border border-slate-200 bg-white text-slate-900",

    submitButton: isDarkMode
      ? "shadow-none"
      : "",

    formWrapper: isDarkMode
      ? "text-[#EAF0F7]"
      : "text-slate-900",
  };

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

      <Card className={ui.card}>
        <div className={ui.formWrapper}>
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
              rules={[
                {
                  required: true,
                  message: "Notification type is required",
                },
              ]}
            >
              <Select
                placeholder="Select notification type"
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
              rules={[
                {
                  required: true,
                  message: "Message is required",
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Write notification message..."
              />
            </Form.Item>

            <Form.Item
              name="target_audience"
              label="Target Audience"
              rules={[
                {
                  required: true,
                  message: "Target audience is required",
                },
              ]}
            >
              <Select
                placeholder="Select target audience"
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
              className={ui.submitButton}
            >
              Send Notification
            </Button>
          </Form>
        </div>
      </Card>
    </>
  );
}