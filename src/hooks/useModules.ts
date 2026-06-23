import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';
import type { Module, ModuleProgress } from '../types';

export const useModules = (courseId?: number) => useQuery({
  queryKey: queryKeys.modules(courseId),
  queryFn: () => api.modules.list(courseId),
  staleTime: 60_000,
});


export const useCreateModule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Module>) => api.modules.create(payload),
    onSuccess: module => {
      qc.invalidateQueries({ queryKey: queryKeys.modules(module.course_id) });
      qc.invalidateQueries({ queryKey: queryKeys.modules() });
      qc.invalidateQueries({ queryKey: queryKeys.courses });
    },
  });
};

export const useModuleProgress = (assignmentId?: number) => useQuery({
  queryKey: ['module-progress', assignmentId],
  queryFn: () => api.moduleProgress.byAssignment(Number(assignmentId)),
  enabled: !!assignmentId,
});

export const useCompleteModule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.moduleProgress.complete,
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: ['module-progress'] });
      const snapshots = qc.getQueriesData<ModuleProgress[]>({ queryKey: ['module-progress'] });
      snapshots.forEach(([key, value]) => {
        qc.setQueryData<ModuleProgress[]>(key, value?.map(p => p.id === id ? { ...p, status: 'completed', completed_at: new Date().toISOString() } : p));
      });
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([key, value]) => qc.setQueryData(key, value));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['module-progress'] });
      qc.invalidateQueries({ queryKey: queryKeys.assignments });
    },
  });
};


export const useUpdateModule = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<Module>;
    }) => api.modules.update(id, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: queryKeys.modules(variables.payload.course_id || ""),
      });
    },
  });
};
