import React from "react";

export function Checkbox({ id, checked, onChange, label, className, disabled }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-2 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
        className="form-checkbox text-orange-600 w-4 h-4"
      />
      {label && <span>{label}</span>}
    </label>
  );
}
