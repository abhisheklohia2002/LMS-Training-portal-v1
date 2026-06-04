import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

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

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules", courseId] });
    },
  });
}