"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlans, getBillingStatus, subscribe, cancelSubscription } from "@/lib/api/billing";

export function usePlans() {
  return useQuery({
    queryKey: ["billing", "plans"],
    queryFn: getPlans,
    staleTime: Infinity, // los planes no cambian seguido
  });
}

export function useBillingStatus() {
  return useQuery({
    queryKey: ["billing", "status"],
    queryFn: getBillingStatus,
  });
}

export function useSubscribe() {
  return useMutation({
    mutationFn: (planId: "basic" | "pro") => subscribe(planId),
    onSuccess: (data) => {
      // Redirigir al checkout de MP
      window.location.href = data.checkoutUrl;
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "status"] });
    },
  });
}
