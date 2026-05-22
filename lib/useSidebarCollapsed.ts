"use client";

import { useEffect, useState } from "react";

const KEY = "aesthetic_sidebar_collapsed";

export function useSidebarCollapsed(): [boolean, (v: boolean) => void] {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored !== null) setCollapsed(stored === "true");
    } catch {}
  }, []);

  const set = (v: boolean) => {
    setCollapsed(v);
    try { localStorage.setItem(KEY, String(v)); } catch {}
  };

  return [collapsed, set];
}
