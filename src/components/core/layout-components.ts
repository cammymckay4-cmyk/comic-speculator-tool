import React from 'react';
import MainNavbar from './MainNavbar';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface LayoutProps {
  children: React.ReactNode;
  user?: User;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  showNavbar = true,
  showFooter = true,
  className = '',
  onNavigate,
  onLogout,
}) => {
  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      {/* Navigation */}
      {showNavbar && (
        <MainNavbar
          user={user}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 ${className}`}>
        {children}
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
};

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stan-lee-blue border-t-comic border-ink-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <h3 className="font-bangers text-2xl text-parchment uppercase tracking-wide mb-4">
              ComicScoutUK
            </h3>
            <p className="font-inter text-parchment opacity-80 text-sm leading-relaxed mb-4">
              The ultimate platform for comic book collectors. Track your collection, 
              discover new issues, and stay updated with the latest comic book news.
            </p>
            <div className="flex space-x-4">
              {/* Social media icons placeholder */}
              <div className="w-8 h-8 bg-parchment comic-border hover:bg-golden-age-yellow transition-colors duration-200 cursor-pointer"></div>
              <div className="w-8 h-8 bg-parchment comic-border hover:bg-golden-age-yellow transition-colors duration-200 cursor-pointer"></div>
              <div className="w-8 h-8 bg-parchment comic-border hover:bg-golden-age-yellow transition-colors duration-200 cursor-pointer"></div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bangers text-lg text-parchment uppercase tracking-wide mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {['Home', 'Collection', 'Alerts', 'News', 'Pricing'].map((link) => (
                <li key={link}>
                  <button className="font-inter text-parchment opacity-80 hover:opacity-100 hover:text-golden-age-yellow transition-colors duration-200 text-sm">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bangers text-lg text-parchment uppercase tracking-wide mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <li key={link}>
                  <button className="font-inter text-parchment opacity-80 hover:opacity-100 hover:text-golden-age-yellow transition-colors duration-200 text-sm">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-parchment border-opacity-20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="font-inter text-parchment opacity-60 text-xs">
              © {currentYear} ComicScoutUK. All rights reserved.
            </p>
            <p className="font-inter text-parchment opacity-60 text-xs mt-2 md:mt-0">
              Made with ❤️ for comic collectors everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Page-specific layouts
interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  action,
  breadcrumbs,
  className = '',
}) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Page Header */}
      {(title || subtitle || action || breadcrumbs) && (
        <div className="mb-8">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-4">
              <ol className="flex items-center space-x-2 font-inter text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <span className="text-ink-black opacity-50 mx-2">/</span>
                    )}
                    {crumb.href ? (
                      <button className="text-ink-black opacity-70 hover:opacity-100 hover:text-kirby-red transition-colors duration-200">
                        {crumb.label}
                      </button>
                    ) : (
                      <span className="text-ink-black">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Title Section */}
          <div className="flex justify-between items-start">
            <div>
              {title && (
                <h1 className="font-bangers text-4xl text-ink-black uppercase tracking-wide mb-2">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="font-inter text-ink-black opacity-70 text-lg">
                  {subtitle}
                </p>
              )}
            </div>
            {action && (
              <div className="ml-4">
                {action}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div>
        {children}
      </div>
    </div>
  );
};

// Grid Layout Component
interface GridLayoutProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className = '',
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Card Container Layout
interface CardContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  children,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`comic-border bg-parchment shadow-comic ${className}`}>
      {/* Card Header */}
      {(title || description || action) && (
        <div className="p-6 border-b-2 border-ink-black">
          <div className="flex justify-between items-start">
            <div>
              {title && (
                <h2 className="font-bangers text-2xl text-ink-black uppercase tracking-wide mb-1">
                  {title}
                </h2>
              )}
              {description && (
                <p className="font-inter text-ink-black opacity-70">
                  {description}
                </p>
              )}
            </div>
            {action && (
              <div className="ml-4">
                {action}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

// Responsive Container
interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`${sizeClasses[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default Layout;