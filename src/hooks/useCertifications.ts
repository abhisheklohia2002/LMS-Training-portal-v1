import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";
export const useCertifications = () =>
  useQuery({
    queryKey: queryKeys.certifications,
    queryFn: api.certifications.list,
    staleTime: 60_000,
  });
export const useCertificationsByCourse = (courseId?: number) =>
  useQuery({
    queryKey: courseId
      ? queryKeys.certificationsByCourse(courseId)
      : ["certifications", "course", "missing"],
    queryFn: () => api.certifications.byCourse(courseId!),
    enabled: Boolean(courseId),
    staleTime: 60_000,
  });
export const useCreateCertification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.certifications.create,
    onSuccess: (cert) => {
      qc.invalidateQueries({ queryKey: queryKeys.certifications });
      qc.invalidateQueries({
        queryKey: queryKeys.certificationsByCourse(cert.course_id),
      });
    },
  });
};
export const useCertificationRules = () =>
  useQuery({
    queryKey: ["certification-rules"],
    queryFn: api.certificationRules.list,
  });
