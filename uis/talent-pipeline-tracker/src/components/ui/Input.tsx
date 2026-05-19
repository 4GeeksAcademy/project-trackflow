import { InputHTMLAttributes, forwardRef } from 'react';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={
        'border rounded px-2 py-1 ' + className
      }
      {...props}
    />
  )
);
Input.displayName = 'Input';
export default Input;
