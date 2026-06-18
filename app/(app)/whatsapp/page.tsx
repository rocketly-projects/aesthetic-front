"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Pagination from "@/components/Pagination";
import EmptyState, { ChatEmptyIcon } from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { statusChip } from "@/components/Chip";
import { useGetChats, useGetMessages, usePatchChat } from "@/hooks/useWhatsapp";
import { useGetClient } from "@/hooks/useClients";
import { useGetAppointments } from "@/hooks/useAppointments";
import { useGetBusiness } from "@/hooks/useBusiness";
import type { MessageSender } from "@/lib/api/whatsapp";

type TabFilter = "todos" | "bot";

const CHATS_LIMIT = 30;

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function bubbleStyle(sender: MessageSender) {
  if (sender === "owner")  return { background: "var(--color-ink)",    color: "#fff",                   borderRadius: "14px 14px 4px 14px", alignSelf: "flex-end"   };
  if (sender === "bot")    return { background: "var(--color-accent-pale)", color: "var(--color-accent-ink)", border: "1px solid var(--color-accent-soft)", borderRadius: "14px 14px 4px 14px", alignSelf: "flex-end" };
  return                          { background: "var(--color-surface)", color: "var(--color-ink)", border: "1px solid var(--color-line-2)", borderRadius: "14px 14px 14px 4px", alignSelf: "flex-start" };
}

function ProGate() {
  return (
    <AppShell active="whatsapp" title="WhatsApp" subtitle="Mensajes con clientes">
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-accent-pale flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M21 11.5a8.4 8.4 0 0 1-1.2 4.4L21 21l-5.2-1.2a8.4 8.4 0 1 1 5.4-8.3z"/>
            <path d="M8 9a1 1 0 0 1 1-1h.5l1 2.5-1 1a6 6 0 0 0 3 3l1-1L16 14.5V15a1 1 0 0 1-1 1c-3.9 0-7-3.1-7-7z"/>
          </svg>
        </div>
        <div>
          <span className="inline-flex items-center bg-accent text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-3">
            Plan Pro
          </span>
          <h2 className="text-[17px] font-semibold text-ink mt-3 mb-2">WhatsApp disponible en el plan Pro</h2>
          <p className="text-[13px] text-ink-3 max-w-sm">
            Respondé mensajes, gestioná turnos automáticamente y dejá que el bot atienda a tus clientes las 24 hs.
          </p>
        </div>
        <a
          href="/config"
          className="inline-flex items-center gap-2 bg-ink text-white text-[13.5px] font-medium rounded-lg px-5 py-2.5 hover:opacity-90 transition-opacity"
          style={{ textDecoration: "none" }}
        >
          Ver planes
        </a>
      </div>
    </AppShell>
  );
}

