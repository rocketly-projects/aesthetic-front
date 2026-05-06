"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
} from "@/lib/api/services";
import type { GetServicesParams, CreateServiceParams, UpdateServiceParams } from "@/lib/api/services";

export const serviceKeys = {
  all:    ["services"] as const,
  list:   (params: GetServicesParams) => ["services", "list", params] as const,
  detail: (id: string) => ["services", "detail", id] as const,
};

export function useGetServices(params: GetServicesParams = {}) {
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn:  () => getServices(params),
  });
}

export function useGetService(id: string) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn:  () => getService(id),
    enabled:  !!id,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateServiceParams) => createService(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...params }: { id: string } & UpdateServiceParams) =>
      updateService(id, params),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: serviceKeys.all });
      qc.invalidateQueries({ queryKey: serviceKeys.detail(id) });
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}
