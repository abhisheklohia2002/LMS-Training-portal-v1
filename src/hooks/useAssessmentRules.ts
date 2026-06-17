import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";

const normalizeArrayResponse = (response: any) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
};

export const useAssessmentRules = (courseId?: number) =>
  useQuery({
    queryKey: [...queryKeys.assessmentRules, courseId],
    queryFn: async () => {
      const response = await api.assessmentRules.list();

      const rules = normalizeArrayResponse(response);

      if (!courseId) {
        return rules;
      }

      return rules.filter(
        (rule: any) =>
          Number(rule.course_id ?? rule.CourseID ?? rule.courseID) ===
          Number(courseId),
      );
    },
    staleTime: 30_000,
  });

export const useCreateAssessmentRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: number;
      payload: any;
    }) => api.assessmentRules.create({ courseId, payload }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.assessmentRules,
      });

      queryClient.invalidateQueries({
        queryKey: [...queryKeys.assessmentRules, variables.courseId],
      });
    },
  });
};

export const useUpdateAssessmentRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      api.assessmentRules.update(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.assessmentRules,
      });
    },
  });
};

export const useDeleteAssessmentRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.assessmentRules.delete,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.assessmentRules,
      });
    },
  });
};