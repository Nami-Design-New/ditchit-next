"use client";

import { CircleQuestionMark, HandCoins, Send, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessagePayload } from "../types";
import { useTranslations } from "next-intl";
import useSendMessage from "../useSendMessage";
import { getCookie } from "@/lib/utils";

export default function QuestionAndOffers({
  questions,
  roomId,
}: {
  roomId: number;
  questions: { id: number; title: string }[];
}) {
  const t = useTranslations("chat");
  const [activeTab, setActiveTab] = useState<"questions" | "offers" | null>(
    null
  );

  const [message, setMessage] = useState<MessagePayload>({
    type: "text",
    message: "",
    room_id: roomId,
  });

  const { sendMessageMutation, isPending } = useSendMessage(setMessage);

  const handleSubmit = (ask: string) => {
    const formData: MessagePayload = {
      type: "text",
      message: ask,
      room_id: roomId,
    };

    sendMessageMutation(formData);
    setActiveTab(null);
  };
  console.log("questions :", questions);

  return (
    <div className="flex bg-white rounded-[12px] p-2 text-center relative gap-2">
      <button
        onClick={() =>
          setActiveTab(activeTab === "questions" ? null : "questions")
        }
        className="text-[14px] flex-1 flex items-center justify-center gap-2 p-2"
      >
        <CircleQuestionMark width={18} height={18} />
        {t("questions")}
      </button>

      <span className="block w-px h-full bg-[var(--lightBorderColor)]" />

      <button
        onClick={() => setActiveTab(activeTab === "offers" ? null : "offers")}
        className="text-[14px] flex-1 flex items-center justify-center gap-2 p-2"
      >
        <HandCoins width={18} height={18} />
        {t("make_offer")}
      </button>

      <AnimatePresence>
        {/* questions tab */}
        {activeTab === "questions" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 start-0 bg-white z-40 p-4 w-full rounded-[12px] border border-[var(--lightBorderColor)] flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <h6 className="text-[18px] text-[var(--mainColor)] font-bold">
                {t("questions")}
              </h6>
              <button
                onClick={() => setActiveTab(null)}
                className="rounded-full border w-7 h-7 flex justify-center items-center border-[var(--lightBorderColor)]"
              >
                <X width={20} height={20} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleSubmit(q.title)}
                  className="p-3 bg-[var(--mainColor10)] rounded-lg text-[14px]"
                >
                  {q.title}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* offers tab */}
        {activeTab === "offers" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 start-0 bg-white z-40 p-4 w-full rounded-[12px] border border-[var(--lightBorderColor)] flex flex-col gap-5"
          >
            <div className="flex justify-between items-center">
              <h6 className="text-[18px] text-[var(--mainColor)] font-bold">
                {t("make_offer")}
              </h6>
              <button
                onClick={() => setActiveTab(null)}
                className="rounded-full border w-7 h-7 flex justify-center items-center border-[var(--lightBorderColor)]"
              >
                <X width={20} height={20} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(
                    t("have_offer", {
                      offer: `${message.message} ${getCookie("symbol")}` || "",
                    })
                  );
                }}
              >
                <input
                  className="w-full h-[44px] p-2 px-3 placeholder:text-[14px] placeholder:text-[#777] outline-none border border-[var(--lightBorderColor)] rounded-[12px]"
                  type="number"
                  id="text-message"
                  name="text-message"
                  placeholder={t("add_your_offer")}
                  autoComplete="off"
                  value={message.message}
                  onChange={(e) =>
                    setMessage({ ...message, message: e.target.value })
                  }
                />

                <button
                  className="md:p-4 p-3 rounded-[12px] bg-[var(--mainColor)] text-white relative"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
