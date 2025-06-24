import React from 'react';
import {SelectOption} from "../../types/common.ts";


// Тип для компонента общего текстового ввода
interface SelectProps {
  label: string;
  value: string | number | undefined;
  placeholder?: string;
  required?: boolean;
  onChange: (value: number|string) => void;
  options: SelectOption[];
  maxWidth?: string;
}

export const Select: React.FC<SelectProps> = ({
   label,
   value,
   required = false,
   onChange,
   options = [],
   maxWidth
 }) => (
  <div className="form-group" style={maxWidth? {maxWidth: maxWidth} : {} }>
    <label>
      <div className="form-label">
        {label}
      </div>
      <select
        className="form-select"
        value={value}
        onChange={(e) => onChange(options.find(item => item.value == e.target.value)?.value || options[0].value)}
        required={required}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>

  </div>
);