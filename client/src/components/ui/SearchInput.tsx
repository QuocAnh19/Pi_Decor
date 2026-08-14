import {
  forwardRef,
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
} from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input, type InputProps } from './Input';
import styles from './SearchInput.module.scss';

export interface SearchInputProps
  extends Omit<InputProps, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onChange,
      onValueChange,
      onDebouncedChange,
      debounceMs = 300,
      onClear,
      placeholder = 'Tìm kiếm...',
      ...props
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string>(
      (defaultValue as string) || (controlledValue as string) || ''
    );

    const currentValue = isControlled ? (controlledValue as string) : internalValue;
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync controlled value if changed from parent
    useEffect(() => {
      if (isControlled && controlledValue !== undefined) {
        setInternalValue(controlledValue);
      }
    }, [isControlled, controlledValue]);

    // Handle debounced callback
    useEffect(() => {
      if (!onDebouncedChange) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onDebouncedChange(currentValue);
      }, debounceMs);

      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, [currentValue, onDebouncedChange, debounceMs]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (!isControlled) {
        setInternalValue(val);
      }
      onChange?.(e);
      onValueChange?.(val);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue('');
      }
      onValueChange?.('');
      onDebouncedChange?.('');
      onClear?.();
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        leftIcon={<MagnifyingGlassIcon className={styles.searchIcon} />}
        rightIcon={
          currentValue ? (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClear}
              aria-label="Xoá tìm kiếm"
            >
              <XMarkIcon width={14} height={14} />
            </button>
          ) : undefined
        }
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
