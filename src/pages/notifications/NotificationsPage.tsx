import { Button, List, Segmented } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusTag } from '../../components/common/StatusTag';
import { useMarkNotificationRead, useNotifications } from '../../hooks/useNotifications';
export function NotificationsPage(){ const {data,isLoading}=useNotifications(); const mark=useMarkNotificationRead(); const [filter,setFilter]=useState('all'); const filtered=data?.filter(n=>filter==='all'||(filter==='unread'?!n.read_status:n.read_status)); return <><PageHeader title="Notifications" subtitle="Due dates, certificate events and assessment results." actions={<Segmented value={filter} onChange={v=>setFilter(String(v))} options={['all','unread','read']}/>}/><List loading={isLoading} dataSource={filtered} renderItem={n=><List.Item actions={[!n.read_status && <Button key="read" onClick={()=>mark.mutate(n.notification_id)}>Mark read</Button>]}><List.Item.Meta title={<span>{n.message} <StatusTag value={n.read_status?'read':'unread'}/></span>} description={`${n.notification_type} • ${dayjs(n.sent_at).format('DD MMM YYYY HH:mm')}`}/></List.Item>} className="rounded-2xl bg-white p-3"/></>; }
