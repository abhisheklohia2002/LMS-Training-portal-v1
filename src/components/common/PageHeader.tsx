import { Typography } from 'antd';
import type { ReactNode } from 'react';
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><Typography.Title level={2} className="!mb-1">{title}</Typography.Title>{subtitle && <p className="text-slate-500">{subtitle}</p>}</div>{actions}</div>;
}