export default function WhatsAppPage() {
  const { data: business, isLoading: bizLoading } = useGetBusiness();
  const isPro = business?.planId === 'pro' && business?.planStatus === 'active';

  const [activeTab,         setActiveTab]         = useState<TabFilter>("todos");
  const [activeChatId,      setActiveChatId]      = useState<string>("");
  const [mobileConversation, setMobileConversation] = useState(false);
  const [chatsPage,         setChatsPage]         = useState(1);

  const { data: chatsData, isLoading: chatsLoading } = useGetChats({ page: chatsPage, limit: CHATS_LIMIT });
  const chats                  = chatsData?.chats ?? [];
  const chatsTotal             = chatsData?.total;
  const patchChat               = usePatchChat();

  const visibleChats = activeTab === "bot" ? chats.filter((c) => c.isBot) : chats;

  const resolvedChatId = activeChatId || chats[0]?.id || "";
  const activeChat     = chats.find((c) => c.id === resolvedChatId);

  const { data: messagesData } = useGetMessages(resolvedChatId);
  const messages               = messagesData?.messages ?? [];

  const { data: clientProfile } = useGetClient(activeChat?.clientId ?? "");
  const { data: apptData }      = useGetAppointments({ clientId: activeChat?.clientId ?? "", limit: 20 });
  const clientAppts             = apptData?.appointments ?? [];

  if (!bizLoading && !isPro) return <ProGate />;

  function handleSelectChat(id: string) {
    setActiveChatId(id);
    setMobileConversation(true);
    // Marcar como leído al abrir
    const chat = chats.find((c) => c.id === id);
    if (chat && chat.unread > 0) {
      patchChat.mutate({ id, markRead: true });
    }
  }

  return (
    <AppShell active="whatsapp" title="WhatsApp" subtitle="Mensajes con clientes">
      <div className="grid gap-4 h-full grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[340px_1fr_320px] lg:h-[calc(100vh-var(--topbar-h)-4rem)]">
        {/* Chat list — ocultamos en mobile cuando hay conversación abierta */}
        <div className={`bg-surface border border-line rounded-lg shadow-sm overflow-hidden flex-col ${mobileConversation ? "hidden lg:flex" : "flex"}`}>
          <div className="p-3 border-b border-line">
            <div className="seg w-full">
              {(["todos", "bot"] as TabFilter[]).map((t) => (
                <button key={t} className={`seg-item flex-1${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>
                  {t === "todos" ? "Todos" : "Bot"}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {chatsLoading ? (
              <div className="p-3"><SkeletonList rows={10} /></div>
            ) : visibleChats.length === 0 ? (
              <EmptyState
                icon={<ChatEmptyIcon />}
                title={activeTab === "bot" ? "Sin chats del bot" : "Sin conversaciones"}
                description={activeTab === "todos" ? "Los chats de tus clientes aparecerán acá." : "No hay chats en esta categoría."}
              />
            ) : visibleChats.map((c) => {
              const isActive = c.id === resolvedChatId;
              const name     = c.clientName ?? c.clientPhone;
              return (
                <div key={c.id} onClick={() => handleSelectChat(c.id)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-line transition-colors border-l-[3px] ${isActive ? "bg-accent-pale border-l-accent" : "border-l-transparent hover:bg-bg"}`}>
                  <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-accent-pale text-accent-ink">
                    {initials(name)}
                    {c.isBot && <span className="absolute -bottom-0.5 -right-0.5 bg-accent text-white text-[8px] font-bold rounded-sm px-0.5">BOT</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[13px] font-semibold text-ink">{name}</span>
                      <span className="font-mono text-[10px] text-ink-3 shrink-0">{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                    </div>
                    <div className="text-xs text-ink-3 truncate mt-0.5">{c.lastMessage}</div>
                  </div>
                  {c.unread > 0 && <span className="bg-accent text-white rounded-full text-[10px] font-semibold px-1.5 leading-relaxed shrink-0">{c.unread}</span>}
                </div>
              );
            })}
          </div>
          <div className="px-3 border-t border-line shrink-0">
            <Pagination page={chatsPage} total={chatsTotal} limit={CHATS_LIMIT} count={chats.length} onChange={setChatsPage} />
          </div>
        </div>

        {/* Conversation — desktop: columna central; mobile: overlay */}
        <div className={`bg-surface border border-line rounded-lg shadow-sm overflow-hidden flex-col
          ${mobileConversation ? "flex fixed inset-0 z-40 lg:static lg:inset-auto lg:z-auto" : "hidden lg:flex"}`}>
          {activeChat ? (
            <>
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-line">
                {/* Back button mobile */}
                <button
                  className="lg:hidden -ml-1 mr-1 tb-icon-btn shrink-0"
                  onClick={() => setMobileConversation(false)}
                  aria-label="Volver"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0 bg-accent-pale text-accent-ink">
                  {initials(activeChat.clientName ?? activeChat.clientPhone)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink">{activeChat.clientName ?? activeChat.clientPhone}</div>
                  <div className="text-[11px] text-ok">{activeChat.clientPhone}</div>
                </div>
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

              <div className="flex items-center gap-2 px-4 py-3 border-t border-line bg-bg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-3 shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-[12px] text-ink-3">Por ahora solo podés ver las conversaciones del bot. Próximamente podrás responder manualmente.</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[13px] text-ink-3">Seleccioná un chat</div>
          )}
        </div>

        {/* Right panel — sólo xl+ */}
        <div className="hidden xl:flex flex-col gap-4 overflow-y-auto">
          {activeChat && (
            <>
              <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-3 bg-accent-pale text-accent-ink">
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

              <div className="bg-surface border border-line rounded-lg shadow-sm overflow-hidden flex flex-col min-h-0">
                <div className="px-4 py-3 border-b border-line font-semibold text-[13px] text-ink shrink-0">Turnos</div>
                <div className="overflow-y-auto">
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
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
