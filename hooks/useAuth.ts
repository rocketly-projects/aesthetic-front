"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, register, clearToken, googleAuth, forgotPassword, resetPassword } from "@/lib/api/auth";
import type { LoginParams, RegisterParams, GoogleAuthParams, StoredUser } from "@/lib/api/auth";
import { toast } from "@/components/Toaster";
import { ApiError } from "@/lib/api/client";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (params: LoginParams) => login(params),
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error) => {
      const msg = error instanceof ApiError ? error.message : "Error al iniciar sesión";
      toast.error(msg);
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
    onError: (error) => {
      const msg = error instanceof ApiError ? error.message : "Error al crear la cuenta";
      toast.error(msg);
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
    onError: (error) => {
      const msg = error instanceof ApiError ? error.message : "Error al iniciar sesión con Google";
      toast.error(msg);
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

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      resetPassword(token, password),
    onSuccess: () => {
      toast.success("Contraseña actualizada. Ya podés iniciar sesión.");
      router.push("/login");
    },
  });
}

export function useLogout() {
  return () => {
    clearToken();
    // Full reload: abandona el panel al instante y descarta todo el estado
    // en memoria (React Query incluido) sin re-renders intermedios
    window.location.replace("/");
  };
}
