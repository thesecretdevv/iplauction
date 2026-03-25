'use client';

import { useRouter } from 'next/navigation';
import { RoomScreen } from '../../src/MultiScreens';
import { useGame } from '../GameContext';

export default function RoomPage() {
  const router = useRouter();
  const {
    emit, playerId, setRoomCode, setLobbyPlayers,
    setIsHost, setMyName, setPlayMode, setMultiGS,
    setLobbyMode
  } = useGame();

  return (
    <RoomScreen
      emit={emit}
      playerId={playerId}
      onJoined={({ code, players, isHost: h, myName: n, roomStatus, gameState, auctionMode: resMode }) => {
        setRoomCode(code);
        setLobbyPlayers(players);
        setIsHost(h);
        setMyName(n);
        setPlayMode("multi");

        if (resMode) setLobbyMode(resMode);

        if (typeof window !== 'undefined') {
          localStorage.setItem("ipl_room_code", code);
          localStorage.setItem("ipl_player_name", n);
          localStorage.setItem("ipl_play_mode", "multi");
        }

        if (roomStatus === "active") {
          setMultiGS(gameState);
          router.push(`/auction?room=${code}${resMode ? `&mode=${resMode}` : ''}`);
        } else if (roomStatus === "finished") {
          setMultiGS(gameState);
          router.push(`/results?room=${code}${resMode ? `&mode=${resMode}` : ''}`);
        } else {
          router.push(`/lobby/${code}${resMode ? `?mode=${resMode}` : ''}`);
        }
      }}
    />
  );
}
