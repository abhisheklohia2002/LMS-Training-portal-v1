import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export function useReactivateTrainingAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: number) => api.assignments.reactivate(assignmentId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["module-progress"] });
      queryClient.invalidateQueries({ queryKey: ["assessment-attempts"] });
    },
  });
}