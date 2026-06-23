import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";
import type { Course } from "../types";
export const useCourses = () =>
  useQuery({
    queryKey: queryKeys.courses,
    queryFn: api.courses.list,
    staleTime: 60_000,
  });
export const useCourse = (id?: string | number) =>
  useQuery({
    queryKey: queryKeys.course(id || ""),
    queryFn: () => api.courses.get(Number(id)),
    enabled: !!id,
  });
export const useCreateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Course>) => api.courses.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.courses }),
  });
};


export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<Course>;
    }) => api.courses.update(Number(id), payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
      queryClient.invalidateQueries({
        queryKey: queryKeys.course(variables.id),
      });
    },
  });
}