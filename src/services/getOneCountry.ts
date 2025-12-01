import { API_URL } from "@/utils/constants";

export async function getOneCountry(lang: string, countryId: string) {
  if (!countryId) return null;

  const response = await fetch(`${API_URL}/main/country/${countryId}`, {
    method: "GET",
    headers: {
      lang: lang === "zh" ? "zh-CN" : lang === "pt" ? "pt-BR" : lang,
      country: countryId || "",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error fetching country:", errorText);
    throw new Error("Failed to fetch country");
  }

  return response.json();
}
