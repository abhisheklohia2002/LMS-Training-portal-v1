import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";

export const useDepartmentAssignments = () =>
  useQuery({
    queryKey: queryKeys.departmentAssignments,
    queryFn: api.departmentAssignments.list,
  });

export const useAssignCourseToDepartment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => api.departmentAssignments.assignCourse(payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.departmentAssignments,
      });

      qc.invalidateQueries({
        queryKey: queryKeys.trainingAssignments,
      });
    },
  });
};