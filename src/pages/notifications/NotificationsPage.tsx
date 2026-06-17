import { Button, Empty, List, Segmented, Typography } from "antd";
import { useState } from "react";
import dayjs from "dayjs";

import { PageHeader } from "../../components/common/PageHeader";
import { StatusTag } from "../../components/common/StatusTag";
import {
  useMarkNotificationRead,
  useNotifications,
} from "../../hooks/useNotifications";

const { Text } = Typography;

type NotificationFilter = "all" | "unread" | "read";

export function NotificationsPage() {
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
          emptyText: <Empty description="No notifications found" />,
        }}
        className="rounded-2xl bg-white p-3"
        renderItem={(notification) => {
          const date =
            notification.sent_at ||
            notification.created_at ||
            new Date().toISOString();

          return (
            <List.Item
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
                  >
                    Mark read
                  </Button>
                ) : null,
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center gap-2">
                    <span>{notification.title || notification.message}</span>

                    <StatusTag
                      value={notification.read_status ? "read" : "unread"}
                    />
                  </div>
                }
                description={
                  <div className="space-y-1">
                    {notification.title && (
                      <div>
                        <Text type="secondary">{notification.message}</Text>
                      </div>
                    )}

                    <div>
                      <Text type="secondary">
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