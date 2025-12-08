"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CirclePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AddPostMenu() {
  const t = useTranslations("header");
  const router = useRouter();
  return (
    <DropdownMenu>
        <button
          onClick={() => router.push("/create-post")}
          className="border-0 flex items-center justify-center gap-2 p-2 h-[40px] min-w-[40px] cursor-pointer rounded-full transition-all relative md:px-4 px-3 py-2 whitespace-nowrap bg-[var(--mainColor)] text-[var(--whiteColor)] md:text-[16px] text-[14px]"
        >
          <CirclePlus width={18} height={18} />
          {t("add_post")}
        </button>

      <DropdownMenuContent className="w-56 space-y-2 p-2 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-[var(--lightBorderColor)]">
        <p className="p-2 text-sm text-gray-500">{t("what_you_want")}</p>

        <div className="flex gap-1">
          <DropdownMenuItem asChild>
            <Link
              href="/create-post?type=wanted"
              className="border border-[var(--lightBorderColor)] !rounded-[14px] aspect-square w-[calc(50%-2px)] flex flex-col justify-center items-center gap-2 text-[var(--darkColor)] px-4 py-2 text-[14px] capitalize"
            >
              <Image
                src="/icons/wanted.svg"
                alt="wanted"
                width={40}
                height={40}
              />
              <span>{t("wanted")}</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/create-post?type=sale"
              className="border border-[var(--lightBorderColor)] !rounded-[14px] aspect-square w-[calc(50%-2px)] flex flex-col justify-center items-center gap-2 text-[var(--darkColor)] px-4 py-2 text-[14px] capitalize"
            >
              <Image src="/icons/sell.svg" alt="sell" width={40} height={40} />
              <span>{t("sell")}</span>
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
