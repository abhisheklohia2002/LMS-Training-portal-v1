import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";
import type { AssessmentQuestion, AssessmentQuestionOption } from "../types";

export const useAssessmentQuestions = (assessmentId?: number) =>
  useQuery({
    queryKey: assessmentId
      ? queryKeys.assessmentQuestions(assessmentId)
      : ["assessment-questions", "missing"],
    queryFn: () => api.assessmentQuestions.byAssessment(assessmentId!),
    enabled: Boolean(assessmentId),
    staleTime: 30_000,
  });

export const useLearnerAssessmentQuestions = (assessmentId?: number) =>
  useQuery({
    queryKey: assessmentId
      ? queryKeys.learnerAssessmentQuestions(assessmentId)
      : ["assessment-questions", "learner", "missing"],
    queryFn: () => api.assessmentQuestions.learnerByAssessment(assessmentId!),
    enabled: Boolean(assessmentId),
    staleTime: 15_000,
  });

export const useCreateAssessmentQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: Omit<Partial<AssessmentQuestion>, "options"> & {
        options?: Partial<AssessmentQuestionOption>[];
      },
    ) => api.assessmentQuestions.create(payload),
    onSuccess: (question) => {
      qc.invalidateQueries({
        queryKey: queryKeys.assessmentQuestions(question.assessment_id),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.learnerAssessmentQuestions(question.assessment_id),
      });
    },
  });
};

export const useDeleteAssessmentQuestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; assessmentId: number }) =>
      api.assessmentQuestions.delete(id),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: queryKeys.assessmentQuestions(variables.assessmentId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.learnerAssessmentQuestions(variables.assessmentId),
      });
    },
  });
};

export function useBulkUploadAssessmentQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assessmentId,
      file,
    }: {
      assessmentId: number;
      file: File;
    }) => api.assessmentQuestions.bulkUpload(assessmentId, file),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.assessmentQuestions(variables.assessmentId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.learnerAssessmentQuestions(variables.assessmentId),
      });
    },
  });
}
