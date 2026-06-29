import { Button, Empty, List, Segmented, Typography } from "antd";
import { useState } from "react";
import dayjs from "dayjs";

import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import {
  useMarkNotificationRead,
  useNotifications,
} from "../../hooks/useNotifications";
import { useThemeMode } from "../../context/ThemeProvider/ThemeProvider";

const { Text } = Typography;

type NotificationFilter = "all" | "unread" | "read";

export function NotificationsPage() {
  const { isDarkMode } = useThemeMode();

  const ui = {
    list: isDarkMode
      ? "rounded-2xl border border-[#253249] bg-[#111C2E] p-3"
      : "rounded-2xl border border-slate-200 bg-white p-3",

    item: isDarkMode
      ? "border-[#253249]"
      : "border-slate-200",

    title: isDarkMode ? "text-[#EAF0F7]" : "text-slate-900",

    muted: isDarkMode ? "text-slate-400" : "text-slate-500",

    actionButton: isDarkMode
      ? "border-[#253249] bg-[#0F172A] text-[#EAF0F7] hover:!border-[#22C7B8] hover:!text-[#22C7B8]"
      : "border-slate-300 bg-white text-slate-700 hover:!border-[#109B9C] hover:!text-[#109B9C]",
  };

  const { data = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  const [filter, setFilter] = useState<NotificationFilter>("all");

  const filteredNotifications = data.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read_status;
    return notification.read_status;
  });

  const handleMarkRead = (notificationID: number) => {
    markRead.mutate(notificationID);
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Due dates, certificate events and assessment results."
        actions={
          <Segmented
            value={filter}
            onChange={(value) => setFilter(value as NotificationFilter)}
            options={[
              { label: "All", value: "all" },
              { label: "Unread", value: "unread" },
              { label: "Read", value: "read" },
            ]}
          />
        }
      />

      <List
        loading={isLoading}
        dataSource={filteredNotifications}
        locale={{
          emptyText: (
            <Empty
              description={
                <span className={ui.muted}>No notifications found</span>
              }
            />
          ),
        }}
        className={ui.list}
        renderItem={(notification) => {
          const date =
            notification.sent_at ||
            notification.created_at ||
            new Date().toISOString();

          return (
            <List.Item
              className={ui.item}
              actions={[
                !notification.read_status ? (
                  <Button
                    key="read"
                    size="small"
                    loading={markRead.isPending}
                    disabled={markRead.isPending}
                    onClick={() =>
                      handleMarkRead(notification.notification_id)
                    }
                    className={ui.actionButton}
                  >
                    Mark read
                  </Button>
                ) : null,
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-medium ${ui.title}`}>
                      {notification.title || notification.message}
                    </span>

                    <StatusTag
                      value={notification.read_status ? "read" : "unread"}
                    />
                  </div>
                }
                description={
                  <div className="space-y-1">
                    {notification.title && (
                      <div>
                        <Text className={ui.muted}>
                          {notification.message}
                        </Text>
                      </div>
                    )}

                    <div>
                      <Text className={ui.muted}>
                        {notification.notification_type} •{" "}
                        {dayjs(date).format("DD MMM YYYY HH:mm")}
                      </Text>
                    </div>
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    </>
  );
}