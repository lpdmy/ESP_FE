import React from "react";

export function RadioGroup({ value, onChange, children, className }) {
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          name: "radio-group",
          checked: value === child.props.value,
          onChange: () => onChange(child.props.value),
        })
      )}
    </div>
  );
}

export function RadioGroupItem({ id, value, checked, onChange, label }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        id={id}
        name="radio-group"
        value={value}
        checked={checked}
        onChange={onChange}
        className="form-radio text-orange-600"
      />
      <span>{label}</span>
    </label>
  );
}
