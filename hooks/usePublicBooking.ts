"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getPublicBusiness,
  getPublicServices,
  getPublicAvailability,
  createPublicAppointment,
} from "@/lib/api/public";
import type { BookingParams } from "@/lib/api/public";

export function usePublicBusiness(slug: string) {
  return useQuery({
    queryKey: ["public", slug],
    queryFn: () => getPublicBusiness(slug),
    retry: false,
  });
}

export function usePublicServices(slug: string) {
  return useQuery({
    queryKey: ["public", slug, "services"],
    queryFn: () => getPublicServices(slug),
  });
}

export function usePublicAvailability(slug: string, date: string, serviceId: string) {
  return useQuery({
    queryKey: ["public", slug, "availability", date, serviceId],
    queryFn: () => getPublicAvailability(slug, date, serviceId),
    enabled: !!date && !!serviceId,
  });
}

export function useCreatePublicAppointment(slug: string) {
  return useMutation({
    mutationFn: (params: BookingParams) => createPublicAppointment(slug, params),
  });
}
