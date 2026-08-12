import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "article" | "div" | "section";
  className?: string;
}

export function Card({
  children,
  as: Component = "article",
  className = "",
  ...rest
}: CardProps) {
  return (
    <Component className={className} {...rest}>
      {children}
    </Component>
  );
}
