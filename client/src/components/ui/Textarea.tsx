import { forwardRef, type TextareaHTMLAttributes, type ReactNode } from 'react';
import styles from './Textarea.module.scss';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = true,
      required,
      className,
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id ||
      (typeof label === 'string'
        ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`
        : undefined);

    return (
      <div className={`${styles.container} ${!fullWidth ? styles.inline : ''}`}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          className={`
            ${styles.textarea}
            ${error ? styles.hasError : ''}
            ${className || ''}
          `.trim()}
          {...props}
        />
        {error && <p className={styles.errorMessage}>{error}</p>}
        {hint && !error && <p className={styles.hint}>{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
