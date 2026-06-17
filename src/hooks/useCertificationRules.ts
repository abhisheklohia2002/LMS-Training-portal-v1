import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";

const normalizeArrayResponse = (response: any) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

export const useCertificationRules = (courseId?: number) =>
  useQuery({
    queryKey: [...queryKeys.certificationRules, courseId],
    queryFn: async () => {
      const response = await api.certificationRules.list();
      const rules = normalizeArrayResponse(response);

      if (!courseId) return rules;

      return rules.filter(
        (rule: any) =>
          Number(rule.course_id ?? rule.CourseID ?? rule.courseID) ===
          Number(courseId),
      );
    },
    staleTime: 30_000,
  });

export const useCreateCertificationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: number;
      payload: any;
    }) => api.certificationRules.create({ courseId, payload }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.certificationRules,
      });

      queryClient.invalidateQueries({
        queryKey: [...queryKeys.certificationRules, variables.courseId],
      });
    },
  });
};

export const useUpdateCertificationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      api.certificationRules.update(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.certificationRules,
      });
    },
  });
};

export const useDeleteCertificationRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.certificationRules.delete,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.certificationRules,
      });
    },
  });
};