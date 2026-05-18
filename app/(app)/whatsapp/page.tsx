"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { statusChip } from "@/components/Chip";
import { useGetChats, useGetMessages, useSendMessage, usePatchChat } from "@/hooks/useWhatsapp";
import { useGetClient } from "@/hooks/useClients";
import { useGetAppointments } from "@/hooks/useAppointments";
import type { MessageSender } from "@/lib/api/whatsapp";

type TabFilter = "todos" | "bot" | "yo";

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function bubbleStyle(sender: MessageSender) {
  if (sender === "owner")  return { background: "var(--color-ink)",    color: "#fff",                   borderRadius: "14px 14px 4px 14px", alignSelf: "flex-end"   };
  if (sender === "bot")    return { background: "var(--color-accent)",  color: "#fff",                   borderRadius: "14px 14px 4px 14px", alignSelf: "flex-end"   };
  return                          { background: "var(--color-surface)", color: "var(--color-ink)", border: "1px solid var(--color-line-2)", borderRadius: "14px 14px 14px 4px", alignSelf: "flex-start" };
}

export default function WhatsAppPage() {
  const [activeTab,    setActiveTab]    = useState<TabFilter>("todos");
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [input,        setInput]        = useState("");

  const { data: chats = [] }    = useGetChats();
  const patchChat               = usePatchChat();
  const sendMessage             = useSendMessage();

  const visibleChats = activeTab === "todos" ? chats
    : activeTab === "bot" ? chats.filter((c) => c.isBot)
    : chats.filter((c) => !c.isBot);

  const resolvedChatId = activeChatId || chats[0]?.id || "";
  const activeChat     = chats.find((c) => c.id === resolvedChatId);

  const { data: messagesData } = useGetMessages(resolvedChatId);
  const messages               = messagesData?.messages ?? [];

  const { data: clientProfile } = useGetClient(activeChat?.clientId ?? "");
  const { data: apptData }      = useGetAppointments({ clientId: activeChat?.clientId ?? "", limit: 20 });
  const clientAppts             = apptData?.appointments ?? [];

  function handleSelectChat(id: string) {
    setActiveChatId(id);
    // Marcar como leído al abrir
    const chat = chats.find((c) => c.id === id);
    if (chat && chat.unread > 0) {
      patchChat.mutate({ id, markRead: true });
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || !resolvedChatId) return;
    sendMessage.mutate({ chatId: resolvedChatId, content: text, sender: "owner" });
    setInput("");
  }

  return (
    <AppShell active="whatsapp" title="WhatsApp" subtitle="Mensajes con clientes">
      <div className="grid gap-4" style={{ gridTemplateColumns: "340px 1fr 320px", height: "calc(100vh - 128px)" }}>
        {/* Chat list */}
        <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-line">
            <div className="seg w-full">
              {(["todos", "bot", "yo"] as TabFilter[]).map((t) => (
                <button key={t} className={`seg-item flex-1${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>
                  {t === "todos" ? "Todos" : t === "bot" ? "Bot" : "Yo"}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {visibleChats.map((c) => {
              const isActive = c.id === resolvedChatId;
              const name     = c.clientName ?? c.clientPhone;
              return (
                <div key={c.id} onClick={() => handleSelectChat(c.id)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-line transition-colors border-l-[3px] ${isActive ? "" : "border-l-transparent hover:bg-bg"}`} style={isActive ? { background: "var(--color-accent-pale)", borderLeftColor: "var(--color-accent)" } : undefined}>
                  <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0" style={{ background: "var(--color-accent-pale)", color: "var(--color-accent-ink)" }}>
                    {initials(name)}
                    {c.isBot && <span className="absolute -bottom-0.5 -right-0.5 text-white text-[8px] font-bold rounded-sm px-0.5" style={{ background: "var(--color-accent)" }}>BOT</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[13px] font-semibold text-ink">{name}</span>
                      <span className="font-mono text-[10px] text-ink-3 shrink-0">{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                    </div>
                    <div className="text-xs text-ink-3 truncate mt-0.5">{c.lastMessage}</div>
                  </div>
                  {c.unread > 0 && <span className="text-white rounded-full text-[10px] font-semibold px-1.5 leading-relaxed shrink-0" style={{ background: "var(--color-accent)" }}>{c.unread}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversation */}
        <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden flex flex-col">
          {activeChat ? (
            <>
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-line">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0" style={{ background: "var(--color-accent-pale)", color: "var(--color-accent-ink)" }}>
                  {initials(activeChat.clientName ?? activeChat.clientPhone)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink">{activeChat.clientName ?? activeChat.clientPhone}</div>
                  <div className="text-[11px] text-ok">{activeChat.clientPhone}</div>
                </div>
                <button className="bg-transparent border-none cursor-pointer text-ink-3 hover:bg-bg-2 hover:text-ink rounded-md px-2 py-1 text-lg transition-colors">⋯</button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {[...messages].reverse().map((msg) => (
                  <div key={msg.id} className="flex" style={{ justifyContent: msg.sender === "client" ? "flex-start" : "flex-end" }}>
                    <div className="max-w-[72%] px-4 py-3 text-[13px] leading-snug" style={bubbleStyle(msg.sender)}>
                      {msg.sender === "bot" && <div className="text-[9px] font-bold uppercase tracking-widest mb-1 opacity-70">BOT</div>}
                      {msg.content}
                      <div className="font-mono text-[10px] mt-1 text-right opacity-60">
                        {new Date(msg.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 px-4 py-3 border-t border-line">
                <input
                  className="input"
                  placeholder="Escribí un mensaje…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend} disabled={sendMessage.isPending} className="shrink-0 text-white rounded-lg px-4 py-2 text-[13px] font-medium cursor-pointer border-none hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: "var(--color-accent)" }}>
                  Enviar
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[13px] text-ink-3">Seleccioná un chat</div>
          )}
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {activeChat && (
            <>
              <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-3" style={{ background: "var(--color-accent-pale)", color: "var(--color-accent-ink)" }}>
                    {initials(activeChat.clientName ?? activeChat.clientPhone)}
                  </div>
                  <div className="text-[15px] font-semibold text-ink">{activeChat.clientName ?? activeChat.clientPhone}</div>
                  <div className="font-mono text-[11px] text-ink-3 mt-0.5">{activeChat.clientPhone}</div>
                </div>
                {clientProfile && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Visitas", val: clientProfile.visits },
                      { label: "Gastado", val: "$" + clientProfile.totalSpent.toLocaleString("es-AR") },
                    ].map((s) => (
                      <div key={s.label} className="bg-bg rounded-md p-3 text-center">
                        <div className="text-base font-semibold text-ink">{s.val}</div>
                        <div className="text-[11px] text-ink-3">{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-line font-semibold text-[13px] text-ink">Turnos</div>
                {clientAppts.length === 0 ? (
                  <div className="p-4 text-xs text-ink-3 text-center">Sin turnos</div>
                ) : clientAppts.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-ink">{a.serviceName}</div>
                      <div className="font-mono text-[11px] text-ink-3">{formatDate(a.date)} · {a.time}</div>
                    </div>
                    {statusChip(a.status)}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
