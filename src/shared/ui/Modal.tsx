import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  children: ReactNode;
  className?: string;
};

export function Modal({ children, className }: ModalProps) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/25 p-4">
      <div className={cn("w-full rounded-md border border-slate-200 bg-white p-4 shadow-xl", className)}>
        {children}
      </div>
    </div>
  );
}
