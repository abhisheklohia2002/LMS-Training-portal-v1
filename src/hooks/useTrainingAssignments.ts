import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';
import type { TrainingAssignment } from '../types';

export const useTrainingAssignments = () => useQuery({
  queryKey: queryKeys.assignments,
  queryFn: api.assignments.list,
  staleTime: 30_000,
});

export const useTrainingAssignmentsByUser = (userId?: number) => useQuery({
  queryKey: userId ? queryKeys.assignmentsByUser(userId) : ['assignments', 'user', 'missing'],
  queryFn: () => api.assignments.listByUser(userId!),
  enabled: Boolean(userId),
  staleTime: 30_000,
});

export const useTrainingAssignment = (id?: number) => useQuery({
  queryKey: queryKeys.assignment(id || ''),
  queryFn: () => api.assignments.get(Number(id)),
  enabled: !!id,
});

export const useCreateTrainingAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<TrainingAssignment>) => api.assignments.create(payload),
    onSuccess: assignment => {
      qc.invalidateQueries({ queryKey: queryKeys.assignments });
      qc.invalidateQueries({ queryKey: queryKeys.assignmentsByUser(assignment.user_id) });
      qc.invalidateQueries({ queryKey: ['module-progress'] });
    },
  });
};

export const useUpdateAssignmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TrainingAssignment['status'] }) => api.assignments.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: queryKeys.assignments });
      const previous = qc.getQueryData<TrainingAssignment[]>(queryKeys.assignments);
      qc.setQueryData<TrainingAssignment[]>(queryKeys.assignments, old => old?.map(a => a.assignment_id === id ? { ...a, status } : a));
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) qc.setQueryData(queryKeys.assignments, context.previous);
    },
    onSuccess: assignment => {
      qc.invalidateQueries({ queryKey: queryKeys.assignments });
      qc.invalidateQueries({ queryKey: queryKeys.assignmentsByUser(assignment.user_id) });
    },
  });
};
