import React from 'react';
import { useBreadcrumb } from '../hooks/useBreadcrumb';

export default function Breadcrumb() {
  const breadcrumbItems = useBreadcrumb();

  return (
    <ol className="text-ui-fg-muted txt-compact-small-plus flex select-none items-center">
      {breadcrumbItems.map((item, index) => (
        <li key={index} className="flex items-center">
          {index > 0 && (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="15" 
              height="15" 
              fill="none" 
              className="mx-2 text-ui-fg-muted"
            >
              <path 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1.5" 
                d="m6 4 3 3.5L6 11" 
              />
            </svg>
          )}
          <div>
            <span className={index === breadcrumbItems.length - 1 ? "text-ui-fg-base" : ""}>
              {item.name}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
