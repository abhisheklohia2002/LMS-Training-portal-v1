import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';
export const useRoles = () => useQuery({ queryKey: queryKeys.roles, queryFn: api.roles.list, staleTime: 5 * 60_000 });
export const useCreateRole = () => { const qc = useQueryClient(); return useMutation({ mutationFn: api.roles.create, onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.roles }) }); };
