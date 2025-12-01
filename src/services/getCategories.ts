import { API_URL } from "@/utils/constants";
import { Category } from "@/types/category";
import { getCookie } from "@/lib/utils";

const countryId = getCookie("countryId");
export async function getCategories(
  lang: string
): Promise<{ data: Category[] }> {
  const response = await fetch(`${API_URL}/main/categories`, {
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
    console.error("Error fetching categories:", errorText);
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}
