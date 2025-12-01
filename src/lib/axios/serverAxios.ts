"use server";

import axios, { AxiosError, AxiosInstance } from "axios";
import { cookies } from "next/headers";
import { API_URL, COUNTIRES_DATA } from "@/utils/constants";
import { redirect } from "next/navigation";

const serverAxios: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

serverAxios.interceptors.request.use(async (config) => {
  const token = (await cookies()).get("token")?.value;
  const locale = (await cookies()).get("NEXT_LOCALE")?.value;

  const baseLocale = locale?.split("-")[0];
  const country = locale?.split("-")[1];
  const countryIdCookie = (await cookies()).get("countryId")?.value;
  // console.log("countryIDCOookie" , countryIdCookie);

  const normalizedLocale =
    baseLocale === "zh" ? "zh-CN" : baseLocale === "pt" ? "pt-BR" : baseLocale;

  config.headers["lang"] = normalizedLocale;
  config.headers["country"] =
    countryIdCookie || COUNTIRES_DATA.find((c) => c.code === country)?.id || 1;
  config.headers.Authorization = token;

  return config;
});

serverAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if ((error as AxiosError<{ message?: string }>).response?.status === 401) {
      redirect("/api/auth/logout");
    }
    return Promise.reject(error);
  }
);

export default serverAxios;
