'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeScreen } from '@/components/welcome-screen';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <WelcomeScreen onEnter={() => router.push('/')} />
  );
}
