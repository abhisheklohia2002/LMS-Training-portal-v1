import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CreateEntityPayload, UpdateEntityPayload } from "../types";
import { api } from "../services/api";

export const useEntities = () => {
  return useQuery({
    queryKey: ["entities"],
    queryFn: async () => {
      const response = await api.entityApi.getEntities();

      return response?.data || response?.entities || response || [];
    },
  });
};

export const useEntityById = (entityId: number) => {
  return useQuery({
    queryKey: ["entities", entityId],
    queryFn: async () => {
      const response = await api.entityApi.getEntityById(entityId);

      return response?.data || response;
    },
    enabled: !!entityId,
  });
};

export const useCreateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateEntityPayload) => {
      return await api.entityApi.createEntity(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["entities"],
      });
    },
  });
};

export const useUpdateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entityId,
      payload,
    }: {
      entityId: number;
      payload: UpdateEntityPayload;
    }) => {
      return await api.entityApi.updateEntity(entityId, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["entities"],
      });

      queryClient.invalidateQueries({
        queryKey: ["entities", variables.entityId],
      });
    },
  });
};

export const useDeleteEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entityId: number) => {
      return await api.entityApi.deleteEntity(entityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["entities"],
      });
    },
  });
};