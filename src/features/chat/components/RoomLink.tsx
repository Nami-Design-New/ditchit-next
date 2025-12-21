"use client";

import { useState } from "react";
import { useChatStore } from "../store";
import { Room } from "../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteRoomAction } from "../actions";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  EllipsisVertical,
  Images,
  MapPin,
  Mic,
  Trash,
  Video,
} from "lucide-react";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import ConfirmModal from "@/components/modals/ConfirmModal";

export default function RoomLink({ room }: { room: Room }) {
  const params = useParams();
  const router = useRouter();
  const currentRoomId = params?.roomId;
  const active = currentRoomId === String(room.id);
  const queryClient = useQueryClient();
  const { removeRoom } = useChatStore();
  const t = useTranslations("chat");

  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const { mutate: deleteRoom, isPending } = useMutation({
    mutationFn: () => deleteRoomAction(room.id),

    onSuccess: () => {
      if (currentRoomId === String(room.id)) {
        router.push("/chats");
      }
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      removeRoom(room.id);
      toast.success(t("deleted_success"));
      setShowConfirm(false);
    },
  });

  // console.log("room::::", room);

  return (
    <Link
      href={`/chats/${room.id}`}
      className={clsx(
        "flex items-center gap-2 p-1 px-2 rounded-xl flex-wrap text-start border bg-[var(--whiteColor)] transition",
        active
          ? "border-white !bg-[#00a6501a]"
          : "border-white hover:border-[var(--lightBorderColor)]"
      )}
    >
      <div className="flex gap-2 w-full">
        <Image
          src={room.another_user.user.image}
          alt={room.another_user.user.name}
          className="w-[64px] h-[64px] rounded-full border-[2px] border-white object-cover"
          width={64}
          height={64}
        />

        <div className="flex flex-col gap-[2px] flex-1 items-start p-2">
          <h6 className="font-bold capitalize text-[12px]">
            {room.another_user.user.name}
          </h6>

          <p className="text-[12px] text-[var(--mainColor)] line-clamp-1  flex justify-between w-full">
            {room.latest_message?.message}
            {room.latest_message?.type === "location" && (
              <div className="flex items-center gap-1">
                <MapPin width={14} height={14} />
                {t("shared_location")}
              </div>
            )}

            {room.latest_message?.type === "files" && (
              <>
                {room.latest_message?.files[0].type === "audio" && (
                  <div className="flex items-center gap-1">
                    <Mic width={14} height={14} />
                    {t("audio")}
                  </div>
                )}

                {room.latest_message?.files[0].type === "image" && (
                  <div className="flex items-center gap-1">
                    <Images width={14} height={14} />
                    {t("photo")}
                  </div>
                )}

                {room.latest_message?.files[0].type === "video" && (
                  <div className="flex items-center gap-1">
                    <Video width={14} height={14} />
                    {t("video")}
                  </div>
                )}
              </>
            )}

            {room.count_not_read > 0 && (
              <span className="w-4 h-4 rounded-full bg-[var(--mainColor)] flex items-center justify-center text-white text-[10px]">
                {room.count_not_read}
              </span>
            )}
          </p>

          <div className="flex gap-2">
            <span className="text-[10px]">{room?.latest_message?.time}</span>
            <span className="text-[10px]">{room?.latest_message?.date}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="h-7 w-7 mt-2 rounded-full flex items-center justify-center bg-white border border-[var(--lightBorderColor)] ">
            <EllipsisVertical width={16} height={16} />
          </DropdownMenuTrigger>

          <DropdownMenuContent className="bg-[var(--whiteColor)] shadow-[0_2px_8px_rgba(0,0,0,0.1)] z-[99999] min-w-[100px] flex-col rounded border border-[var(--lightBorderColor)] max-h-[400px] overflow-y-auto">
            <DropdownMenuItem asChild>
              <button
                className="flex items-center gap-2 w-full whitespace-nowrap text-[var(--darkColor)] hover:bg-[#f1f1f1] px-4 py-2 text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirm(true);
                }}
              >
                <Trash width={16} height={16} className="text-[#FF0000]" />
                {t("delete")}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className={clsx(
          "w-full  p-2 pl-4 mb-1 rounded-full",
          active ? "bg-[#00a6501a]" : "bg-[rgba(228,228,228,0.4)]"
        )}
      >
        <span className="text-[12px]">{room.post.title}</span>
      </div>

      <ConfirmModal
        modalTitle={t("delete_chat")}
        text={t("sure_delete")}
        show={showConfirm}
        isPending={isPending}
        event={deleteRoom}
        handleClose={() => setShowConfirm(false)}
      />
    </Link>
  );
}
