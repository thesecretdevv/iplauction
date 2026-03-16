import { useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import fahhhSrc from "./assets/fahhh.mp3";

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
export function playPulse() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880;
        osc.type = "square";
        gain.gain.value = 0.15;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) { /* ignore audio errors */ }
}

export function playSaleSound() {
    try {
        const audio = new Audio(fahhhSrc);
        audio.volume = 0.6;
        audio.play().catch(e => console.warn("Audio play failed:", e));
    } catch (e) { }
}
