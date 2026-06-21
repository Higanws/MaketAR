import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PopoverProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Popover({ className, children, ...props }: PopoverProps) {
  return (
    <div className={cn("rounded-md border border-slate-200 bg-white p-1 text-sm shadow-xl", className)} {...props}>
      {children}
    </div>
  );
}
