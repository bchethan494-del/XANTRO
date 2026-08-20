import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl tracking-tight',
    lg: 'text-2xl tracking-tighter'
  };

  return (
    <div className="flex items-center gap-2.5 select-none" id="xantro-logo">
      {/* Original XANTRO Geometric Emblem */}
      <div className={`${iconSizes[size]} relative flex items-center justify-center rounded-lg bg-blue-600 shadow-xs`}>
        {/* Modern multi-facet X icon */}
        <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
          <path
            d="M7 7L13.5 16L7 25H11.5L16 19L20.5 25H25L18.5 16L25 7H20.5L16 13L11.5 7H7Z"
            fill="white"
          />
          <circle cx="16" cy="16" r="2.5" fill="#facc15" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className={`font-extrabold text-blue-900 ${textSizes[size]}`}>
            XAN<span className="text-blue-600">TRO</span>
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-500">
            Marketplace
          </span>
        )}
      </div>
    </div>
  );
};
