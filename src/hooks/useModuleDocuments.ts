import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export function useModuleDocuments(moduleId?: number) {
  return useQuery({
    queryKey: ["module-documents", moduleId],
    queryFn: () => api.getModuleDocuments(moduleId!),
    enabled: !!moduleId,
  });
}

export function useUploadModulePdf(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      file,
      title,
    }: {
      moduleId: number;
      file: File;
      title?: string;
    }) => api.uploadModulePdf(moduleId, file, title),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["module-documents", variables.moduleId],
      });

      queryClient.invalidateQueries({
        queryKey: ["modules", courseId],
      });
    },
  });
}