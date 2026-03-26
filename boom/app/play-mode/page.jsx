// COMMENTED OUT — flow now goes directly from landing → /room
// Single player / Multiplayer selection screen is hidden for now.
// Uncomment below to restore it.

/*
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../GameContext';

// ... full play-mode screen
// Restore this if we want the single vs multi selection step back.
*/

'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlayModePage() {
  const router = useRouter();
  useEffect(() => { router.replace('/room'); }, []);
  return null;
}
