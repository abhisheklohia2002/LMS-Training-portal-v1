import { Drawer } from 'antd';
import type { ReactNode } from 'react';
export function FormDrawer({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) { return <Drawer title={title} open={open} onClose={onClose} width={520} destroyOnClose>{children}</Drawer>; }
