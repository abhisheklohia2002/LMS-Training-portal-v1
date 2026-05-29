import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";
export const useCertificateIssues = () =>
  useQuery({
    queryKey: queryKeys.certificateIssues,
    queryFn: api.certificateIssues.list,
    staleTime: 60_000,
  });
export const useCertificateIssuesByUser = (userId?: number) =>
  useQuery({
    queryKey: userId
      ? queryKeys.certificateIssuesByUser(userId)
      : ["certificate-issues", "user", "missing"],
    queryFn: () => api.certificateIssues.byUser(userId!),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
export const useIssueCertificate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.certificateIssues.issue,
    onSuccess: (issue) => {
      qc.invalidateQueries({ queryKey: queryKeys.certificateIssues });
      qc.invalidateQueries({
        queryKey: queryKeys.certificateIssuesByUser(issue.user_id),
      });
    },
  });
};
