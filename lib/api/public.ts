const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

async function publicFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      if (typeof body.error === "string") message = body.error;
    } catch {
      // body vacío o no-JSON
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface PublicBusiness {
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  instagram: string | null;
  logoUrl: string | null;
  webDepositRequired: boolean;
  depositPercent: number;
}

export interface PublicHours {
  dayOfWeek: number;
  open: boolean;
  fromTime: string;
  toTime: string;
}

export interface PublicService {
  id: string;
  name: string;
  duration: number;
  price: number;
  color: string;
  category: string;
}

export interface BookingParams {
  serviceId: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
}

export interface BookingResult {
  appointment: {
    id: string;
    date: string;
    time: string;
    serviceName: string;
    price: number;
    status: string;
  };
  deposit: {
    required: boolean;
    percent: number;
    amount: number;
    initPoint: string | null;   // URL de pago MP (null si no requiere seña)
    expiresAt:  string | null;  // ISO timestamp — 30 min para pagar
  };
}

// ── Endpoints ───────────────────────────────────────────────────────────────

export async function getPublicBusiness(
  slug: string
): Promise<{ business: PublicBusiness; hours: PublicHours[] }> {
  return publicFetch(`/public/${slug}`);
}

export async function getPublicServices(slug: string): Promise<PublicService[]> {
  const data = await publicFetch<{ services: PublicService[] }>(`/public/${slug}/services`);
  return data.services;
}

export async function getPublicAvailability(
  slug: string,
  date: string,
  serviceId: string
): Promise<string[]> {
  const data = await publicFetch<{ slots: string[] }>(
    `/public/${slug}/availability?date=${date}&serviceId=${serviceId}`
  );
  return data.slots;
}

export async function createPublicAppointment(
  slug: string,
  params: BookingParams
): Promise<BookingResult> {
  return publicFetch(`/public/${slug}/appointments`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}
