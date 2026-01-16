import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  actions?: ReactNode;
}

export function Card({ children, className, title, actions }: CardProps) {
  return (
    <div className={cn('bg-white shadow rounded-lg', className)}>
      {(title || actions) && (
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          {title && <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{title}</h3>}
          {actions && <div className="w-full sm:w-auto">{actions}</div>}
        </div>
      )}
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">{children}</div>
    </div>
  );
}

