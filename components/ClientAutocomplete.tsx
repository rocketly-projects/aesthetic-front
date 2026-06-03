"use client";

import { useState, useEffect, useRef } from "react";
import { useGetClients, useCreateClient } from "@/hooks/useClients";
import { ApiError } from "@/lib/api/client";

interface SelectedClient {
  id: string;
  name: string;
  phone?: string | null;
}

interface ConflictDetails {
  existingClientId: string;
  existingClientName: string;
}

interface Props {
  value: string;
  onChange: (id: string) => void;
}

// ── icons ──────────────────────────────────────────────────────────────────

const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);

const IconBack = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);

const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

// ── component ──────────────────────────────────────────────────────────────

export default function ClientAutocomplete({ value, onChange }: Props) {
  const [mode, setMode] = useState<"idle" | "search" | "create">("idle");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selected, setSelected] = useState<SelectedClient | null>(null);
  const [createForm, setCreateForm] = useState({ name: "", phone: "" });
  const containerRef = useRef<HTMLDivElement>(null);
  const createClient = useCreateClient();

  // Sync: cuando el padre resetea value="" → limpiar selección
  useEffect(() => {
    if (!value) {
      setSelected(null);
      setQuery("");
      setMode("idle");
      createClient.reset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Debounce de búsqueda
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Clientes (React Query cachea, así que siempre puede estar activo)
  const { data: clientsData, isLoading: clientsLoading } = useGetClients({
    search: debouncedQuery || undefined,
    limit: 8,
  });
  const clientsList = clientsData?.clients ?? [];

  // Click fuera → cerrar dropdown
  useEffect(() => {
    if (mode === "idle") return;
    function handle(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setMode("idle");
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [mode]);

  // ── handlers ────────────────────────────────────────────────────────────

  function handleSelect(client: SelectedClient) {
    setSelected(client);
    onChange(client.id);
    setMode("idle");
    setQuery("");
    createClient.reset();
  }

  function handleClear() {
    setSelected(null);
    onChange("");
    setQuery("");
    setMode("idle");
    createClient.reset();
  }

  function openCreate() {
    createClient.reset();
    setCreateForm({ name: query, phone: "" });
    setMode("create");
  }

  function handleCreate() {
    if (!createForm.name.trim() || !createForm.phone.trim()) return;
    createClient.mutate(
      { name: createForm.name.trim(), phone: createForm.phone.trim() },
      {
        onSuccess: (client) => {
          handleSelect({ id: client.id, name: client.name, phone: client.phone });
        },
      }
    );
  }

  // Detectar conflicto 409
  const conflict: ConflictDetails | null = (() => {
    if (!(createClient.error instanceof ApiError)) return null;
    if (createClient.error.status !== 409) return null;
    const d = createClient.error.details as unknown as Partial<ConflictDetails>;
    if (!d?.existingClientId) return null;
    return { existingClientId: d.existingClientId, existingClientName: d.existingClientName ?? "" };
  })();

  // ── render: chip cuando hay cliente seleccionado ─────────────────────────

  if (selected) {
    return (
      <div className="flex items-center gap-2 px-3 py-[9px] bg-bg-2 rounded-lg border border-line">
        <span className="flex-1 text-[13px] text-ink truncate">{selected.name}</span>
        {selected.phone && (
          <span className="shrink-0 text-[11px] text-ink-3 font-mono">{selected.phone}</span>
        )}
        <button
          type="button"
          onClick={handleClear}
          className="shrink-0 text-ink-3 hover:text-ink transition-colors cursor-pointer bg-transparent border-0 p-0 leading-none"
          aria-label="Quitar cliente"
        >
          <IconX />
        </button>
      </div>
    );
  }

  // ── render: input + dropdown ─────────────────────────────────────────────

  return (
    <div ref={containerRef} className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none">
          <IconSearch />
        </span>
        <input
          className="input"
          style={{ paddingLeft: "2rem" }}
          placeholder="Buscar cliente…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setMode("search"); }}
          onFocus={() => { if (mode !== "create") setMode("search"); }}
          autoComplete="off"
        />
      </div>

      {/* Dropdown */}
      {mode !== "idle" && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 right-0 bg-bg border border-line rounded-xl shadow-lg overflow-hidden">

          {mode === "create" ? (
            // ── Formulario de creación ──────────────────────────────────
            <div className="p-3 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setMode("search")}
                className="flex items-center gap-1.5 text-[12px] text-ink-3 hover:text-ink transition-colors cursor-pointer bg-transparent border-0 p-0 w-fit"
              >
                <IconBack /> Volver
              </button>

              <input
                className="input text-[13px]"
                placeholder="Nombre"
                value={createForm.name}
                autoFocus
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
              <input
                className="input text-[13px]"
                type="tel"
                placeholder="Teléfono (obligatorio)"
                value={createForm.phone}
                onChange={(e) => {
                  setCreateForm({ ...createForm, phone: e.target.value });
                  if (createClient.error) createClient.reset();
                }}
              />

              {/* Conflicto 409 — cliente ya existe con ese teléfono */}
              {conflict && (
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-warn-soft rounded-lg">
                  <span className="text-[12px] text-warn leading-snug">
                    Ya existe: <strong>{conflict.existingClientName}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelect({ id: conflict.existingClientId, name: conflict.existingClientName })}
                    className="shrink-0 text-[11.5px] font-medium text-warn underline cursor-pointer bg-transparent border-0"
                  >
                    Seleccionar
                  </button>
                </div>
              )}

              {/* Otro error */}
              {createClient.error && !conflict && (
                <p className="text-[12px] text-err m-0">{(createClient.error as Error).message}</p>
              )}

              <button
                type="button"
                onClick={handleCreate}
                disabled={createClient.isPending || !createForm.name.trim() || !createForm.phone.trim()}
                className="w-full h-9 rounded-lg bg-accent text-bg text-[13px] font-medium border-0 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {createClient.isPending ? "Creando…" : "Crear cliente"}
              </button>
            </div>

          ) : (
            // ── Resultados de búsqueda ──────────────────────────────────
            <>
              {clientsLoading && (
                <div className="px-3 py-3 text-[12.5px] text-ink-3">Buscando…</div>
              )}

              {!clientsLoading && clientsList.length === 0 && (
                <div className="px-3 py-3 text-[12.5px] text-ink-3">
                  {query ? "Sin resultados" : "No hay clientes todavía"}
                </div>
              )}

              {clientsList.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect({ id: c.id, name: c.name, phone: c.phone })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg-2 transition-colors cursor-pointer bg-transparent border-0 text-left"
                >
                  <span className="flex-1 text-[13px] text-ink truncate">{c.name}</span>
                  {c.phone && (
                    <span className="shrink-0 text-[11px] text-ink-3 font-mono">{c.phone}</span>
                  )}
                </button>
              ))}

              {/* Siempre visible al final */}
              <div className="border-t border-line">
                <button
                  type="button"
                  onClick={openCreate}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-accent hover:bg-accent-pale transition-colors cursor-pointer bg-transparent border-0 text-left"
                >
                  <IconPlus />
                  {query ? `Crear "${query}" como cliente` : "Nuevo cliente"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
