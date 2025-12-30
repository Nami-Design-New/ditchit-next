// import { getQueryClient } from "@/utils/queryClient";
// import { getHomeCategories } from "@/features/home/service";
// import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
// import { cookies } from "next/headers";
// import { CategoryResponse, HomeFilterInterface } from "@/features/home/types";
// import { getProfile } from "@/features/auth/actions";
// import CategoriesList from "@/features/home/components/CategoriesList";

// export default async function Home() {
//   const queryClient = getQueryClient();
//   const cookieStore = await cookies();
//   const { user } = await getProfile();
//   console.log("HOME RENDER", new Date().toISOString());

//   const filterParams: HomeFilterInterface = {
//     longitude: cookieStore.get("longitude")?.value ?? null,
//     latitude: cookieStore.get("latitude")?.value ?? null,
//     kilometers: cookieStore.get("kilometers")?.value ?? null,
//     delivery_method: cookieStore.get("delivery_method")?.value ?? null,
//     user_id: user?.id ?? null,
//     country_id: cookieStore.get("countryId")?.value
//       ? parseInt(cookieStore.get("countryId")!.value, 10)
//       : null,
//   };

//   await queryClient.prefetchInfiniteQuery({
//     queryKey: ["home-categories", filterParams],
//     queryFn: ({ pageParam = 1 }) => getHomeCategories(pageParam, filterParams),
//     initialPageParam: 1,
//     getNextPageParam: (
//       lastPage: CategoryResponse,
//       _: unknown,
//       lastPageParam: number
//     ) => {
//       const posts = lastPage?.data?.posts ?? [];
//       if (posts.length < 5) return undefined;
//       return lastPageParam + 1;
//     },
//   });

//   return (
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <CategoriesList filterParams={filterParams} />
//     </HydrationBoundary>
//   );
// }
import { getQueryClient } from "@/utils/queryClient";
import { getHomeCategories } from "@/features/home/service";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { CategoryResponse, HomeFilterInterface } from "@/features/home/types";
import { getProfile } from "@/features/auth/actions";
import CategoriesList from "@/features/home/components/CategoriesList";

export default async function Home() {
  // 🔴 LOG: every server render
  console.log("🟥 HOME SERVER RENDER START", new Date().toISOString());

  const queryClient = getQueryClient();

  // 🔴 LOG: cookies access
  console.log("🟧 Reading cookies");
  const cookieStore = cookies();

  // 🔴 LOG: auth fetch
  console.log("🟨 Fetching profile");
  const { user } = await getProfile();

  const filterParams: HomeFilterInterface = {
    longitude: cookieStore.get("longitude")?.value ?? null,
    latitude: cookieStore.get("latitude")?.value ?? null,
    kilometers: cookieStore.get("kilometers")?.value ?? null,
    delivery_method: cookieStore.get("delivery_method")?.value ?? null,
    user_id: user?.id ?? null,
    country_id: cookieStore.get("countryId")?.value
      ? parseInt(cookieStore.get("countryId")!.value, 10)
      : null,
  };

  // 🔴 LOG: before prefetch
  console.log("🟦 Prefetching home categories");

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["home-categories", filterParams],
    queryFn: ({ pageParam = 1 }) => getHomeCategories(pageParam, filterParams),
    initialPageParam: 1,
    getNextPageParam: (
      lastPage: CategoryResponse,
      _: unknown,
      lastPageParam: number
    ) => {
      const posts = lastPage?.data?.posts ?? [];
      if (posts.length < 5) return undefined;
      return lastPageParam + 1;
    },
  });

  // 🔴 LOG: dehydration
  console.log("🟩 Dehydrating query cache");

  const dehydratedState = dehydrate(queryClient);

  console.log("🟥 HOME SERVER RENDER END", new Date().toISOString());

  return (
    <HydrationBoundary state={dehydratedState}>
      <CategoriesList filterParams={filterParams} />
    </HydrationBoundary>
  );
}
