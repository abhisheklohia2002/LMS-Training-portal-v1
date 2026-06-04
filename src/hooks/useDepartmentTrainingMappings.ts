import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";

export const useDepartmentTrainingMappings = () =>
  useQuery({
    queryKey: queryKeys.departmentTrainingMappings,
    queryFn: api.departmentTrainingMappings.list,
  });

export const useDepartmentTrainingMappingsByDepartment = (
  departmentId?: number,
) =>
  useQuery({
    queryKey: queryKeys.departmentTrainingMappingsByDepartment(
      departmentId || 0,
    ),
    queryFn: () =>
      api.departmentTrainingMappings.getByDepartment(Number(departmentId)),
    enabled: !!departmentId,
  });

export const useCreateDepartmentTrainingMapping = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => api.departmentTrainingMappings.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.departmentTrainingMappings,
      });
    },
  });
};