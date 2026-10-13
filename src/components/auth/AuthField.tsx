import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { authFieldStyles as styles } from './AuthField.styles';
import type { AuthFieldProps } from './AuthField.types';

export function AuthField({
  label,
  icon: Icon,
  error,
  type = 'text',
  className,
  ...inputProps
}: AuthFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && passwordVisible ? 'text' : type;

  return (
    <div className={cn(styles.root, className)}>
      <Label htmlFor={id} className={styles.label}>
        {label}
      </Label>
      <div className={styles.control}>
        {Icon ? <Icon className={styles.leadingIcon} aria-hidden /> : null}
        <Input
          id={id}
          type={resolvedType}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            styles.input,
            Icon && styles.inputWithIcon,
            isPassword && styles.inputWithToggle,
          )}
          {...inputProps}
        />
        {isPassword ? (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setPasswordVisible((current) => !current)}
            aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
