import type { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({ label, error, icon: Icon, children, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
        {children}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

/* Pre-styled input classes for use with FormField */
export const inputBase = 'w-full py-2.5 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors';
export const inputWithIcon = `${inputBase} pl-10 pr-4`;
export const inputPlain = `${inputBase} px-4`;
