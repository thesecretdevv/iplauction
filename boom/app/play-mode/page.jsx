'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PlayModeScreen } from '../../src/MultiScreens';
import { useGame } from '../GameContext';

export default function PlayModePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPlayMode, auctionMode } = useGame();
  const mode = searchParams.get('mode') || (auctionMode || 'MEGA').toUpperCase();

  return (
    <PlayModeScreen
      onSingle={() => { setPlayMode("single"); router.push(`/team-select?mode=${mode}`); }}
      onMulti={() => { setPlayMode("multi"); router.push("/room"); }}
    />
  );
}
