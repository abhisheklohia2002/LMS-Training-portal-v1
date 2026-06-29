import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../services/api";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";

const roleCredentials: Record<string, { email: string; password: string }> = {
  employee: { email: "david@test.com", password: "12345678" },
};

export function LoginPage() {
  const { isDarkMode } = useThemeMode();

  const ui = {
    card: isDarkMode
      ? "w-full max-w-md rounded-2xl border border-[#253249] bg-[#111C2E] text-[#EAF0F7] shadow-xl"
      : "w-full max-w-md rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl",

    title: isDarkMode ? "!text-[#EAF0F7]" : "!text-slate-900",

    subtitle: isDarkMode ? "mb-6 text-slate-400" : "mb-6 text-slate-500",

    linkButton: isDarkMode
      ? "mt-2 !text-[#22C7B8] hover:!text-[#35D6C8]"
      : "mt-2 !text-[#109B9C] hover:!text-[#14B8A6]",
  };

  const [form] = Form.useForm();
  const login = useLogin();
  const navigate = useNavigate();

  return (
    <Card className={ui.card}>
      <Typography.Title level={3} className={ui.title}>
        Welcome back
      </Typography.Title>

      <p className={ui.subtitle}>
        Use quick-fill roles or enter real backend credentials.
      </p>

      <Form
        form={form}
        layout="vertical"
        initialValues={roleCredentials.employee}
        onFinish={(values) =>
          login.mutate(values, {
            onSuccess: () => {
              message.success("Logged in");
              navigate("/");
            },
            onError: (error) => message.error(getApiErrorMessage(error)),
          })
        }
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Enter a valid email",
            },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            {
              required: true,
              message: "Password is required",
            },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter password"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={login.isPending}
          block
          size="large"
        >
          Login
        </Button>

        <Button type="link" block className={ui.linkButton}>
          Forgot password?
        </Button>
      </Form>
    </Card>
  );
}