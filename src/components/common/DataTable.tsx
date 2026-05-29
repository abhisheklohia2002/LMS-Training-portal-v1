import { Table } from 'antd';
import type { TableProps } from 'antd';
export function DataTable<T extends object>(props: TableProps<T>) { return <Table rowKey={(row: any) => row.id ?? row.user_id ?? row.course_id ?? row.assignment_id ?? row.assessment_id ?? row.notification_id ?? row.certificate_issue_id ?? row.role_id ?? row.mapping_id} className="rounded-2xl bg-white" pagination={{ pageSize: 8 }} {...props} />; }
