import { CheckCircleIcon } from "./icons";

interface VerifiedBadgeProps {
  label: string;
  className?: string;
}

export function VerifiedBadge({ label, className }: VerifiedBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300 ${className ?? ""}`}
    >
      <CheckCircleIcon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
