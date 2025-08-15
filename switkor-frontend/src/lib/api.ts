//src/lib/api.ts
import axios, { AxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // Si más adelante se usan cookies httpOnly, cambio a true.
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

// Umbrales de “petición lenta”
const SLOW_THRESHOLD = 2500;      // 2.5 s (genérico)
const CRITICAL_THRESHOLD = 4000;  // 4 s (login/registro)

function isCritical(url = "") {
  return /\/auth\/(login|register)|\/users\/me/.test(url);
}

// Añadimos metadatos en la config para limpiar luego
declare module "axios" {
  export interface AxiosRequestConfig {
    __slowTimerId__?: number;
    __slowToastId__?: string;
  }
}
// Añade el token JWT a cada petición si existe
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = typeof window !== 'undefined'
    ? sessionStorage.getItem('token') || localStorage.getItem('token')
    : null;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Ignora endpoints triviales
  const u = config.url ?? "";
  const shouldShow = !/\/health|\/warmup/i.test(u);

  if (typeof window !== "undefined" && shouldShow) {
    const threshold = isCritical(u) ? CRITICAL_THRESHOLD : SLOW_THRESHOLD;
    const id = window.setTimeout(() => {
      const toastId = toast.loading(
        "Arrancando el servidor… La primera petición puede tardar hasta ~1 minuto.",
        { id: "slow-request", duration: Infinity }
      );
      config.__slowToastId__ = toastId as unknown as string;
    }, threshold);
    config.__slowTimerId__ = id;
  }

  return config;
});

function clearSlowIndicators(config?: AxiosRequestConfig) {
  if (typeof window === "undefined") return;
  if (config?.__slowTimerId__) window.clearTimeout(config.__slowTimerId__);
  if (config?.__slowToastId__) toast.dismiss(config.__slowToastId__);
  else toast.dismiss("slow-request"); // por si usamos id fijo
}

api.interceptors.response.use(
  (res) => {
    clearSlowIndicators(res.config);
    return res;
  },
  (err) => {
    clearSlowIndicators(err.config);
    // Mensaje amable si es un fallo típico de red/timeouts (frío)
    if (err.message === "Network Error" || err.code === "ECONNABORTED") {
      toast.error("Conexión lenta o servidor iniciándose. Prueba de nuevo en unos segundos.");
    }
    return Promise.reject(err);
  }
);