import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";
import type { User } from "../types";
export const useUsers = (page: number, pageSize: number) =>
  useQuery({
    queryKey: queryKeys.allusers(page, pageSize),
    queryFn: ()=> api.users.list(page, pageSize),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
export const useUser = (id?: string | number,) =>
  useQuery({
    queryKey: queryKeys.user(id || "",),
    queryFn: () => api.users.get(Number(id)),
    enabled: !!id,
  });
export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<User>) => api.users.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  });
};
export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<User> }) =>
      api.users.update(id, payload),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: queryKeys.users });
      qc.invalidateQueries({ queryKey: queryKeys.user(v.id) });
    },
  });
};


export const useBulkUploadUsers = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => api.users.bulkUpload(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};