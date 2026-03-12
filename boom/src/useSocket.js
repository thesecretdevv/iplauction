import { useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

export function useSocket() {
    const sock = useRef(null);

    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://bidwicket.onrender.com";
        console.log("Connecting to Auction Server:", backendUrl || "Same Origin");
        sock.current = io(backendUrl, { transports: ["websocket", "polling"], reconnection: true });

        return () => { sock.current?.disconnect(); };
    }, []);

    const emit = useCallback((ev, data, cb) => {
        sock.current?.emit(ev, data, cb);
    }, []);

    const on = useCallback((ev, fn) => {
        sock.current?.on(ev, fn);
        return () => sock.current?.off(ev, fn);
    }, []);

    return { emit, on, socket: sock };
}

// Timer beep using Web Audio API
let audioCtx = null;
// Pulse sound (heartbeat) for last 5 seconds
export function playPulse() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        // Low frequency thump
        osc.frequency.setValueAtTime(60, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.1);
        osc.type = "sine";

        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) { }
}

export function playSaleSound() {
    try {
        const audio = new Audio('/src/assets/fahhh.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.warn("Audio play failed:", e));
    } catch (e) { }
}

