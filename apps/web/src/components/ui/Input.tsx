import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import styles from "./Input.module.scss";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = true,
      required,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId =
      id ||
      (typeof label === "string" ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    return (
      <div className={`${styles.container} ${!fullWidth ? styles.inline : ""}`}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {leftIcon && <div className={styles.leftIcon}>{leftIcon}</div>}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              ${styles.input}
              ${leftIcon ? styles.hasLeftIcon : ""}
              ${rightIcon ? styles.hasRightIcon : ""}
              ${error ? styles.hasError : ""}
              ${className || ""}
            `.trim()}
            {...props}
          />
          {rightIcon && <div className={styles.rightIcon}>{rightIcon}</div>}
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {hint && !error && <p className={styles.hint}>{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
