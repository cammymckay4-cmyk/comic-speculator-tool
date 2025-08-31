import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ComicCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  onClick?: () => void;
  hover?: boolean;
  className?: string;
  headerIcon?: LucideIcon;
  variant?: 'default' | 'highlighted' | 'muted';
}

const ComicCard: React.FC<ComicCardProps> = ({
  children,
  title,
  subtitle,
  image,
  imageAlt = '',
  onClick,
  hover = true,
  className = '',
  headerIcon: HeaderIcon,
  variant = 'default',
}) => {
  const baseClasses = `
    bg-parchment comic-border p-6
    transition-all duration-200 ease-in-out
    ${onClick ? 'cursor-pointer' : ''}
  `;

  const variantClasses = {
    default: 'bg-parchment',
    highlighted: 'bg-golden-age-yellow bg-opacity-20 border-golden-age-yellow',
    muted: 'bg-gray-50 opacity-90',
  };

  const hoverClasses = hover && onClick ? `
    hover:transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-comic-hover
    active:transform active:translate-x-1 active:translate-y-1 active:shadow-comic-sm
  ` : '';

  const shadowClass = variant === 'highlighted' 
    ? 'shadow-[6px_6px_0px_#F7B538]' 
    : 'shadow-comic';

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${hoverClasses}
    ${shadowClass}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div
      className={combinedClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Header Section */}
      {(title || subtitle || HeaderIcon) && (
        <div className="mb-4 border-b-2 border-ink-black pb-3">
          {/* Title and Icon */}
          {(title || HeaderIcon) && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {HeaderIcon && <HeaderIcon className="w-6 h-6 text-ink-black" />}
                {title && (
                  <h3 className="font-bangers text-xl text-ink-black uppercase tracking-wide">
                    {title}
                  </h3>
                )}
              </div>
            </div>
          )}
          
          {/* Subtitle */}
          {subtitle && (
            <p className="font-inter text-sm text-ink-black opacity-70 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Image Section */}
      {image && (
        <div className="mb-4">
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-48 object-cover comic-border bg-gray-100"
          />
        </div>
      )}

      {/* Content Section */}
      <div className="font-inter text-ink-black">
        {children}
      </div>

      {/* Comic-style corner decoration */}
      <div className="absolute top-2 right-2 w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-ink-black opacity-20" />
    </div>
  );
};

// Specialized card components
interface ComicIssueCardProps {
  title: string;
  issueNumber?: string;
  coverImage: string;
  publisher?: string;
  year?: number;
  price?: string;
  condition?: string;
  onClick?: () => void;
  className?: string;
}

export const ComicIssueCard: React.FC<ComicIssueCardProps> = ({
  title,
  issueNumber,
  coverImage,
  publisher,
  year,
  price,
  condition,
  onClick,
  className = '',
}) => {
  return (
    <ComicCard
      title={`${title}${issueNumber ? ` #${issueNumber}` : ''}`}
      subtitle={publisher && year ? `${publisher} (${year})` : publisher}
      image={coverImage}
      onClick={onClick}
      className={className}
    >
      <div className="space-y-2">
        {condition && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium opacity-70">Condition:</span>
            <span className="text-sm font-semibold bg-golden-age-yellow bg-opacity-30 px-2 py-1 rounded">
              {condition}
            </span>
          </div>
        )}
        
        {price && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium opacity-70">Value:</span>
            <span className="text-lg font-bold text-kirby-red">
              {price}
            </span>
          </div>
        )}
      </div>
    </ComicCard>
  );
};

interface NewsCardProps {
  headline: string;
  excerpt: string;
  publishDate: string;
  author?: string;
  category?: string;
  onClick?: () => void;
  className?: string;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  headline,
  excerpt,
  publishDate,
  author,
  category,
  onClick,
  className = '',
}) => {
  return (
    <ComicCard
      title={headline}
      subtitle={`${publishDate}${author ? ` • by ${author}` : ''}`}
      onClick={onClick}
      className={className}
    >
      <div className="space-y-3">
        {category && (
          <span className="inline-block bg-stan-lee-blue text-parchment px-2 py-1 text-xs font-semibold uppercase tracking-wide">
            {category}
          </span>
        )}
        
        <p className="text-sm leading-relaxed opacity-80">
          {excerpt}
        </p>
        
        {onClick && (
          <div className="pt-2">
            <span className="text-kirby-red font-semibold text-sm hover:underline">
              Read More →
            </span>
          </div>
        )}
      </div>
    </ComicCard>
  );
};

export default ComicCard;