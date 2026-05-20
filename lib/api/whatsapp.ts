import { apiFetch } from "./client";

// ── Types ──────────────────────────────────────────────────────────────────

export type MessageSender = "client" | "owner" | "bot";

export interface WhatsappChat {
  id: string;
  businessId: string;
  clientId: string | null;
  clientPhone: string;
  clientName: string | null;
  isBot: boolean;
  unread: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface WhatsappMessage {
  id: string;
  chatId: string;
  sender: MessageSender;
  content: string;
  createdAt: string;
}

export interface GetChatsParams {
  page?: number;
  limit?: number;
}

export interface GetChatsResponse {
  chats: WhatsappChat[];
  page: number;
  limit: number;
  total: number;
}

export interface GetMessagesParams {
  page?: number;
  limit?: number;
}

export interface GetMessagesResponse {
  messages: WhatsappMessage[];
  page: number;
  limit: number;
}

export interface CreateOrGetChatParams {
  clientPhone: string;
  clientName?: string;
}

export interface PatchChatParams {
  isBot?: boolean;
  markRead?: boolean;
}

export interface SendMessageParams {
  content: string;
  sender: MessageSender;
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export async function getChats(params: GetChatsParams = {}): Promise<GetChatsResponse> {
  const qs = new URLSearchParams();
  if (params.page)  qs.set("page",  String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch<GetChatsResponse>(`/whatsapp/chats${query}`);
}

export async function getChat(id: string): Promise<WhatsappChat> {
  const data = await apiFetch<{ chat: WhatsappChat }>(`/whatsapp/chats/${id}`);
  return data.chat;
}

export async function createOrGetChat(params: CreateOrGetChatParams): Promise<WhatsappChat> {
  const data = await apiFetch<{ chat: WhatsappChat }>("/whatsapp/chats", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return data.chat;
}

export async function patchChat(id: string, params: PatchChatParams): Promise<WhatsappChat> {
  const data = await apiFetch<{ chat: WhatsappChat }>(`/whatsapp/chats/${id}`, {
    method: "PATCH",
    body: JSON.stringify(params),
  });
  return data.chat;
}

export async function getMessages(chatId: string, params: GetMessagesParams = {}): Promise<GetMessagesResponse> {
  const qs = new URLSearchParams();
  if (params.page)  qs.set("page",  String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch<GetMessagesResponse>(`/whatsapp/chats/${chatId}/messages${query}`);
}

export async function sendMessage(chatId: string, params: SendMessageParams): Promise<WhatsappMessage> {
  const data = await apiFetch<{ message: WhatsappMessage }>(`/whatsapp/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify(params),
  });
  return data.message;
}
