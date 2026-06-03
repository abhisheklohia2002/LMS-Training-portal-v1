import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: api.auth.me,
    staleTime: 5 * 60_000,
  });
}
export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.auth.login,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}
export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => qc.clear(),
  });
}
