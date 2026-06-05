
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { CreateDepartmentPayload, UpdateDepartmentPayload } from "../types";


export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: api.department.getDepartments,
  });
}

export function useDepartmentById(departmentId: number) {
  return useQuery({
    queryKey: ["departments", departmentId],
    queryFn: () => api.department.getDepartmentById(departmentId),
    enabled: !!departmentId,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) =>
      api.department.createDepartment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      departmentId,
      payload,
    }: {
      departmentId: number;
      payload: UpdateDepartmentPayload;
    }) => api.department.updateDepartment(departmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (departmentId: number) =>
      api.department.deleteDepartment(departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDepartmentTrainingMappings(departmentId: number) {
  return useQuery({
    queryKey: ["department-training-mappings", departmentId],
    queryFn: () => api.department.getDepartmentTrainingMappings(departmentId),
    enabled: !!departmentId,
  });
}

