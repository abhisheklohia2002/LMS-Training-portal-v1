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



type BulkUploadUsersToDepartmentPayload = {
  departmentId: number;
  file: File;
};

export function useBulkUploadUsersToDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      departmentId,
      file,
    }: BulkUploadUsersToDepartmentPayload) => {
      const formData = new FormData();
      formData.append("file", file);

      return await api.department.bulkUploadUsersToDepartment(
        departmentId,
        formData,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}