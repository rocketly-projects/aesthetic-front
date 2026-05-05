"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { statusChip } from "@/components/Chip";
import { CHATS, ALL_APPTS, CLIENTS } from "@/lib/data";
import type { Chat, MessageSender } from "@/lib/types";

type TabFilter = "todos" | "bot" | "yo";

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

function initials(name: string) { return name.split(" ").map((n) => n[0]).join("").slice(0, 2); }

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>("todos");
  const [activeChatId, setActiveChatId] = useState<string>(CHATS[0].id);
  const [input, setInput] = useState("");

  const visibleChats = activeTab === "todos" ? CHATS : activeTab === "bot" ? CHATS.filter((c) => c.isBot) : CHATS.filter((c) => !c.isBot);
  const chat = CHATS.find((c) => c.id === activeChatId) ?? CHATS[0];
  const client = CLIENTS.find((c) => c.id === chat.clientId);
  const clientAppts = ALL_APPTS.filter((a) => a.clientId === chat.clientId);

  function bubbleStyle(sender: MessageSender) {
    if (sender === "me") return { background: "var(--color-ink)", color: "#fff", borderRadius: "14px 14px 4px 14px", alignSelf: "flex-end" };
    if (sender === "bot") return { background: "transparent", border: "1.5px dashed var(--color-accent-soft)", color: "var(--color-accent-ink)", borderRadius: "10px", alignSelf: "flex-start" };
    return { background: "var(--color-surface)", border: "1px solid var(--color-line-2)", color: "var(--color-ink)", borderRadius: "14px 14px 14px 4px", alignSelf: "flex-start" };
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
            {visibleChats.map((c: Chat) => {
              const isActive = c.id === activeChatId;
              return (
                <div key={c.id} onClick={() => setActiveChatId(c.id)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-line transition-colors border-l-[3px] ${isActive ? "" : "border-l-transparent hover:bg-bg"}`} style={isActive ? { background: "var(--color-accent-pale)", borderLeftColor: "var(--color-accent)" } : undefined}>
                  <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0" style={{ background: "var(--color-accent-pale)", color: "var(--color-accent-ink)" }}>
                    {initials(c.clientName)}
                    {c.isBot && <span className="absolute -bottom-0.5 -right-0.5 text-white text-[8px] font-bold rounded-sm px-0.5" style={{ background: "var(--color-accent)" }}>BOT</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[13px] font-semibold text-ink">{c.clientName}</span>
                      <span className="font-mono text-[10px] text-ink-3 shrink-0">{c.lastTime}</span>
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
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-line">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0" style={{ background: "var(--color-accent-pale)", color: "var(--color-accent-ink)" }}>{initials(chat.clientName)}</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-ink">{chat.clientName}</div>
              <div className="text-[11px] text-ok">En línea</div>
            </div>
            <button className="bg-transparent border-none cursor-pointer text-ink-3 hover:bg-bg-2 hover:text-ink rounded-md px-2 py-1 text-lg transition-colors">⋯</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {chat.messages.map((msg) => (
              <div key={msg.id} className="flex" style={{ justifyContent: msg.sender === "me" ? "flex-end" : "flex-start" }}>
                <div className="max-w-[72%] px-4 py-3 text-[13px] leading-snug" style={bubbleStyle(msg.sender)}>
                  {msg.sender === "bot" && <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-accent)" }}>BOT</div>}
                  {msg.text}
                  <div className="font-mono text-[10px] mt-1 text-right opacity-60">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 px-4 py-3 border-t border-line">
            <input className="input" placeholder="Escribí un mensaje…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setInput("")} />
            <button onClick={() => setInput("")} className="shrink-0 text-white rounded-lg px-4 py-2 text-[13px] font-medium cursor-pointer border-none hover:opacity-90 transition-opacity" style={{ background: "var(--color-accent)" }}>Enviar</button>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          <div className="bg-surface border border-line rounded-lg shadow-sm p-5">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-3" style={{ background: "var(--color-accent-pale)", color: "var(--color-accent-ink)" }}>{initials(chat.clientName)}</div>
              <div className="text-[15px] font-semibold text-ink">{chat.clientName}</div>
              {client && <div className="font-mono text-[11px] text-ink-3 mt-0.5">{client.phone}</div>}
            </div>
            {client && (
              <div className="grid grid-cols-2 gap-3">
                {[{ label: "Visitas", val: client.visits }, { label: "Gastado", val: "$" + client.totalSpent.toLocaleString("es-AR") }].map((s) => (
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
        </div>
      </div>
    </AppShell>
  );
}
