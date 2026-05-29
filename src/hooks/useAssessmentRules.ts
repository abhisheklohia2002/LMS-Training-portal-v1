import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";

export const useAssessmentRules = () =>
  useQuery({
    queryKey: queryKeys.assessmentRules,
    queryFn: api.assessmentRules.list,
    staleTime: 30_000,
  });

export const useCreateAssessmentRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.assessmentRules.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessmentRules });
    },
  });
};

export const useUpdateAssessmentRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      api.assessmentRules.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessmentRules });
    },
  });
};

export const useDeleteAssessmentRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.assessmentRules.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessmentRules });
    },
  });
};