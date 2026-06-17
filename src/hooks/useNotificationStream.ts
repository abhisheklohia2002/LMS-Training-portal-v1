import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useNotificationStream() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!API_BASE_URL) {
      console.error("VITE_API_BASE_URL is missing");
      return;
    }

    const streamUrl = `${API_BASE_URL}/api/notifications/stream`;

    const eventSource = new EventSource(streamUrl, {
      withCredentials: true,
    });

    eventSource.addEventListener("notification", (event) => {
      try {
        const notification = JSON.parse(event.data);

        message.info(notification.title || notification.message || "New notification");

        queryClient.invalidateQueries({
          queryKey: ["notifications"],
        });
      } catch (error) {
        console.error("Invalid notification event:", error);
      }
    });

    eventSource.onerror = (error) => {
      console.error("Notification stream error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);
}