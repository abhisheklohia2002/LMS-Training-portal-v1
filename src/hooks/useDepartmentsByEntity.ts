import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export function useDepartmentsByEntity(entityId?: number) {
  return useQuery({
    queryKey: ["departments-by-entity", entityId],
    queryFn: () => api.department.listByEntity(Number(entityId)),
    enabled: Boolean(entityId),
  });
}