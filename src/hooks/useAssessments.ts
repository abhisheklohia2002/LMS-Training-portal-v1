import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';

export const useAssessments = () => useQuery({ queryKey: queryKeys.assessments, queryFn: api.assessments.list, staleTime: 60_000 });
export const useAssessmentsByCourse = (courseId?: number) => useQuery({
  queryKey: courseId ? queryKeys.assessmentsByCourse(courseId) : ['assessments', 'course', 'missing'],
  queryFn: () => api.assessments.byCourse(courseId!),
  enabled: Boolean(courseId),
  staleTime: 60_000,
});
export const useCreateAssessment = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.assessments.create, onSuccess: assessment => { qc.invalidateQueries({ queryKey: queryKeys.assessments }); qc.invalidateQueries({ queryKey: queryKeys.assessmentsByCourse(assessment.course_id) }); } }); };
export const useAssessmentRules = () => useQuery({ queryKey: ['assessment-rules'], queryFn: api.assessmentRules.list });
export const useCreateAssessmentRule = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.assessmentRules.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['assessment-rules'] }) }); };
