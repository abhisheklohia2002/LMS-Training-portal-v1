import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export function useModuleDocuments(moduleId?: number) {
  return useQuery({
    queryKey: ["module-documents", moduleId],
    queryFn: () => api.getModuleDocuments(moduleId!),
    enabled: !!moduleId,
  });
}

export function useUploadModulePdf() {
  return useMutation({
    mutationFn: api.uploadModulePdf,
  });
}

export function useUploadModuleVideo() {
  return useMutation({
    mutationFn: api.uploadModuleVideo,
  });
}

export function useModuleVideo(moduleId: number) {
  return useQuery({
    queryKey: ["module-video", moduleId],
    queryFn: () => api.getModuleVideo(moduleId),
    enabled: !!moduleId,
  });
}


export function useUpdateModuleVideoProgress(assignmentId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      progressId,
      payload,
    }: {
      progressId: number;
      payload: {
        watched_seconds: number;
        duration_seconds: number;
      };
    }) => api.updateModuleVideoProgress(progressId, payload),

    onSuccess: () => {
      if (assignmentId) {
        queryClient.invalidateQueries({
          queryKey: ["module-progress", assignmentId],
        });
      }
    },
  });
}