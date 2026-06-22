import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Segmented, Typography, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../services/api';

const roleCredentials: Record<string, { email: string; password: string }> = {
  employee: { email: 'david@test.com', password: '12345678' },
};

export function LoginPage() {
  const [form] = Form.useForm();
  const login = useLogin();
  const navigate = useNavigate();

  return (
    <Card className="page-card w-full max-w-md">
      <Typography.Title level={3}>Welcome back</Typography.Title>
      <p className="mb-6 text-slate-500">Use quick-fill roles or enter real backend credentials.</p>
      <Form
        form={form}
        layout="vertical"
        initialValues={roleCredentials.employee}
        onFinish={(values) => login.mutate(values, {
          onSuccess: () => { message.success('Logged in'); navigate('/'); },
          onError: (error) => message.error(getApiErrorMessage(error)),
        })}
      >
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input prefix={<MailOutlined />} />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password prefix={<LockOutlined />} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={login.isPending} block size="large">Login</Button>
        <Button type="link" block className="mt-2">Forgot password?</Button>
      </Form>
    </Card>
  );
}
