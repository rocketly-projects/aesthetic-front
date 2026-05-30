"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBusiness,
  updateBusiness,
  getHours,
  updateHours,
  connectMp,
  disconnectMp,
  submitWhatsappRequest,
  submitWhatsappDeactivationRequest,
} from "@/lib/api/business";
import type { UpdateBusinessParams, UpdateHoursParam, WhatsappRequestParams, WhatsappDeactivationParams } from "@/lib/api/business";

export const businessKeys = {
  all:   ["business"] as const,
  hours: ["business", "hours"] as const,
};

export function useGetBusiness() {
  return useQuery({
    queryKey: businessKeys.all,
    queryFn:  getBusiness,
  });
}

export function useUpdateBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateBusinessParams) => updateBusiness(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}

export function useGetHours() {
  return useQuery({
    queryKey: businessKeys.hours,
    queryFn:  getHours,
  });
}

export function useUpdateHours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hours: UpdateHoursParam[]) => updateHours(hours),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: businessKeys.hours });
    },
  });
}

export function useSubmitWhatsappRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: WhatsappRequestParams) => submitWhatsappRequest(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}

export function useSubmitWhatsappDeactivationRequest() {
  return useMutation({
    mutationFn: (params: WhatsappDeactivationParams) => submitWhatsappDeactivationRequest(params),
  });
}

export function useMpConnect() {
  return useMutation({ mutationFn: connectMp });
}

export function useMpDisconnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: disconnectMp,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}
