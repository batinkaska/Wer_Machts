import logo from "../../assets/logo.png";
import wordmark from "../../assets/wordmark.png";

export function Footer() {
  return (
    <footer className="flex items-center justify-center gap-2 border-t border-gray-200 py-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <img src={logo} alt="" className="h-5 w-5 rounded" />
      <img src={wordmark} alt="Wer Macht" className="h-5 w-auto" />
      <span>— MVP</span>
    </footer>
  );
}
