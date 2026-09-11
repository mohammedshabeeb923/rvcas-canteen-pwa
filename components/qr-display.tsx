'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRDisplay({ value, size = 180, className = '' }: QRDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#1E293B',
        light: '#FFFFFF',
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-stone-100 animate-pulse rounded-xl flex items-center justify-center ${className}`}
      >
        <span className="text-xs text-stone-400">Loading QR...</span>
      </div>
    );
  }

  return (
    <div className={`p-2 bg-white rounded-2xl shadow-xs border border-stone-200/60 inline-block ${className}`}>
      <img
        src={dataUrl}
        alt="Meal Pass QR Code"
        width={size}
        height={size}
        className="rounded-lg object-contain"
      />
    </div>
  );
}
