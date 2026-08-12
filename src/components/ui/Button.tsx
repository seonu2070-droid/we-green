import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "light";
type ButtonSize = "default" | "small";

interface SharedButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  wide?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = SharedButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    as?: "button";
    to?: never;
  };

type ButtonAsLink = SharedButtonProps & {
  as: "link";
  to: string;
  replace?: boolean;
  state?: unknown;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function buildClassName({
  variant = "primary",
  size = "default",
  wide = false,
  className = "",
}: SharedButtonProps): string {
  return [
    "button",
    `button-${variant}`,
    size === "small" ? "button-small" : "",
    wide ? "button-wide" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: ButtonProps) {
  const className = buildClassName(props);

  if (props.as === "link") {
    const { as: _as, variant: _v, size: _s, wide: _w, children, to, replace, state } =
      props;
    return (
      <Link className={className} to={to} replace={replace} state={state}>
        {children}
      </Link>
    );
  }

  const {
    as: _as,
    variant: _v,
    size: _s,
    wide: _w,
    children,
    type = "button",
    ...rest
  } = props;

  return (
    <button className={className} type={type} {...rest}>
      {children}
    </button>
  );
}
