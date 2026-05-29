import { Tag } from 'antd';
const colors: Record<string,string> = { active:'green', inactive:'red', completed:'green', in_progress:'blue', assigned:'gold', overdue:'red', cancelled:'default', pending:'gold', issued:'green', expired:'red', revoked:'volcano', passed:'green', failed:'red', true:'green', false:'default' };
export function StatusTag({ value }: { value?: string | boolean }) { const text = String(value ?? 'unknown'); return <Tag color={colors[text] ?? 'blue'}>{text.replaceAll('_',' ').toUpperCase()}</Tag>; }
