import { RouterProvider } from "react-router-dom";
import { ConfigProvider, App as AntApp, theme } from "antd";
import { router } from "./router";
import { UploadProvider } from "../context/UploadProvider";
import {
  ThemeProvider,
  useThemeMode,
} from "../context/ThemeProvider/ThemeProvider";

function AppContent() {
  const { isDarkMode } = useThemeMode();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          borderRadius: 12,

          ...(isDarkMode
            ? {
                colorPrimary: "#22C7B8",
                colorPrimaryHover: "#35D6C8",
                colorPrimaryActive: "#14B8A6",

                colorBgBase: "#0B1220",
                colorBgLayout: "#0B1220",
                colorBgContainer: "#111C2E",
                colorBgElevated: "#162238",

                colorBorder: "#253249",
                colorBorderSecondary: "#1E293B",

                colorTextBase: "#EAF0F7",
                colorText: "#EAF0F7",
                colorTextSecondary: "#A8B3C7",
                colorTextTertiary: "#7D8AA3",

                colorSuccess: "#34D399",
                colorWarning: "#F59E0B",
                colorError: "#F87171",

                colorFillSecondary: "#1B2940",
                colorBgTextActive: "#1B2940",
              }
            : {
                colorPrimary: "#109B9C",
                colorPrimaryHover: "#14B8A6",
                colorPrimaryActive: "#0F766E",

                colorBgBase: "#F4F7FB",
                colorBgLayout: "#F4F7FB",
                colorBgContainer: "#FFFFFF",
                colorBgElevated: "#FFFFFF",

                colorBorder: "#E2E8F0",
                colorBorderSecondary: "#EEF2F7",

                colorTextBase: "#111827",
                colorText: "#111827",
                colorTextSecondary: "#64748B",
                colorTextTertiary: "#94A3B8",

                colorSuccess: "#16A34A",
                colorWarning: "#F59E0B",
                colorError: "#DC2626",

                colorBgTextActive: "#E6FFFB",
              }),
        },
        components: {
          Layout: {
            headerBg: isDarkMode ? "#0F172A" : "#FFFFFF",
            siderBg: isDarkMode ? "#07111F" : "#07111F",
            bodyBg: isDarkMode ? "#0B1220" : "#F4F7FB",
          },
          Menu: {
            darkItemBg: "#07111F",
            darkSubMenuItemBg: "#07111F",
            darkItemSelectedBg: "#22C7B8",
            darkItemSelectedColor: "#031B1A",
            darkItemColor: "#A8B3C7",
            darkItemHoverColor: "#FFFFFF",
          },
          Card: {
            colorBgContainer: isDarkMode ? "#111C2E" : "#FFFFFF",
          },
          Button: {
            primaryShadow: "none",
          },
          Table: {
            headerBg: isDarkMode ? "#1B2940" : "#F8FAFC",
            headerColor: isDarkMode ? "#EAF0F7" : "#111827",
            rowHoverBg: isDarkMode ? "#162238" : "#F8FAFC",
            borderColor: isDarkMode ? "#253249" : "#E2E8F0",
            colorBgContainer: isDarkMode ? "#111C2E" : "#FFFFFF",
            colorText: isDarkMode ? "#EAF0F7" : "#111827",
            colorTextHeading: isDarkMode ? "#EAF0F7" : "#111827",
            // expandedRowBg: isDarkMode ? "#0B1220" : "#F8FAFC"
          },
          Pagination: {
            itemActiveBg: isDarkMode ? "#FFf" : "#109B9C",
            colorPrimary: isDarkMode ? "#22C7B8" : "#109B9C",
            colorPrimaryHover: isDarkMode ? "#35D6C8" : "#14B8A6",
            colorText: isDarkMode ? "#EAF0F7" : "#111827",
            colorTextDisabled: isDarkMode ? "#64748B" : "#94A3B8",
            colorBgContainer: isDarkMode ? "#111C2E" : "#FFFFFF",
            colorBorder: isDarkMode ? "#253249" : "#E2E8F0",
          },
          
        },
      }}
    >
      <AntApp>
        <UploadProvider>
          <RouterProvider router={router} />
        </UploadProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
