import type { TextareaHTMLAttributes } from "react";

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  requiredMark?: boolean;
}

export function TextArea({
  label,
  error,
  requiredMark = false,
  id,
  className = "",
  ...rest
}: TextAreaProps) {
  const areaId = id ?? rest.name;

  return (
    <label className={`field field-full ${className}`.trim()} htmlFor={areaId}>
      <span>
        {label}
        {requiredMark ? <b> *</b> : null}
      </span>
      <textarea id={areaId} aria-invalid={Boolean(error)} {...rest} />
      <small className="field-error">{error ?? ""}</small>
    </label>
  );
}
