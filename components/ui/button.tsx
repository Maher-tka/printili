import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-charcoal text-paper shadow-[0_16px_35px_rgb(45_41_38_/_0.18)] hover:bg-[rgb(62_55_51)]",
  secondary: "border border-paper/70 bg-paper/16 text-paper backdrop-blur hover:bg-paper/24",
  outline: "border border-[rgb(199_163_95_/_0.45)] bg-paper text-charcoal hover:bg-cream"
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-14 px-6 text-base"
};

export function ButtonLink({
  children,
  className,
  size = "md",
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "focus-ring inline-flex items-center justify-center rounded-full font-semibold transition",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
