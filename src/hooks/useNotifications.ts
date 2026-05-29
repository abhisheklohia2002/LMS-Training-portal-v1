import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';
import type { Notification } from '../types';

export const useNotifications = () => useQuery({
  queryKey: queryKeys.notifications,
  queryFn: api.notifications.list,
  staleTime: 30_000,
});

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.notifications.markRead,
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications });
      const previous = qc.getQueryData<Notification[]>(queryKeys.notifications);
      qc.setQueryData<Notification[]>(queryKeys.notifications, old => old?.map(n => n.notification_id === id ? { ...n, read_status: true } : n));
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) qc.setQueryData(queryKeys.notifications, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
};
