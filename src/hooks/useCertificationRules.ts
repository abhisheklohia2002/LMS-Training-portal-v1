import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";

export const useCertificationRules = () =>
  useQuery({
    queryKey: queryKeys.certificationRules,
    queryFn: api.certificationRules.list,
    staleTime: 30_000,
  });

export const useCreateCertificationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.certificationRules.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.certificationRules });
    },
  });
};

export const useUpdateCertificationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      api.certificationRules.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.certificationRules });
    },
  });
};

export const useDeleteCertificationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.certificationRules.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.certificationRules });
    },
  });
};