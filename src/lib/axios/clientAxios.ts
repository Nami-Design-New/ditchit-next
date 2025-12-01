"use client";

import axios, { AxiosInstance } from "axios";
import { API_URL } from "@/utils/constants";
import { useAuthStore } from "@/features/auth/store";
import { getCookie } from "../utils";


const clientAxios: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const getLocaleFromCookie = (): string => {
  if (typeof window === "undefined") return "en";

  const cookies = document.cookie.split(";");
  const localeCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("NEXT_LOCALE=")
  );

  if (localeCookie) {
    return localeCookie.split("=")[1]?.trim();
  }

  return "en";
};

clientAxios.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    const locale = getLocaleFromCookie();

    const lang = locale.split("-")[0];
    // const country = locale.split("-")[1];

    const normalizedLocale =
      lang === "zh" ? "zh-CN" : lang === "pt" ? "pt-BR" : lang;

    config.headers.Authorization = token;
    config.headers["lang"] = normalizedLocale;
    config.headers["country"] = getCookie("countryId");
    // config.headers["country"] =
    //   COUNTIRES_DATA.find((c) => c.code === country)?.id || 1;

    return config;
  },
  (error) => Promise.reject(error)
);
clientAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      const locale = getLocaleFromCookie();
      window.location.href = `/${locale}/login`;
    }
    return Promise.reject(error);
  }
);
export default clientAxios;
