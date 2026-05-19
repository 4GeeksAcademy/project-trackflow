import { ButtonHTMLAttributes } from 'react';

export default function Button({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        'px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 ' +
        (props.className || '')
      }
    >
      {children}
    </button>
  );
}
