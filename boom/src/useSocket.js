import { useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import fahhhSrc from "./assets/fahhh.mp3";
import clockSrc from "./assets/clock-ticking.mp3";

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

// Countdown pulse for last 5 seconds (Ticking clock)
export function playPulse() {
    try {
        const audio = new Audio(clockSrc);
        audio.volume = 0.5;
        audio.play().catch(e => console.warn("Clock audio play failed:", e));
    } catch (e) { }
}

export function playSaleSound() {
    try {
        const audio = new Audio(fahhhSrc);
        audio.volume = 0.6;
        audio.play().catch(e => console.warn("Audio play failed:", e));
    } catch (e) { }
}
