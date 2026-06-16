import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { TrainingAssignment } from "../types";

export function useUpdateTrainingAssignmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: TrainingAssignment["status"];
    }) => api.assignments.updateStatus(id, status),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["training-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["module-progress"] });
    },
  });
}