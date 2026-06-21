import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "toolbar";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "primary-button",
  secondary: "secondary-button",
  toolbar: "toolbar-button",
};

export function Button({ variant = "secondary", className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(variantClassName[variant], className)} {...props}>
      {children}
    </button>
  );
}
