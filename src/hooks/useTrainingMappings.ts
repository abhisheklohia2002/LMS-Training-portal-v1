import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';
export const useTrainingMappings = () => useQuery({ queryKey: queryKeys.mappings, queryFn: api.mappings.list, staleTime: 60_000 });
export const useCreateTrainingMapping = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.mappings.create, onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.mappings }) }); };
