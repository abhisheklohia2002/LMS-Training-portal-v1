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
      thumbnail,
      title,
      publicId,
      oldThumbnailPublicId,
    }: {
      moduleId: number;
      file: File;
      thumbnail: File;
      title?: string;
      publicId?: string;
      oldThumbnailPublicId?: string;
    }) =>
      api.uploadModulePdf({
        moduleId,
        file,
        thumbnail,
        title,
        publicId,
        oldThumbnailPublicId,
      }),

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

export function useUploadModuleVideo(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.uploadModuleVideo,

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["module-video", variables.moduleId],
      });

      queryClient.invalidateQueries({
        queryKey: ["module-documents", variables.moduleId],
      });

      queryClient.invalidateQueries({
        queryKey: ["modules", courseId],
      });
    },
  });
}

export function useModuleVideo(moduleId: number) {
  return useQuery({
    queryKey: ["module-video", moduleId],
    queryFn: () => api.getModuleVideo(moduleId),
    enabled: !!moduleId,
  });
}





