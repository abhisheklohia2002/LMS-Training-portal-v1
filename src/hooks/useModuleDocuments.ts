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
      publicId,
    }: {
      moduleId: number;
      file: File;
      title?: string;
      publicId?:string;
    }) => api.uploadModulePdf(moduleId, file, title,publicId),

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