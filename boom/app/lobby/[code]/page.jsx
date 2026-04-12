'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

export default function LobbyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#05070D" }} />}>
      <LobbyContent />
    </Suspense>
  );
}

function LobbyContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const urlCode = params.code?.toUpperCase() || '';
  const mode = searchParams.get('mode');
  const isPublic = searchParams.get('public') !== 'false';
  
  useEffect(() => {
    if (!urlCode) {
      router.replace('/room');
      return;
    }
    const params = new URLSearchParams();
    params.set('action', 'lobby');
    params.set('room', urlCode);
    if (mode) params.set('mode', mode);
    if (!isPublic) params.set('public', 'false');
    router.replace(`/room?${params.toString()}`);
  }, [router, urlCode, mode, isPublic]);

  return (
    <div style={{ minHeight: "100vh", background: "#05070D" }} />
  );
}
