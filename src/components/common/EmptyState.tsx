import { Empty } from 'antd';
export function EmptyState({ description = 'No data found' }: { description?: string }) { return <div className="rounded-2xl bg-white p-10"><Empty description={description} /></div>; }
