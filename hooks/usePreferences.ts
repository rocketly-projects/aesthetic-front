"use client";

import { useState, useCallback } from "react";

export type Preferences = {
  palette: string;
  typography: string;
  density: "comfortable" | "compact";
  notifications: {
    turnos: boolean;
    recordatorios: boolean;
    pagos: boolean;
    resumen: boolean;
    marketing: boolean;
  };
};

const DEFAULTS: Preferences = {
  palette: "sage",
  typography: "inter",
  density: "comfortable",
  notifications: { turnos: true, recordatorios: true, pagos: false, resumen: true, marketing: false },
};

const STORAGE_KEY = "aesthetic_prefs";

function loadPrefs(): Preferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(loadPrefs);
  const [saved, setSaved] = useState(false);

  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [prefs]);

  return { prefs, setPrefs, save, saved };
}
