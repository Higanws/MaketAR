import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ label, className, children, title, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={title ?? label}
      className={cn("toolbar-button", className)}
      {...props}
    >
      {children}
    </button>
  );
}
