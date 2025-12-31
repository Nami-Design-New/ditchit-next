import { Message } from "../types";
import Image from "next/image";
import DurationAndTimeUi from "./DurationAndTimeUi";

export default function MessageUI({
  message,
  otherUserId,
}: {
  message: Message;
  otherUserId: number;
}) {
  // console.log(message);

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`flex ${message.sender_id !== otherUserId ? "justify-end" : "justify-start"}`}
      >
        {message.msg_type === "text" && (
          <div
            className={`max-w-[80%] rounded-lg p-3 text-[14px] ${
              message.sender_id !== otherUserId
                ? "bg-[var(--mainColor)] text-white"
                : "bg-white"
            }`}
          >
            <span>{message.message}</span>
          </div>
        )}

        {(message.msg_type === "location" || message.msg_type === "files") && (
          <div className="max-w-[80%] rounded-lg overflow-hidden bg-[#f1f3f4] border-[2px] border-[#fff]">
            {message.msg_type === "files" && (
              <>
                {message.type === "audio" && (
                  <>
                    <audio src={message.file} controls />
                  </>
                )}
                {message.type === "image" && (
                  <Image
                    src={message.file}
                    width={300}
                    height={200}
                    alt={message.file}
                  />
                )}
                {message.type === "other" && (
                  <div className="flex justify-between items-center gap-3 p-2 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/images/doc_image.png"
                        alt="file image"
                        width={60}
                        height={60}
                      />
                      <span className="text-[14px]">{message.name}</span>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(message.file);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = message.name || "download";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error("Download failed:", error);
                          alert("Failed to download file");
                        }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 "
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                        />
                      </svg>
                    </button>
                  </div>
                )}
                {message.type === "video" && (
                  <video
                    src={message.file}
                    controls
                    style={{ width: "300px", height: "200px" }}
                  />
                )}
              </>
            )}

            {message.msg_type === "location" && (
              <iframe
                width="100%"
                height="200"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${message.latitude},${message.longitude}&z=14&output=embed`}
              />
            )}
          </div>
        )}
      </div>

      <span
        className={`text-[12px] text-[var(--grayColor)] px-1 flex gap-2 ${message.sender_id !== otherUserId ? "justify-end" : "justify-start"}`}
      >
        <DurationAndTimeUi message={message} otherUserId={otherUserId} />
      </span>
    </div>
  );
}
