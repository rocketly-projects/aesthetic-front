"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, register, clearToken, googleAuth } from "@/lib/api/auth";
import type { LoginParams, RegisterParams, GoogleAuthParams, StoredUser } from "@/lib/api/auth";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (params: LoginParams) => login(params),
    onSuccess: () => {
      router.push("/dashboard");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (params: RegisterParams) => register(params),
    onSuccess: () => {
      router.push("/planes");
    },
  });
}

export function useGoogleAuth(redirectTo = "/dashboard") {
  const router = useRouter();
  return useMutation({
    mutationFn: (params: GoogleAuthParams) => googleAuth(params),
    onSuccess: (data) => {
      if (!("needsOnboarding" in data)) {
        router.push(redirectTo);
      }
    },
  });
}

export function useCurrentUser(): StoredUser | null {
  const [user] = useState<StoredUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("aesthetic_user");
      return raw ? (JSON.parse(raw) as StoredUser) : null;
    } catch {
      return null;
    }
  });
  return user;
}

export function useLogout() {
  const router      = useRouter();
  const queryClient = useQueryClient();

  return () => {
    clearToken();
    queryClient.clear();
    router.push("/login");
  };
}
