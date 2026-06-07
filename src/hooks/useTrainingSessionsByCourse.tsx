import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export function useCreateTrainingSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => api.trainingSessions.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-sessions"] });
    },
  });
}