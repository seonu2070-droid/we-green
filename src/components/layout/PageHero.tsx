import type { ReactNode } from "react";

export interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: ReactNode;
  children?: ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: PageHeroProps) {
  return (
    <section className="subpage-hero">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subpage-lead">{description}</p>
        {children}
      </div>
    </section>
  );
}
