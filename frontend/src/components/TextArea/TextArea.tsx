import React from 'react';

// Тип для компонента общего текстового ввода
interface InputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  value: string | number;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
  type?: string;
  maxWidth?: string
}

export const TextArea: React.FC<InputProps> = ({
   label,
   value,
   placeholder = '',
   required = false,
   onChange,
   type = 'text',
   maxWidth,
   ...inputProps
 }) => (
  <div className="form-group" style={maxWidth? {maxWidth: maxWidth} : {} }>
    <label>
      <div className="form-label">
        {label}
      </div>
      <textarea
        className="form-area"
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        {...inputProps}
      />
    </label>

  </div>

);