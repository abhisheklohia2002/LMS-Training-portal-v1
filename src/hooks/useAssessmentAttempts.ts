import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";

export const useAssessmentAttempts = () =>
  useQuery({
    queryKey: queryKeys.assessmentAttempts,
    queryFn: api.assessmentAttempts.list,
    staleTime: 30_000,
  });
export const useAssessmentAttemptsByUser = (userId?: number) =>
  useQuery({
    queryKey: userId
      ? queryKeys.assessmentAttemptsByUser(userId)
      : ["assessment-attempts", "user", "missing"],
    queryFn: () => api.assessmentAttempts.byUser(userId!),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
export const useSubmitAssessment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.assessmentAttempts.submit,
    onSuccess: (attempt) => {
      qc.invalidateQueries({ queryKey: queryKeys.assessmentAttempts });
      qc.invalidateQueries({
        queryKey: queryKeys.assessmentAttemptsByUser(attempt.user_id),
      });
      qc.invalidateQueries({ queryKey: ["module-progress"] });
      qc.invalidateQueries({ queryKey: queryKeys.assignments });
      qc.invalidateQueries({
        queryKey: queryKeys.assignmentsByUser(attempt.user_id),
      });
    },
  });
};
