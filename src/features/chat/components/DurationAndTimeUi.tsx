"use client";

import { useEffect, useState } from "react";
import { Message } from "../types";
import { formatFromNow, formatTime } from "@/lib/timeStamp/handleTimeStamp";

const DurationAndTimeUi = ({
  message,
  otherUserId,
}: {
  message: Message;
  otherUserId: number;
}) => {
  const [time, setTime] = useState<string>("");
  const [fromNow, setFromNow] = useState<string>("");

  useEffect(() => {
    async function loadTimes() {
      const formattedTime = await formatTime(message?.timestamp);
      const formattedFromNow = await formatFromNow(message?.timestamp);

      setTime(formattedTime);
      setFromNow(formattedFromNow);
    }

    loadTimes();
  }, [message?.timestamp]);
  return (
    <span
      className={`text-[12px] text-[var(--grayColor)] px-1 flex gap-2 ${message.sender_id !== otherUserId ? "justify-end" : "justify-start"}`}
    >
      <span>{time}</span>
      <span>{fromNow}</span>
    </span>
  );
};

export default DurationAndTimeUi;
