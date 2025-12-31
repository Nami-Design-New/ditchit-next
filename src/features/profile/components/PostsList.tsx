"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import useGetMyPosts from "@/features/profile/hooks/useGetMyPosts";
import PostCardSkeleton from "@/components/loaders/PostCardSkeleton";
import PostCard from "@/components/cards/PostCard";
import NoDataPlaceHolder from "@/components/shared/NoDataPlaceHolder";
import { Search } from "lucide-react";

export default function PostsList() {
  const { posts, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useGetMyPosts();
  const t = useTranslations();
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "sold"
  >("all");

  // recompute filteredPosts whenever dependencies change
  useEffect(() => {
    let list = posts;

    // filter by status
    if (statusFilter !== "all") {
      const shouldBeSold = statusFilter === "sold";
      list = list.filter((post) => post.is_sold === shouldBeSold);
    }

    setFilteredPosts(list);
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!observerRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <section className="flex flex-wrap">
      <div className="w-full p-2 relative mb-4">
        <input
          placeholder={t("common.search")}
          onChange={(e) => {
            const searchValue = e.target.value.toLowerCase();
            setFilteredPosts(
              posts.filter((post) =>
                post.title.toLowerCase().includes(searchValue)
              )
            );
          }}
          className="w-full border border-gray-100 rounded-4xl py-2 px-5"
        />

        <button
          type="submit"
          className="absolute end-3 top-5  p-0 w-9 flex items-center justify-center rounded-xl text-[var(--mainColor)]"
        >
          <Search height={20} width={20} />
        </button>

        <div className="items-center text-end gap-2 text-[14px] mt-4 ">
          {/* <ListFilter width={16} height={16} /> */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "available" | "sold")
            }
            className="border border-gray-300  px-2 py-1 text-[14px] focus:outline-none rounded-xl"
          >
            <option value="all">{t("common.all")}</option>
            <option value="available">{t("common.available")}</option>
            <option value="sold">{t("common.sold")}</option>
          </select>
        </div>
      </div>

      {filteredPosts.map((post) => (
        <div key={post.id} className="w-full lg:w-4/12 p-2">
          <PostCard post={post} showActions={true} />
        </div>
      ))}

      {isFetchingNextPage && (
        <>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="w-full lg:w-4/12 p-2">
              <PostCardSkeleton />
            </div>
          ))}
        </>
      )}

      {posts.length === 0 && (
        <div className="w-full flex flex-col justify-center items-center">
          <NoDataPlaceHolder />
          {t("post.no_posts")}
        </div>
      )}
    </section>
  );
}
