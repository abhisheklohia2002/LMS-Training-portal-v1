import { Card, Switch } from 'antd';
import { PageHeader } from '../../components/common/PageHeader';
export function SettingsPage(){ return <><PageHeader title="Settings" subtitle="Portal preferences and future backend integration settings."/><Card className="page-card"><div className="flex items-center justify-between"><span>Enable mock mode</span><Switch checked /></div></Card></>; }
