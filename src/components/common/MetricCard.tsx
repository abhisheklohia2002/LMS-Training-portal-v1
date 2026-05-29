import { Card, Statistic } from 'antd';
import type { ReactNode } from 'react';
export function MetricCard({ title, value, icon, suffix }: { title: string; value: number | string; icon?: ReactNode; suffix?: string }) { return <Card className="page-card"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-xl text-blue-600">{icon}</div><Statistic title={title} value={value} suffix={suffix} /></div></Card>; }
