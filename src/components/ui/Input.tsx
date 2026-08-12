import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  requiredMark?: boolean;
  hint?: string;
}

export function Input({
  label,
  error,
  requiredMark = false,
  hint,
  id,
  className = "",
  ...rest
}: InputProps) {
  const inputId = id ?? rest.name;

  return (
    <label className={`field ${className}`.trim()} htmlFor={inputId}>
      <span>
        {label}
        {requiredMark ? <b> *</b> : null}
      </span>
      <input id={inputId} aria-invalid={Boolean(error)} {...rest} />
      {hint ? <small>{hint}</small> : null}
      <small className="field-error">{error ?? ""}</small>
    </label>
  );
}
