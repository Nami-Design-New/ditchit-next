import { getCookie } from "@/lib/utils";
import { API_URL } from "@/utils/constants";

export async function getQuestions(lang: string): Promise<{
  data: { id: number; title: string }[];
}> {
  const countryId = getCookie("countryId");
  const response = await fetch(`${API_URL}/main/questions`, {
    method: "GET",
    headers: {
      lang: lang === "zh" ? "zh-CN" : lang === "pt" ? "pt-BR" : lang,
      country: countryId || "",
    },
    next: { revalidate: false },
    cache: "force-cache",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error fetching questions:", errorText);
    throw new Error("Failed to fetch questions");
  }

  return response.json();
}
