import React from 'react';

interface GniotLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const GniotLogo: React.FC<GniotLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  // Use Vite base path so it resolves seamlessly in both local dev (/) and GitHub Pages (/gniot-lost-and-found/)
  const baseUrl = import.meta.env.BASE_URL || '/';
  const logoSrc = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}assets/gniot-logo.png`;
  const fallbackSrc = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}assets/aistudio/Screenshot_2026-10-22_194510_db6fa07e.png`;

  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Light-backed container to ensure 100% readability against dark aubergine and light backgrounds */}
      <div className="bg-white/95 rounded-lg px-2 py-1 shadow-sm border border-white/30 backdrop-blur-sm flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-[1.02]">
        <img
          src={logoSrc}
          alt="GNIOT Group of Institutions Official Logo"
          className={`${sizeClasses[size]} w-auto object-contain`}
          onError={(e) => {
            // Graceful fallback to workspace attachment if main copy is loading
            if (e.currentTarget.src !== fallbackSrc) {
              e.currentTarget.src = fallbackSrc;
            }
          }}
        />
      </div>

      {showSubtitle && (
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold tracking-tight text-[#E8EDF2] font-display whitespace-nowrap">
            Lost &amp; Found AI
          </span>
          <span className="text-[10px] text-[#D9A441] font-mono tracking-wider uppercase">
            Campus Recovery Portal
          </span>
        </div>
      )}
    </div>
  );
};
