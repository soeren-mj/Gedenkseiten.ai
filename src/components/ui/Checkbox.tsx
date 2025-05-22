import React from 'react';

interface CheckboxProps {
  label: React.ReactNode;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  name?: string;
  required?: boolean;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  error,
  name,
  required = false,
  className = '',
}) => {
  return (
    <div className={`flex items-start pb-2 ${className}`}>
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        required={required}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <label htmlFor={name} className="ml-2 text-sm text-gray-700 select-none">
        {label}
      </label>
      {error && <p className="ml-2 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Checkbox; 