import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  EllipsisVertical,
  FilePenLine,
  Heart,
  Megaphone,
  Tag,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { Post } from "@/types/post";
import { useAuthStore } from "@/features/auth/store";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import BoostYourAd from "../modals/BoostYourAd";
import ConfirmModal from "../modals/ConfirmModal";
import useStoreFavorites from "@/features/profile/hooks/useStoreFavorites";
import useDeletePost from "@/features/profile/hooks/useDeletePost";
import useSellActivePost from "@/features/profile/hooks/useSellActivePost";

type propsTypes = {
  post: Post;
  showActions?: boolean;
};

export default function PostActions({ post, showActions }: propsTypes) {
  const [showBoost, setShowBoost] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLove, setIsLove] = useState(post.is_love);

  const { token } = useAuthStore();
  const router = useRouter();
  const t = useTranslations("post");

  const { storeFavorites, isPending: isPendingFav } = useStoreFavorites();
  const { deletePost, isPending } = useDeletePost(setShowConfirm);
  const { sellActivePost, isPending: isPendingSell } =
    useSellActivePost(setShowConfirm);

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
      {!showActions && (
        <button
          onClick={() => handleFav(post?.id)}
          disabled={isPendingFav}
          className={`absolute top-4 start-4 z-20 w-8 h-8 flex items-center justify-center rounded-full text-[var(--whiteColor)] bg-black/30 backdrop-blur-sm transition-all hover:bg-red-600 ${isLove ? "bg-red-600" : ""}`}
        >
          <Heart width={18} height={18} />
        </button>
      )}

      {!showActions && (
        <span className="absolute top-4 end-4 z-20 flex py-1 px-3 items-center justify-center rounded-full text-[12px] text-white bg-[var(--mainColor)]">
          {post.type}
        </span>
      )}

      {showActions && (
        <div className="absolute top-4 start-4 end-4 z-20 flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-9 w-9 rounded-full flex items-center justify-center bg-white border border-[var(--lightBorderColor)] ">
              <EllipsisVertical width={16} height={16} />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-[var(--whiteColor)] shadow-[0_2px_8px_rgba(0,0,0,0.1)] z-[99999] min-w-[100px] flex-col rounded border border-[var(--lightBorderColor)] max-h-[400px] overflow-y-auto">
              {!post.is_promoted && !post.is_sold && (
                <DropdownMenuItem asChild>
                  <button
                    className="flex items-center gap-2 w-full whitespace-nowrap text-[var(--darkColor)] hover:bg-[#f1f1f1] px-4 py-2 text-sm"
                    onClick={() => setShowBoost(true)}
                  >
                    <Megaphone
                      width={16}
                      height={16}
                      className="text-[var(--mainColor)]"
                    />
                    {t("promote")}
                  </button>
                </DropdownMenuItem>
              )}
              {post.type === "sale" && (
                <DropdownMenuItem asChild>
                  <button
                    className="flex items-center gap-2 w-full whitespace-nowrap text-[var(--darkColor)] hover:bg-[#f1f1f1] px-4 py-2 text-sm"
                    disabled={isPendingSell}
                    onClick={() => sellActivePost(post?.id)}
                  >
                    <Tag
                      width={16}
                      height={16}
                      className="text-[var(--mainColor)]"
                    />
                    {post.is_sold ? t("active") : t("sold")}
                  </button>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link
                  href={`/edit-post/${post.id}`}
                  className="flex items-center gap-2 w-full whitespace-nowrap text-[var(--darkColor)] hover:bg-[#f1f1f1] px-4 py-2 text-sm"
                >
                  <FilePenLine width={16} height={16} />
                  {t("edit")}
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <button
                  className="flex items-center gap-2 w-full whitespace-nowrap text-[var(--darkColor)] hover:bg-[#f1f1f1] px-4 py-2 text-sm"
                  onClick={() => setShowConfirm(true)}
                >
                  <Trash width={16} height={16} className="text-[#FF0000]" />
                  {t("delete")}
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="bg-white rounded-[40px] px-3 py-1 text-[var(--darkColor)] text-[14px] block border border-[var(--lightBorderColor)]">
            {post.is_sold ? t("sold") : t("available")}
          </span>
        </div>
      )}

      <BoostYourAd
        show={showBoost}
        handleClose={() => setShowBoost(false)}
        postId={post.id}
      />

      <ConfirmModal
        show={showConfirm}
        modalTitle={t("delete_post")}
        text={t("confirm_delete_post")}
        handleClose={() => setShowConfirm(false)}
        isPending={isPending}
        event={() => deletePost(post?.id)}
      />
    </>
  );
}
