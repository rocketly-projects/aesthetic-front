"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAgenda,
} from "@/lib/api/appointments";
import type { GetAppointmentsParams, CreateAppointmentParams, UpdateAppointmentParams } from "@/lib/api/appointments";
import { clientKeys } from "./useClients";

export const appointmentKeys = {
  all:    ["appointments"] as const,
  list:   (params: GetAppointmentsParams) => ["appointments", "list", params] as const,
  detail: (id: string) => ["appointments", "detail", id] as const,
  agenda: (date: string) => ["appointments", "agenda", date] as const,
};

export function useGetAppointments(params: GetAppointmentsParams = {}) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn:  () => getAppointments(params),
  });
}

export function useGetAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn:  () => getAppointment(id),
    enabled:  !!id,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateAppointmentParams) => createAppointment(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...params }: { id: string } & UpdateAppointmentParams) =>
      updateAppointment(id, params),
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
      qc.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: appointmentKeys.agenda(data.date) });
      // Si el turno se completó, el backend actualiza stats del cliente — invalidar
      if (data.status === "completed") {
        qc.invalidateQueries({ queryKey: clientKeys.detail(data.clientId) });
        qc.invalidateQueries({ queryKey: clientKeys.all });
      }
    },
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useGetAgenda(date: string) {
  return useQuery({
    queryKey: appointmentKeys.agenda(date),
    queryFn:  () => getAgenda(date),
    enabled:  !!date,
  });
}
