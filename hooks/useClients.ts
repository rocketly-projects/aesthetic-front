"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/Toaster";
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from "@/lib/api/clients";
import type { GetClientsParams, CreateClientParams, UpdateClientParams } from "@/lib/api/clients";

export const clientKeys = {
  all:    ["clients"] as const,
  list:   (params: GetClientsParams) => ["clients", "list", params] as const,
  detail: (id: string) => ["clients", "detail", id] as const,
};

export function useGetClients(params: GetClientsParams = {}) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn:  () => getClients(params),
  });
}

export function useGetClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn:  () => getClient(id),
    enabled:  !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateClientParams) => createClient(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all });
      toast.success("Cliente creada");
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...params }: { id: string } & UpdateClientParams) =>
      updateClient(id, params),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: clientKeys.all });
      qc.invalidateQueries({ queryKey: clientKeys.detail(id) });
      toast.success("Cliente actualizada");
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.all });
      toast.success("Cliente eliminada");
    },
  });
}
