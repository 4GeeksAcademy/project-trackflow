import { SelectHTMLAttributes } from 'react';

export default function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={'border rounded px-2 py-1 ' + (props.className || '')}>
      {children}
    </select>
  );
}
