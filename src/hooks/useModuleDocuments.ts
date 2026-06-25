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