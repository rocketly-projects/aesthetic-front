"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, register, clearToken, googleAuth } from "@/lib/api/auth";
import type { LoginParams, RegisterParams, GoogleAuthParams } from "@/lib/api/auth";

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
      router.push("/dashboard");
    },
  });
}

export function useGoogleAuth() {
  const router = useRouter();
  return useMutation({
    mutationFn: (params: GoogleAuthParams) => googleAuth(params),
    onSuccess: (data) => {
      if (!("needsOnboarding" in data)) {
        router.push("/dashboard");
      }
    },
  });
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
