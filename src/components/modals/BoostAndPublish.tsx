"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

type BoostAndPublishProps = {
  show: boolean;
  isPromoting: boolean;
  isSaving: boolean;
  addPost: () => void;
  addAndPromote: () => void;
  handleClose: () => void;
};

export default function BoostAndPublish({
  show,
  isSaving,
  isPromoting,
  addPost,
  addAndPromote,
  handleClose,
}: BoostAndPublishProps) {
  const t = useTranslations("post");

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-6 bg-white shadow-xl space-y-6 rounded-[24px] gap-2">
        <DialogHeader className="mb-0">
          <DialogTitle className="text-[18px] text-start font-bold capitalize">
            {t("boost_ad")}
          </DialogTitle>
        </DialogHeader>

        <div className="pt-4">
          <p className="text-[14px]">
            {t("promote_text_1")}{" "}
            <span className="font-bold text-[var(--mainColor)]">1.99$</span>{" "}
            {t("promote_text_2")}{" "}
            <span className="font-bold text-[var(--mainColor)]">
              {t("five_days")}
            </span>{" "}
            .{t("promote_text_3")}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--lightBorderColor)] mb-0 pt-4">
          <button
            className="customBtn rounded-[12px] w-fit md:px-12 px-8 m-0"
            type="button" 
            onClick={() => addPost()}
            disabled={isSaving}
          >
            {isSaving ? t("loading") : t("skip_and_publish")}
          </button>

          <button
            type="button"
            onClick={() => addAndPromote()}
            disabled={isPromoting}
            className="bg-[var(--mainColor)] text-white rounded-[12px] w-fit px-12 py-3 m-0 border border-[var(--mainColor)]"
          >
            {isPromoting ? t("loading") : t("promote")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
