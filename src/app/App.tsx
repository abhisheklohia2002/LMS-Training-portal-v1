import { RouterProvider } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import { router } from "./router";
import { UploadProvider } from "../context/UploadProvider";
export function App() {
  return (
    <ConfigProvider
      theme={{ token: { borderRadius: 12, colorPrimary: "#109B9C",colorBgTextActive:"#DF736B" } }}
    >
      <AntApp>
        <UploadProvider>
        <RouterProvider router={router} />
        </UploadProvider>
      </AntApp>
    </ConfigProvider>
  );
}
