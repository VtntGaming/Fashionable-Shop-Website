import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, actionLink, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-gray-300 mb-4">
        {icon || <ShoppingBag size={64} />}
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-md">{description}</p>}
      {actionLabel && (onAction ? (
        <button onClick={onAction} className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
          {actionLabel}
        </button>
      ) : actionLink ? (
        <Link to={actionLink} className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
          {actionLabel}
        </Link>
      ) : null)}
    </div>
  );
}
