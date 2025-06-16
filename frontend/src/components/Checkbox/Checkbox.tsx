import React from 'react';
interface SelectProps {
  label: string;
  value: boolean;
  placeholder?: string;
  onChange: (value: boolean) => void;
}

export const Checkbox: React.FC<SelectProps> = ({
   label,
   value,
   onChange,
 }) => (
  <div className="form-group">
    <label>
      <div className="form-label">
        {label}
      </div>
      <input
        type="checkbox"
        className="form-checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>

  </div>
);