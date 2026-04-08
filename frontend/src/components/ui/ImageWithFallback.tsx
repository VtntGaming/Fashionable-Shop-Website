import { useState, useMemo } from 'react';
import { ShoppingBag, Shirt, Gem, Palette } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

const FALLBACK_THEMES = [
  { bg: 'from-slate-100 to-slate-200', icon: 'text-slate-300', accent: 'bg-slate-50' },
  { bg: 'from-stone-100 to-stone-200', icon: 'text-stone-300', accent: 'bg-stone-50' },
  { bg: 'from-zinc-100 to-zinc-200', icon: 'text-zinc-300', accent: 'bg-zinc-50' },
  { bg: 'from-neutral-100 to-neutral-200', icon: 'text-neutral-300', accent: 'bg-neutral-50' },
];

const FALLBACK_ICONS = [ShoppingBag, Shirt, Gem, Palette];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function ImageWithFallback({ src, alt, fallbackText, className = '', ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  const { theme, Icon } = useMemo(() => {
    const h = hashStr(alt || fallbackText || 'default');
    return {
      theme: FALLBACK_THEMES[h % FALLBACK_THEMES.length],
      Icon: FALLBACK_ICONS[h % FALLBACK_ICONS.length],
    };
  }, [alt, fallbackText]);

  if (!src || error) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br ${theme.bg} overflow-hidden ${className}`} style={props.style}>
        <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${theme.accent} opacity-60`} />
        <div className={`absolute -bottom-6 -left-6 w-32 h-32 rounded-full ${theme.accent} opacity-40`} />
        <div className="relative z-10 flex flex-col items-center gap-1.5">
          <Icon size={36} strokeWidth={1.2} className={theme.icon} />
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
      {...props}
    />
  );
}
