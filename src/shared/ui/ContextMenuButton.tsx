import { cn } from "@/lib/utils";

export function ContextMenuButton({
  label,
  danger,
  disabled,
  onClick,
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "block w-full rounded px-3 py-2 text-left hover:bg-slate-50",
        danger && "text-red-600 hover:bg-red-50",
        disabled && "cursor-not-allowed opacity-45 hover:bg-transparent",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
