"use client";

import { Post } from "@/types/post";
import { Clock, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import PostActions from "./PostActions";
import { formatFromNow } from "@/lib/timeStamp/handleTimeStamp";
import { useEffect, useState } from "react";

export default function PostCard({
  post,
  showActions,
}: {
  post: Post;
  showActions: boolean;
}) {
  const t = useTranslations("post");

  const [fromNow, setFromNow] = useState<string>("");

  useEffect(() => {
    async function loadTimes() {
      const formattedFromNow = await formatFromNow(post.timestamp);
      setFromNow(formattedFromNow);
    }

    loadTimes();
  }, [post.timestamp]);

  return (
    <div className="relative flex flex-col gap-1 h-full rounded-2xl border border-[var(--lightBorderColor)] bg-[var(--whiteColor)] transition-all">
      <PostActions post={post} showActions={showActions} />

      {/* Item Image */}
      <Link
        href={`/posts/${post.id}`}
        className="relative overflow-hidden rounded-t-2xl aspect-[3/2] w-full max-h-[300px] transition-all"
      >
        <Image
          src={post.image}
          alt="item"
          width={500}
          height={300}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-all hover:scale-110"
        />

        {post.is_promoted && (
          <Image
            src="/icons/promoted.svg"
            alt="promoted"
            width={24}
            height={24}
            className="absolute bottom-0 start-0 z-20 w-10 aspect-square bg-white rounded-t-md p-2"
          />
        )}

        <div className="absolute top-0 start-[-80%] w-1/2 h-full z-10 bg-gradient-to-r from-transparent to-white/30 skew-x-[-25deg]" />
      </Link>

      {/* Info Section */}
      <div className="relative flex flex-col gap-2 p-4 text-[var(--darkColor)] flex-1">
        <div className="absolute top-[-28px] end-4 z-30  bg-gray-300 rounded-full">
          <Link href={`/advertiser/${post.user.user.id}`}>
            <Image
              src={post.user.user.image}
              alt={post.user.user.name}
              width={48}
              height={48}
              className="w-[48px] h-[48px] border border-white rounded-full object-cover"
            />
          </Link>
        </div>

        <div className="flex items-center gap-1 text-sm text-[var(--grayColor)]">
          <Clock width={16} height={16} />
          <span>{fromNow}</span>
          {/* <span>{post.publishing_duration}</span> */}
        </div>

        <Link
          href={`/posts/${post.id}`}
          className="font-bold text-[16px] overflow-hidden line-clamp-1"
        >
          {post.title}
        </Link>

        <p className="text-[var(--grayColor)] flex-1 text-[13px] overflow-hidden max-h-[40px] line-clamp-2">
          {post.description}
        </p>

        <div className="flex items-center gap-1 text-[13px] text-[var(--grayColor)]">
          <MapPin width={16} height={16} />
          <span>{post.address}</span>
        </div>
        {post.is_promoted && (
          <span className="capitalize text-[var(--mainColor)]">
            {t("promoted")}
          </span>
        )}

        <div className="flex items-center justify-between pt-3 mt-auto border-t border-[var(--lightBorderColor)]">
          <Link
            href={`/posts?category_id=${post.category.id}`}
            className="flex items-center gap-1 text-sm"
          >
            <span className="w-10 h-10 rounded-full bg-[var(--mainColor10)] flex items-center justify-center">
              <Image
                src={post.category.image}
                alt="category"
                width={20}
                height={20}
                className="object-contain"
              />
            </span>
            {post.category.title}
          </Link>

          <div className="text-lg font-bold">
            {/* <span>$ {post.price.toFixed(2)}</span> */}
            <span>
              {post.country?.symbol || "$"} {post.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
