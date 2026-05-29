import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';
export const useReports = () => useQuery({ queryKey: queryKeys.reports, queryFn: api.reports.summary, staleTime: 2 * 60_000 });
