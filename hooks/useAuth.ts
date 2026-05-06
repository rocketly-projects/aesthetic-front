"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, register, clearToken } from "@/lib/api/auth";
import type { LoginParams, RegisterParams } from "@/lib/api/auth";

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

export function useLogout() {
  const router = useRouter();

  return () => {
    clearToken();
    router.push("/login");
  };
}
