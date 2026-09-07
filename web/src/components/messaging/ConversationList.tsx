import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { ConversationSummary } from "../../hooks/useConversationSummaries";
import { useDateFormatter } from "../../lib/useDateFormatter";
import { PhotoIcon } from "../icons";

interface ConversationListProps {
  summaries: ConversationSummary[];
  loading: boolean;
  activeId?: string;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (conversationId: string) => void;
}

export function ConversationList({
  summaries,
  loading,
  activeId,
  selectionMode = false,
  selectedIds,
  onToggleSelect,
}: ConversationListProps) {
  const { t } = useTranslation();
  const { formatMessageTime } = useDateFormatter();

  if (loading) {
    return <p className="p-4 text-center text-gray-500 dark:text-gray-400">{t("common.loading")}</p>;
  }
  if (summaries.length === 0) {
    return <p className="p-4 text-center text-gray-500 dark:text-gray-400">{t("messages.noConversations")}</p>;
  }
  return (
    <div className="divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
      {summaries.map((s) => {
        const rowContent = (
          <>
            {selectionMode && (
              <input
                type="checkbox"
                checked={selectedIds?.has(s.conversationId) ?? false}
                onChange={() => onToggleSelect?.(s.conversationId)}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 shrink-0 accent-[#5fac5e]"
              />
            )}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
              {s.adPhotoUrl ? (
                <img src={s.adPhotoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <PhotoIcon className="h-5 w-5 text-gray-300 dark:text-gray-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-gray-900 dark:text-gray-100">{s.otherName || "..."}</span>
                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                  {formatMessageTime(s.lastMessage.createdAt)}
                </span>
              </div>
              <p className="truncate text-sm text-gray-700 dark:text-gray-300">
                {s.adStatus === "closed" && (
                  <span className="font-semibold text-red-600 dark:text-red-400">{t("messages.adClosed")} · </span>
                )}
                {s.adTitle}
              </p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">{s.lastMessage.text}</p>
            </div>
          </>
        );

        const className = `flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
          s.conversationId === activeId ? "bg-gray-100 dark:bg-gray-800" : ""
        }`;

        return selectionMode ? (
          <button
            key={s.conversationId}
            type="button"
            onClick={() => onToggleSelect?.(s.conversationId)}
            className={`w-full text-left ${className}`}
          >
            {rowContent}
          </button>
        ) : (
          <Link key={s.conversationId} to={`/messages/${s.conversationId}`} className={className}>
            {rowContent}
          </Link>
        );
      })}
    </div>
  );
}
