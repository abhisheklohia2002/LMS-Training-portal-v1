import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { router } from './router';
export function App(){ return <ConfigProvider theme={{ token: { borderRadius: 12, colorPrimary: '#2563eb' } }}><AntApp><RouterProvider router={router}/></AntApp></ConfigProvider>; }
