import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: api.notifications.list,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.notifications.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
}


export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.notifications.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
}