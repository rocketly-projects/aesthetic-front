"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChats,
  getChat,
  createOrGetChat,
  patchChat,
  getMessages,
  sendMessage,
} from "@/lib/api/whatsapp";
import type { GetChatsParams, GetMessagesParams, CreateOrGetChatParams, PatchChatParams, SendMessageParams } from "@/lib/api/whatsapp";

export const whatsappKeys = {
  all:      ["whatsapp"] as const,
  chats:    (params: GetChatsParams) => ["whatsapp", "chats", params] as const,
  chat:     (id: string) => ["whatsapp", "chats", id] as const,
  messages: (chatId: string, params: GetMessagesParams) =>
    ["whatsapp", "chats", chatId, "messages", params] as const,
};

export function useGetChats(params: GetChatsParams = {}) {
  return useQuery({
    queryKey: whatsappKeys.chats(params),
    queryFn:  () => getChats(params),
  });
}

export function useGetChat(id: string) {
  return useQuery({
    queryKey: whatsappKeys.chat(id),
    queryFn:  () => getChat(id),
    enabled:  !!id,
  });
}

export function useCreateOrGetChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateOrGetChatParams) => createOrGetChat(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: whatsappKeys.chats });
    },
  });
}

export function usePatchChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...params }: { id: string } & PatchChatParams) =>
      patchChat(id, params),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["whatsapp", "chats"] });
      qc.invalidateQueries({ queryKey: whatsappKeys.chat(id) });
    },
  });
}

export function useGetMessages(chatId: string, params: GetMessagesParams = {}) {
  return useQuery({
    queryKey: whatsappKeys.messages(chatId, params),
    queryFn:  () => getMessages(chatId, params),
    enabled:  !!chatId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, ...params }: { chatId: string } & SendMessageParams) =>
      sendMessage(chatId, params),
    onSuccess: (_, { chatId }) => {
      // Invalidar todos los params de mensajes de este chat
      qc.invalidateQueries({ queryKey: ["whatsapp", "chats", chatId, "messages"] });
      // Actualizar lastMessage en la lista de chats
      qc.invalidateQueries({ queryKey: ["whatsapp", "chats"] });
    },
  });
}
