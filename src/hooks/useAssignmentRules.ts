
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";

export const useAssignmentRules = () =>
  useQuery({
    queryKey: queryKeys.assignmentRules,
    queryFn: api.assignmentRules.list,
    staleTime: 30_000,
  });

export const useCreateAssignmentRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.assignmentRules.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignmentRules });
    },
  });
};

export const useUpdateAssignmentRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      api.assignmentRules.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignmentRules });
    },
  });
};

export const useDeleteAssignmentRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.assignmentRules.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignmentRules });
    },
  });
};