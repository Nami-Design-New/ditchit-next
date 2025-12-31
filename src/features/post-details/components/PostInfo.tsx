"use client";

import { useEffect, useState } from "react";
import { Clock, Flag, Heart, MapPin, Share2 } from "lucide-react";
import { PostDetailsResponse } from "../types";
import { useAuthStore } from "@/features/auth/store";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import useStoreFavorites from "@/features/profile/hooks/useStoreFavorites";
import ReportPost from "@/components/modals/ReportPost";
import { formatFromNow } from "@/lib/timeStamp/handleTimeStamp";

export default function PostInfo({ post }: { post: PostDetailsResponse }) {
  const optionsToMap = post.options.filter((option) => option.value);

  const [show, setShow] = useState<boolean>(false);
  const [isLove, setIsLove] = useState(post.is_love);
  const { storeFavorites, isPending: isPendingFav } = useStoreFavorites();
  const t = useTranslations("manage_post");

  const { token } = useAuthStore();
  const router = useRouter();

  const [fromNow, setFromNow] = useState<string>("");

  useEffect(() => {
    async function loadTimes() {
      const formattedFromNow = await formatFromNow(post.timestamp);

      setFromNow(formattedFromNow);
    }

    loadTimes();
  }, [post.timestamp]);

  console.log("formate from now .", fromNow);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: `Check out this ${post.category.title} listing: ${post.title} - $${post.price}`,
          url: window.location.href,
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          navigator.clipboard
            .writeText(window.location.href)
            .then(() => alert("Link copied to clipboard!"))
            .catch((err) => console.error("Error copying:", err));
        });
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Link copied to clipboard!"))
        .catch((error) => console.error("Error copying:", error));
    }
  };

  const handleFav = (id: number) => {
    if (!token) {
      router.push("/login");
      return;
    }

    setIsLove((prev) => !prev);

    storeFavorites(id, {
      onError: () => {
        setIsLove((prev) => !prev);
      },
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 text-[var(--mainColor)] text-[32px] font-bold whitespace-nowrap">
          {post?.country?.symbol} {post.price.toFixed(2)}
        </div>

        <button
          onClick={() => handleFav(post.id)}
          disabled={isPendingFav}
          className={`min-w-[42px] h-[42px] flex items-center justify-center rounded-full border border-[var(--darkColor)] transition-all ${isLove ? "bg-[#ff0000] !border-[#ff0000] text-white" : ""}`}
        >
          <Heart width={20} height={20} />
        </button>

        <div className="flex items-center flex-wrap gap-4">
          <button
            onClick={() => setShow(true)}
            className={`min-w-[42px] h-[42px] flex items-center justify-center rounded-full border border-[var(--darkColor)] transition-all`}
          >
            <Flag width={20} height={20} />
          </button>

          <button
            onClick={handleShare}
            className={`min-w-[42px] h-[42px] flex items-center justify-center rounded-full border border-[var(--darkColor)] transition-all`}
          >
            <Share2 width={20} height={20} />
          </button>

          <Link
            href={`/posts?category_id=${post.category.id}`}
            className="flex items-center gap-2 border border-[var(--darkColor)] px-3 py-2 rounded-full h-[42px] font-bold text-[14px] transition-colors hover:bg-[var(--mainColor)] hover:text-[var(--whiteColor)] hover:border-[var(--mainColor)] group"
          >
            <Image
              src={post.category.image}
              alt={post.category.title}
              width={16}
              height={16}
              className="filter brightness-0 group-hover:brightness-0 group-hover:invert transition"
            />
            {post.category.title}
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-2 relative text-[var(--darkColor)]">
        <div className="flex gap-2">
          {post.is_promoted && (
            <span className="inline-flex items-center gap-2 p-2 px-4 rounded-full border border-[var(--mainColor)] w-fit text-sm font-bold uppercase bg-[var(--mainColor20)]">
              <Image
                src="/icons/promoted2.svg"
                width={18}
                height={18}
                alt="Promoted"
              />
              <span className="text-[12px]">Promoted</span>
            </span>
          )}
          {/* wanted translate */}

          <span className="px-4 flex items-center py-1 bg-[var(--mainColor)] text-[var(--whiteColor)] rounded-full w-fit text-[14px]">
            {post.type === "job" && t("hiring")}
            {post.type === "wanted" && t("wanted")}
            {post.type === "sale" && t("sale")}
          </span>
        </div>

        <h3 className="text-[20px] font-bold">{post.title}</h3>

        <div className="flex items-center justify-between pt-3 mt-2 border-t border-t-[var(--lightBorderColor)] gap-2 flex-wrap">
          <a
            href={`https://www.google.com/maps?q=${post.latitude},${post.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[13px] text-[var(--grayColor)]"
          >
            <MapPin height={16} width={16} />
            {post.address}
          </a>
          <div className="flex items-center gap-1 text-[13px] text-[var(--grayColor)]">
            <Clock height={16} width={16} />
            {fromNow}
          </div>
        </div>

        <p className="py-4 text-[var(--grayColor)] text-[14px] whitespace-pre-line">
          {post.description}
        </p>

        <div className="flex flex-wrap gap-1">
          {post?.condition?.length > 0 && (
            <span className="flex justify-center items-center gap-1 bg-[var(--mainColor)] text-[var(--whiteColor)] text-[14px] px-4 py-2 rounded-full">
              {post.condition === "new" ? t("new") : t("used")}
            </span>
          )}

          <span className="flex justify-center items-center gap-1 bg-[var(--mainColor)] text-[var(--whiteColor)] text-[14px] px-4 py-2 rounded-full">
            {post.delivery_method === "Local + Shipping" && t("local_shipping")}
            {post.delivery_method === "local" && t("local")}
            {post.delivery_method === "shipping" && t("shipping")}
          </span>
          {post.firm_price && (
            <span className="flex justify-center items-center gap-1 bg-[var(--mainColor)] text-[var(--whiteColor)] text-[14px] px-4 py-2 rounded-full">
              {t("firm_price")}
            </span>
          )}
          {post.virtual_tour && (
            <span className="flex justify-center items-center gap-1 bg-[var(--mainColor)] text-[var(--whiteColor)] text-[14px] px-4 py-2 rounded-full">
              {t("virtual_tour")}
            </span>
          )}
        </div>
      </div>

      {optionsToMap.length > 0 && (
        <div className="p-6 border border-[var(--lightBorderColor)] rounded-2xl bg-[var(--whiteColor)]">
          <h4 className="font-bold text-[18px] mb-4 pb-4 border-b border-b-[var(--lightBorderColor)]">
            {t("key_features")}
          </h4>
          <ul>
            {optionsToMap.map((option, index) => (
              <li
                key={option.category_option_id}
                className={`flex flex-wrap p-4 rounded-2xl gap-2 ${index % 2 === 0 ? "bg-[#f5f5f5]" : ""}`}
              >
                <span className="text-[14px] flex-1">
                  {option.category_option.title}
                </span>
                <p className="text-[14px] font-bold flex-3">{option.value}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {post.features.length > 0 && (
        <div className="p-6 border border-[var(--lightBorderColor)] rounded-2xl bg-[var(--whiteColor)]">
          <h4 className="font-bold text-lg mb-4 pb-4 border-b border-[var(--lightBorderColor)]">
            {t("extra_features")}
          </h4>

          <div className="flex flex-wrap gap-2">
            {post.features.map((feature) => (
              <span
                key={feature.id}
                className="flex justify-center items-center gap-1 border border-[var(--darkColor)] px-4 py-2 rounded-full text-[14px]"
              >
                {feature.value}
              </span>
            ))}
          </div>
        </div>
      )}

      <ReportPost
        show={show}
        handleClose={() => setShow(false)}
        postId={post.id}
      />
    </>
  );
}
