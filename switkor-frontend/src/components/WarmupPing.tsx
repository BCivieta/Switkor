// src/components/WarmupPing.tsx
"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function WarmupPing() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Solo una vez por sesión
    const KEY = "switkor-warmup-done";
    if (sessionStorage.getItem(KEY) === "1") return;
    sessionStorage.setItem(KEY, "1");

    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), 8000);

    // Aviso si tarda más de 2,5 segundos
    const slowTimer = setTimeout(() => {
      toast.loading(
          "La app se está despertando 😴. Puede tardar unos segundos en estar lista, gracias por tu paciencia 🙌",
        { id: "warmup", duration: Infinity }
      );
    }, 2500);

    api
      .get("/health", { signal: controller.signal })
      .catch(() => {})
      .finally(() => {
        clearTimeout(abortTimeout);
        clearTimeout(slowTimer);
        toast.dismiss("warmup");
      });
  }, []);

  return null;
}

