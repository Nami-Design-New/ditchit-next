import { getCookie } from "@/lib/utils";
import { CountriesResponse } from "@/types/country";
import { API_URL } from "@/utils/constants";

export async function getCountries(
  lang: string,
  page = 1,
  limit = 15
): Promise<CountriesResponse> {
  const countryId = getCookie("countryId");

  const response = await fetch(
    `${API_URL}/main/countries?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        lang: lang === "zh" ? "zh-CN" : lang === "pt" ? "pt-BR" : lang,
        country: countryId || "",
      },
      next: { revalidate: false },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error fetching countries:", errorText);
    throw new Error("Failed to fetch countries");
  }

  return response.json();
}
