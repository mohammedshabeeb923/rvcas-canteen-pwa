import React from 'react';

export function RvcasCrest({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img
        src="/images/rvcas-crest.png"
        alt="RVCAS Crest"
        className="w-full h-full object-contain drop-shadow-xs"
      />
    </div>
  );
}
