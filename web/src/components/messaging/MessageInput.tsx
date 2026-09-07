import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

export function MessageInput({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await onSend(text.trim());
    setText("");
    setSending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("messages.inputPlaceholder")}
        className="flex-1 rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      />
      <button
        type="submit"
        disabled={sending}
        className="rounded bg-[#5fac5e] px-4 py-2 text-white hover:bg-[#4d9a4c] disabled:opacity-50"
      >
        {t("common.send")}
      </button>
    </form>
  );
}
