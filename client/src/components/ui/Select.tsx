import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import styles from './Select.module.scss';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      fullWidth = true,
      required,
      className,
      id,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const selectId =
      id ||
      (typeof label === 'string'
        ? `select-${label.toLowerCase().replace(/\s+/g, '-')}`
        : undefined);

    return (
      <div className={`${styles.container} ${!fullWidth ? styles.inline : ''}`}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={styles.selectWrapper}>
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`
              ${styles.select}
              ${error ? styles.hasError : ''}
              ${className || ''}
            `.trim()}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDownIcon className={styles.chevron} />
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {hint && !error && <p className={styles.hint}>{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
