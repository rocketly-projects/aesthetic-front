import { apiFetch } from "./client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Plan {
  id: "basic" | "pro";
  name: string;
  price: number;
  features: string[];
}

export interface BillingStatus {
  planId: string | null;
  planName: string | null;
  planStatus: "active" | "inactive" | "cancelled" | "past_due" | null;
  subscriptionId: string | null;
  subscriptionExpiresAt: string | null;
  trialEndsAt: string | null;
}

export interface SubscribeResponse {
  subscriptionId: string;
  checkoutUrl: string;
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export async function getPlans(): Promise<Plan[]> {
  const data = await apiFetch<{ plans: Plan[] }>("/billing/plans");
  return data.plans;
}

export async function getBillingStatus(): Promise<BillingStatus> {
  return apiFetch<BillingStatus>("/billing/status");
}

export async function subscribe(planId: "basic" | "pro"): Promise<SubscribeResponse> {
  return apiFetch<SubscribeResponse>("/billing/subscribe", {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
}

export async function cancelSubscription(): Promise<void> {
  await apiFetch<{ ok: boolean }>("/billing/cancel", { method: "POST" });
}
