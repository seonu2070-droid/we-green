import type { SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  requiredMark?: boolean;
  placeholder?: string;
}

export function Select({
  label,
  options,
  error,
  requiredMark = false,
  placeholder,
  id,
  className = "",
  ...rest
}: SelectProps) {
  const selectId = id ?? rest.name;

  return (
    <label className={`field ${className}`.trim()} htmlFor={selectId}>
      <span>
        {label}
        {requiredMark ? <b> *</b> : null}
      </span>
      <select id={selectId} aria-invalid={Boolean(error)} {...rest}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <small className="field-error">{error ?? ""}</small>
    </label>
  );
}
