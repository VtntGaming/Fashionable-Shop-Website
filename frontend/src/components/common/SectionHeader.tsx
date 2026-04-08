import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionLink?: string;
}

export default function SectionHeader({ icon, title, subtitle, actionLabel, actionLink }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        {icon ? (
          <div className="flex items-center gap-2 mb-1">
            {icon}
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
        ) : (
          <h2 className="text-2xl font-bold">{title}</h2>
        )}
        {subtitle && <p className="text-sm text-text-light mt-0.5">{subtitle}</p>}
      </div>
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="text-sm bg-accent/10 text-accent font-medium px-4 py-2 rounded-full hover:bg-accent/20 flex items-center gap-1 transition-colors"
        >
          {actionLabel} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
