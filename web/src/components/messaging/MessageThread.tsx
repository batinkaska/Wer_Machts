import { useTranslation } from "react-i18next";
import { useDateFormatter } from "../../lib/useDateFormatter";
import type { ChatMessage } from "../../types/message";

interface MessageThreadProps {
  messages: ChatMessage[];
  uid: string;
  otherName?: string;
}

export function MessageThread({ messages, uid, otherName }: MessageThreadProps) {
  const { t } = useTranslation();
  const { formatMessageTime } = useDateFormatter();

  if (messages.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">{t("messages.empty")}</p>;
  }
  const initials = otherName ? otherName.charAt(0).toUpperCase() : "?";
  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => {
        const mine = message.senderId === uid;
        return (
          <div key={message.id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
            {!mine && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {initials}
              </div>
            )}
            <div className={`flex max-w-[75%] flex-col ${mine ? "items-end" : "items-start"}`}>
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  mine ? "bg-[#5fac5e] text-white" : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                }`}
              >
                {message.text}
              </div>
              <span className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {formatMessageTime(message.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
